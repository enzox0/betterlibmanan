import { AuditLogModel, AuditAction } from "./audit-log.model";
import type { AccessTokenPayload } from "@/modules/auth/auth.service";
import { logger } from "@/shared/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditContext {
  admin: AccessTokenPayload;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogOptions {
  action: AuditAction;
  module: string;
  description: string;
  resourceId?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Write an audit log entry. Fire-and-forget — never throws so a logging
 * failure can't break the request that triggered it.
 */
export async function writeAuditLog(
  ctx: AuditContext,
  opts: LogOptions,
): Promise<void> {
  try {
    await AuditLogModel.create({
      adminId: ctx.admin.sub,
      adminUsername: ctx.admin.username,
      adminDisplayName: ctx.admin.displayName,
      adminRole: ctx.admin.role,
      action: opts.action,
      module: opts.module,
      resourceId: opts.resourceId,
      description: opts.description,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  } catch (err) {
    logger.error("[AUDIT] Failed to write audit log:", err);
  }
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export interface AuditQueryOptions {
  adminId?: string;
  action?: AuditAction;
  module?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export async function queryAuditLogs(opts: AuditQueryOptions = {}) {
  const filter: Record<string, unknown> = {};

  if (opts.adminId) filter["adminId"] = opts.adminId;
  if (opts.action) filter["action"] = opts.action;
  if (opts.module) filter["module"] = opts.module;
  if (opts.fromDate || opts.toDate) {
    filter["createdAt"] = {};
    if (opts.fromDate) (filter["createdAt"] as any)["$gte"] = opts.fromDate;
    if (opts.toDate) (filter["createdAt"] as any)["$lte"] = opts.toDate;
  }

  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    AuditLogModel.countDocuments(filter),
    AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}
