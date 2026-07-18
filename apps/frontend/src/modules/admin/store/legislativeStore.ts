import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getPublicLegislativeSettings,
  updateLegislativeSettings,
  listOrdinances,
  createOrdinanceRecord,
  updateOrdinanceRecord,
  deleteOrdinanceRecord,
  listResolutions,
  createResolutionRecord,
  updateResolutionRecord,
  deleteResolutionRecord,
  listProcessSteps,
  createProcessStepRecord,
  updateProcessStepRecord,
  deleteProcessStepRecord,
  replaceProcessStepsRequest,
  listAboutPoints,
  createAboutPointRecord,
  updateAboutPointRecord,
  deleteAboutPointRecord,
  type LegislativeSettings,
  type LegislativeDocRecord,
  type ProcessStepRecord,
  type AboutPointRecord,
  type DocPayload,
  type ProcessStepPayload,
  type ReplaceStepsPayload,
  type AboutPointPayload,
  type SettingsPayload,
} from "../services/legislative.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortByCreatedAt<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function upsert<T extends { id: string; createdAt: string }>(
  list: T[],
  item: T,
): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return sortByCreatedAt([...list, item]);
  const next = [...list];
  next[idx] = item;
  return sortByCreatedAt(next);
}

// ─── State ────────────────────────────────────────────────────────────────────

interface LegislativeState {
  // Settings
  settings: LegislativeSettings | null;
  isSettingsLoading: boolean;

  // Documents
  ordinances: LegislativeDocRecord[];
  resolutions: LegislativeDocRecord[];
  isOrdinancesLoading: boolean;
  isResolutionsLoading: boolean;

  // Process steps
  ordSteps: ProcessStepRecord[];
  resSteps: ProcessStepRecord[];
  isOrdStepsLoading: boolean;
  isResStepsLoading: boolean;

  // About points
  aboutPoints: AboutPointRecord[];
  isAboutLoading: boolean;

  error: string | null;
  clearError: () => void;

  // Settings actions
  fetchSettings: () => Promise<LegislativeSettings>;
  saveSettings: (
    payload: SettingsPayload,
    accessToken: string,
  ) => Promise<LegislativeSettings>;

  // Ordinance actions
  fetchOrdinances: () => Promise<LegislativeDocRecord[]>;
  createOrdinance: (
    payload: DocPayload,
    accessToken: string,
  ) => Promise<LegislativeDocRecord>;
  updateOrdinance: (
    id: string,
    payload: DocPayload,
    accessToken: string,
  ) => Promise<LegislativeDocRecord>;
  deleteOrdinance: (id: string, accessToken: string) => Promise<void>;

  // Resolution actions
  fetchResolutions: () => Promise<LegislativeDocRecord[]>;
  createResolution: (
    payload: DocPayload,
    accessToken: string,
  ) => Promise<LegislativeDocRecord>;
  updateResolution: (
    id: string,
    payload: DocPayload,
    accessToken: string,
  ) => Promise<LegislativeDocRecord>;
  deleteResolution: (id: string, accessToken: string) => Promise<void>;

  // Process step actions
  fetchOrdSteps: () => Promise<ProcessStepRecord[]>;
  fetchResSteps: () => Promise<ProcessStepRecord[]>;
  createProcessStep: (
    payload: ProcessStepPayload,
    accessToken: string,
  ) => Promise<ProcessStepRecord>;
  updateProcessStep: (
    id: string,
    payload: ProcessStepPayload,
    accessToken: string,
  ) => Promise<ProcessStepRecord>;
  deleteProcessStep: (id: string, accessToken: string) => Promise<void>;
  replaceProcessSteps: (
    payload: ReplaceStepsPayload,
    accessToken: string,
  ) => Promise<ProcessStepRecord[]>;

  // About point actions
  fetchAboutPoints: () => Promise<AboutPointRecord[]>;
  createAboutPoint: (
    payload: AboutPointPayload,
    accessToken: string,
  ) => Promise<AboutPointRecord>;
  updateAboutPoint: (
    id: string,
    payload: AboutPointPayload,
    accessToken: string,
  ) => Promise<AboutPointRecord>;
  deleteAboutPoint: (id: string, accessToken: string) => Promise<void>;
}

