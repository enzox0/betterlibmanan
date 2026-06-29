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
  author: string;
  avatarInitials: string;
  title: string;
  tags: string[];
  replies: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityGroup {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  order: number;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
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
): Promise<Discussion> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: Discussion;
  }>("/discussions", payload);
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

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function listGroups(): Promise<CommunityGroup[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: CommunityGroup[];
  }>("/groups");
  return data.data;
}

export async function joinGroupRequest(id: string): Promise<CommunityGroup> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CommunityGroup;
  }>(`/groups/join/${id}`);
  return data.data;
}

export async function leaveGroupRequest(id: string): Promise<CommunityGroup> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CommunityGroup;
  }>(`/groups/leave/${id}`);
  return data.data;
}

// ─── Group proposals ──────────────────────────────────────────────────────────

export interface ProposeGroupPayload {
  name: string;
  description: string;
}

// Public — no auth
export async function proposeGroupRequest(
  payload: ProposeGroupPayload,
): Promise<CommunityGroup> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: CommunityGroup;
  }>("/groups", payload);
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
