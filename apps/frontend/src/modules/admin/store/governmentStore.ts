import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentRecord } from "../types/admin.types";
import {
  listPublicExecutiveOfficials,
  createExecutiveOfficialRecord,
  updateExecutiveOfficialRecord,
  deleteExecutiveOfficialRecord,
  listPublicLegislativeMembers,
  createLegislativeMemberRecord,
  updateLegislativeMemberRecord,
  deleteLegislativeMemberRecord,
  listPublicMunicipalOffices,
  createMunicipalOfficeRecord,
  updateMunicipalOfficeRecord,
  deleteMunicipalOfficeRecord,
  listPublicBarangays,
  createBarangayRecord,
  updateBarangayRecord,
  deleteBarangayRecord,
  type ExecutiveOfficialPayload,
  type LegislativeMemberPayload,
  type MunicipalOfficePayload,
  type BarangayPayload,
} from "../services/government.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortByOrder(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const orderA = (a.fields as any).order ?? 0;
    const orderB = (b.fields as any).order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function upsertRecord(
  list: ContentRecord[],
  next: ContentRecord,
): ContentRecord[] {
  const idx = list.findIndex((r) => r.id === next.id);
  if (idx === -1) return sortByOrder([...list, next]);
  const updated = [...list];
  updated[idx] = next;
  return sortByOrder(updated);
}

// ─── State interface ──────────────────────────────────────────────────────────

interface GovernmentState {
  executive: ContentRecord[];
  legislative: ContentRecord[];
  offices: ContentRecord[];
  barangays: ContentRecord[];

  isExecutiveLoading: boolean;
  isLegislativeLoading: boolean;
  isOfficesLoading: boolean;
  isBarangaysLoading: boolean;
  error: string | null;

  clearError: () => void;

  // Fetch (used by both public page and admin page)
  fetchExecutive: () => Promise<ContentRecord[]>;
  fetchLegislative: () => Promise<ContentRecord[]>;
  fetchOffices: () => Promise<ContentRecord[]>;
  fetchBarangays: () => Promise<ContentRecord[]>;

