import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  setAccountStatus,
} from "./accounts.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { logger } from "@/shared/logger";

// ─── Validation schemas ───────────────────────────────────────────────────────

const roleEnum = z.enum(["superadmin", "admin"]);

const createSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(
      /^[a-z0-9_]+$/,
      "Username: lowercase letters, numbers, underscores only",
    ),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64).trim(),
  email: z.string().email(),
  role: roleEnum.default("admin"),
  isActive: z.boolean().optional(),
});

const updateSchema = z.object({
  displayName: z.string().min(1).max(64).trim().optional(),
  email: z.string().email().optional(),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(128).optional(),
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
 * GET /api/accounts
 * List all admin accounts.
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleListAccounts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const accounts = await listAccounts();

    // Audit: read
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "AccountManagement",
          description: "Listed all accounts",
        },
      );
    }

    res.status(200).json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounts/:id
 * Get a single account.
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleGetAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const account = await getAccount(req.params.id);
    res.status(200).json({ success: true, data: account });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/accounts
 * Create a new admin account.
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleCreateAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const account = await createAccount(parsed.data);

    // Audit
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "AccountManagement",
          resourceId: (account as any)._id?.toString(),
          description: `Created account for ${account.displayName} (${account.username}) with role ${account.role}`,
        },
      );
    }

    logger.info(
      `[ACCOUNTS] Created: ${account.username} by ${req.admin?.username}`,
    );
    res.status(201).json({ success: true, data: account });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * PATCH /api/accounts/:id
 * Update an admin account.
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleUpdateAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const account = await updateAccount(req.params.id, parsed.data);

    // Audit
    if (req.admin) {
      const changes = Object.keys(parsed.data)
        .filter((k) => k !== "password")
        .join(", ");
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "AccountManagement",
          resourceId: req.params.id,
          description: `Updated account ${account.username}${changes ? ` (${changes})` : ""}`,
        },
      );
    }

    res.status(200).json({ success: true, data: account });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * DELETE /api/accounts/:id
 * Remove an admin account.
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleDeleteAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Prevent self-deletion
    if (req.admin && req.admin.sub === req.params.id) {
      res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own account.",
        });
      return;
    }

    // Fetch before deleting for audit trail
    const account = await getAccount(req.params.id);
    await deleteAccount(req.params.id);

    // Audit
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "AccountManagement",
          resourceId: req.params.id,
          description: `Deleted account ${account.username} (${account.displayName})`,
        },
      );
    }

    logger.info(
      `[ACCOUNTS] Deleted: ${account.username} by ${req.admin?.username}`,
    );
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * PATCH /api/accounts/:id/status
 * Activate or deactivate an account.
 * Body: { isActive: boolean }
 * Requires: requireAuth + requireRole("superadmin")
 */
export async function handleSetAccountStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const isActive = req.body?.isActive;
    if (typeof isActive !== "boolean") {
      res
        .status(400)
        .json({ success: false, message: "isActive (boolean) is required" });
      return;
    }

    // Prevent deactivating own account
    if (req.admin && req.admin.sub === req.params.id && !isActive) {
      res
        .status(400)
        .json({
          success: false,
          message: "You cannot deactivate your own account.",
        });
      return;
    }

    const account = await setAccountStatus(req.params.id, isActive);

    // Audit
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: isActive ? "ACTIVATE" : "DEACTIVATE",
          module: "AccountManagement",
          resourceId: req.params.id,
          description: `${isActive ? "Activated" : "Deactivated"} account ${account.username} (${account.displayName})`,
        },
      );
    }

    res.status(200).json({ success: true, data: account });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
