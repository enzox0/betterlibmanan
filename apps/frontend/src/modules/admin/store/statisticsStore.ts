import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as api from "../services/statistics.api";
import type {
  MunicipalStatRecord,
  FinanceStatRecord,
  FinanceCompositionRecord,
  PopulationPointRecord,
  BarangayRecord,
  EconomyIndicatorRecord,
  EconomySectorRecord,
  PovertyEntryRecord,
  CompetitivenessItemRecord,
  MunicipalStatPayload,
  FinanceStatPayload,
  FinanceCompositionPayload,
  PopulationPointPayload,
  BarangayPayload,
  EconomyIndicatorPayload,
  EconomySectorPayload,
  PovertyEntryPayload,
  CompetitivenessItemPayload,
} from "../services/statistics.api";

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface StatisticsState {
  municipalStats: MunicipalStatRecord[];
  financeStats: FinanceStatRecord[];
  financeComposition: FinanceCompositionRecord[];
  populationHistory: PopulationPointRecord[];
  barangays: BarangayRecord[];
  economyIndicators: EconomyIndicatorRecord[];
  economySectors: EconomySectorRecord[];
  povertyEntries: PovertyEntryRecord[];
  competitivenessItems: CompetitivenessItemRecord[];

  isLoading: boolean;
  error: string | null;
  clearError: () => void;

  fetchAll: () => Promise<void>;

  // Municipal Stats
  createMunicipalStat: (
    p: MunicipalStatPayload,
    token: string,
  ) => Promise<MunicipalStatRecord>;
  updateMunicipalStat: (
    id: string,
    p: MunicipalStatPayload,
    token: string,
  ) => Promise<MunicipalStatRecord>;
  deleteMunicipalStat: (id: string, token: string) => Promise<void>;

  // Finance Stats
  createFinanceStat: (
    p: FinanceStatPayload,
    token: string,
  ) => Promise<FinanceStatRecord>;
  updateFinanceStat: (
    id: string,
    p: FinanceStatPayload,
    token: string,
  ) => Promise<FinanceStatRecord>;
  deleteFinanceStat: (id: string, token: string) => Promise<void>;

  // Finance Composition
  createFinanceCompositionItem: (
    p: FinanceCompositionPayload,
    token: string,
  ) => Promise<FinanceCompositionRecord>;
  updateFinanceCompositionItem: (
    id: string,
    p: FinanceCompositionPayload,
    token: string,
  ) => Promise<FinanceCompositionRecord>;
  deleteFinanceCompositionItem: (id: string, token: string) => Promise<void>;

  // Population History
  createPopulationPoint: (
    p: PopulationPointPayload,
    token: string,
  ) => Promise<PopulationPointRecord>;
  updatePopulationPoint: (
    id: string,
    p: PopulationPointPayload,
    token: string,
  ) => Promise<PopulationPointRecord>;
  deletePopulationPoint: (id: string, token: string) => Promise<void>;

  // Barangays
  createBarangay: (
    p: BarangayPayload,
    token: string,
  ) => Promise<BarangayRecord[]>;
  updateBarangay: (
    id: string,
    p: BarangayPayload,
    token: string,
  ) => Promise<BarangayRecord[]>;
  deleteBarangay: (id: string, token: string) => Promise<void>;

  // Economy Indicators
  createEconomyIndicator: (
    p: EconomyIndicatorPayload,
    token: string,
  ) => Promise<EconomyIndicatorRecord>;
  updateEconomyIndicator: (
    id: string,
    p: EconomyIndicatorPayload,
    token: string,
  ) => Promise<EconomyIndicatorRecord>;
  deleteEconomyIndicator: (id: string, token: string) => Promise<void>;

  // Economy Sectors
  createEconomySector: (
    p: EconomySectorPayload,
    token: string,
  ) => Promise<EconomySectorRecord>;
  updateEconomySector: (
    id: string,
    p: EconomySectorPayload,
    token: string,
  ) => Promise<EconomySectorRecord>;
  deleteEconomySector: (id: string, token: string) => Promise<void>;

  // Poverty Entries
  createPovertyEntry: (
    p: PovertyEntryPayload,
    token: string,
  ) => Promise<PovertyEntryRecord>;
  updatePovertyEntry: (
    id: string,
    p: PovertyEntryPayload,
    token: string,
  ) => Promise<PovertyEntryRecord>;
  deletePovertyEntry: (id: string, token: string) => Promise<void>;

  // Competitiveness Items
  createCompetitivenessItem: (
    p: CompetitivenessItemPayload,
    token: string,
  ) => Promise<CompetitivenessItemRecord>;
  updateCompetitivenessItem: (
    id: string,
    p: CompetitivenessItemPayload,
    token: string,
  ) => Promise<CompetitivenessItemRecord>;
  deleteCompetitivenessItem: (id: string, token: string) => Promise<void>;
}

