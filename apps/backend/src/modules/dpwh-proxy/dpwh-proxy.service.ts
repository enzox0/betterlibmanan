import { logger } from '@/shared/logger';
// Type-only import — TypeScript erases this, so the CommonJS output never
// `require()`s the ESM-only `got-scraping` package.
import type {
  gotScraping as GotScrapingFn,
  Response as GotResponse
} from 'got-scraping';

export interface DpwhProxyOptions {
  /**
   * Path on the upstream DPWH API, must start with `/`
   * e.g. `/projects`, `/projects/24FE0042`
   */
  path: string;
  /**
   * Query parameters to forward to the upstream API
   */
  query?: Record<string, string | string[] | undefined>;
}

export interface DpwhProxyResult<T = unknown> {
  status: number;
  body: T;
  contentType: string | null;
}

/**
 * Reads DPWH proxy configuration from environment.
 * Centralised so we get the same defaults everywhere.
 */
const getConfig = () => ({
  baseUrl: (process.env.DPWH_API_BASE_URL || 'https://api.transparency.dpwh.gov.ph').replace(/\/+$/, ''),
  apiKey: process.env.DPWH_API_KEY || '',
  apiToken: process.env.DPWH_API_TOKEN || '',
  timeoutMs: parseInt(process.env.DPWH_TIMEOUT_MS || '20000', 10),
  /**
   * Origin/Referer the upstream's CORS config whitelisted. We're talking
   * server-to-server, so CORS doesn't apply, but DPWH still seems to inspect
   * these headers, so we forward the whitelisted values by default.
   */
  origin: process.env.DPWH_ORIGIN || 'http://localhost:3000',
  referer: process.env.DPWH_REFERER || 'http://localhost:3000/'
});

/**
 * `got-scraping` v4 is ESM-only and our backend compiles to CommonJS, so a
 * static `import` would be rewritten by TypeScript into `require()` and crash
 * with `ERR_PACKAGE_PATH_NOT_EXPORTED`. We dodge that by going through
 * `new Function`, which TS can't analyse — Node sees a real dynamic `import()`
 * and loads the ESM module successfully.
 */
const importEsm = new Function('specifier', 'return import(specifier)') as <T>(
  specifier: string
) => Promise<T>;

let gotScrapingPromise: Promise<{ gotScraping: typeof GotScrapingFn }> | null = null;
const getGotScraping = async (): Promise<typeof GotScrapingFn> => {
  if (!gotScrapingPromise) {
    gotScrapingPromise = importEsm<{ gotScraping: typeof GotScrapingFn }>('got-scraping');
  }
  return (await gotScrapingPromise).gotScraping;
};

/**
 * Build a `URLSearchParams` from a loose query object, dropping undefined values
 * and supporting repeated keys (string[]).
 */
const buildQuery = (query: Record<string, string | string[] | undefined> = {}): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && v !== '') params.append(key, String(v));
      }
    } else {
      params.append(key, String(value));
    }
  }
  return params;
};

/**
 * Server-to-server fetch against the DPWH transparency API.
 *
 * The upstream sits behind Cloudflare's bot mitigation, which 403s plain Node
 * `fetch` calls because the TLS / HTTP-2 fingerprint doesn't look like a real
 * browser. We use `got-scraping`, which impersonates Chrome at the header,
 * HTTP/2 and TLS levels, so the request looks indistinguishable from a normal
 * browser hit.
 *
 * CORS is irrelevant here — that's a browser-only policy. The point of this
 * proxy is to give the SPA a same-origin endpoint to talk to, while we handle
 * the upstream call out-of-band.
 */
export const dpwhProxyRequest = async <T = unknown>(opts: DpwhProxyOptions): Promise<DpwhProxyResult<T>> => {
  const { baseUrl, apiKey, apiToken, timeoutMs, origin, referer } = getConfig();

  if (!opts.path.startsWith('/')) {
    throw new Error(`DPWH proxy path must start with '/', received: ${opts.path}`);
  }

  const params = buildQuery(opts.query);
  const qs = params.toString();
  const url = `${baseUrl}${opts.path}${qs ? `?${qs}` : ''}`;

  // got-scraping's header generator fills in realistic browser headers
  // (User-Agent, sec-ch-ua-*, Accept, Accept-Language, …). We only override
  // the ones that need to match DPWH's whitelist plus optional credentials.
  const headers: Record<string, string> = {
    Origin: origin,
    Referer: referer
  };
  if (apiKey) headers['x-api-key'] = apiKey;
  if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

  const startedAt = Date.now();
  let response: GotResponse<string>;
  try {
    const gotScraping = await getGotScraping();
    response = (await gotScraping({
      url,
      method: 'GET',
      responseType: 'text',
      throwHttpErrors: false,
      timeout: { request: timeoutMs },
      retry: { limit: 1 },
      headers,
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome', minVersion: 120 }],
        devices: ['desktop'],
        operatingSystems: ['windows']
      }
    })) as GotResponse<string>;
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    const name = (err as Error).name;
    if (name === 'TimeoutError' || name === 'AbortError') {
      logger.error(`[DPWH] timeout after ${elapsed}ms: ${url}`);
      const error = new Error('Upstream DPWH API timed out');
      (error as any).statusCode = 504;
      throw error;
    }
    logger.error(`[DPWH] request failed (${elapsed}ms): ${url}`, err);
    const error = new Error('Failed to reach upstream DPWH API');
    (error as any).statusCode = 502;
    throw error;
  }

  const elapsed = Date.now() - startedAt;
  const contentType = (response.headers['content-type'] as string | undefined) ?? null;
  const isJson = contentType?.includes('application/json');
  const rawBody = response.body ?? '';

  // Detect Cloudflare interstitial (status can be 200 or 403)
  const looksLikeCloudflareChallenge =
    typeof rawBody === 'string' &&
    rawBody.startsWith('<') &&
    rawBody.includes('Just a moment');

  if (looksLikeCloudflareChallenge) {
    logger.error(
      `[DPWH] Cloudflare challenge served (status=${response.statusCode}, ${elapsed}ms): ${url}`
    );
    const error = new Error(
      'Upstream DPWH API is currently behind a Cloudflare challenge that the proxy could not solve.'
    );
    (error as any).statusCode = 502;
    throw error;
  }

  let body: unknown;
  if (isJson && typeof rawBody === 'string' && rawBody.length > 0) {
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      logger.error(`[DPWH] Failed to parse JSON body from upstream: ${url}`, err);
      const error = new Error('Upstream DPWH API returned malformed JSON');
      (error as any).statusCode = 502;
      throw error;
    }
  } else {
    body = rawBody;
  }

  logger.info(`[DPWH] ${response.statusCode} ${url} (${elapsed}ms)`);

  return {
    status: response.statusCode,
    body: body as T,
    contentType
  };
};
