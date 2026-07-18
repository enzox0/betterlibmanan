import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedContacts,
  getAdminContacts,
  createAdminContact,
  updateAdminContact,
  deleteAdminContact,
} from "./contact.controller";

export const contactRouter: Router = Router();

contactRouter.get("/", getPublishedContacts);
contactRouter.get("/admin", requireAuth, getAdminContacts);
contactRouter.post("/", requireAuth, createAdminContact);
contactRouter.patch("/:id", requireAuth, updateAdminContact);
contactRouter.delete("/:id", requireAuth, deleteAdminContact);
