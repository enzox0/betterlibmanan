import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedBetterLugs,
  getAdminBetterLugs,
  createAdminBetterLug,
  updateAdminBetterLug,
  deleteAdminBetterLug,
  uploadAdminBetterLugLogo,
} from "./better-lugs.controller";

export const betterLugsRouter: Router = Router();

betterLugsRouter.get("/", getPublishedBetterLugs);
betterLugsRouter.get("/admin", requireAuth, getAdminBetterLugs);
betterLugsRouter.post("/", requireAuth, createAdminBetterLug);
betterLugsRouter.patch("/:id", requireAuth, updateAdminBetterLug);
betterLugsRouter.delete("/:id", requireAuth, deleteAdminBetterLug);
betterLugsRouter.post("/upload", requireAuth, uploadAdminBetterLugLogo);
