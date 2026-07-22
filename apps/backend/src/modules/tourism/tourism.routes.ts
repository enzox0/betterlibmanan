import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedTouristSpots,
  getAdminTouristSpots,
  createAdminTouristSpot,
  updateAdminTouristSpot,
  deleteAdminTouristSpot,
  ratePublicTouristSpot,
  uploadAdminTourismImage,
} from "./tourism.controller";

export const tourismRouter: Router = Router();

tourismRouter.get("/", getPublishedTouristSpots);
tourismRouter.get("/admin", requireAuth, getAdminTouristSpots);
tourismRouter.post("/", requireAuth, createAdminTouristSpot);
tourismRouter.patch("/:id", requireAuth, updateAdminTouristSpot);
tourismRouter.delete("/:id", requireAuth, deleteAdminTouristSpot);
// Public rating endpoint — no auth required
tourismRouter.post("/:id/rate", ratePublicTouristSpot);
tourismRouter.post("/upload", requireAuth, uploadAdminTourismImage);
