import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedTouristSpots,
  getAdminTouristSpots,
  createAdminTouristSpot,
  updateAdminTouristSpot,
  deleteAdminTouristSpot,
  uploadAdminTourismImage,
} from "./tourism.controller";

export const tourismRouter: Router = Router();

tourismRouter.get("/", getPublishedTouristSpots);
tourismRouter.get("/admin", requireAuth, getAdminTouristSpots);
tourismRouter.post("/", requireAuth, createAdminTouristSpot);
tourismRouter.patch("/:id", requireAuth, updateAdminTouristSpot);
tourismRouter.delete("/:id", requireAuth, deleteAdminTouristSpot);
tourismRouter.post("/upload", requireAuth, uploadAdminTourismImage);
