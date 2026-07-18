import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedMedicalContacts,
  getAdminMedicalContacts,
  createAdminMedicalContact,
  updateAdminMedicalContact,
  deleteAdminMedicalContact,
} from "./medical-contacts.controller";

export const medicalContactsRouter: Router = Router();

medicalContactsRouter.get("/", getPublishedMedicalContacts);
medicalContactsRouter.get("/admin", requireAuth, getAdminMedicalContacts);
medicalContactsRouter.post("/", requireAuth, createAdminMedicalContact);
medicalContactsRouter.patch("/:id", requireAuth, updateAdminMedicalContact);
medicalContactsRouter.delete("/:id", requireAuth, deleteAdminMedicalContact);
