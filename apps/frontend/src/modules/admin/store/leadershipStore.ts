import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createLeadershipRecord,
  deleteLeadershipRecord,
  listAdminLeadership,
  listPublicLeadership,
  updateLeadershipRecord,
  type LeadershipPayload,
} from "../services/leadership.api";
import type { ContentRecord } from "../types/admin.types";

interface LeadershipState {
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
  createLeadership: (
    payload: LeadershipPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateLeadership: (
    id: string,
    payload: LeadershipPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteLeadership: (id: string, accessToken: string) => Promise<void>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

/** Preserve insertion order (createdAt ascending) — mirrors the backend sort */
function sortRecords(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
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

export const useLeadershipStore = create<LeadershipState>()(
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
            const records = await listAdminLeadership(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(
                error,
                "Failed to load Leadership records.",
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
            const records = await listPublicLeadership();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(
                error,
                "Failed to load Leadership records.",
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

      createLeadership: async (payload, accessToken) => {
        set({ error: null });
        try {
          const createdRecord = await createLeadershipRecord(
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
              "Failed to create Leadership record.",
            ),
          });
          throw error;
        }
      },

      updateLeadership: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updatedRecord = await updateLeadershipRecord(
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
              "Failed to update Leadership record.",
            ),
          });
          throw error;
        }
      },

      deleteLeadership: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteLeadershipRecord(id, accessToken);
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
              "Failed to delete Leadership record.",
            ),
          });
          throw error;
        }
      },
    }),
    {
      name: "leadership-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
