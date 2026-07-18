import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createHistoryRecord,
  deleteHistoryRecord,
  listAdminHistory,
  listPublicHistory,
  updateHistoryRecord,
  bulkImportHistoryRecords,
  type HistoryPayload,
  type HistoryBulkImportItem,
} from "../services/history.api";
import type { ContentRecord } from "../types/admin.types";

interface HistoryState {
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
  createHistory: (
    payload: HistoryPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateHistory: (
    id: string,
    payload: HistoryPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteHistory: (id: string, accessToken: string) => Promise<void>;
  bulkImportHistory: (
    items: HistoryBulkImportItem[],
    accessToken: string,
  ) => Promise<{ imported: number }>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

/** Sort ascending by year (numeric), then by createdAt ascending — mirrors the HistoryLayout sort */
function sortRecords(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const ya = parseInt(a.fields.year ?? "0", 10);
    const yb = parseInt(b.fields.year ?? "0", 10);
    if (ya !== yb) return ya - yb;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function derivePublishedRecords(records: ContentRecord[]): ContentRecord[] {
  return sortRecords(records.filter((record) => record.status === "published"));
}

function upsertRecord(
  records: ContentRecord[],
  nextRecord: ContentRecord,
): ContentRecord[] {
  const existingIndex = records.findIndex(
    (record) => record.id === nextRecord.id,
  );
  if (existingIndex === -1) {
    return sortRecords([...records, nextRecord]);
  }
  const nextRecords = [...records];
  nextRecords[existingIndex] = nextRecord;
  return sortRecords(nextRecords);
}

let publicFetchPromise: Promise<ContentRecord[]> | null = null;
let adminFetchPromise: Promise<ContentRecord[]> | null = null;

export const useHistoryStore = create<HistoryState>()(
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
        set({
          publicRecords: sortRecords(records),
        }),

      fetchAdminRecords: async (accessToken) => {
        if (adminFetchPromise) {
          return adminFetchPromise;
        }

        set({ isAdminLoading: true, error: null });
        adminFetchPromise = (async () => {
          try {
            const records = await listAdminHistory(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(error, "Failed to load History records."),
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
        if (publicFetchPromise) {
          return publicFetchPromise;
        }

        set({ isPublicLoading: true, error: null });
        publicFetchPromise = (async () => {
          try {
            const records = await listPublicHistory();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(error, "Failed to load History records."),
            });
            throw error;
          } finally {
            set({ isPublicLoading: false });
            publicFetchPromise = null;
          }
        })();
        return publicFetchPromise;
      },

      createHistory: async (payload, accessToken) => {
        set({ error: null });
        try {
          const createdRecord = await createHistoryRecord(payload, accessToken);
          const nextAdminRecords = upsertRecord(
            get().adminRecords,
            createdRecord,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
          return createdRecord;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to create History record."),
          });
          throw error;
        }
      },

      updateHistory: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updatedRecord = await updateHistoryRecord(
            id,
            payload,
            accessToken,
          );
          const nextAdminRecords = upsertRecord(
            get().adminRecords,
            updatedRecord,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
          return updatedRecord;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to update History record."),
          });
          throw error;
        }
      },

      deleteHistory: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteHistoryRecord(id, accessToken);
          const nextAdminRecords = get().adminRecords.filter(
            (record) => record.id !== id,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete History record."),
          });
          throw error;
        }
      },

      bulkImportHistory: async (items, accessToken) => {
        set({ error: null });
        try {
          const result = await bulkImportHistoryRecords(items, accessToken);
          // Replace the full admin records list with the freshly returned set
          set({
            adminRecords: sortRecords(result.data),
            publicRecords: derivePublishedRecords(result.data),
          });
          return { imported: result.imported };
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to bulk import History records.",
            ),
          });
          throw error;
        }
      },
    }),
    {
      name: "history-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
