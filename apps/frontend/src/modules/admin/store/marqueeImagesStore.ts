import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createMarqueeImageRequest,
  deleteMarqueeImageRequest,
  listAdminMarqueeImagesRequest,
  listPublicMarqueeImagesRequest,
  updateMarqueeImageRequest,
  reorderMarqueeImagesRequest,
  type MarqueeImagePayload,
  type ReorderUpdate,
} from "../services/marquee-images.api";
import type { ContentRecord } from "../types/admin.types";

interface MarqueeImagesState {
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
  createMarqueeImage: (
    payload: MarqueeImagePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateMarqueeImage: (
    id: string,
    payload: MarqueeImagePayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteMarqueeImage: (id: string, accessToken: string) => Promise<void>;
  reorderMarqueeImages: (
    updates: ReorderUpdate[],
    accessToken: string,
  ) => Promise<void>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortRecords(records: ContentRecord[]): ContentRecord[] {
  return [...records].sort((a, b) => {
    const rowDiff =
      Number(a.fields.rowNumber ?? 0) - Number(b.fields.rowNumber ?? 0);
    if (rowDiff !== 0) return rowDiff;
    return Number(a.fields.order ?? 0) - Number(b.fields.order ?? 0);
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

export const useMarqueeImagesStore = create<MarqueeImagesState>()(
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
            const records = await listAdminMarqueeImagesRequest(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(error, "Failed to load marquee images."),
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
            const records = await listPublicMarqueeImagesRequest();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(error, "Failed to load marquee images."),
            });
            throw error;
          } finally {
            set({ isPublicLoading: false });
            publicFetchPromise = null;
          }
        })();
        return publicFetchPromise;
      },

      createMarqueeImage: async (payload, accessToken) => {
        set({ error: null });
        try {
          const createdRecord = await createMarqueeImageRequest(
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
            error: getErrorMessage(error, "Failed to create marquee image."),
          });
          throw error;
        }
      },

      updateMarqueeImage: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updatedRecord = await updateMarqueeImageRequest(
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
            error: getErrorMessage(error, "Failed to update marquee image."),
          });
          throw error;
        }
      },

      deleteMarqueeImage: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteMarqueeImageRequest(id, accessToken);
          const nextAdminRecords = get().adminRecords.filter(
            (record) => record.id !== id,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete marquee image."),
          });
          throw error;
        }
      },

      reorderMarqueeImages: async (updates, accessToken) => {
        set({ error: null });
        try {
          await reorderMarqueeImagesRequest(updates, accessToken);
          // Update local state to reflect new order
          const updatedRecords = get().adminRecords.map((record) => {
            const update = updates.find((u) => u.id === record.id);
            if (update) {
              return {
                ...record,
                fields: {
                  ...record.fields,
                  rowNumber: update.rowNumber,
                  order: update.order,
                },
              } as ContentRecord;
            }
            return record;
          });
          set({
            adminRecords: sortRecords(updatedRecords),
            publicRecords: derivePublishedRecords(updatedRecords),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to reorder marquee images."),
          });
          throw error;
        }
      },
    }),
    {
      name: "marquee-images-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
