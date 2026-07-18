import { Request, Response, NextFunction } from "express";
import { queryAuditLogs, AuditQueryOptions } from "./audit.service";
import type { AuditAction } from "./audit-log.model";

/**
 * GET /api/audit
 * Query parameters:
 *   adminId, action, module, fromDate, toDate, page, limit
 *
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleGetAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const opts: AuditQueryOptions = {};

    if (req.query.adminId) opts.adminId = String(req.query.adminId);
    if (req.query.action) opts.action = String(req.query.action) as AuditAction;
    if (req.query.module) opts.module = String(req.query.module);
    if (req.query.fromDate)
      opts.fromDate = new Date(String(req.query.fromDate));
    if (req.query.toDate) opts.toDate = new Date(String(req.query.toDate));
    if (req.query.page) opts.page = parseInt(String(req.query.page), 10);
    if (req.query.limit) opts.limit = parseInt(String(req.query.limit), 10);

    const result = await queryAuditLogs(opts);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
