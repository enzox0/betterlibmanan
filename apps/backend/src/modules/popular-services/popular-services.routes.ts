import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedPopularServices,
  getAdminPopularServices,
  createAdminPopularService,
  updateAdminPopularService,
  deleteAdminPopularService,
  uploadAdminPopularServiceIcon,
} from "./popular-services.controller";

export const popularServicesRouter: Router = Router();

popularServicesRouter.get("/", getPublishedPopularServices);
popularServicesRouter.get("/admin", requireAuth, getAdminPopularServices);
popularServicesRouter.post("/", requireAuth, createAdminPopularService);
popularServicesRouter.patch("/:id", requireAuth, updateAdminPopularService);
popularServicesRouter.delete("/:id", requireAuth, deleteAdminPopularService);
popularServicesRouter.post(
  "/upload",
  requireAuth,
  uploadAdminPopularServiceIcon,
);
