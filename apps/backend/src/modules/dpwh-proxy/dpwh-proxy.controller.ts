import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger';
import { dpwhProxyRequest } from './dpwh-proxy.service';

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
 * GET /api/dpwh/projects
 *
 * Proxies the upstream `GET /projects` endpoint of the DPWH transparency API.
 * Query parameters are forwarded; any missing filters fall back to the
 * Libmanan / Camarines Sur defaults so the existing frontend keeps working
 * without changes.
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = asString(req.query.page) ?? '1';
    const limit = asString(req.query.limit) ?? '10000';
    const search = asString(req.query.search) ?? DEFAULT_PROJECT_FILTERS.search;
    const region = asString(req.query.region) ?? DEFAULT_PROJECT_FILTERS.region;
    const province = asString(req.query.province) ?? DEFAULT_PROJECT_FILTERS.province;

    const result = await dpwhProxyRequest({
      path: '/projects',
      query: { page, limit, search, region, province }
    });

    res.status(result.status);
    if (result.contentType) res.setHeader('Content-Type', result.contentType);
    res.send(result.body);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dpwh/projects/:contractId
 *
 * Proxies the upstream `GET /projects/:contractId` endpoint. The contractId
 * is URL-encoded before being placed on the upstream path to keep things safe
 * against odd characters DPWH sometimes uses in their identifiers.
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contractId } = req.params;
    if (!contractId) {
      return res.status(400).json({ success: false, message: 'contractId is required' });
    }

    const result = await dpwhProxyRequest({
      path: `/projects/${encodeURIComponent(contractId)}`
    });

    res.status(result.status);
    if (result.contentType) res.setHeader('Content-Type', result.contentType);
    res.send(result.body);
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

// Re-export logger so consumers don't need a separate import in tests
export { logger as dpwhLogger };
