import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedLeadership,
  getAdminLeadership,
  createAdminLeadership,
  updateAdminLeadership,
  deleteAdminLeadership,
  uploadAdminLeadershipAvatar,
} from "./leadership.controller";

export const leadershipRouter: Router = Router();

leadershipRouter.get("/", getPublishedLeadership);
leadershipRouter.get("/admin", requireAuth, getAdminLeadership);
leadershipRouter.post("/", requireAuth, createAdminLeadership);
leadershipRouter.patch("/:id", requireAuth, updateAdminLeadership);
leadershipRouter.delete("/:id", requireAuth, deleteAdminLeadership);
leadershipRouter.post("/upload", requireAuth, uploadAdminLeadershipAvatar);