// Deduplicate concurrent in-flight fetches
let settingsFetch: Promise<LegislativeSettings> | null = null;
let ordinancesFetch: Promise<LegislativeDocRecord[]> | null = null;
let resolutionsFetch: Promise<LegislativeDocRecord[]> | null = null;
let ordStepsFetch: Promise<ProcessStepRecord[]> | null = null;
let resStepsFetch: Promise<ProcessStepRecord[]> | null = null;
let aboutFetch: Promise<AboutPointRecord[]> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLegislativeStore = create<LegislativeState>()(
  persist(
    (set, get) => ({
      settings: null,
      isSettingsLoading: false,
      ordinances: [],
      resolutions: [],
      isOrdinancesLoading: false,
      isResolutionsLoading: false,
      ordSteps: [],
      resSteps: [],
      isOrdStepsLoading: false,
      isResStepsLoading: false,
      aboutPoints: [],
      isAboutLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      // ── Settings ─────────────────────────────────────────────────────────────

      fetchSettings: async () => {
        if (settingsFetch) return settingsFetch;
        set({ isSettingsLoading: true, error: null });
        settingsFetch = (async () => {
          try {
            const s = await getPublicLegislativeSettings();
            set({ settings: s });
            return s;
          } catch (err: any) {
            set({ error: getErrorMessage(err, "Failed to load settings.") });
            throw err;
          } finally {
            set({ isSettingsLoading: false });
            settingsFetch = null;
          }
        })();
        return settingsFetch;
      },

      saveSettings: async (payload, accessToken) => {
        set({ error: null });
        try {
          const s = await updateLegislativeSettings(payload, accessToken);
          set({ settings: s });
          return s;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to save settings.") });
          throw err;
        }
      },

      // ── Ordinances ────────────────────────────────────────────────────────────

      fetchOrdinances: async () => {
        if (ordinancesFetch) return ordinancesFetch;
        set({ isOrdinancesLoading: true, error: null });
        ordinancesFetch = (async () => {
          try {
            const records = await listOrdinances();
            set({ ordinances: sortByCreatedAt(records) });
            return records;
          } catch (err: any) {
            set({ error: getErrorMessage(err, "Failed to load ordinances.") });
            throw err;
          } finally {
            set({ isOrdinancesLoading: false });
            ordinancesFetch = null;
          }
        })();
        return ordinancesFetch;
      },

      createOrdinance: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createOrdinanceRecord(payload, accessToken);
          set({ ordinances: upsert(get().ordinances, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create ordinance.") });
          throw err;
        }
      },

      updateOrdinance: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateOrdinanceRecord(id, payload, accessToken);
          set({ ordinances: upsert(get().ordinances, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update ordinance.") });
          throw err;
        }
      },

      deleteOrdinance: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteOrdinanceRecord(id, accessToken);
          set({ ordinances: get().ordinances.filter((d) => d.id !== id) });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete ordinance.") });
          throw err;
        }
      },

      // ── Resolutions ───────────────────────────────────────────────────────────

      fetchResolutions: async () => {
        if (resolutionsFetch) return resolutionsFetch;
        set({ isResolutionsLoading: true, error: null });
        resolutionsFetch = (async () => {
          try {
            const records = await listResolutions();
            set({ resolutions: sortByCreatedAt(records) });
            return records;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load resolutions."),
            });
            throw err;
          } finally {
            set({ isResolutionsLoading: false });
            resolutionsFetch = null;
          }
        })();
        return resolutionsFetch;
      },

      createResolution: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createResolutionRecord(payload, accessToken);
          set({ resolutions: upsert(get().resolutions, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create resolution.") });
          throw err;
        }
      },

      updateResolution: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateResolutionRecord(id, payload, accessToken);
          set({ resolutions: upsert(get().resolutions, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update resolution.") });
          throw err;
        }
      },

      deleteResolution: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteResolutionRecord(id, accessToken);
          set({ resolutions: get().resolutions.filter((d) => d.id !== id) });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete resolution.") });
          throw err;
        }
      },

      // ── Process Steps ──────────────────────────────────────────────────────────

      fetchOrdSteps: async () => {
        if (ordStepsFetch) return ordStepsFetch;
        set({ isOrdStepsLoading: true, error: null });
        ordStepsFetch = (async () => {
          try {
            const records = await listProcessSteps("ordinance");
            const sorted = [...records].sort(
              (a, b) => a.fields.step - b.fields.step,
            );
            set({ ordSteps: sorted });
            return sorted;
          } catch (err: any) {
            set({
              error: getErrorMessage(
                err,
                "Failed to load ordinance process steps.",
              ),
            });
            throw err;
          } finally {
            set({ isOrdStepsLoading: false });
            ordStepsFetch = null;
          }
        })();
        return ordStepsFetch;
      },

      fetchResSteps: async () => {
        if (resStepsFetch) return resStepsFetch;
        set({ isResStepsLoading: true, error: null });
        resStepsFetch = (async () => {
          try {
            const records = await listProcessSteps("resolution");
            const sorted = [...records].sort(
              (a, b) => a.fields.step - b.fields.step,
            );
            set({ resSteps: sorted });
            return sorted;
          } catch (err: any) {
            set({
              error: getErrorMessage(
                err,
                "Failed to load resolution process steps.",
              ),
            });
            throw err;
          } finally {
            set({ isResStepsLoading: false });
            resStepsFetch = null;
          }
        })();
        return resStepsFetch;
      },

      createProcessStep: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createProcessStepRecord(payload, accessToken);
          const key = payload.variant === "ordinance" ? "ordSteps" : "resSteps";
          const current = get()[key];
          const next = [...current, record].sort(
            (a, b) => a.fields.step - b.fields.step,
          );
          set({ [key]: next });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create process step."),
          });
          throw err;
        }
      },

      updateProcessStep: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateProcessStepRecord(
            id,
            payload,
            accessToken,
          );
          const key = payload.variant === "ordinance" ? "ordSteps" : "resSteps";
          const current = get()[key];
          const idx = current.findIndex((s) => s.id === id);
          const next =
            idx === -1
              ? [...current, record]
              : current.map((s) => (s.id === id ? record : s));
          set({
            [key]: next.sort((a, b) => a.fields.step - b.fields.step),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update process step."),
          });
          throw err;
        }
      },

      deleteProcessStep: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteProcessStepRecord(id, accessToken);
          // Remove from whichever list contains it
          set({
            ordSteps: get()
              .ordSteps.filter((s) => s.id !== id)
              .map((s, i) => ({
                ...s,
                fields: { ...s.fields, step: i + 1 },
              })),
            resSteps: get()
              .resSteps.filter((s) => s.id !== id)
              .map((s, i) => ({
                ...s,
                fields: { ...s.fields, step: i + 1 },
              })),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete process step."),
          });
          throw err;
        }
      },

      replaceProcessSteps: async (payload, accessToken) => {
        set({ error: null });
        try {
          const records = await replaceProcessStepsRequest(
            payload,
            accessToken,
          );
          const sorted = [...records].sort(
            (a, b) => a.fields.step - b.fields.step,
          );
          const key = payload.variant === "ordinance" ? "ordSteps" : "resSteps";
          set({ [key]: sorted });
          return sorted;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to reorder process steps."),
          });
          throw err;
        }
      },

      // ── About Points ──────────────────────────────────────────────────────────

      fetchAboutPoints: async () => {
        if (aboutFetch) return aboutFetch;
        set({ isAboutLoading: true, error: null });
        aboutFetch = (async () => {
          try {
            const records = await listAboutPoints();
            set({ aboutPoints: records });
            return records;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load about points."),
            });
            throw err;
          } finally {
            set({ isAboutLoading: false });
            aboutFetch = null;
          }
        })();
        return aboutFetch;
      },

      createAboutPoint: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createAboutPointRecord(payload, accessToken);
          set({ aboutPoints: [...get().aboutPoints, record] });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create about point."),
          });
          throw err;
        }
      },

      updateAboutPoint: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateAboutPointRecord(id, payload, accessToken);
          set({
            aboutPoints: get().aboutPoints.map((p) =>
              p.id === id ? record : p,
            ),
          });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update about point."),
          });
          throw err;
        }
      },

      deleteAboutPoint: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteAboutPointRecord(id, accessToken);
          set({
            aboutPoints: get().aboutPoints.filter((p) => p.id !== id),
          });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete about point."),
          });
          throw err;
        }
      },
    }),
    {
      name: "legislative-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        ordinances: state.ordinances,
        resolutions: state.resolutions,
        ordSteps: state.ordSteps,
        resSteps: state.resSteps,
        aboutPoints: state.aboutPoints,
      }),
    },
  ),
);
