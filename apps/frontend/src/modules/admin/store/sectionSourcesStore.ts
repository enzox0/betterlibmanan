import { create } from "zustand";
import * as api from "../services/section-sources.api";
import type {
  SectionSourceRecord,
  SectionSourcePayload,
} from "../services/section-sources.api";

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface SectionSourcesState {
  sources: SectionSourceRecord[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  fetchAll: () => Promise<void>;

  upsert: (
    payload: SectionSourcePayload,
    token: string,
  ) => Promise<SectionSourceRecord>;
  update: (
    id: string,
    payload: SectionSourcePayload,
    token: string,
  ) => Promise<SectionSourceRecord>;
  remove: (id: string, token: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSectionSourcesStore = create<SectionSourcesState>()(
  (set, get) => ({
    sources: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const sources = await api.adminListSources();
        set({ sources });
      } catch (err: any) {
        set({ error: getErrorMessage(err, "Failed to load sources.") });
      } finally {
        set({ isLoading: false });
      }
    },

    upsert: async (payload, token) => {
      set({ error: null });
      try {
        const record = await api.adminUpsertSource(payload, token);
        // Replace existing entry for this section, or add new
        set((state) => ({
          sources: state.sources.some((s) => s.section === payload.section)
            ? state.sources.map((s) =>
                s.section === payload.section ? record : s,
              )
            : [...state.sources, record],
        }));
        return record;
      } catch (err: any) {
        set({ error: getErrorMessage(err, "Failed to save source.") });
        throw err;
      }
    },

    update: async (id, payload, token) => {
      set({ error: null });
      try {
        const record = await api.adminUpdateSource(id, payload, token);
        set((state) => ({
          sources: state.sources.map((s) => (s._id === id ? record : s)),
        }));
        return record;
      } catch (err: any) {
        set({ error: getErrorMessage(err, "Failed to update source.") });
        throw err;
      }
    },

    remove: async (id, token) => {
      set({ error: null });
      try {
        await api.adminDeleteSource(id, token);
        set((state) => ({
          sources: state.sources.filter((s) => s._id !== id),
        }));
      } catch (err: any) {
        set({ error: getErrorMessage(err, "Failed to delete source.") });
        throw err;
      }
    },
  }),
);
