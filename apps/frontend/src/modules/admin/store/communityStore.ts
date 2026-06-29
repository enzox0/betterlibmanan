import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  listDiscussions,
  createDiscussionRequest,
  deleteDiscussionRequest,
  listGroups,
  listAllGroups as listAllGroupsApi,
  joinGroupRequest,
  leaveGroupRequest,
  getFeaturedEventRequest,
  rsvpFeaturedEventRequest,
  proposeGroupRequest,
  listPendingGroups as listPendingGroupsApi,
  updateGroupStatus,
  deleteGroupRequest,
  type Discussion,
  type CommunityGroup,
  type FeaturedEvent,
  type CreateDiscussionPayload,
  type ProposeGroupPayload,
} from "../services/community.api";

// ─── State shape ──────────────────────────────────────────────────────────────

interface CommunityState {
  // Discussions
  discussions: Discussion[];
  isDiscussionsLoading: boolean;

  // Groups
  groups: CommunityGroup[];
  isGroupsLoading: boolean;

  // All groups — admin view (all statuses)
  allGroups: CommunityGroup[];
  isAllGroupsLoading: boolean;

  // Pending Groups (admin)
  pendingGroups: CommunityGroup[];
  isPendingGroupsLoading: boolean;

  // Featured Event
  featuredEvent: FeaturedEvent | null;
  isFeaturedEventLoading: boolean;

  // Shared
  error: string | null;
  clearError: () => void;

  // Discussion actions
  fetchDiscussions: () => Promise<Discussion[]>;
  postDiscussion: (payload: CreateDiscussionPayload) => Promise<Discussion>;
  removeDiscussion: (id: string, accessToken: string) => Promise<void>;

  // Group actions
  fetchGroups: () => Promise<CommunityGroup[]>;
  fetchAllGroups: (accessToken: string) => Promise<CommunityGroup[]>;
  joinGroup: (id: string) => Promise<CommunityGroup>;
  leaveGroup: (id: string) => Promise<CommunityGroup>;
  deleteGroup: (id: string, accessToken: string) => Promise<void>;

  // Group proposal actions
  proposeGroup: (payload: ProposeGroupPayload) => Promise<CommunityGroup>;
  fetchPendingGroups: (accessToken: string) => Promise<CommunityGroup[]>;
  approveGroup: (id: string, accessToken: string) => Promise<CommunityGroup>;
  rejectGroup: (id: string, accessToken: string) => Promise<CommunityGroup>;

  // Featured event actions
  fetchFeaturedEvent: () => Promise<FeaturedEvent | null>;
  rsvpEvent: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function upsertDiscussion(list: Discussion[], next: Discussion): Discussion[] {
  const idx = list.findIndex((d) => d._id === next._id);
  if (idx === -1) return [next, ...list];
  const updated = [...list];
  updated[idx] = next;
  return updated;
}

function upsertGroup(
  list: CommunityGroup[],
  next: CommunityGroup,
): CommunityGroup[] {
  const idx = list.findIndex((g) => g._id === next._id);
  if (idx === -1) return [...list, next];
  const updated = [...list];
  updated[idx] = next;
  return updated;
}

// ─── Fetch-dedup guards (module-level) ───────────────────────────────────────

let discussionsFetchPromise: Promise<Discussion[]> | null = null;
let groupsFetchPromise: Promise<CommunityGroup[]> | null = null;
let allGroupsFetchPromise: Promise<CommunityGroup[]> | null = null;
let pendingGroupsFetchPromise: Promise<CommunityGroup[]> | null = null;
let featuredEventFetchPromise: Promise<FeaturedEvent | null> | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      discussions: [],
      isDiscussionsLoading: false,
      groups: [],
      isGroupsLoading: false,
      allGroups: [],
      isAllGroupsLoading: false,
      pendingGroups: [],
      isPendingGroupsLoading: false,
      featuredEvent: null,
      isFeaturedEventLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      // ── Discussions ─────────────────────────────────────────────────────────

