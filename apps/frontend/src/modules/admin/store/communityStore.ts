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
  listDiscussionReplies,
  createDiscussionReplyRequest,
  likeDiscussionReplyRequest,
  listGroupMessages,
  sendGroupMessageRequest,
  reactToGroupMessageRequest,
  getGroupMembersRequest,
  listTrendingTagsRequest,
  type Discussion,
  type DiscussionReply,
  type GroupMessage,
  type GroupMember,
  type GroupMembersResult,
  type TrendingTag,
  type CommunityGroup,
  type FeaturedEvent,
  type CreateDiscussionPayload,
  type CreateReplyPayload,
  type SendGroupMessagePayload,
  type ProposeGroupPayload,
} from "../services/community.api";

// ─── State shape ──────────────────────────────────────────────────────────────

interface CommunityState {
  // Discussions
  discussions: Discussion[];
  isDiscussionsLoading: boolean;

  // Discussion replies — keyed by discussionId
  repliesByDiscussion: Record<string, DiscussionReply[]>;
  isRepliesLoading: boolean;

  // Groups
  groups: CommunityGroup[];
  isGroupsLoading: boolean;

  // All groups — admin view (all statuses)
  allGroups: CommunityGroup[];
  isAllGroupsLoading: boolean;

  // Pending Groups (admin)
  pendingGroups: CommunityGroup[];
  isPendingGroupsLoading: boolean;

  // Group messages — keyed by groupId
  messagesByGroup: Record<string, GroupMessage[]>;
  isMessagesLoading: boolean;

  // Group members — keyed by groupId
  membersByGroup: Record<string, GroupMember[]>;
  isMembersLoading: boolean;

  // Joined group IDs for the current user (persisted)
  joinedGroupIds: string[];

  // Trending tags
  trendingTags: TrendingTag[];
  isTrendingTagsLoading: boolean;

  // Featured Event
  featuredEvent: FeaturedEvent | null;
  isFeaturedEventLoading: boolean;

  // Shared
  error: string | null;
  clearError: () => void;

  // Discussion actions
  fetchDiscussions: () => Promise<Discussion[]>;
  postDiscussion: (
    payload: CreateDiscussionPayload,
    userToken: string,
  ) => Promise<Discussion>;
  removeDiscussion: (id: string, accessToken: string) => Promise<void>;

  // Reply actions
  fetchReplies: (discussionId: string) => Promise<DiscussionReply[]>;
  postReply: (
    discussionId: string,
    payload: CreateReplyPayload,
    userToken: string,
  ) => Promise<DiscussionReply>;
  toggleLikeReply: (
    replyId: string,
    userToken: string,
  ) => Promise<DiscussionReply>;

  // Group actions
  fetchGroups: () => Promise<CommunityGroup[]>;
  fetchAllGroups: (accessToken: string) => Promise<CommunityGroup[]>;
  joinGroup: (
    id: string,
    userToken: string,
    displayName: string,
  ) => Promise<CommunityGroup>;
  leaveGroup: (id: string, userToken: string) => Promise<CommunityGroup>;
  deleteGroup: (id: string, accessToken: string) => Promise<void>;

  // Group proposal actions
  proposeGroup: (
    payload: ProposeGroupPayload,
    userToken: string,
  ) => Promise<CommunityGroup>;
  fetchPendingGroups: (accessToken: string) => Promise<CommunityGroup[]>;
  approveGroup: (id: string, accessToken: string) => Promise<CommunityGroup>;
  rejectGroup: (id: string, accessToken: string) => Promise<CommunityGroup>;

