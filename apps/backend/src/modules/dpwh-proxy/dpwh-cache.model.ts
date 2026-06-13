import { Schema, model, Document } from 'mongoose';

/**
 * Cache document for DPWH transparency API responses.
 *
 * The upstream API sits behind Cloudflare and won't accept requests from our
 * GCP datacenter IP. Instead of solving that at request-time (would need
 * FlareSolverr or a paid residential proxy), we run the fetch out-of-band
 * from a residential/home connection (the included `refresh-dpwh-cache`
 * script) and stash the responses here. The Express handlers then just read
 * these documents — fast, free, no Cloudflare friction at runtime.
 *
 * We deliberately do NOT use a TTL index. If a refresh fails, we'd rather
 * keep serving stale data than blank-out the page. Freshness is tracked via
 * `expiresAt` and surfaced to the client via `_cache.fresh`.
 */
export interface IDpwhCache extends Document {
  /** Stable hash of the upstream path + sorted query params. */
  cacheKey: string;
  /** The full upstream response body, stored verbatim. */
  data: unknown;
  /** When this entry was last successfully refreshed. */
  fetchedAt: Date;
  /** When this entry should be considered stale (still served, just flagged). */
  expiresAt: Date;
  /** Original upstream HTTP status code, kept for debugging. */
  upstreamStatus: number;
  /** How long the refresh took, kept for debugging slow runs. */
  fetchDurationMs?: number;
}

const dpwhCacheSchema = new Schema<IDpwhCache>(
  {
    cacheKey: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, required: true, default: Date.now, index: true },
    expiresAt: { type: Date, required: true },
    upstreamStatus: { type: Number, required: true, default: 200 },
    fetchDurationMs: { type: Number }
  },
  { timestamps: true, collection: 'dpwh_cache' }
);

export const DpwhCacheModel = model<IDpwhCache>('DpwhCache', dpwhCacheSchema);
