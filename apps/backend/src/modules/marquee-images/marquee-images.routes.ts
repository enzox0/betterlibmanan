import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedMarqueeImages,
  getAdminMarqueeImages,
  createAdminMarqueeImage,
  updateAdminMarqueeImage,
  deleteAdminMarqueeImage,
  uploadAdminMarqueeImage,
  reorderAdminMarqueeImages,
} from "./marquee-images.controller";

export const marqueeImagesRouter: Router = Router();

marqueeImagesRouter.get("/", getPublishedMarqueeImages);
marqueeImagesRouter.get("/admin", requireAuth, getAdminMarqueeImages);
marqueeImagesRouter.post("/", requireAuth, createAdminMarqueeImage);
marqueeImagesRouter.patch("/:id", requireAuth, updateAdminMarqueeImage);
marqueeImagesRouter.delete("/:id", requireAuth, deleteAdminMarqueeImage);
marqueeImagesRouter.post("/upload", requireAuth, uploadAdminMarqueeImage);
marqueeImagesRouter.post("/reorder", requireAuth, reorderAdminMarqueeImages);
