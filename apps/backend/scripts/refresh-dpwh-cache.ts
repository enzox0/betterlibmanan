import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";

// Use process.cwd() instead of __dirname so this resolves correctly whether
// the script runs via tsx (source), compiled JS, Docker, or VPS deployment.
// All run commands are invoked from the monorepo root.
dotenv.config({ path: `${process.cwd()}/.env` });

import mongoose from "mongoose";
import { dpwhProxyRequest } from "@/modules/dpwh-proxy/dpwh-proxy.service";
import {
  buildCacheKey,
  setCached,
  DEFAULT_CACHE_TTL_MS,
} from "@/modules/dpwh-proxy/dpwh-cache.service";
import { logger } from "@/shared/logger";

interface RefreshTarget {
  path: string;
  query?: Record<string, string>;
  ttlMs?: number;
}

const FILTERS_TO_REFRESH: RefreshTarget[] = [
  {
    path: "/projects",
    query: {
      page: "1",
      limit: "10000",
      search: "Libmanan",
      region: "Region V",
      province: "CAMARINES SUR",
    },
  },
];

async function refreshOne(target: RefreshTarget): Promise<boolean> {
  const cacheKey = buildCacheKey(target.path, target.query);
  logger.info(`[refresh] starting target ${cacheKey}`);
  const startedAt = Date.now();
  try {
    const result = await dpwhProxyRequest({
      path: target.path,
      query: target.query,
    });
    const dataSize =
      typeof result.body === "string"
        ? result.body.length
        : JSON.stringify(result.body).length;
    await setCached({
      cacheKey,
      data: result.body,
      upstreamStatus: result.status,
      ttlMs: target.ttlMs ?? DEFAULT_CACHE_TTL_MS,
      fetchDurationMs: Date.now() - startedAt,
    });
    logger.info(
      `[refresh] OK key=${cacheKey} status=${result.status} bytes=${dataSize} elapsedMs=${Date.now() - startedAt}`,
    );
    return true;
  } catch (err) {
    logger.error(
      `[refresh] FAILED key=${cacheKey} reason=${(err as any).reason ?? "unknown"} ` +
        `message=${(err as Error).message}`,
    );
    return false;
  }
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error("[refresh] MONGODB_URI is not set. Aborting.");
    process.exit(1);
  }

  logger.info("[refresh] connecting to MongoDB…");
  await mongoose.connect(mongoUri);

  let okCount = 0;
  for (const target of FILTERS_TO_REFRESH) {
    const ok = await refreshOne(target);
    if (ok) okCount++;
  }

  await mongoose.disconnect();
  logger.info(
    `[refresh] done. ${okCount}/${FILTERS_TO_REFRESH.length} targets refreshed.`,
  );

  if (okCount === 0) process.exit(2);
}

main().catch((err) => {
  logger.error("[refresh] fatal error", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
