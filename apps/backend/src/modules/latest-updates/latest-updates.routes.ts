import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedLatestUpdates,
  getAdminLatestUpdates,
  createAdminLatestUpdate,
  updateAdminLatestUpdate,
  deleteAdminLatestUpdate,
  uploadAdminLatestUpdateImage,
} from "./latest-updates.controller";

export const latestUpdatesRouter: Router = Router();

latestUpdatesRouter.get("/", getPublishedLatestUpdates);
latestUpdatesRouter.get("/admin", requireAuth, getAdminLatestUpdates);
latestUpdatesRouter.post("/", requireAuth, createAdminLatestUpdate);
latestUpdatesRouter.post("/upload", requireAuth, uploadAdminLatestUpdateImage);
latestUpdatesRouter.patch("/:id", requireAuth, updateAdminLatestUpdate);
latestUpdatesRouter.delete("/:id", requireAuth, deleteAdminLatestUpdate);
