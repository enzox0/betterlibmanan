import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedCategories,
  getAdminCategories,
  getCategoryBySlugController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  addServiceController,
  updateServiceController,
  removeServiceController,
  getPublishedLifeEvents,
  getAdminLifeEvents,
  createLifeEventController,
  updateLifeEventController,
  deleteLifeEventController,
} from "./services.controller";

export const servicesRouter: Router = Router();

// ─── Categories (public) ──────────────────────────────────────────────────────
servicesRouter.get("/categories", getPublishedCategories);
servicesRouter.get("/categories/:slug/public", getCategoryBySlugController);

// ─── Categories (admin) ───────────────────────────────────────────────────────
servicesRouter.get("/categories/admin", requireAuth, getAdminCategories);
servicesRouter.post("/categories", requireAuth, createCategoryController);
servicesRouter.patch("/categories/:id", requireAuth, updateCategoryController);
servicesRouter.delete("/categories/:id", requireAuth, deleteCategoryController);

// ─── Individual services within a category (admin) ────────────────────────────
servicesRouter.post(
  "/categories/:categoryId/services",
  requireAuth,
  addServiceController,
);
servicesRouter.patch(
  "/categories/:categoryId/services/:serviceId",
  requireAuth,
  updateServiceController,
);
servicesRouter.delete(
  "/categories/:categoryId/services/:serviceId",
  requireAuth,
  removeServiceController,
);

// ─── Life Events (public) ─────────────────────────────────────────────────────
servicesRouter.get("/life-events", getPublishedLifeEvents);

// ─── Life Events (admin) ──────────────────────────────────────────────────────
servicesRouter.get("/life-events/admin", requireAuth, getAdminLifeEvents);
servicesRouter.post("/life-events", requireAuth, createLifeEventController);
servicesRouter.patch(
  "/life-events/:id",
  requireAuth,
  updateLifeEventController,
);
servicesRouter.delete(
  "/life-events/:id",
  requireAuth,
  deleteLifeEventController,
);
