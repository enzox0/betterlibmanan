import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "@/modules/auth/auth.middleware";
import {
  handleSubmitRegistration,
  handleListRegistrations,
  handleGetRegistration,
  handleApproveRegistration,
  handleRejectRegistration,
  handleDeleteRegistration,
} from "./admin-registration.controller";

export const adminRegistrationRouter: Router = Router();

/**
 * Rate-limit registration submissions — prevent spam / brute-force.
 * 5 submissions per hour per IP.
 */
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public route ─────────────────────────────────────────────────────────────

// Anyone can submit an admin registration request
adminRegistrationRouter.post("/", submitLimiter, handleSubmitRegistration);

// ─── Protected routes (superadmin only) ──────────────────────────────────────

adminRegistrationRouter.use(requireAuth, requireRole("superadmin"));

adminRegistrationRouter.get("/", handleListRegistrations);
adminRegistrationRouter.get("/:id", handleGetRegistration);
adminRegistrationRouter.patch("/:id/approve", handleApproveRegistration);
adminRegistrationRouter.patch("/:id/reject", handleRejectRegistration);
adminRegistrationRouter.delete("/:id", handleDeleteRegistration);
