import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createBetterLugRequest,
  deleteBetterLugRequest,
  listAdminBetterLugsRequest,
  listPublicBetterLugsRequest,
  updateBetterLugRequest,
  type BetterLugPayload,
} from "../services/better-lugs.api";
import type { ContentRecord } from "../types/admin.types";

interface BetterLugsState {
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
  createBetterLug: (
    payload: BetterLugPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateBetterLug: (
    id: string,
    payload: BetterLugPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteBetterLug: (id: string, accessToken: string) => Promise<void>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortRecords(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const updatedDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (updatedDiff !== 0) return updatedDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

export const useBetterLugsStore = create<BetterLugsState>()(
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
            const records = await listAdminBetterLugsRequest(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(error, "Failed to load Better LGUs."),
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
            const records = await listPublicBetterLugsRequest();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(error, "Failed to load Better LGUs."),
            });
            throw error;
          } finally {
            set({ isPublicLoading: false });
            publicFetchPromise = null;
          }
        })();
        return publicFetchPromise;
      },

      createBetterLug: async (payload, accessToken) => {
        set({ error: null });
        try {
          const createdRecord = await createBetterLugRequest(
            payload,
            accessToken,
          );
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
            error: getErrorMessage(error, "Failed to create Better LGU."),
          });
          throw error;
        }
      },

      updateBetterLug: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updatedRecord = await updateBetterLugRequest(
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
            error: getErrorMessage(error, "Failed to update Better LGU."),
          });
          throw error;
        }
      },

      deleteBetterLug: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteBetterLugRequest(id, accessToken);
          const nextAdminRecords = get().adminRecords.filter(
            (record) => record.id !== id,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete Better LGU."),
          });
          throw error;
        }
      },
    }),
    {
      name: "better-lugs-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
