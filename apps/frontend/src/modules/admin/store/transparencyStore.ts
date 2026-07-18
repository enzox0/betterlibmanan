import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  listProjects,
  createProjectRecord,
  updateProjectRecord,
  deleteProjectRecord,
  bulkImportProjects as bulkImportProjectsApi,
  listFinancialReports,
  createFinancialReportRecord,
  updateFinancialReportRecord,
  deleteFinancialReportRecord,
  type DpwhProjectRecord,
  type ProjectPayload,
  type ProjectSummary,
  type ProjectListParams,
  type FinancialReportRecord,
  type FinancialReportPayload,
  type BulkImportResult,
} from "../services/transparency.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface TransparencyState {
  projects: DpwhProjectRecord[];
  summary: ProjectSummary;
  isLoading: boolean;
  financialReports: FinancialReportRecord[];
  isReportsLoading: boolean;
  error: string | null;

  clearError: () => void;

  fetchProjects: (params?: ProjectListParams) => Promise<DpwhProjectRecord[]>;
  createProject: (
    payload: ProjectPayload,
    accessToken: string,
  ) => Promise<DpwhProjectRecord>;
  updateProject: (
    id: string,
    payload: ProjectPayload,
    accessToken: string,
  ) => Promise<DpwhProjectRecord>;
  deleteProject: (id: string, accessToken: string) => Promise<void>;
  bulkImport: (
    payload: object,
    accessToken: string,
  ) => Promise<BulkImportResult>;

  fetchFinancialReports: () => Promise<FinancialReportRecord[]>;
  createFinancialReport: (
    payload: FinancialReportPayload,
    accessToken: string,
  ) => Promise<FinancialReportRecord>;
  updateFinancialReport: (
    id: string,
    payload: FinancialReportPayload,
    accessToken: string,
  ) => Promise<FinancialReportRecord>;
  deleteFinancialReport: (id: string, accessToken: string) => Promise<void>;
}

// Deduplicate in-flight fetches
let projectsFetch: Promise<DpwhProjectRecord[]> | null = null;
let reportsFetch: Promise<FinancialReportRecord[]> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTransparencyStore = create<TransparencyState>()(
  persist(
    (set, get) => ({
      projects: [],
      summary: {
        totalProjects: 0,
        completed: 0,
        ongoing: 0,
        notStarted: 0,
        totalBudget: 0,
      },
      isLoading: false,
      financialReports: [],
      isReportsLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      fetchProjects: async (params = {}) => {
        if (projectsFetch) return projectsFetch;
        set({ isLoading: true, error: null });
        projectsFetch = (async () => {
          try {
            const res = await listProjects({ limit: 200, ...params });
            set({ projects: res.data, summary: res.summary });
            return res.data;
          } catch (err: any) {
            set({ error: getErrorMessage(err, "Failed to load projects.") });
            throw err;
          } finally {
            set({ isLoading: false });
            projectsFetch = null;
          }
        })();
        return projectsFetch;
      },

      createProject: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createProjectRecord(payload, accessToken);
          set({ projects: [record, ...get().projects] });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create project.") });
          throw err;
        }
      },

      updateProject: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateProjectRecord(id, payload, accessToken);
          set({
            projects: get().projects.map((p) => (p.id === id ? record : p)),
          });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update project.") });
          throw err;
        }
      },

      deleteProject: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteProjectRecord(id, accessToken);
          set({ projects: get().projects.filter((p) => p.id !== id) });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete project.") });
          throw err;
        }
      },

      bulkImport: async (payload, accessToken) => {
        set({ error: null });
        try {
          const result = await bulkImportProjectsApi(payload, accessToken);
          // Refresh the full list so new projects appear
          await listProjects({ limit: 200 }).then((res) =>
            set({ projects: res.data, summary: res.summary }),
          );
          return result;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Bulk import failed.") });
          throw err;
        }
      },

      fetchFinancialReports: async () => {
        if (reportsFetch) return reportsFetch;
        set({ isReportsLoading: true, error: null });
        reportsFetch = (async () => {
          try {
            const records = await listFinancialReports();
            set({ financialReports: records });
            return records;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load financial reports."),
            });
            throw err;
          } finally {
            set({ isReportsLoading: false });
            reportsFetch = null;
          }
        })();
        return reportsFetch;
      },

      createFinancialReport: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createFinancialReportRecord(
            payload,
            accessToken,
          );
          set({ financialReports: [record, ...get().financialReports] });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create report.") });
          throw err;
        }
      },

      updateFinancialReport: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateFinancialReportRecord(
            id,
            payload,
            accessToken,
          );
          set({
            financialReports: get().financialReports.map((r) =>
              r.id === id ? record : r,
            ),
          });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update report.") });
          throw err;
        }
      },

      deleteFinancialReport: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteFinancialReportRecord(id, accessToken);
          set({
            financialReports: get().financialReports.filter((r) => r.id !== id),
          });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete report.") });
          throw err;
        }
      },
    }),
    {
      name: "transparency-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        summary: state.summary,
        financialReports: state.financialReports,
      }),
    },
  ),
);
