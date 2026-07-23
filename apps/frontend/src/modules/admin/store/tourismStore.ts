import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  listPublicTouristSpots,
  listAdminTouristSpots,
  createTouristSpotRecord,
  updateTouristSpotRecord,
  deleteTouristSpotRecord,
  rateTouristSpotRecord,
  type TouristSpotRecord,
  type TouristSpotPayload,
} from "../services/tourism.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

/**
 * Returns a stable anonymous session ID for this browser.
 * Used for constituent ratings so each person can only rate once.
 */
export function getOrCreateSessionId(): string {
  const KEY = "tourism_session_id";
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(KEY, id);
  return id;
}

function sortByCreatedAt<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function upsert<T extends { id: string; createdAt: string }>(
  list: T[],
  item: T,
): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return sortByCreatedAt([...list, item]);
  const next = [...list];
  next[idx] = item;
  return sortByCreatedAt(next);
}

function derivePublicSpots(records: TouristSpotRecord[]): TouristSpotRecord[] {
  return sortByCreatedAt(records.filter((r) => r.status === "published"));
}

// ─── State interface ──────────────────────────────────────────────────────────

interface TourismState {
  adminSpots: TouristSpotRecord[];
  publicSpots: TouristSpotRecord[];
  isAdminLoading: boolean;
  isPublicLoading: boolean;
  error: string | null;
  /** Per-spot visit counts, keyed by spot id */
  visitCounts: Record<string, number>;

  clearError: () => void;
  fetchAdminSpots: (accessToken: string) => Promise<TouristSpotRecord[]>;
  fetchPublicSpots: () => Promise<TouristSpotRecord[]>;
  createSpot: (
    payload: TouristSpotPayload,
    accessToken: string,
  ) => Promise<TouristSpotRecord>;
  updateSpot: (
    id: string,
    payload: TouristSpotPayload,
    accessToken: string,
  ) => Promise<TouristSpotRecord>;
  deleteSpot: (id: string, accessToken: string) => Promise<void>;
  /** Increment the visit count for a spot */
  incrementVisit: (id: string) => void;
  /** Submit a constituent star rating (1–5) for a spot */
  rateSpot: (id: string, value: number) => Promise<TouristSpotRecord>;
  /** Per-spot user rating keyed by spot id (the value this session submitted) */
  myRatings: Record<string, number>;
}

// Deduplicate in-flight fetches
let adminFetch: Promise<TouristSpotRecord[]> | null = null;
let publicFetch: Promise<TouristSpotRecord[]> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTourismStore = create<TourismState>()(
  persist(
    (set, get) => ({
      adminSpots: [],
      publicSpots: [],
      isAdminLoading: false,
      isPublicLoading: false,
      error: null,
      visitCounts: {},
      myRatings: {},

      clearError: () => set({ error: null }),

      incrementVisit: (id) =>
        set((state) => ({
          visitCounts: {
            ...state.visitCounts,
            [id]: (state.visitCounts[id] ?? 0) + 1,
          },
        })),

      rateSpot: async (id, value) => {
        const sessionId = getOrCreateSessionId();
        try {
          const record = await rateTouristSpotRecord(id, sessionId, value);
          // Update the spot in both lists with fresh averageRating/ratingCount
          const updateList = (list: TouristSpotRecord[]) => {
            const idx = list.findIndex((s) => s.id === id);
            if (idx === -1) return list;
            const next = [...list];
            next[idx] = record;
            return next;
          };
          set((state) => ({
            publicSpots: updateList(state.publicSpots),
            adminSpots: updateList(state.adminSpots),
            myRatings: { ...state.myRatings, [id]: value },
          }));
          return record;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to submit rating.") });
          throw error;
        }
      },

      fetchAdminSpots: async (accessToken) => {
        if (adminFetch) return adminFetch;
        set({ isAdminLoading: true, error: null });
        adminFetch = (async () => {
          try {
            const records = await listAdminTouristSpots(accessToken);
            const sorted = sortByCreatedAt(records);
            set({ adminSpots: sorted, publicSpots: derivePublicSpots(sorted) });
            return sorted;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load tourist spots."),
            });
            throw error;
          } finally {
            set({ isAdminLoading: false });
            adminFetch = null;
          }
        })();
        return adminFetch;
      },

      fetchPublicSpots: async () => {
        if (publicFetch) return publicFetch;
        set({ isPublicLoading: true, error: null });
        publicFetch = (async () => {
          try {
            const records = await listPublicTouristSpots();
            set({ publicSpots: sortByCreatedAt(records) });
            return records;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load tourist spots."),
            });
            throw error;
          } finally {
            set({ isPublicLoading: false });
            publicFetch = null;
          }
        })();
        return publicFetch;
      },

      createSpot: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createTouristSpotRecord(payload, accessToken);
          const next = upsert(get().adminSpots, record);
          set({ adminSpots: next, publicSpots: derivePublicSpots(next) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to create tourist spot."),
          });
          throw error;
        }
      },

      updateSpot: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateTouristSpotRecord(
            id,
            payload,
            accessToken,
          );
          const next = upsert(get().adminSpots, record);
          set({ adminSpots: next, publicSpots: derivePublicSpots(next) });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to update tourist spot."),
          });
          throw error;
        }
      },

      deleteSpot: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteTouristSpotRecord(id, accessToken);
          const next = get().adminSpots.filter((s) => s.id !== id);
          set({ adminSpots: next, publicSpots: derivePublicSpots(next) });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete tourist spot."),
          });
          throw error;
        }
      },
    }),
    {
      name: "tourism-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminSpots: state.adminSpots,
        publicSpots: state.publicSpots,
        visitCounts: state.visitCounts,
        myRatings: state.myRatings,
      }),
    },
  ),
);
