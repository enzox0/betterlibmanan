import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getOffices,
  createAdminOffice,
  updateAdminOffice,
  deleteAdminOffice,
} from "./office-directory.controller";

export const officeDirectoryRouter: Router = Router();

officeDirectoryRouter.get("/", getOffices);
officeDirectoryRouter.post("/", requireAuth, createAdminOffice);
officeDirectoryRouter.patch("/:id", requireAuth, updateAdminOffice);
officeDirectoryRouter.delete("/:id", requireAuth, deleteAdminOffice);
