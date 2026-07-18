import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedAtAGlance,
  getAdminAtAGlance,
  createAdminAtAGlance,
  updateAdminAtAGlance,
  deleteAdminAtAGlance,
} from "./at-a-glance.controller";

export const atAGlanceRouter: Router = Router();

atAGlanceRouter.get("/", getPublishedAtAGlance);
atAGlanceRouter.get("/admin", requireAuth, getAdminAtAGlance);
atAGlanceRouter.post("/", requireAuth, createAdminAtAGlance);
atAGlanceRouter.patch("/:id", requireAuth, updateAdminAtAGlance);
atAGlanceRouter.delete("/:id", requireAuth, deleteAdminAtAGlance);
