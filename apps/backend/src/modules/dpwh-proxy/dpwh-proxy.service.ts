import { logger } from '@/shared/logger';

interface GotResponse<BodyType = unknown> {
  statusCode: number;
  body: BodyType;
  headers: Record<string, string | string[] | undefined>;
}

type GotScrapingFn = (options: Record<string, unknown>) => Promise<GotResponse<string>>;

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
 *
 * The production VM never reaches the upstream successfully — Cloudflare
 * blocks datacenter IPs — so this module is exercised mainly by the offline
 * `refresh-dpwh-cache` script running on a residential connection. The
 * controller still calls it as a best-effort live fallback when the cache
 * is empty, but a failure there is expected and gracefully handled.
 */
const getConfig = () => ({
  baseUrl: (process.env.DPWH_API_BASE_URL || 'https://api.transparency.dpwh.gov.ph').replace(/\/+$/, ''),
  timeoutMs: parseInt(process.env.DPWH_TIMEOUT_MS || '70000', 10),
  /**
   * Optional outbound proxy (HTTP/HTTPS/SOCKS). Only useful when running
   * the refresh script from a network whose IP Cloudflare flags. Most
   * residential connections don't need this.
   */
  proxyUrl: process.env.DPWH_PROXY_URL || '',
  /**
   * The upstream's CORS config whitelists `http://localhost:3000`. We're
   * server-to-server so CORS doesn't apply, but DPWH still seems to inspect
   * Origin/Referer, so we forward the whitelisted values.
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

let gotScrapingPromise: Promise<{ gotScraping: GotScrapingFn }> | null = null;
const getGotScraping = async (): Promise<GotScrapingFn> => {
  if (!gotScrapingPromise) {
    gotScrapingPromise = importEsm<{ gotScraping: GotScrapingFn }>('got-scraping');
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
 * Live server-to-server fetch against the DPWH transparency API.
 *
 * Used by:
 *   - `refresh-dpwh-cache.ts` running from a residential connection (the
 *     primary user — succeeds because home IPs aren't Cloudflare-blocked)
 *   - the controller as a best-effort live fallback when the cache is empty
 *     (usually fails on datacenter VMs; that's fine, the controller handles
 *     the failure cleanly)
 *
 * `got-scraping` impersonates Chrome's TLS / HTTP-2 / header fingerprint so
 * the request looks like a real browser to Cloudflare.
 */
export const dpwhProxyRequest = async <T = unknown>(opts: DpwhProxyOptions): Promise<DpwhProxyResult<T>> => {
  const { baseUrl, timeoutMs, proxyUrl, origin, referer } = getConfig();

  if (!opts.path.startsWith('/')) {
    throw new Error(`DPWH proxy path must start with '/', received: ${opts.path}`);
  }

  const params = buildQuery(opts.query);
  const qs = params.toString();
  const url = `${baseUrl}${opts.path}${qs ? `?${qs}` : ''}`;

  // got-scraping's header generator fills in realistic browser headers
  // (User-Agent, sec-ch-ua-*, Accept, Accept-Language, …). We only override
  // the ones DPWH inspects via its CORS whitelist.
  const headers: Record<string, string> = {
    Origin: origin,
    Referer: referer
  };

  const startedAt = Date.now();
  let response: GotResponse<string>;
  try {
    const gotScraping = await getGotScraping();
    response = (await gotScraping({
      url,
      method: 'GET',
      responseType: 'text',
      throwHttpErrors: false,
      // Single attempt, no retry: a stuck upstream (Cloudflare challenge /
      // slow datacenter-IP handshake) must not be retried, otherwise the
      // total time can exceed the hosting gateway timeout and the edge
      // returns its own 502 before we can respond cleanly.
      timeout: { request: timeoutMs },
      retry: { limit: 0 },
      ...(proxyUrl ? { proxyUrl } : {}),
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
    const message = (err as Error).message;
    const code = (err as any).code;

    logger.error(
      `[DPWH] request failed (${elapsed}ms): ${url} | name=${name} code=${code} ` +
        `proxy=${proxyUrl ? 'set' : 'none'} message=${message}`
    );

    if (name === 'TimeoutError' || name === 'AbortError') {
      const error = new Error('Upstream DPWH API timed out');
      (error as any).statusCode = 504;
      (error as any).reason = 'upstream_timeout';
      (error as any).diagnostic = { elapsed, proxy: proxyUrl ? 'configured' : 'none' };
      throw error;
    }

    const error = new Error('Failed to reach upstream DPWH API');
    (error as any).statusCode = 502;
    (error as any).reason = 'upstream_unreachable';
    (error as any).cause = message;
    (error as any).diagnostic = {
      elapsed,
      errorName: name,
      errorCode: code,
      errorMessage: message,
      proxy: proxyUrl ? 'configured' : 'none'
    };
    throw error;
  }

  const elapsed = Date.now() - startedAt;
  const contentType = (response.headers['content-type'] as string | undefined) ?? null;
  const isJson = contentType?.includes('application/json');
  const rawBody = response.body ?? '';

  // Detect Cloudflare interstitial (status can be 200 or 403). The expected
  // failure mode on the VM — caller should fall back to cached data.
  const looksLikeCloudflareChallenge =
    typeof rawBody === 'string' && rawBody.startsWith('<') && rawBody.includes('Just a moment');

  if (looksLikeCloudflareChallenge) {
    logger.warn(
      `[DPWH] Cloudflare challenge served (status=${response.statusCode}, ${elapsed}ms): ${url}. ` +
        `This is expected on datacenter IPs — caller should use the MongoDB cache instead.`
    );
    const error = new Error('Upstream DPWH API is behind a Cloudflare challenge');
    (error as any).statusCode = 502;
    (error as any).reason = 'cloudflare_challenge';
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
      (error as any).reason = 'malformed_json';
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
