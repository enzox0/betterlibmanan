import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/community`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Discussion {
  _id: string;
  userId: string;
  author: string;
  avatarInitials: string;
  avatarUrl: string;
  title: string;
  tags: string[];
  replies: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  _id: string;
  discussionId: string;
  parentReplyId: string | null;
  userId: string;
  author: string;
  avatarInitials: string;
  avatarUrl: string;
  body: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  _id: string;
  groupId: string;
  replyToId: string | null;
  replyToAuthor: string;
  replyToText: string;
  userId: string;
  author: string;
  avatarInitials: string;
  avatarUrl: string;
  text: string;
  reactions: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface GroupMembersResult {
  members: GroupMember[];
  memberCount: number;
}

export interface TrendingTag {
  label: string;
  count: number;
}

export interface CommunityGroup {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  memberCount: number;
  order: number;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
  proposedBy: string;
  proposerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  ctaLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscussionPayload {
  author: string;
  title: string;
  tags: string[];
}

export interface CreateReplyPayload {
  author: string;
  body: string;
  parentReplyId?: string;
  avatarUrl?: string;
}

export interface SendGroupMessagePayload {
  author: string;
  text: string;
  replyToId?: string;
  avatarUrl?: string;
}

export interface ProposeGroupPayload {
  name: string;
  description: string;
  imageUrl?: string;
  imageKey?: string;
}

export interface GroupImageUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedGroupImage {
  key: string;
  url: string;
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export async function listDiscussions(): Promise<Discussion[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: Discussion[];
  }>("/discussions");
  return data.data;
}

export async function createDiscussionRequest(
  payload: CreateDiscussionPayload,
  userToken: string,
): Promise<Discussion> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: Discussion;
  }>("/discussions", payload, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  return data.data;
}

export async function deleteDiscussionRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/discussions/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Discussion Replies ───────────────────────────────────────────────────────

export async function listDiscussionReplies(
  discussionId: string,
): Promise<DiscussionReply[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: DiscussionReply[];
  }>(`/discussions/${discussionId}/replies`);
  return data.data;
}

export async function createDiscussionReplyRequest(
  discussionId: string,
  payload: CreateReplyPayload,
  userToken: string,
): Promise<DiscussionReply> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: DiscussionReply;
  }>(`/discussions/${discussionId}/replies`, payload, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  return data.data;
}

export async function likeDiscussionReplyRequest(
  replyId: string,
  userToken: string,
): Promise<DiscussionReply> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: DiscussionReply;
  }>(
    `/replies/${replyId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${userToken}` },
    },
  );
  return data.data;
}

export async function deleteDiscussionReplyRequest(
  replyId: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/replies/${replyId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function listGroups(): Promise<CommunityGroup[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: CommunityGroup[];
  }>("/groups");
  return data.data;
}

export async function joinGroupRequest(
  id: string,
  userToken: string,
  displayName: string,
): Promise<CommunityGroup> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CommunityGroup;
  }>(
    `/groups/join/${id}`,
    { displayName },
    {
      headers: { Authorization: `Bearer ${userToken}` },
    },
  );
  return data.data;
}

export async function leaveGroupRequest(
  id: string,
  userToken: string,
): Promise<CommunityGroup> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CommunityGroup;
  }>(
    `/groups/leave/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${userToken}` },
    },
  );
  return data.data;
}

// ─── Group proposals ──────────────────────────────────────────────────────────

// Public (auth required — founder is auto-added as first member)
export async function proposeGroupRequest(
  payload: ProposeGroupPayload,
  userToken: string,
): Promise<CommunityGroup> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CommunityGroup;
  }>("/groups", payload, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  return data.data;
}

/** Upload a group cover image to R2. Returns { key, url }. */
export async function uploadGroupImageRequest(
  payload: GroupImageUploadPayload,
): Promise<UploadedGroupImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedGroupImage;
  }>("/groups/upload-image", payload);
  return data.data;
}

// Admin — fetch pending groups
export async function listPendingGroups(
  accessToken: string,
): Promise<CommunityGroup[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: CommunityGroup[];
  }>("/groups/pending", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

// Admin — fetch ALL groups (all statuses)
export async function listAllGroups(
  accessToken: string,
): Promise<CommunityGroup[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: CommunityGroup[];
  }>("/groups/all", { headers: { Authorization: `Bearer ${accessToken}` } });
  return data.data;
}

// Admin — approve or reject a group
export async function updateGroupStatus(
  id: string,
  status: "approved" | "rejected",
  accessToken: string,
): Promise<CommunityGroup> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: CommunityGroup;
  }>(
    `/groups/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return data.data;
}

// Admin — hard-delete a group
export async function deleteGroupRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/groups/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Group Messages ───────────────────────────────────────────────────────────

export async function listGroupMessages(
  groupId: string,
  limit = 50,
): Promise<GroupMessage[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: GroupMessage[];
  }>(`/groups/${groupId}/messages`, { params: { limit } });
  return data.data;
}

export async function sendGroupMessageRequest(
  groupId: string,
  payload: SendGroupMessagePayload,
  userToken: string,
): Promise<GroupMessage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: GroupMessage;
  }>(`/groups/${groupId}/messages`, payload, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  return data.data;
}

export async function reactToGroupMessageRequest(
  groupId: string,
  msgId: string,
  emoji: string,
  userToken: string,
): Promise<GroupMessage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: GroupMessage;
  }>(
    `/groups/${groupId}/messages/${msgId}/react`,
    { emoji },
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  return data.data;
}

export async function getGroupMembersRequest(
  groupId: string,
): Promise<GroupMembersResult> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: GroupMembersResult;
  }>(`/groups/${groupId}/members`);
  return data.data;
}

export async function deleteGroupMessageRequest(
  groupId: string,
  messageId: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Featured Event ───────────────────────────────────────────────────────────

export async function getFeaturedEventRequest(): Promise<FeaturedEvent | null> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: FeaturedEvent | null;
  }>("/featured-event");
  return data.data;
}

export async function rsvpFeaturedEventRequest(): Promise<void> {
  await apiClient.post("/featured-event/rsvp");
}

// ─── Trending Tags ────────────────────────────────────────────────────────────

export async function listTrendingTagsRequest(): Promise<TrendingTag[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: TrendingTag[];
  }>("/trending-tags");
  return data.data;
}
