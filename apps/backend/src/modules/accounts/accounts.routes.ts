import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/auth.middleware";
import {
  handleListAccounts,
  handleGetAccount,
  handleCreateAccount,
  handleUpdateAccount,
  handleDeleteAccount,
  handleSetAccountStatus,
} from "./accounts.controller";

export const accountsRouter: Router = Router();

// All account management routes require authentication AND superadmin role.
accountsRouter.use(requireAuth, requireRole("superadmin"));

accountsRouter.get("/", handleListAccounts);
accountsRouter.get("/:id", handleGetAccount);
accountsRouter.post("/", handleCreateAccount);
accountsRouter.patch("/:id", handleUpdateAccount);
accountsRouter.delete("/:id", handleDeleteAccount);
accountsRouter.patch("/:id/status", handleSetAccountStatus);
