import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentRecord } from "../types/admin.types";
import {
  listSocialLinks,
  createSocialLinkRecord,
  updateSocialLinkRecord,
  deleteSocialLinkRecord,
  type SocialLinkPayload,
} from "../services/social-links.api";

interface SocialLinksState {
  records: ContentRecord[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  fetchRecords: () => Promise<ContentRecord[]>;
  createRecord: (
    payload: SocialLinkPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateRecord: (
    id: string,
    payload: SocialLinkPayload,
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

export const useSocialLinksStore = create<SocialLinksState>()(
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
            const records = await listSocialLinks();
            set({ records: sortByOrder(records) });
            return records;
          } catch (err: any) {
            set({
              error: getErrorMessage(err, "Failed to load social links."),
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
          const record = await createSocialLinkRecord(payload, accessToken);
          set({ records: upsert(get().records, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to create social link.") });
          throw err;
        }
      },

      updateRecord: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateSocialLinkRecord(id, payload, accessToken);
          set({ records: upsert(get().records, record) });
          return record;
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to update social link.") });
          throw err;
        }
      },

      deleteRecord: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteSocialLinkRecord(id, accessToken);
          set({ records: get().records.filter((r) => r.id !== id) });
        } catch (err: any) {
          set({ error: getErrorMessage(err, "Failed to delete social link.") });
          throw err;
        }
      },
    }),
    {
      name: "social-links-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
