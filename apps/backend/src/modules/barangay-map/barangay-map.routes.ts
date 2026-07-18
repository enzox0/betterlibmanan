import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedBarangayMapRecords,
  getAdminBarangayMapRecords,
  createAdminBarangayMapRecord,
  updateAdminBarangayMapRecord,
  deleteAdminBarangayMapRecord,
  uploadAdminBarangayMapImage,
} from "./barangay-map.controller";

export const barangayMapRouter: Router = Router();

barangayMapRouter.get("/", getPublishedBarangayMapRecords);
barangayMapRouter.get("/admin", requireAuth, getAdminBarangayMapRecords);
barangayMapRouter.post("/", requireAuth, createAdminBarangayMapRecord);
barangayMapRouter.patch("/:id", requireAuth, updateAdminBarangayMapRecord);
barangayMapRouter.delete("/:id", requireAuth, deleteAdminBarangayMapRecord);
barangayMapRouter.post("/upload", requireAuth, uploadAdminBarangayMapImage);
