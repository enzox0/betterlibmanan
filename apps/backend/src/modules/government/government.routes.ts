import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getExecutiveOfficials,
  createAdminExecutiveOfficial,
  updateAdminExecutiveOfficial,
  deleteAdminExecutiveOfficial,
  getLegislativeMembers,
  createAdminLegislativeMember,
  updateAdminLegislativeMember,
  deleteAdminLegislativeMember,
  getMunicipalOffices,
  createAdminMunicipalOffice,
  updateAdminMunicipalOffice,
  deleteAdminMunicipalOffice,
  getBarangays,
  createAdminBarangay,
  updateAdminBarangay,
  deleteAdminBarangay,
} from "./government.controller";

export const governmentRouter: Router = Router();

// ── Executive Officials ───────────────────────────────────────────────────────
governmentRouter.get("/executive", getExecutiveOfficials);
governmentRouter.post("/executive", requireAuth, createAdminExecutiveOfficial);
governmentRouter.patch(
  "/executive/:id",
  requireAuth,
  updateAdminExecutiveOfficial,
);
governmentRouter.delete(
  "/executive/:id",
  requireAuth,
  deleteAdminExecutiveOfficial,
);

// ── Legislative Members ───────────────────────────────────────────────────────
governmentRouter.get("/legislative", getLegislativeMembers);
governmentRouter.post(
  "/legislative",
  requireAuth,
  createAdminLegislativeMember,
);
governmentRouter.patch(
  "/legislative/:id",
  requireAuth,
  updateAdminLegislativeMember,
);
governmentRouter.delete(
  "/legislative/:id",
  requireAuth,
  deleteAdminLegislativeMember,
);

// ── Municipal Offices ─────────────────────────────────────────────────────────
governmentRouter.get("/offices", getMunicipalOffices);
governmentRouter.post("/offices", requireAuth, createAdminMunicipalOffice);
governmentRouter.patch("/offices/:id", requireAuth, updateAdminMunicipalOffice);
governmentRouter.delete(
  "/offices/:id",
  requireAuth,
  deleteAdminMunicipalOffice,
);

// ── Barangays ─────────────────────────────────────────────────────────────────
governmentRouter.get("/barangays", getBarangays);
governmentRouter.post("/barangays", requireAuth, createAdminBarangay);
governmentRouter.patch("/barangays/:id", requireAuth, updateAdminBarangay);
governmentRouter.delete("/barangays/:id", requireAuth, deleteAdminBarangay);
