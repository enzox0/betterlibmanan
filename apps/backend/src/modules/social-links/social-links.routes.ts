import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getSocialLinks,
  createAdminSocialLink,
  updateAdminSocialLink,
  deleteAdminSocialLink,
} from "./social-links.controller";

export const socialLinksRouter: Router = Router();

socialLinksRouter.get("/", getSocialLinks);
socialLinksRouter.post("/", requireAuth, createAdminSocialLink);
socialLinksRouter.patch("/:id", requireAuth, updateAdminSocialLink);
socialLinksRouter.delete("/:id", requireAuth, deleteAdminSocialLink);