      fetchDiscussions: async () => {
        if (discussionsFetchPromise) return discussionsFetchPromise;

        set({ isDiscussionsLoading: true, error: null });
        discussionsFetchPromise = (async () => {
          try {
            const discussions = await listDiscussions();
            set({ discussions });
            return discussions;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load discussions."),
            });
            throw error;
          } finally {
            set({ isDiscussionsLoading: false });
            discussionsFetchPromise = null;
          }
        })();
        return discussionsFetchPromise;
      },

      postDiscussion: async (payload) => {
        set({ error: null });
        try {
          const created = await createDiscussionRequest(payload);
          set({ discussions: upsertDiscussion(get().discussions, created) });
          return created;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to post discussion.") });
          throw error;
        }
      },

      removeDiscussion: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteDiscussionRequest(id, accessToken);
          set({
            discussions: get().discussions.filter((d) => d._id !== id),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete discussion."),
          });
          throw error;
        }
      },

      // ── Groups ──────────────────────────────────────────────────────────────

      fetchGroups: async () => {
        if (groupsFetchPromise) return groupsFetchPromise;

        set({ isGroupsLoading: true, error: null });
        groupsFetchPromise = (async () => {
          try {
            const groups = await listGroups();
            set({ groups });
            return groups;
          } catch (error: any) {
            set({ error: getErrorMessage(error, "Failed to load groups.") });
            throw error;
          } finally {
            set({ isGroupsLoading: false });
            groupsFetchPromise = null;
          }
        })();
        return groupsFetchPromise;
      },

      joinGroup: async (id) => {
        set({ error: null });
        try {
          const updated = await joinGroupRequest(id);
          set({ groups: upsertGroup(get().groups, updated) });
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to join group.") });
          throw error;
        }
      },

      leaveGroup: async (id) => {
        set({ error: null });
        try {
          const updated = await leaveGroupRequest(id);
          set({ groups: upsertGroup(get().groups, updated) });
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to leave group.") });
          throw error;
        }
      },

      fetchAllGroups: async (accessToken) => {
        if (allGroupsFetchPromise) return allGroupsFetchPromise;

        set({ isAllGroupsLoading: true, error: null });
        allGroupsFetchPromise = (async () => {
          try {
            const allGroups = await listAllGroupsApi(accessToken);
            set({ allGroups });
            return allGroups;
          } catch (error: any) {
            set({ error: getErrorMessage(error, "Failed to load groups.") });
            throw error;
          } finally {
            set({ isAllGroupsLoading: false });
            allGroupsFetchPromise = null;
          }
        })();
        return allGroupsFetchPromise;
      },

      deleteGroup: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteGroupRequest(id, accessToken);
          set((state) => ({
            allGroups: state.allGroups.filter((g) => g._id !== id),
            groups: state.groups.filter((g) => g._id !== id),
            pendingGroups: state.pendingGroups.filter((g) => g._id !== id),
          }));
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to delete group.") });
          throw error;
        }
      },

      // ── Group proposals ──────────────────────────────────────────────────────

      proposeGroup: async (payload) => {
        set({ error: null });
        try {
          const created = await proposeGroupRequest(payload);
          // Do NOT add to `groups` — it's pending, not approved yet
          return created;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to propose group.") });
          throw error;
        }
      },

      fetchPendingGroups: async (accessToken) => {
        if (pendingGroupsFetchPromise) return pendingGroupsFetchPromise;

        set({ isPendingGroupsLoading: true, error: null });
        pendingGroupsFetchPromise = (async () => {
          try {
            const pendingGroups = await listPendingGroupsApi(accessToken);
            set({ pendingGroups });
            return pendingGroups;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load pending groups."),
            });
            throw error;
          } finally {
            set({ isPendingGroupsLoading: false });
            pendingGroupsFetchPromise = null;
          }
        })();
        return pendingGroupsFetchPromise;
      },

      approveGroup: async (id, accessToken) => {
        set({ error: null });
        try {
          const updated = await updateGroupStatus(id, "approved", accessToken);
          set((state) => ({
            pendingGroups: state.pendingGroups.filter((g) => g._id !== id),
            groups: upsertGroup(state.groups, updated),
            allGroups: upsertGroup(state.allGroups, updated),
          }));
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to approve group.") });
          throw error;
        }
      },

      rejectGroup: async (id, accessToken) => {
        set({ error: null });
        try {
          const updated = await updateGroupStatus(id, "rejected", accessToken);
          set((state) => ({
            pendingGroups: state.pendingGroups.filter((g) => g._id !== id),
            allGroups: upsertGroup(state.allGroups, updated),
          }));
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to reject group.") });
          throw error;
        }
      },

      // ── Featured Event ───────────────────────────────────────────────────────

      fetchFeaturedEvent: async () => {
        if (featuredEventFetchPromise) return featuredEventFetchPromise;

        set({ isFeaturedEventLoading: true, error: null });
        featuredEventFetchPromise = (async () => {
          try {
            const event = await getFeaturedEventRequest();
            set({ featuredEvent: event });
            return event;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load featured event."),
            });
            throw error;
          } finally {
            set({ isFeaturedEventLoading: false });
            featuredEventFetchPromise = null;
          }
        })();
        return featuredEventFetchPromise;
      },

      rsvpEvent: async () => {
        set({ error: null });
        try {
          await rsvpFeaturedEventRequest();
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to submit RSVP.") });
          throw error;
        }
      },
    }),
    {
      name: "community-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        discussions: state.discussions,
        groups: state.groups,
        featuredEvent: state.featuredEvent,
      }),
    },
  ),
);
