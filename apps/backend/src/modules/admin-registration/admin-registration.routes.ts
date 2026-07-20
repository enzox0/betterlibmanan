import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "@/modules/auth/auth.middleware";
import {
  handleInitiateRegistration,
  handleResendOtp,
  handleVerifyOtp,
  handleListRegistrations,
  handleGetRegistration,
  handleApproveRegistration,
  handleRejectRegistration,
  handleDeleteRegistration,
  handleLookupByEmail,
} from "./admin-registration.controller";

const adminRegistrationRouter = Router();

/**
 * Rate-limit registration submissions - prevent spam/abuse
 */
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per IP per hour
  message: {
    success: false,
    message: "Too many registration attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for OTP endpoints to prevent abuse
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// PUBLIC ROUTES

// Lookup by email (for frontend duplicate check)
adminRegistrationRouter.get("/lookup", handleLookupByEmail);

// Initiate registration (first step)
adminRegistrationRouter.post(
  "/initiate",
  submitLimiter,
  handleInitiateRegistration,
);

// Resend OTP
adminRegistrationRouter.post("/resend-otp", otpLimiter, handleResendOtp);

// Verify OTP and complete registration
adminRegistrationRouter.post("/verify", otpLimiter, handleVerifyOtp);

// PROTECTED ROUTES (admin authenticated only)

// List all admin registrations
adminRegistrationRouter.get("/", requireAuth, handleListRegistrations);

// Get single admin registration by ID
adminRegistrationRouter.get("/:id", requireAuth, handleGetRegistration);

// Approve an admin registration (super admin only)
adminRegistrationRouter.post(
  "/:id/approve",
  requireAuth,
  requireRole("superadmin"),
  handleApproveRegistration,
);

// Reject an admin registration (super admin only)
adminRegistrationRouter.post(
  "/:id/reject",
  requireAuth,
  requireRole("superadmin"),
  handleRejectRegistration,
);

// Delete an admin registration (super admin only)
adminRegistrationRouter.delete(
  "/:id",
  requireAuth,
  requireRole("superadmin"),
  handleDeleteRegistration,
);

export { adminRegistrationRouter };
