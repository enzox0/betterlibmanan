import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentRecord } from "../types/admin.types";
import {
  listPublicMedicalContacts,
  listAdminMedicalContacts,
  createMedicalContactRecord,
  updateMedicalContactRecord,
  deleteMedicalContactRecord,
  type MedicalContactPayload,
} from "../services/medical-contacts.api";

interface MedicalContactsState {
  adminRecords: ContentRecord[];
  publicRecords: ContentRecord[];
  isAdminLoading: boolean;
  isPublicLoading: boolean;
  error: string | null;
  clearError: () => void;
  fetchAdminRecords: (accessToken: string) => Promise<ContentRecord[]>;
  fetchPublicRecords: () => Promise<ContentRecord[]>;
  createRecord: (
    payload: MedicalContactPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateRecord: (
    id: string,
    payload: MedicalContactPayload,
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

function derivePublished(records: ContentRecord[]): ContentRecord[] {
  return sortByOrder(records.filter((r) => r.status === "published"));
}

function upsert(list: ContentRecord[], next: ContentRecord): ContentRecord[] {
  const idx = list.findIndex((r) => r.id === next.id);
  if (idx === -1) return sortByOrder([...list, next]);
  const updated = [...list];
  updated[idx] = next;
  return sortByOrder(updated);
}

let adminFetch: Promise<ContentRecord[]> | null = null;
let publicFetch: Promise<ContentRecord[]> | null = null;

export const useMedicalContactsStore = create<MedicalContactsState>()(
  persist(
    (set, get) => ({
      adminRecords: [],
      publicRecords: [],
      isAdminLoading: false,
      isPublicLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      fetchAdminRecords: async (accessToken) => {
        if (adminFetch) return adminFetch;
        set({ isAdminLoading: true, error: null });
        adminFetch = (async () => {
          try {
            const records = await listAdminMedicalContacts(accessToken);
            const sorted = sortByOrder(records);
            set({
              adminRecords: sorted,
              publicRecords: derivePublished(sorted),
            });
            return sorted;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load medical contacts."),
            });
            throw err;
          } finally {
            set({ isAdminLoading: false });
            adminFetch = null;
          }
        })();
        return adminFetch;
      },

      fetchPublicRecords: async () => {
        if (publicFetch) return publicFetch;
        set({ isPublicLoading: true, error: null });
        publicFetch = (async () => {
          try {
            const records = await listPublicMedicalContacts();
            set({ publicRecords: sortByOrder(records) });
            return records;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load medical contacts."),
            });
            throw err;
          } finally {
            set({ isPublicLoading: false });
            publicFetch = null;
          }
        })();
        return publicFetch;
      },

      createRecord: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createMedicalContactRecord(payload, accessToken);
          const next = upsert(get().adminRecords, record);
          set({ adminRecords: next, publicRecords: derivePublished(next) });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to create medical contact."),
          });
          throw err;
        }
      },

      updateRecord: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateMedicalContactRecord(
            id,
            payload,
            accessToken,
          );
          const next = upsert(get().adminRecords, record);
          set({ adminRecords: next, publicRecords: derivePublished(next) });
          return record;
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to update medical contact."),
          });
          throw err;
        }
      },

      deleteRecord: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteMedicalContactRecord(id, accessToken);
          const next = get().adminRecords.filter((r) => r.id !== id);
          set({ adminRecords: next, publicRecords: derivePublished(next) });
        } catch (err: any) {
          set({
            error: getErrorMessage(err, "Failed to delete medical contact."),
          });
          throw err;
        }
      },
    }),
    {
      name: "medical-contacts-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
