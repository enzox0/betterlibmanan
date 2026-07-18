import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/leadership`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface LeadershipPayload {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  avatarKey?: string;
  status: ContentStatus;
}

export interface LeadershipUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedLeadershipAvatar {
  key: string;
  url: string;
}

export async function listPublicLeadership(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminLeadership(
  accessToken: string,
): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/admin", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function createLeadershipRecord(
  payload: LeadershipPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ContentRecord;
  }>("/", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateLeadershipRecord(
  id: string,
  payload: LeadershipPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ContentRecord;
  }>(`/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteLeadershipRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadLeadershipAvatarRequest(
  payload: LeadershipUploadPayload,
  accessToken: string,
): Promise<UploadedLeadershipAvatar> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedLeadershipAvatar;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
