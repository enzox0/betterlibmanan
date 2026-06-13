import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger';
import { dpwhProxyRequest } from './dpwh-proxy.service';
import { buildCacheKey, getCached, setCached, DEFAULT_CACHE_TTL_MS } from './dpwh-cache.service';

/**
 * Default filters tuned for the BetterLibmanan transparency page.
 * Callers can still override these by passing the corresponding query params.
 */
const DEFAULT_PROJECT_FILTERS = {
  search: 'Libmanan',
  region: 'Region V',
  province: 'CAMARINES SUR'
};

/**
 * Coerce a query value into a single string, since express types it as
 * `string | string[] | ParsedQs | ParsedQs[]`.
 */
const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

/**
 * Try a live fetch against the upstream and persist the result to the cache.
 * Returns the response on success, or `null` on any failure — the caller is
 * expected to fall back to whatever cached entry it already has.
 */
const tryLiveFetchAndCache = async (
  cacheKey: string,
  path: string,
  query?: Record<string, string | string[] | undefined>
) => {
  const startedAt = Date.now();
  try {
    const result = await dpwhProxyRequest({ path, query });
    await setCached({
      cacheKey,
      data: result.body,
      upstreamStatus: result.status,
      ttlMs: DEFAULT_CACHE_TTL_MS,
      fetchDurationMs: Date.now() - startedAt
    });
    return result;
  } catch (err) {
    logger.warn(
      `[DPWH][cache] live refresh failed for ${cacheKey}, falling back to cache. ` +
        `reason=${(err as any).reason ?? 'unknown'}`
    );
    return null;
  }
};

/**
 * GET /api/dpwh/projects
 *
 * Cache-first read path:
 *   1. If the cache entry is fresh, serve it immediately.
 *   2. If it's stale, kick off a best-effort live refresh in the background
 *      and serve the stale data right away (stale-while-revalidate).
 *   3. If there's no cache entry at all, attempt one live fetch synchronously
 *      so the very first request after deployment doesn't return empty.
 *
 * The cache is normally populated out-of-band by `npm run refresh-dpwh-cache`
 * running on a residential connection — see the script for details.
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = asString(req.query.page) ?? '1';
    const limit = asString(req.query.limit) ?? '10000';
    const search = asString(req.query.search) ?? DEFAULT_PROJECT_FILTERS.search;
    const region = asString(req.query.region) ?? DEFAULT_PROJECT_FILTERS.region;
    const province = asString(req.query.province) ?? DEFAULT_PROJECT_FILTERS.province;

    const filters = { page, limit, search, region, province };
    const cacheKey = buildCacheKey('/projects', filters);
    const cached = await getCached(cacheKey);

    if (cached) {
      // Stale-while-revalidate: serve immediately, refresh in the background.
      // We swallow the background error because the user already has a response.
      if (!cached.fresh) {
        tryLiveFetchAndCache(cacheKey, '/projects', filters).catch(() => {});
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'X-Cache',
        cached.fresh ? `HIT; fetched=${cached.fetchedAt.toISOString()}` : `STALE; fetched=${cached.fetchedAt.toISOString()}`
      );
      res.send(cached.data);
      return;
    }

    // Cold cache — try live, then surface a clear 503 if even that fails.
    const live = await tryLiveFetchAndCache(cacheKey, '/projects', filters);
    if (live) {
      res.status(live.status);
      if (live.contentType) res.setHeader('Content-Type', live.contentType);
      res.setHeader('X-Cache', 'MISS');
      res.send(live.body);
      return;
    }

    res.status(503).json({
      status: 503,
      code: 'DPWH_CACHE_EMPTY',
      message:
        'No cached DPWH data is available yet, and the upstream is unreachable from this server. ' +
        'Run `npm run refresh-dpwh-cache` from a residential connection to populate the cache.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dpwh/projects/:contractId
 *
 * Same cache-first flow as `getProjects`, scoped to a single contractId.
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contractId } = req.params;
    if (!contractId) {
      return res.status(400).json({ success: false, message: 'contractId is required' });
    }

    const path = `/projects/${encodeURIComponent(contractId)}`;
    const cacheKey = buildCacheKey(path);
    const cached = await getCached(cacheKey);

    if (cached) {
      if (!cached.fresh) {
        tryLiveFetchAndCache(cacheKey, path).catch(() => {});
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'X-Cache',
        cached.fresh ? `HIT; fetched=${cached.fetchedAt.toISOString()}` : `STALE; fetched=${cached.fetchedAt.toISOString()}`
      );
      return res.send(cached.data);
    }

    const live = await tryLiveFetchAndCache(cacheKey, path);
    if (live) {
      res.status(live.status);
      if (live.contentType) res.setHeader('Content-Type', live.contentType);
      res.setHeader('X-Cache', 'MISS');
      return res.send(live.body);
    }

    res.status(503).json({
      status: 503,
      code: 'DPWH_CACHE_EMPTY',
      message: `No cached data for contract ${contractId}, and upstream is unreachable.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dpwh/health
 *
 * Lightweight diagnostic endpoint so the frontend (or an uptime monitor) can
 * verify the proxy itself is wired up without hitting the upstream API.
 */
