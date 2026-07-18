import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getProjects,
  getProject,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  bulkImportAdminProjects,
  getFinancialReports,
  getFinancialReportById,
  createAdminFinancialReport,
  updateAdminFinancialReport,
  deleteAdminFinancialReport,
} from "./transparency.controller";

export const transparencyRouter: Router = Router();

// Projects — public read, admin write
transparencyRouter.get("/projects", getProjects);
transparencyRouter.get("/projects/:id", getProject);
transparencyRouter.post("/projects", requireAuth, createAdminProject);
transparencyRouter.post(
  "/projects/bulk-import",
  requireAuth,
  bulkImportAdminProjects,
);
transparencyRouter.patch("/projects/:id", requireAuth, updateAdminProject);
transparencyRouter.delete("/projects/:id", requireAuth, deleteAdminProject);

// Financial Reports — public read, admin write
transparencyRouter.get("/financial-reports", getFinancialReports);
transparencyRouter.get("/financial-reports/:id", getFinancialReportById);
transparencyRouter.post(
  "/financial-reports",
  requireAuth,
  createAdminFinancialReport,
);
transparencyRouter.patch(
  "/financial-reports/:id",
  requireAuth,
  updateAdminFinancialReport,
);
transparencyRouter.delete(
  "/financial-reports/:id",
  requireAuth,
  deleteAdminFinancialReport,
);
