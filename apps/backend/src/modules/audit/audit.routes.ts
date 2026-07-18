import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/auth.middleware";
import { handleGetAuditLogs } from "./audit.controller";

export const auditRouter: Router = Router();

// Only Super Admins may view audit logs
auditRouter.get(
  "/",
  requireAuth,
  requireRole("superadmin"),
  handleGetAuditLogs,
);
