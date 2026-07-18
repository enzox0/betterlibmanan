import { logger } from "@/shared/logger";
import { DpwhCacheModel, IDpwhCache } from "./dpwh-cache.model";

/**
 * Default cache TTL — how long before a stored response is considered "stale"
 * (still served, just flagged in the response payload). DPWH project data
 * changes slowly; one refresh per day is plenty.
 */
export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build a deterministic cache key from a path + query.
 *
 * - Sort keys alphabetically so that `?a=1&b=2` and `?b=2&a=1` map to the
 *   same cache entry.
 * - Skip undefined / empty values so callers can safely pass partial filter
 *   objects without splitting cache lines.
 * - Array values are sorted before joining for the same reason.
 */
export const buildCacheKey = (
  path: string,
  query: Record<string, string | string[] | undefined> = {},
): string => {
  const entries = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const value = Array.isArray(v) ? [...v].sort().join(",") : String(v);
      return [k, value] as const;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  const qs = entries.map(([k, v]) => `${k}=${v}`).join("&");
  return qs ? `${path}?${qs}` : path;
};

export interface CacheEntry {
  data: unknown;
  fetchedAt: Date;
  expiresAt: Date;
  fresh: boolean;
  upstreamStatus: number;
}

/**
 * Look up a cache entry. Always returns the latest entry for a key, even if
 * it's expired — the caller decides whether stale is acceptable. Returns
 * `null` only if the key has never been populated.
 */
export const getCached = async (
  cacheKey: string,
): Promise<CacheEntry | null> => {
  const doc = await DpwhCacheModel.findOne({ cacheKey })
    .lean<IDpwhCache>()
    .exec();
  if (!doc) return null;
  return {
    data: doc.data,
    fetchedAt: doc.fetchedAt,
    expiresAt: doc.expiresAt,
    upstreamStatus: doc.upstreamStatus,
    fresh: doc.expiresAt.getTime() > Date.now(),
  };
};

export interface SetCacheInput {
  cacheKey: string;
  data: unknown;
  upstreamStatus: number;
  ttlMs?: number;
  fetchDurationMs?: number;
}

/**
 * Upsert a cache entry. Used by the offline refresh script and by any
 * runtime live-fetch fallback that does manage to reach the upstream.
 */
export const setCached = async (input: SetCacheInput): Promise<void> => {
  const ttl = input.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const now = new Date();
  await DpwhCacheModel.updateOne(
    { cacheKey: input.cacheKey },
    {
      $set: {
        data: input.data,
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + ttl),
        upstreamStatus: input.upstreamStatus,
        fetchDurationMs: input.fetchDurationMs,
      },
    },
    { upsert: true },
  );
  logger.info(
    `[DPWH][cache] upserted key=${input.cacheKey} ttlMs=${ttl} status=${input.upstreamStatus}`,
  );
};
