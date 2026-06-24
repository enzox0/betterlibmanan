import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedEmergencyContacts,
  getAdminEmergencyContacts,
  createAdminEmergencyContact,
  updateAdminEmergencyContact,
  deleteAdminEmergencyContact,
} from "./emergency-contacts.controller";

export const emergencyContactsRouter: Router = Router();

emergencyContactsRouter.get("/", getPublishedEmergencyContacts);
emergencyContactsRouter.get("/admin", requireAuth, getAdminEmergencyContacts);
emergencyContactsRouter.post("/", requireAuth, createAdminEmergencyContact);
emergencyContactsRouter.patch("/:id", requireAuth, updateAdminEmergencyContact);
emergencyContactsRouter.delete(
  "/:id",
  requireAuth,
  deleteAdminEmergencyContact,
);
