import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  login,
  refresh,
  logout,
  logoutAll,
  updateMe,
  changeMyPassword,
  uploadAvatar,
} from "./auth.service";
import { AdminModel } from "./admin.model";
import { logger } from "@/shared/logger";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { queryAuditLogs } from "@/modules/audit/audit.service";

// ─── Request schemas ──────────────────────────────────────────────────────────

const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(32),
  password: z.string().min(1, "Password is required").max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
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
 * POST /api/auth/login
 * Body: { username, password }
 */
export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const { username, password } = parsed.data;
    const result = await login({
      username,
      password,
      userAgent: req.headers["user-agent"],
      ipAddress: getClientIp(req),
    });

    // Audit: record successful login
    writeAuditLog(
      {
        admin: {
          sub: (result.admin._id as any).toString(),
          username: result.admin.username,
          displayName: result.admin.displayName,
          role: result.admin.role,
          type: "access",
        },
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "LOGIN",
        module: "Auth",
        description: `${result.admin.displayName} (${result.admin.username}) logged in`,
      },
    );

    logger.info(`[AUTH] Login successful: ${username}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        admin: result.admin,
      },
    });
  } catch (err: any) {
    if (err.statusCode === 401) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
export async function handleRefresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: "refreshToken is required" });
      return;
    }

    const result = await refresh(parsed.data.refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        admin: result.admin,
      },
    });
  } catch (err: any) {
    if (err.statusCode === 401) {
      res.status(401).json({
        success: false,
        message: err.message,
        code: err.code || "REFRESH_FAILED",
      });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Body: { refreshToken }
 * Requires: Bearer access token in Authorization header
 */
export async function handleLogout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = logoutSchema.safeParse(req.body);
    if (parsed.success) {
      await logout(parsed.data.refreshToken);
    }

    // Audit: record logout
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "LOGOUT",
          module: "Auth",
          description: `${req.admin.displayName} (${req.admin.username}) logged out`,
        },
      );
    }

    // Always respond 200 — idempotent logout
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout-all
 * Revokes all refresh tokens for the authenticated admin (all devices).
 * Requires: Bearer access token
 */
export async function handleLogoutAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }
    await logoutAll(req.admin.sub);
    logger.info(`[AUTH] All sessions revoked for admin: ${req.admin.username}`);

    // Audit: record logout-all
    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "LOGOUT_ALL",
        module: "Auth",
        description: `${req.admin.displayName} (${req.admin.username}) revoked all sessions`,
      },
    );

    res.status(200).json({ success: true, message: "All sessions revoked" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated admin's profile from the database (includes extended fields).
 * Requires: Bearer access token
 */
export async function handleMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  try {
    const admin = await AdminModel.findById(req.admin.sub)
      .select("-password")
      .lean();

    if (!admin) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
}

// ─── Self-service profile handlers ───────────────────────────────────────────

const updateMeSchema = z.object({
  displayName: z.string().min(1).max(64).trim().optional(),
  email: z.string().email().optional(),
  phone: z.string().max(32).trim().optional(),
  department: z.string().max(128).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  avatarUrl: z.string().trim().optional(),
  avatarKey: z.string().trim().optional(),
});

const uploadAvatarSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

/**
 * PATCH /api/auth/me
 * Update the authenticated admin's own profile (displayName, email, phone, department, bio).
 * Role and isActive cannot be modified here.
 * Requires: Bearer access token
 */
export async function handleUpdateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const admin = await updateMe(req.admin.sub, parsed.data);

    // Audit
    const changes = Object.keys(parsed.data).join(", ");
    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "UPDATE",
        module: "MyAccount",
        resourceId: req.admin.sub,
        description: `${req.admin.displayName} updated their profile${changes ? ` (${changes})` : ""}`,
      },
    );

    res.status(200).json({ success: true, data: admin });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/auth/me/password
 * Change the authenticated admin's own password.
 * Requires: Bearer access token
 */
export async function handleChangeMyPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    await changeMyPassword(req.admin.sub, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    // Audit
    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "UPDATE",
        module: "MyAccount",
        resourceId: req.admin.sub,
        description: `${req.admin.displayName} changed their password`,
      },
    );

    logger.info(`[AUTH] Password changed for admin: ${req.admin.username}`);
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * POST /api/auth/me/avatar
 * Uploads a new avatar image for the authenticated admin.
 * Requires: Bearer access token
 */
export async function handleUploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const parsed = uploadAvatarSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const uploaded = await uploadAvatar(parsed.data);

    // Audit
    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "UPDATE",
        module: "MyAccount",
        resourceId: req.admin.sub,
        description: `${req.admin.displayName} uploaded a new avatar`,
      },
    );

    res.status(200).json({ success: true, data: uploaded });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * GET /api/auth/me/activity
 * Returns the authenticated admin's recent audit log entries (last 20).
 * Requires: Bearer access token
 */
export async function handleGetMyActivity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const result = await queryAuditLogs({
      adminId: req.admin.sub,
      limit: 20,
      page: 1,
    });

    res.status(200).json({ success: true, data: result.logs });
  } catch (err) {
    next(err);
  }
}
