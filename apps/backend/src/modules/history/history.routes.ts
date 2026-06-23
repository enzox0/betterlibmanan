import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedHistory,
  getAdminHistory,
  createAdminHistory,
  updateAdminHistory,
  deleteAdminHistory,
  bulkImportAdminHistory,
} from "./history.controller";

export const historyRouter: Router = Router();

historyRouter.get("/", getPublishedHistory);
historyRouter.get("/admin", requireAuth, getAdminHistory);
historyRouter.post("/", requireAuth, createAdminHistory);
historyRouter.post("/bulk-import", requireAuth, bulkImportAdminHistory);
historyRouter.patch("/:id", requireAuth, updateAdminHistory);
historyRouter.delete("/:id", requireAuth, deleteAdminHistory);
