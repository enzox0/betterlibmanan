import { Router } from 'express';
import { getProjects, getProjectById, getProxyHealth, getProxyDiagnostic } from './dpwh-proxy.controller';

/**
 * Express router for the DPWH transparency proxy.
 *
 * Mounted at `/api/dpwh` from the main API router so the available endpoints
 * end up as:
 *   GET /api/dpwh/health
 *   GET /api/dpwh/diagnose
 *   GET /api/dpwh/projects
 *   GET /api/dpwh/projects/:contractId
 */
export const dpwhProxyRouter: Router = Router();

dpwhProxyRouter.get('/health', getProxyHealth);
dpwhProxyRouter.get('/diagnose', getProxyDiagnostic);
dpwhProxyRouter.get('/projects', getProjects);
dpwhProxyRouter.get('/projects/:contractId', getProjectById);
