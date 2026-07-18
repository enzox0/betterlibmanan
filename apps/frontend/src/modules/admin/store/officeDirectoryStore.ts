import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentRecord } from "../types/admin.types";
import {
  listOfficeDirectory,
  createOfficeRecord,
  updateOfficeRecord,
  deleteOfficeRecord,
  type OfficeDirectoryPayload,
} from "../services/office-directory.api";

interface OfficeDirectoryState {
  records: ContentRecord[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  fetchRecords: () => Promise<ContentRecord[]>;
  createRecord: (
    payload: OfficeDirectoryPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateRecord: (
    id: string,
    payload: OfficeDirectoryPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteRecord: (id: string, accessToken: string) => Promise<void>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortByOrder(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const oa = (a.fields as any).order ?? 0;
    const ob = (b.fields as any).order ?? 0;
    if (oa !== ob) return oa - ob;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function upsert(list: ContentRecord[], next: ContentRecord): ContentRecord[] {
  const idx = list.findIndex((r) => r.id === next.id);
  if (idx === -1) return sortByOrder([...list, next]);
  const updated = [...list];
  updated[idx] = next;
  return sortByOrder(updated);
}

let fetchPromise: Promise<ContentRecord[]> | null = null;

export const useOfficeDirectoryStore = create<OfficeDirectoryState>()(
  persist(
    (set, get) => ({
      records: [],
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      fetchRecords: async () => {
        if (fetchPromise) return fetchPromise;
        set({ isLoading: true, error: null });
        fetchPromise = (async () => {
          try {
            const records = await listOfficeDirectory();
            set({ records: sortByOrder(records) });
            return records;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load office directory."),
            });
            throw err;
          } finally {
            set({ isLoading: false });
            fetchPromise = null;
          }
        })();
        return fetchPromise;
      },

      createRecord: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createOfficeRecord(payload, accessToken);
          set({ records: upsert(get().records, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create office.") });
          throw err;
        }
      },

      updateRecord: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateOfficeRecord(id, payload, accessToken);
          set({ records: upsert(get().records, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update office.") });
          throw err;
        }
      },

      deleteRecord: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteOfficeRecord(id, accessToken);
          set({ records: get().records.filter((r) => r.id !== id) });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete office.") });
          throw err;
        }
      },
    }),
    {
      name: "office-directory-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