  // Executive
  createExecutive: (
    payload: ExecutiveOfficialPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateExecutive: (
    id: string,
    payload: ExecutiveOfficialPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteExecutive: (id: string, accessToken: string) => Promise<void>;

  // Legislative
  createLegislative: (
    payload: LegislativeMemberPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateLegislative: (
    id: string,
    payload: LegislativeMemberPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteLegislative: (id: string, accessToken: string) => Promise<void>;

  // Offices
  createOffice: (
    payload: MunicipalOfficePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateOffice: (
    id: string,
    payload: MunicipalOfficePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteOffice: (id: string, accessToken: string) => Promise<void>;

  // Barangays
  createBarangay: (
    payload: BarangayPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateBarangay: (
    id: string,
    payload: BarangayPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteBarangay: (id: string, accessToken: string) => Promise<void>;
}

// Deduplicate in-flight fetches
let executiveFetch: Promise<ContentRecord[]> | null = null;
let legislativeFetch: Promise<ContentRecord[]> | null = null;
let officesFetch: Promise<ContentRecord[]> | null = null;
let barangaysFetch: Promise<ContentRecord[]> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGovernmentStore = create<GovernmentState>()(
  persist(
    (set, get) => ({
      executive: [],
      legislative: [],
      offices: [],
      barangays: [],

      isExecutiveLoading: false,
      isLegislativeLoading: false,
      isOfficesLoading: false,
      isBarangaysLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      // ── Fetch ────────────────────────────────────────────────────────────────

      fetchExecutive: async () => {
        if (executiveFetch) return executiveFetch;
        set({ isExecutiveLoading: true, error: null });
        executiveFetch = (async () => {
          try {
            const records = await listPublicExecutiveOfficials();
            const sorted = sortByOrder(records);
            set({ executive: sorted });
            return sorted;
          } catch (error: any) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load executive officials.",
              ),
            });
            throw error;
          } finally {
            set({ isExecutiveLoading: false });
            executiveFetch = null;
          }
        })();
        return executiveFetch;
      },

      fetchLegislative: async () => {
        if (legislativeFetch) return legislativeFetch;
        set({ isLegislativeLoading: true, error: null });
        legislativeFetch = (async () => {
          try {
            const records = await listPublicLegislativeMembers();
            const sorted = sortByOrder(records);
            set({ legislative: sorted });
            return sorted;
          } catch (error: any) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load legislative members.",
              ),
            });
            throw error;
          } finally {
            set({ isLegislativeLoading: false });
            legislativeFetch = null;
          }
        })();
        return legislativeFetch;
      },

      fetchOffices: async () => {
        if (officesFetch) return officesFetch;
        set({ isOfficesLoading: true, error: null });
        officesFetch = (async () => {
          try {
            const records = await listPublicMunicipalOffices();
            const sorted = sortByOrder(records);
            set({ offices: sorted });
            return sorted;
          } catch (error: any) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load municipal offices.",
              ),
            });
            throw error;
          } finally {
            set({ isOfficesLoading: false });
            officesFetch = null;
          }
        })();
        return officesFetch;
      },

      fetchBarangays: async () => {
        if (barangaysFetch) return barangaysFetch;
        set({ isBarangaysLoading: true, error: null });
        barangaysFetch = (async () => {
          try {
            const records = await listPublicBarangays();
            const sorted = sortByOrder(records);
            set({ barangays: sorted });
            return sorted;
          } catch (error: any) {
            set({ error: getErrorMessage(error, "Failed to load barangays.") });
            throw error;
          } finally {
            set({ isBarangaysLoading: false });
            barangaysFetch = null;
          }
        })();
        return barangaysFetch;
      },

      // ── Executive mutations ───────────────────────────────────────────────────

      createExecutive: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createExecutiveOfficialRecord(
            payload,
            accessToken,
          );
          set({ executive: upsertRecord(get().executive, record) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to create executive official.",
            ),
          });
          throw error;
        }
      },

      updateExecutive: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateExecutiveOfficialRecord(
            id,
            payload,
            accessToken,
          );
          set({ executive: upsertRecord(get().executive, record) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to update executive official.",
            ),
          });
          throw error;
        }
      },

      deleteExecutive: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteExecutiveOfficialRecord(id, accessToken);
          set({ executive: get().executive.filter((r) => r.id !== id) });
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to delete executive official.",
            ),
          });
          throw error;
        }
      },

      // ── Legislative mutations ─────────────────────────────────────────────────

      createLegislative: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createLegislativeMemberRecord(
            payload,
            accessToken,
          );
          set({ legislative: upsertRecord(get().legislative, record) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to create legislative member.",
            ),
          });
          throw error;
        }
      },

      updateLegislative: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateLegislativeMemberRecord(
            id,
            payload,
            accessToken,
          );
          set({ legislative: upsertRecord(get().legislative, record) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to update legislative member.",
            ),
          });
          throw error;
        }
      },

      deleteLegislative: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteLegislativeMemberRecord(id, accessToken);
          set({ legislative: get().legislative.filter((r) => r.id !== id) });
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to delete legislative member.",
            ),
          });
          throw error;
        }
      },

      // ── Office mutations ──────────────────────────────────────────────────────

      createOffice: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createMunicipalOfficeRecord(
            payload,
            accessToken,
          );
          set({ offices: upsertRecord(get().offices, record) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to create municipal office."),
          });
          throw error;
        }
      },

      updateOffice: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateMunicipalOfficeRecord(
            id,
            payload,
            accessToken,
          );
          set({ offices: upsertRecord(get().offices, record) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to update municipal office."),
          });
          throw error;
        }
      },

      deleteOffice: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteMunicipalOfficeRecord(id, accessToken);
          set({ offices: get().offices.filter((r) => r.id !== id) });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete municipal office."),
          });
          throw error;
        }
      },

      // ── Barangay mutations ────────────────────────────────────────────────────

      createBarangay: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createBarangayRecord(payload, accessToken);
          set({ barangays: upsertRecord(get().barangays, record) });
          return record;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to create barangay.") });
          throw error;
        }
      },

      updateBarangay: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateBarangayRecord(id, payload, accessToken);
          set({ barangays: upsertRecord(get().barangays, record) });
          return record;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to update barangay.") });
          throw error;
        }
      },

      deleteBarangay: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteBarangayRecord(id, accessToken);
          set({ barangays: get().barangays.filter((r) => r.id !== id) });
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to delete barangay.") });
          throw error;
        }
      },
    }),
    {
      name: "government-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        executive: state.executive,
        legislative: state.legislative,
        offices: state.offices,
        barangays: state.barangays,
      }),
    },
  ),
);
