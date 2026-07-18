import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createAtAGlanceRecord,
  deleteAtAGlanceRecord,
  listAdminAtAGlance,
  listPublicAtAGlance,
  updateAtAGlanceRecord,
  type AtAGlancePayload,
} from "../services/at-a-glance.api";
import type { ContentRecord } from "../types/admin.types";

interface AtAGlanceState {
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
  createAtAGlance: (
    payload: AtAGlancePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateAtAGlance: (
    id: string,
    payload: AtAGlancePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteAtAGlance: (id: string, accessToken: string) => Promise<void>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortRecords(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const createdDiff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
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

export const useAtAGlanceStore = create<AtAGlanceState>()(
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
            const records = await listAdminAtAGlance(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(
                error,
                "Failed to load At a Glance records.",
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
        if (publicFetchPromise) {
          return publicFetchPromise;
        }

        set({ isPublicLoading: true, error: null });
        publicFetchPromise = (async () => {
          try {
            const records = await listPublicAtAGlance();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(
                error,
                "Failed to load At a Glance records.",
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

      createAtAGlance: async (payload, accessToken) => {
        set({ error: null });
        try {
          const createdRecord = await createAtAGlanceRecord(
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
            error: getErrorMessage(
              error,
              "Failed to create At a Glance record.",
            ),
          });
          throw error;
        }
      },

      updateAtAGlance: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updatedRecord = await updateAtAGlanceRecord(
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
            error: getErrorMessage(
              error,
              "Failed to update At a Glance record.",
            ),
          });
          throw error;
        }
      },

      deleteAtAGlance: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteAtAGlanceRecord(id, accessToken);
          const nextAdminRecords = get().adminRecords.filter(
            (record) => record.id !== id,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(
              error,
              "Failed to delete At a Glance record.",
            ),
          });
          throw error;
        }
      },
    }),
    {
      name: "at-a-glance-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