// Deduplicate in-flight fetch
let fetchPromise: Promise<void> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set, get) => ({
      municipalStats: [],
      financeStats: [],
      financeComposition: [],
      populationHistory: [],
      barangays: [],
      economyIndicators: [],
      economySectors: [],
      povertyEntries: [],
      competitivenessItems: [],
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      fetchAll: async () => {
        if (fetchPromise) return fetchPromise;
        set({ isLoading: true, error: null });
        fetchPromise = (async () => {
          try {
            const [
              municipalStats,
              financeStats,
              financeComposition,
              populationHistory,
              barangays,
              economyIndicators,
              economySectors,
              povertyEntries,
              competitivenessItems,
            ] = await Promise.all([
              api.listMunicipalStats(),
              api.listFinanceStats(),
              api.listFinanceComposition(),
              api.listPopulationHistory(),
              api.listBarangays(),
              api.listEconomyIndicators(),
              api.listEconomySectors(),
              api.listPovertyEntries(),
              api.listCompetitivenessItems(),
            ]);
            set({
              municipalStats,
              financeStats,
              financeComposition,
              populationHistory,
              barangays,
              economyIndicators,
              economySectors,
              povertyEntries,
              competitivenessItems,
            });
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load statistics data."),
            });
            throw err;
          } finally {
            set({ isLoading: false });
            fetchPromise = null;
          }
        })();
        return fetchPromise;
      },

      // ── Municipal Stats ──────────────────────────────────────────────────────
      createMunicipalStat: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createMunicipalStat(p, token);
          set({
            municipalStats: [...get().municipalStats, record].sort(
              (a, b) => a.order - b.order,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create municipal stat."),
          });
          throw err;
        }
      },
      updateMunicipalStat: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updateMunicipalStat(id, p, token);
          set({
            municipalStats: get().municipalStats.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update municipal stat."),
          });
          throw err;
        }
      },
      deleteMunicipalStat: async (id, token) => {
        set({ error: null });
        try {
          await api.deleteMunicipalStat(id, token);
          set({
            municipalStats: get().municipalStats.filter((r) => r._id !== id),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete municipal stat."),
          });
          throw err;
        }
      },

      // ── Finance Stats ────────────────────────────────────────────────────────
      createFinanceStat: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createFinanceStat(p, token);
          set({
            financeStats: [...get().financeStats, record].sort(
              (a, b) => a.order - b.order,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create finance stat."),
          });
          throw err;
        }
      },
      updateFinanceStat: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updateFinanceStat(id, p, token);
          set({
            financeStats: get().financeStats.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update finance stat."),
          });
          throw err;
        }
      },
      deleteFinanceStat: async (id, token) => {
        set({ error: null });
        try {
          await api.deleteFinanceStat(id, token);
          set({ financeStats: get().financeStats.filter((r) => r._id !== id) });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete finance stat."),
          });
          throw err;
        }
      },

      // ── Finance Composition ──────────────────────────────────────────────────
      createFinanceCompositionItem: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createFinanceCompositionItem(p, token);
          set({
            financeComposition: [...get().financeComposition, record].sort(
              (a, b) => a.order - b.order,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create composition item."),
          });
          throw err;
        }
      },
      updateFinanceCompositionItem: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updateFinanceCompositionItem(id, p, token);
          set({
            financeComposition: get().financeComposition.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update composition item."),
          });
          throw err;
        }
      },
      deleteFinanceCompositionItem: async (id, token) => {
        set({ error: null });
        try {
          await api.deleteFinanceCompositionItem(id, token);
          set({
            financeComposition: get().financeComposition.filter(
              (r) => r._id !== id,
            ),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete composition item."),
          });
          throw err;
        }
      },

      // ── Population History ───────────────────────────────────────────────────
      createPopulationPoint: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createPopulationPoint(p, token);
          set({
            populationHistory: [...get().populationHistory, record].sort(
              (a, b) => a.year - b.year,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create population point."),
          });
          throw err;
        }
      },
      updatePopulationPoint: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updatePopulationPoint(id, p, token);
          set({
            populationHistory: get()
              .populationHistory.map((r) => (r._id === id ? record : r))
              .sort((a, b) => a.year - b.year),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update population point."),
          });
          throw err;
        }
      },
      deletePopulationPoint: async (id, token) => {
        set({ error: null });
        try {
          await api.deletePopulationPoint(id, token);
          set({
            populationHistory: get().populationHistory.filter(
              (r) => r._id !== id,
            ),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete population point."),
          });
          throw err;
        }
      },

      // ── Barangays ────────────────────────────────────────────────────────────
      createBarangay: async (p, token) => {
        set({ error: null });
        try {
          const records = await api.createBarangay(p, token);
          set({ barangays: records });
          return records;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create barangay.") });
          throw err;
        }
      },
      updateBarangay: async (id, p, token) => {
        set({ error: null });
        try {
          const records = await api.updateBarangay(id, p, token);
          set({ barangays: records });
          return records;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update barangay.") });
          throw err;
        }
      },
      deleteBarangay: async (id, token) => {
        set({ error: null });
        try {
          const records = await api.deleteBarangay(id, token);
          set({ barangays: records });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete barangay.") });
          throw err;
        }
      },

      // ── Economy Indicators ───────────────────────────────────────────────────
      createEconomyIndicator: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createEconomyIndicator(p, token);
          set({
            economyIndicators: [...get().economyIndicators, record].sort(
              (a, b) => a.order - b.order,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create economy indicator."),
          });
          throw err;
        }
      },
      updateEconomyIndicator: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updateEconomyIndicator(id, p, token);
          set({
            economyIndicators: get().economyIndicators.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update economy indicator."),
          });
          throw err;
        }
      },
      deleteEconomyIndicator: async (id, token) => {
        set({ error: null });
        try {
          await api.deleteEconomyIndicator(id, token);
          set({
            economyIndicators: get().economyIndicators.filter(
              (r) => r._id !== id,
            ),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete economy indicator."),
          });
          throw err;
        }
      },

      // ── Economy Sectors ──────────────────────────────────────────────────────
      createEconomySector: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createEconomySector(p, token);
          set({
            economySectors: [...get().economySectors, record].sort(
              (a, b) => a.order - b.order,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create economy sector."),
          });
          throw err;
        }
      },
      updateEconomySector: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updateEconomySector(id, p, token);
          set({
            economySectors: get().economySectors.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update economy sector."),
          });
          throw err;
        }
      },
      deleteEconomySector: async (id, token) => {
        set({ error: null });
        try {
          await api.deleteEconomySector(id, token);
          set({
            economySectors: get().economySectors.filter((r) => r._id !== id),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete economy sector."),
          });
          throw err;
        }
      },

      // ── Poverty Entries ──────────────────────────────────────────────────────
      createPovertyEntry: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createPovertyEntry(p, token);
          set({
            povertyEntries: [...get().povertyEntries, record].sort(
              (a, b) => a.year - b.year,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create poverty entry."),
          });
          throw err;
        }
      },
      updatePovertyEntry: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updatePovertyEntry(id, p, token);
          set({
            povertyEntries: get().povertyEntries.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update poverty entry."),
          });
          throw err;
        }
      },
      deletePovertyEntry: async (id, token) => {
        set({ error: null });
        try {
          await api.deletePovertyEntry(id, token);
          set({
            povertyEntries: get().povertyEntries.filter((r) => r._id !== id),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete poverty entry."),
          });
          throw err;
        }
      },

      // ── Competitiveness Items ────────────────────────────────────────────────
      createCompetitivenessItem: async (p, token) => {
        set({ error: null });
        try {
          const record = await api.createCompetitivenessItem(p, token);
          set({
            competitivenessItems: [...get().competitivenessItems, record].sort(
              (a, b) => a.order - b.order,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(
              err,
              "Failed to create competitiveness item.",
            ),
          });
          throw err;
        }
      },
      updateCompetitivenessItem: async (id, p, token) => {
        set({ error: null });
        try {
          const record = await api.updateCompetitivenessItem(id, p, token);
          set({
            competitivenessItems: get().competitivenessItems.map((r) =>
              r._id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(
              err,
              "Failed to update competitiveness item.",
            ),
          });
          throw err;
        }
      },
      deleteCompetitivenessItem: async (id, token) => {
        set({ error: null });
        try {
          await api.deleteCompetitivenessItem(id, token);
          set({
            competitivenessItems: get().competitivenessItems.filter(
              (r) => r._id !== id,
            ),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(
              err,
              "Failed to delete competitiveness item.",
            ),
          });
          throw err;
        }
      },
    }),
    {
      name: "statistics-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        municipalStats: state.municipalStats,
        financeStats: state.financeStats,
        financeComposition: state.financeComposition,
        populationHistory: state.populationHistory,
        barangays: state.barangays,
        economyIndicators: state.economyIndicators,
        economySectors: state.economySectors,
        povertyEntries: state.povertyEntries,
        competitivenessItems: state.competitivenessItems,
      }),
    },
  ),
);
