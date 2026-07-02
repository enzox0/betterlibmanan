import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  submitRegistration,
  listRegistrations,
  getRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
} from "./admin-registration.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { logger } from "@/shared/logger";

// ─── Validation schemas ───────────────────────────────────────────────────────

const submitSchema = z.object({
  displayName: z.string().min(2).max(64).trim(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(
      /^[a-z0-9_]+$/,
      "Username: lowercase letters, numbers, underscores only",
    ),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().max(32).optional().default(""),
  department: z.string().max(128).optional().default(""),
  reason: z.string().max(500).optional().default(""),
});

const reviewSchema = z.object({
  rejectionReason: z.string().max(500).optional().default(""),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * POST /api/admin-registrations
 * Public — anyone can submit a registration request.
 */
export async function handleSubmitRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const registration = await submitRegistration(parsed.data);
    logger.info(`[ADMIN-REG] New registration from: ${parsed.data.username}`);
    res.status(201).json({ success: true, data: registration });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * GET /api/admin-registrations
 * Requires: requireAuth + requireRole("superadmin")
 * Optional query: ?status=pending|approved|rejected
 */
export async function handleListRegistrations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const validStatuses = ["pending", "approved", "rejected"];
    const statusFilter =
      status && validStatuses.includes(status)
        ? (status as "pending" | "approved" | "rejected")
        : undefined;

    const registrations = await listRegistrations(statusFilter);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "AdminRegistrations",
          description: `Listed admin registrations${statusFilter ? ` (status: ${statusFilter})` : ""}`,
        },
      );
    }

    res.status(200).json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin-registrations/:id
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleGetRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const registration = await getRegistration(req.params.id);
    res.status(200).json({ success: true, data: registration });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * PATCH /api/admin-registrations/:id/approve
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleApproveRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const registration = await approveRegistration(req.params.id, {
      status: "approved",
      reviewerId: req.admin.sub,
      reviewerName: req.admin.displayName,
    });

    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "ACTIVATE",
        module: "AdminRegistrations",
        resourceId: req.params.id,
        description: `Approved admin registration for ${registration.username} (${registration.displayName}) — admin account created`,
      },
    );

    logger.info(
      `[ADMIN-REG] Approved: ${registration.username} by ${req.admin.username}`,
    );
    res.status(200).json({ success: true, data: registration });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * PATCH /api/admin-registrations/:id/reject
 * Body: { rejectionReason?: string }
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleRejectRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const registration = await rejectRegistration(req.params.id, {
      status: "rejected",
      rejectionReason: parsed.data.rejectionReason,
      reviewerId: req.admin.sub,
      reviewerName: req.admin.displayName,
    });

    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "DEACTIVATE",
        module: "AdminRegistrations",
        resourceId: req.params.id,
        description: `Rejected admin registration for ${registration.username} (${registration.displayName})${parsed.data.rejectionReason ? ` — reason: ${parsed.data.rejectionReason}` : ""}`,
      },
    );

    logger.info(
      `[ADMIN-REG] Rejected: ${registration.username} by ${req.admin.username}`,
    );
    res.status(200).json({ success: true, data: registration });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * DELETE /api/admin-registrations/:id
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleDeleteRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const registration = await getRegistration(req.params.id);
    await deleteRegistration(req.params.id);

    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "DELETE",
        module: "AdminRegistrations",
        resourceId: req.params.id,
        description: `Deleted admin registration record for ${registration.username} (${registration.displayName})`,
      },
    );

    res.status(200).json({ success: true, message: "Registration deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
