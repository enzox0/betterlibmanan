import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublicSettings,
  updateAdminSettings,
  getOrdinances,
  createAdminOrdinance,
  updateAdminOrdinance,
  deleteAdminOrdinance,
  getResolutions,
  createAdminResolution,
  updateAdminResolution,
  deleteAdminResolution,
  getProcessSteps,
  createAdminProcessStep,
  updateAdminProcessStep,
  deleteAdminProcessStep,
  replaceAdminProcessSteps,
  getAboutPoints,
  createAdminAboutPoint,
  updateAdminAboutPoint,
  deleteAdminAboutPoint,
} from "./legislative.controller";

export const legislativeRouter: Router = Router();

// Settings — public read, admin write
legislativeRouter.get("/settings", getPublicSettings);
legislativeRouter.patch("/settings", requireAuth, updateAdminSettings);

// Ordinances — public read, admin write
legislativeRouter.get("/ordinances", getOrdinances);
legislativeRouter.post("/ordinances", requireAuth, createAdminOrdinance);
legislativeRouter.patch("/ordinances/:id", requireAuth, updateAdminOrdinance);
legislativeRouter.delete("/ordinances/:id", requireAuth, deleteAdminOrdinance);

// Resolutions — public read, admin write
legislativeRouter.get("/resolutions", getResolutions);
legislativeRouter.post("/resolutions", requireAuth, createAdminResolution);
legislativeRouter.patch("/resolutions/:id", requireAuth, updateAdminResolution);
legislativeRouter.delete(
  "/resolutions/:id",
  requireAuth,
  deleteAdminResolution,
);

// Process Steps — public read (?variant=ordinance|resolution), admin write
legislativeRouter.get("/process-steps", getProcessSteps);
legislativeRouter.post("/process-steps", requireAuth, createAdminProcessStep);
legislativeRouter.put(
  "/process-steps/replace",
  requireAuth,
  replaceAdminProcessSteps,
);
legislativeRouter.patch(
  "/process-steps/:id",
  requireAuth,
  updateAdminProcessStep,
);
legislativeRouter.delete(
  "/process-steps/:id",
  requireAuth,
  deleteAdminProcessStep,
);

// About Points — public read, admin write
legislativeRouter.get("/about-points", getAboutPoints);
legislativeRouter.post("/about-points", requireAuth, createAdminAboutPoint);
legislativeRouter.patch(
  "/about-points/:id",
  requireAuth,
  updateAdminAboutPoint,
);
legislativeRouter.delete(
  "/about-points/:id",
  requireAuth,
  deleteAdminAboutPoint,
);
