import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublicSources,
  adminListSources,
  adminCreateSource,
  adminUpdateSource,
  adminDeleteSource,
} from "./section-sources.controller";

export const sectionSourcesRouter: Router = Router();

// Public — anyone can read current sources
sectionSourcesRouter.get("/", getPublicSources);

// Admin CRUD
sectionSourcesRouter.post("/", requireAuth, adminCreateSource);
sectionSourcesRouter.patch("/:id", requireAuth, adminUpdateSource);
sectionSourcesRouter.delete("/:id", requireAuth, adminDeleteSource);
