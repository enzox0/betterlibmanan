import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createLatestUpdateRecord,
  deleteLatestUpdateRecord,
  listAdminLatestUpdates,
  listPublicLatestUpdates,
  updateLatestUpdateRecord,
  type LatestUpdatePayload,
} from "../services/latest-updates.api";
import type { ContentRecord } from "../types/admin.types";

interface LatestUpdatesState {
  adminRecords: ContentRecord[];
  publicRecords: ContentRecord[];
  isAdminLoading: boolean;
  isPublicLoading: boolean;
  error: string | null;
  clearError: () => void;
  setAdminRecords: (records: ContentRecord[]) => void;
  setPublicRecords: (records: ContentRecord[]) => void;
  fetchAdminRecords: (accessToken: string) => Promise<ContentRecord[]>;
  fetchPublicRecords: () => Promise<ContentRecord[]>;
  createLatestUpdate: (
    payload: LatestUpdatePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateLatestUpdate: (
    id: string,
    payload: LatestUpdatePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteLatestUpdate: (id: string, accessToken: string) => Promise<void>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

/** Sort descending by date (newest first), then by createdAt descending */
function sortRecords(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const dateA = a.fields.date || "";
    const dateB = b.fields.date || "";
    if (dateA !== dateB) {
      // Lexicographic sort works for ISO date strings (YYYY-MM-DD)
      return dateB.localeCompare(dateA);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function derivePublishedRecords(records: ContentRecord[]): ContentRecord[] {
  return sortRecords(records.filter((r) => r.status === "published"));
}

function upsertRecord(
  records: ContentRecord[],
  nextRecord: ContentRecord,
): ContentRecord[] {
  const existingIndex = records.findIndex((r) => r.id === nextRecord.id);
  if (existingIndex === -1) {
    return sortRecords([...records, nextRecord]);
  }
  const next = [...records];
  next[existingIndex] = nextRecord;
  return sortRecords(next);
}

let publicFetchPromise: Promise<ContentRecord[]> | null = null;
let adminFetchPromise: Promise<ContentRecord[]> | null = null;

export const useLatestUpdatesStore = create<LatestUpdatesState>()(
  persist(
    (set, get) => ({
      adminRecords: [],
      publicRecords: [],
      isAdminLoading: false,
      isPublicLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      setAdminRecords: (records) =>
        set({
          adminRecords: sortRecords(records),
          publicRecords: derivePublishedRecords(records),
        }),

      setPublicRecords: (records) =>
        set({ publicRecords: sortRecords(records) }),

      fetchAdminRecords: async (accessToken) => {
        if (adminFetchPromise) return adminFetchPromise;

        set({ isAdminLoading: true, error: null });
        adminFetchPromise = (async () => {
          try {
            const records = await listAdminLatestUpdates(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(
                error,
                "Failed to load Latest Updates records.",
              ),
            });
            throw error;
          } finally {
            set({ isAdminLoading: false });
            adminFetchPromise = null;
          }
        })();
        return adminFetchPromise;
      },

      fetchPublicRecords: async () => {
        if (publicFetchPromise) return publicFetchPromise;

        set({ isPublicLoading: true, error: null });
        publicFetchPromise = (async () => {
          try {
            const records = await listPublicLatestUpdates();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(
                error,
                "Failed to load Latest Updates records.",
              ),
            });
            throw error;
          } finally {
            set({ isPublicLoading: false });
            publicFetchPromise = null;
          }
        })();
        return publicFetchPromise;
      },

      createLatestUpdate: async (payload, accessToken) => {
        set({ error: null });
        try {
          const created = await createLatestUpdateRecord(payload, accessToken);
          const nextAdmin = upsertRecord(get().adminRecords, created);
          set({
            adminRecords: nextAdmin,
            publicRecords: derivePublishedRecords(nextAdmin),
          });
          return created;
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to create Latest Update record.",
            ),
          });
          throw error;
        }
      },

      updateLatestUpdate: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updated = await updateLatestUpdateRecord(
            id,
            payload,
            accessToken,
          );
          const nextAdmin = upsertRecord(get().adminRecords, updated);
          set({
            adminRecords: nextAdmin,
            publicRecords: derivePublishedRecords(nextAdmin),
          });
          return updated;
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to update Latest Update record.",
            ),
          });
          throw error;
        }
      },

      deleteLatestUpdate: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteLatestUpdateRecord(id, accessToken);
          const nextAdmin = get().adminRecords.filter((r) => r.id !== id);
          set({
            adminRecords: nextAdmin,
            publicRecords: derivePublishedRecords(nextAdmin),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to delete Latest Update record.",
            ),
          });
          throw error;
        }
      },
    }),
    {
      name: "latest-updates-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
