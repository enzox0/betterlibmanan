import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedLatestUpdates,
  getAdminLatestUpdates,
  createAdminLatestUpdate,
  updateAdminLatestUpdate,
  deleteAdminLatestUpdate,
} from "./latest-updates.controller";

export const latestUpdatesRouter: Router = Router();

latestUpdatesRouter.get("/", getPublishedLatestUpdates);
latestUpdatesRouter.get("/admin", requireAuth, getAdminLatestUpdates);
latestUpdatesRouter.post("/", requireAuth, createAdminLatestUpdate);
latestUpdatesRouter.patch("/:id", requireAuth, updateAdminLatestUpdate);
latestUpdatesRouter.delete("/:id", requireAuth, deleteAdminLatestUpdate);