export const getProxyHealth = (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DPWH proxy is reachable',
    upstream: process.env.DPWH_API_BASE_URL || 'https://api.transparency.dpwh.gov.ph',
    timestamp: new Date().toISOString()
  });
};

/**
 * GET /api/dpwh/diagnose
 *
 * Inspects cache state and attempts a live upstream call so we can tell at a
 * glance whether the page would still work if the cache emptied out.
 */
export const getProxyDiagnostic = async (_req: Request, res: Response) => {
  const config = {
    baseUrl: process.env.DPWH_API_BASE_URL || 'https://api.transparency.dpwh.gov.ph',
    proxyConfigured: Boolean(process.env.DPWH_PROXY_URL),
    proxyHost: process.env.DPWH_PROXY_URL ? new URL(process.env.DPWH_PROXY_URL).host : null,
    timeoutMs: parseInt(process.env.DPWH_TIMEOUT_MS || '70000', 10),
    nodeEnv: process.env.NODE_ENV
  };

  // Inspect the canonical Libmanan cache entry so the diagnostic tells us
  // both whether we have data on disk AND whether live fetch works.
  const defaultKey = buildCacheKey('/projects', {
    page: '1',
    limit: '10000',
    search: 'Libmanan',
    region: 'Region V',
    province: 'CAMARINES SUR'
  });
  const cached = await getCached(defaultKey);

  try {
    const startedAt = Date.now();
    const result = await dpwhProxyRequest({
      path: '/projects',
      query: { page: '1', limit: '1', search: 'Libmanan', region: 'Region V', province: 'CAMARINES SUR' }
    });
    res.json({
      success: true,
      ok: true,
      elapsed: Date.now() - startedAt,
      upstreamStatus: result.status,
      contentType: result.contentType,
      bodyPreview:
        typeof result.body === 'string'
          ? (result.body as string).slice(0, 200)
          : JSON.stringify(result.body).slice(0, 200),
      config,
      cache: cached
        ? {
            present: true,
            fresh: cached.fresh,
            fetchedAt: cached.fetchedAt,
            expiresAt: cached.expiresAt,
            upstreamStatus: cached.upstreamStatus
          }
        : { present: false }
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      ok: false,
      reason: (err as any).reason ?? 'unknown',
      message: (err as Error).message,
      cause: (err as any).cause,
      diagnostic: (err as any).diagnostic,
      config,
      cache: cached
        ? {
            present: true,
            fresh: cached.fresh,
            fetchedAt: cached.fetchedAt,
            expiresAt: cached.expiresAt,
            upstreamStatus: cached.upstreamStatus
          }
        : { present: false },
      hint: cached
        ? 'Live upstream is unreachable, but the cache has data so the transparency page will still work. Refresh the cache from a residential connection: `npm run refresh-dpwh-cache`.'
        : 'Cache is empty AND live upstream is unreachable. Run `npm run refresh-dpwh-cache` from a residential connection (e.g. your home Windows machine) to populate the cache.'
    });
  }
};

// Re-export logger so consumers don't need a separate import in tests
export { logger as dpwhLogger };