  // Group message actions
  fetchGroupMessages: (groupId: string) => Promise<GroupMessage[]>;
  sendGroupMessage: (
    groupId: string,
    payload: SendGroupMessagePayload,
    userToken: string,
  ) => Promise<GroupMessage>;
  reactToGroupMessage: (
    groupId: string,
    msgId: string,
    emoji: string,
    userToken: string,
  ) => Promise<GroupMessage>;
  fetchGroupMembers: (groupId: string) => Promise<GroupMembersResult>;
  // Trending tags
  fetchTrendingTags: () => Promise<TrendingTag[]>;

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

function upsertReply(
  list: DiscussionReply[],
  next: DiscussionReply,
): DiscussionReply[] {
  const idx = list.findIndex((r) => r._id === next._id);
  if (idx === -1) return [...list, next];
  const updated = [...list];
  updated[idx] = next;
  return updated;
}

function upsertMessage(
  list: GroupMessage[],
  next: GroupMessage,
): GroupMessage[] {
  const idx = list.findIndex((m) => m._id === next._id);
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
let trendingTagsFetchPromise: Promise<TrendingTag[]> | null = null;
const repliesFetchPromises: Record<
  string,
  Promise<DiscussionReply[]> | undefined
> = {};
const messagesFetchPromises: Record<
  string,
  Promise<GroupMessage[]> | undefined
> = {};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      discussions: [],
      isDiscussionsLoading: false,
      repliesByDiscussion: {},
      isRepliesLoading: false,
      groups: [],
      isGroupsLoading: false,
      allGroups: [],
      isAllGroupsLoading: false,
      pendingGroups: [],
      isPendingGroupsLoading: false,
      messagesByGroup: {},
      isMessagesLoading: false,
      membersByGroup: {},
      isMembersLoading: false,
      joinedGroupIds: [],
      trendingTags: [],
      isTrendingTagsLoading: false,
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

      postDiscussion: async (payload, userToken) => {
        set({ error: null });
        try {
          const created = await createDiscussionRequest(payload, userToken);
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

      // ── Discussion Replies ───────────────────────────────────────────────────

      fetchReplies: async (discussionId) => {
        if (repliesFetchPromises[discussionId]) {
          return repliesFetchPromises[discussionId]!;
        }

        set({ isRepliesLoading: true, error: null });
        repliesFetchPromises[discussionId] = (async () => {
          try {
            const replies = await listDiscussionReplies(discussionId);
            set((state) => ({
              repliesByDiscussion: {
                ...state.repliesByDiscussion,
                [discussionId]: replies,
              },
            }));
            return replies;
          } catch (error: any) {
            set({ error: getErrorMessage(error, "Failed to load replies.") });
            throw error;
          } finally {
            set({ isRepliesLoading: false });
            delete repliesFetchPromises[discussionId];
          }
        })();
        return repliesFetchPromises[discussionId]!;
      },

      postReply: async (discussionId, payload, userToken) => {
        set({ error: null });
        try {
          const created = await createDiscussionReplyRequest(
            discussionId,
            payload,
            userToken,
          );
          const current = get().repliesByDiscussion[discussionId] ?? [];
          set((state) => ({
            repliesByDiscussion: {
              ...state.repliesByDiscussion,
              [discussionId]: [...current, created],
            },
            // Increment local reply count on the discussion
            discussions: state.discussions.map((d) =>
              d._id === discussionId ? { ...d, replies: d.replies + 1 } : d,
            ),
          }));
          return created;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to post reply.") });
          throw error;
        }
      },

      toggleLikeReply: async (replyId, userToken) => {
        set({ error: null });
        try {
          const updated = await likeDiscussionReplyRequest(replyId, userToken);
          // Update the reply in whichever discussion it belongs to
          const discussionId = updated.discussionId;
          const current = get().repliesByDiscussion[discussionId] ?? [];
          set((state) => ({
            repliesByDiscussion: {
              ...state.repliesByDiscussion,
              [discussionId]: upsertReply(current, updated),
            },
          }));
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to toggle like.") });
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

      joinGroup: async (id, userToken, displayName) => {
        set({ error: null });
        try {
          const updated = await joinGroupRequest(id, userToken, displayName);
          set((state) => ({
            groups: upsertGroup(state.groups, updated),
            joinedGroupIds: state.joinedGroupIds.includes(id)
              ? state.joinedGroupIds
              : [...state.joinedGroupIds, id],
          }));
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to join group.") });
          throw error;
        }
      },

      leaveGroup: async (id, userToken) => {
        set({ error: null });
        try {
          const updated = await leaveGroupRequest(id, userToken);
          set((state) => ({
            groups: upsertGroup(state.groups, updated),
            joinedGroupIds: state.joinedGroupIds.filter((gid) => gid !== id),
          }));
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

      proposeGroup: async (payload, userToken) => {
        set({ error: null });
        try {
          const created = await proposeGroupRequest(payload, userToken);
          // Founder is already a member — track locally so join button shows as joined
          set((state) => ({
            joinedGroupIds: state.joinedGroupIds.includes(created._id)
              ? state.joinedGroupIds
              : [...state.joinedGroupIds, created._id],
          }));
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

      // ── Group Messages ────────────────────────────────────────────────────────

      fetchGroupMessages: async (groupId) => {
        if (messagesFetchPromises[groupId]) {
          return messagesFetchPromises[groupId]!;
        }

        set({ isMessagesLoading: true, error: null });
        messagesFetchPromises[groupId] = (async () => {
          try {
            const messages = await listGroupMessages(groupId);
            set((state) => ({
              messagesByGroup: {
                ...state.messagesByGroup,
                [groupId]: messages,
              },
            }));
            return messages;
          } catch (error: any) {
            set({ error: getErrorMessage(error, "Failed to load messages.") });
            throw error;
          } finally {
            set({ isMessagesLoading: false });
            delete messagesFetchPromises[groupId];
          }
        })();
        return messagesFetchPromises[groupId]!;
      },

      sendGroupMessage: async (groupId, payload, userToken) => {
        set({ error: null });
        try {
          const created = await sendGroupMessageRequest(
            groupId,
            payload,
            userToken,
          );
          const current = get().messagesByGroup[groupId] ?? [];
          set((state) => ({
            messagesByGroup: {
              ...state.messagesByGroup,
              [groupId]: [...current, created],
            },
          }));
          return created;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to send message.") });
          throw error;
        }
      },

      reactToGroupMessage: async (groupId, msgId, emoji, userToken) => {
        set({ error: null });
        try {
          const updated = await reactToGroupMessageRequest(
            groupId,
            msgId,
            emoji,
            userToken,
          );
          const current = get().messagesByGroup[groupId] ?? [];
          set((state) => ({
            messagesByGroup: {
              ...state.messagesByGroup,
              [groupId]: upsertMessage(current, updated),
            },
          }));
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to react to message.") });
          throw error;
        }
      },

      fetchGroupMembers: async (groupId) => {
        set({ isMembersLoading: true });
        try {
          const result = await getGroupMembersRequest(groupId);
          set((state) => ({
            membersByGroup: {
              ...state.membersByGroup,
              [groupId]: result.members,
            },
            isMembersLoading: false,
          }));
          return result;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to load members."),
            isMembersLoading: false,
          });
          throw error;
        }
      },
      // ── Trending Tags ─────────────────────────────────────────────────────────

      fetchTrendingTags: async () => {
        if (trendingTagsFetchPromise) return trendingTagsFetchPromise;

        set({ isTrendingTagsLoading: true, error: null });
        trendingTagsFetchPromise = (async () => {
          try {
            const tags = await listTrendingTagsRequest();
            set({ trendingTags: tags });
            return tags;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load trending tags."),
            });
            // Don't rethrow — non-critical; sidebar degrades gracefully
            return get().trendingTags;
          } finally {
            set({ isTrendingTagsLoading: false });
            trendingTagsFetchPromise = null;
          }
        })();
        return trendingTagsFetchPromise;
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
        trendingTags: state.trendingTags,
        joinedGroupIds: state.joinedGroupIds,
      }),
    },
  ),
);
