import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedMunicipalHall,
  getAdminMunicipalHall,
  createAdminMunicipalHall,
  updateAdminMunicipalHall,
  deleteAdminMunicipalHall,
  uploadAdminMunicipalHall,
} from "./municipal-hall.controller";

export const municipalHallRouter: Router = Router();

municipalHallRouter.get("/", getPublishedMunicipalHall);
municipalHallRouter.get("/admin", requireAuth, getAdminMunicipalHall);
municipalHallRouter.post("/", requireAuth, createAdminMunicipalHall);
municipalHallRouter.patch("/:id", requireAuth, updateAdminMunicipalHall);
municipalHallRouter.delete("/:id", requireAuth, deleteAdminMunicipalHall);
municipalHallRouter.post("/upload", requireAuth, uploadAdminMunicipalHall);
