/**
 * scripts/refresh-dpwh-cache.ts
 *
 * Populates the MongoDB DPWH cache by calling the upstream API directly.
 *
 * --- Why this script exists ---
 * The DPWH transparency API is fronted by Cloudflare bot protection that
 * blocks datacenter IPs (GCP, AWS, Render, Fly.io, …). Our production VM is
 * in Google Cloud, so it can never reach the upstream successfully. Instead
 * of fighting that at request time (which would need a paid residential
 * proxy or a heavy headless-Chrome setup the free-tier VM can't host), we
 * run THIS script from a residential connection — typically the developer's
 * Windows machine on home internet — and stash the response in the same
 * MongoDB the production backend reads from.
 *
 * Schedule it as a Windows Task Scheduler job (or just run it manually) once
 * a day. The transparency page on production will serve cached data 24/7;
 * if a refresh fails, the previous entry stays in place until the next run.
 *
 * --- Usage ---
 *   # From the repo root
 *   npm run refresh-dpwh-cache --workspace=apps/backend
 *
 * Reads the same `.env` the backend uses (MONGODB_URI, DPWH_API_BASE_URL).
 *
 * --- Filters ---
 * The script refreshes the canonical filter set the BetterLibmanan
 * transparency page uses (Libmanan / Region V / Camarines Sur, paginated
 * lazily by setting `limit=10000`). Add additional filter tuples to
 * `FILTERS_TO_REFRESH` below if the frontend ever queries with different
 * parameters.
 */
import dotenv from 'dotenv';
import path from 'path';
// Load env from the monorepo root, since the backend doesn't have its own .env.
// __dirname here is apps/backend/scripts during dev (tsx) or apps/backend after build.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: false }); // also support a backend-local .env if present
import mongoose from 'mongoose';
import { dpwhProxyRequest } from '../src/modules/dpwh-proxy/dpwh-proxy.service';
import { buildCacheKey, setCached, DEFAULT_CACHE_TTL_MS } from '../src/modules/dpwh-proxy/dpwh-cache.service';
import { logger } from '../src/shared/logger';

interface RefreshTarget {
  path: string;
  query?: Record<string, string>;
  /** Override TTL per target if needed; defaults to 24h. */
  ttlMs?: number;
}

/**
 * The exact filter tuples the production frontend asks for. Keep in sync
 * with the controller defaults in `dpwh-proxy.controller.ts`.
 */
const FILTERS_TO_REFRESH: RefreshTarget[] = [
  {
    path: '/projects',
    query: {
      page: '1',
      limit: '10000',
      search: 'Libmanan',
      region: 'Region V',
      province: 'CAMARINES SUR'
    }
  }
];

async function refreshOne(target: RefreshTarget): Promise<boolean> {
  const cacheKey = buildCacheKey(target.path, target.query);
  logger.info(`[refresh] starting target ${cacheKey}`);
  const startedAt = Date.now();
  try {
    const result = await dpwhProxyRequest({ path: target.path, query: target.query });
    const dataSize =
      typeof result.body === 'string' ? result.body.length : JSON.stringify(result.body).length;
    await setCached({
      cacheKey,
      data: result.body,
      upstreamStatus: result.status,
      ttlMs: target.ttlMs ?? DEFAULT_CACHE_TTL_MS,
      fetchDurationMs: Date.now() - startedAt
    });
    logger.info(
      `[refresh] OK key=${cacheKey} status=${result.status} bytes=${dataSize} elapsedMs=${Date.now() - startedAt}`
    );
    return true;
  } catch (err) {
    logger.error(
      `[refresh] FAILED key=${cacheKey} reason=${(err as any).reason ?? 'unknown'} ` +
        `message=${(err as Error).message}`
    );
    return false;
  }
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error('[refresh] MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  logger.info('[refresh] connecting to MongoDB…');
  await mongoose.connect(mongoUri);

  let okCount = 0;
  for (const target of FILTERS_TO_REFRESH) {
    const ok = await refreshOne(target);
    if (ok) okCount++;
  }

  await mongoose.disconnect();
  logger.info(`[refresh] done. ${okCount}/${FILTERS_TO_REFRESH.length} targets refreshed.`);

  // Non-zero exit when nothing was refreshed so a scheduler can detect failures.
  if (okCount === 0) process.exit(2);
}

main().catch((err) => {
  logger.error('[refresh] fatal error', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
