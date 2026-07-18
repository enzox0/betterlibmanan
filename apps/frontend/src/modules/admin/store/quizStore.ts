import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createQuizRecord,
  deleteQuizRecord,
  listAdminQuiz,
  listPublicQuiz,
  updateQuizRecord,
  bulkImportQuizRecords,
  type QuizPayload,
  type QuizBulkImportItem,
} from "../services/quiz.api";
import type { ContentRecord } from "../types/admin.types";

interface QuizState {
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
  createQuiz: (
    payload: QuizPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  updateQuiz: (
    id: string,
    payload: QuizPayload,
    accessToken: string,
  ) => Promise<ContentRecord>;
  deleteQuiz: (id: string, accessToken: string) => Promise<void>;
  bulkImportQuiz: (
    items: QuizBulkImportItem[],
    accessToken: string,
  ) => Promise<{ imported: number }>;
}

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

/** Preserve insertion order (createdAt ascending) */
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

export const useQuizStore = create<QuizState>()(
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
            const records = await listAdminQuiz(accessToken);
            get().setAdminRecords(records);
            return records;
          } catch (error: any) {
            set({
              isAdminLoading: false,
              error: getErrorMessage(error, "Failed to load Quiz records."),
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
            const records = await listPublicQuiz();
            get().setPublicRecords(records);
            return records;
          } catch (error: any) {
            set({
              isPublicLoading: false,
              error: getErrorMessage(error, "Failed to load Quiz records."),
            });
            throw error;
          } finally {
            set({ isPublicLoading: false });
            publicFetchPromise = null;
          }
        })();
        return publicFetchPromise;
      },

      createQuiz: async (payload, accessToken) => {
        set({ error: null });
        try {
          const createdRecord = await createQuizRecord(payload, accessToken);
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
            error: getErrorMessage(error, "Failed to create Quiz record."),
          });
          throw error;
        }
      },

      updateQuiz: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const updatedRecord = await updateQuizRecord(
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
            error: getErrorMessage(error, "Failed to update Quiz record."),
          });
          throw error;
        }
      },

      deleteQuiz: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteQuizRecord(id, accessToken);
          const nextAdminRecords = get().adminRecords.filter(
            (record) => record.id !== id,
          );
          set({
            adminRecords: nextAdminRecords,
            publicRecords: derivePublishedRecords(nextAdminRecords),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete Quiz record."),
          });
          throw error;
        }
      },

      bulkImportQuiz: async (items, accessToken) => {
        set({ error: null });
        try {
          const result = await bulkImportQuizRecords(items, accessToken);
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
              "Failed to bulk import Quiz records.",
            ),
          });
          throw error;
        }
      },
    }),
    {
      name: "quiz-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminRecords: state.adminRecords,
        publicRecords: state.publicRecords,
      }),
    },
  ),
);
