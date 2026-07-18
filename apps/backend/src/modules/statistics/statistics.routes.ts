import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublicStatistics,
  getMunicipalStats,
  createAdminMunicipalStat,
  updateAdminMunicipalStat,
  deleteAdminMunicipalStat,
  getFinanceStats,
  createAdminFinanceStat,
  updateAdminFinanceStat,
  deleteAdminFinanceStat,
  getFinanceComposition,
  createAdminFinanceComposition,
  updateAdminFinanceComposition,
  deleteAdminFinanceComposition,
  getPopulationHistory,
  createAdminPopulationPoint,
  updateAdminPopulationPoint,
  deleteAdminPopulationPoint,
  getBarangays,
  createAdminBarangay,
  updateAdminBarangay,
  deleteAdminBarangay,
  getEconomyIndicators,
  createAdminEconomyIndicator,
  updateAdminEconomyIndicator,
  deleteAdminEconomyIndicator,
  getEconomySectors,
  createAdminEconomySector,
  updateAdminEconomySector,
  deleteAdminEconomySector,
  getPovertyEntries,
  createAdminPovertyEntry,
  updateAdminPovertyEntry,
  deleteAdminPovertyEntry,
  getCompetitivenessItems,
  createAdminCompetitivenessItem,
  updateAdminCompetitivenessItem,
  deleteAdminCompetitivenessItem,
} from "./statistics.controller";

export const statisticsRouter: Router = Router();

// Public — full bundle in one request
statisticsRouter.get("/", getPublicStatistics);

// Municipal Stats
statisticsRouter.get("/municipal-stats", getMunicipalStats);
statisticsRouter.post(
  "/municipal-stats",
  requireAuth,
  createAdminMunicipalStat,
);
statisticsRouter.patch(
  "/municipal-stats/:id",
  requireAuth,
  updateAdminMunicipalStat,
);
statisticsRouter.delete(
  "/municipal-stats/:id",
  requireAuth,
  deleteAdminMunicipalStat,
);

// Finance Stats
statisticsRouter.get("/finance-stats", getFinanceStats);
statisticsRouter.post("/finance-stats", requireAuth, createAdminFinanceStat);
statisticsRouter.patch(
  "/finance-stats/:id",
  requireAuth,
  updateAdminFinanceStat,
);
statisticsRouter.delete(
  "/finance-stats/:id",
  requireAuth,
  deleteAdminFinanceStat,
);

// Finance Composition
statisticsRouter.get("/finance-composition", getFinanceComposition);
statisticsRouter.post(
  "/finance-composition",
  requireAuth,
  createAdminFinanceComposition,
);
statisticsRouter.patch(
  "/finance-composition/:id",
  requireAuth,
  updateAdminFinanceComposition,
);
statisticsRouter.delete(
  "/finance-composition/:id",
  requireAuth,
  deleteAdminFinanceComposition,
);

// Population History
statisticsRouter.get("/population", getPopulationHistory);
statisticsRouter.post("/population", requireAuth, createAdminPopulationPoint);
statisticsRouter.patch(
  "/population/:id",
  requireAuth,
  updateAdminPopulationPoint,
);
statisticsRouter.delete(
  "/population/:id",
  requireAuth,
  deleteAdminPopulationPoint,
);

// Barangays
statisticsRouter.get("/barangays", getBarangays);
statisticsRouter.post("/barangays", requireAuth, createAdminBarangay);
statisticsRouter.patch("/barangays/:id", requireAuth, updateAdminBarangay);
statisticsRouter.delete("/barangays/:id", requireAuth, deleteAdminBarangay);

// Economy Indicators
statisticsRouter.get("/economy-indicators", getEconomyIndicators);
statisticsRouter.post(
  "/economy-indicators",
  requireAuth,
  createAdminEconomyIndicator,
);
statisticsRouter.patch(
  "/economy-indicators/:id",
  requireAuth,
  updateAdminEconomyIndicator,
);
statisticsRouter.delete(
  "/economy-indicators/:id",
  requireAuth,
  deleteAdminEconomyIndicator,
);

// Economy Sectors
statisticsRouter.get("/economy-sectors", getEconomySectors);
statisticsRouter.post(
  "/economy-sectors",
  requireAuth,
  createAdminEconomySector,
);
statisticsRouter.patch(
  "/economy-sectors/:id",
  requireAuth,
  updateAdminEconomySector,
);
statisticsRouter.delete(
  "/economy-sectors/:id",
  requireAuth,
  deleteAdminEconomySector,
);

// Poverty Entries
statisticsRouter.get("/poverty", getPovertyEntries);
statisticsRouter.post("/poverty", requireAuth, createAdminPovertyEntry);
statisticsRouter.patch("/poverty/:id", requireAuth, updateAdminPovertyEntry);
statisticsRouter.delete("/poverty/:id", requireAuth, deleteAdminPovertyEntry);

// Competitiveness Items
statisticsRouter.get("/competitiveness", getCompetitivenessItems);
statisticsRouter.post(
  "/competitiveness",
  requireAuth,
  createAdminCompetitivenessItem,
);
statisticsRouter.patch(
  "/competitiveness/:id",
  requireAuth,
  updateAdminCompetitivenessItem,
);
statisticsRouter.delete(
  "/competitiveness/:id",
  requireAuth,
  deleteAdminCompetitivenessItem,
);
