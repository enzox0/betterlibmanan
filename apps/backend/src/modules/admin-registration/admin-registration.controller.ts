import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  initiateRegistration,
  resendOtp,
  verifyOtpAndCompleteRegistration,
  listRegistrations,
  getRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
  lookupRegistrationByEmail,
} from "./admin-registration.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { logger } from "@/shared/logger";

/**
 * Utility to get client IP
 */
const getClientIp = (req: Request): string => {
  return (
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

// Zod schemas
const submitSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional().default(""),
  department: z.string().optional().default(""),
  reason: z.string().min(1, "Please provide a reason for admin access"),
});

const reviewSchema = z.object({
  rejectionReason: z.string().max(500).optional().default(""),
});

const sendOtpSchema = z.object({
  tempId: z.string().uuid("Invalid tempId"),
});

const verifyOtpSchema = z.object({
  tempId: z.string().uuid("Invalid tempId"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

/**
 * Public: POST /api/admin-registrations/initiate
 * Initiates admin registration, returns tempId
 */
export async function handleInitiateRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
        errors: parsed.error.errors,
      });
      return;
    }

    const result = await initiateRegistration(parsed.data);

    logger.info(
      `[ADMIN-REG] Registration initiated for email: ${parsed.data.email}`,
    );

    res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      data: { tempId: result.tempId },
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next(err);
  }
}

/**
 * Public: POST /api/admin-registrations/resend-otp
 * Resend OTP
 */
export async function handleResendOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
        errors: parsed.error.errors,
      });
      return;
    }

    await resendOtp(parsed.data.tempId);

    res.status(200).json({
      success: true,
      message: "OTP resent",
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next(err);
  }
}

/**
 * Public: POST /api/admin-registrations/verify
 * Verify OTP and complete registration
 */
export async function handleVerifyOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
        errors: parsed.error.errors,
      });
      return;
    }

    const registration = await verifyOtpAndCompleteRegistration(
      parsed.data.tempId,
      parsed.data.otp,
    );

    res.status(200).json({
      success: true,
      message: "Registration successful! Awaiting admin approval",
      data: registration,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    }
    next(err);
  }
}

/**
 * Protected: GET /api/admin-registrations
 * List all admin registration requests
 */
export async function handleListRegistrations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const status = req.query.status as any;
    const registrations = await listRegistrations(status);

    res.status(200).json({ success: true, data: registrations });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/**
 * Protected: GET /api/admin-registrations/:id
 * Get a single admin registration by ID
 */
export async function handleGetRegistration(
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
 * Protected: POST /api/admin-registrations/:id/approve
 * Approve an admin registration (super admin only)
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

    const registration = await approveRegistration(
      req.params.id,
      req.admin.sub,
      req.admin.displayName,
    );

    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "APPROVE",
        module: "AdminRegistrations",
        resourceId: req.params.id,
        description: `Approved admin registration request for ${registration.username} (${registration.displayName})`,
      },
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
 * Protected: POST /api/admin-registrations/:id/reject
 * Reject an admin registration (super admin only)
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

    const registration = await rejectRegistration(
      req.params.id,
      parsed.data.rejectionReason,
      req.admin.sub,
      req.admin.displayName,
    );

    writeAuditLog(
      {
        admin: req.admin,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      },
      {
        action: "REJECT",
        module: "AdminRegistrations",
        resourceId: req.params.id,
        description: `Rejected admin registration request for ${registration.username} (${registration.displayName})`,
      },
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
 * Protected: DELETE /api/admin-registrations/:id
 * Delete an admin registration record (super admin only)
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

/**
 * Public: GET /api/admin-registrations/lookup
 * Lookup a registration by email for the frontend duplicate check
 */
export async function handleLookupByEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
      return;
    }

    const result = await lookupRegistrationByEmail(email);

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
