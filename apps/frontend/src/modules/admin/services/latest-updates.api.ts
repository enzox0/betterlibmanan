import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/latest-updates`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface LatestUpdatePayload {
  title: string;
  date?: string;
  summary?: string;
  imageUrl?: string;
  imageKey?: string;
  sourceUrl?: string;
  status: ContentStatus;
}

export interface LatestUpdateUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedLatestUpdateImage {
  key: string;
  url: string;
}

export async function listPublicLatestUpdates(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminLatestUpdates(
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

export async function createLatestUpdateRecord(
  payload: LatestUpdatePayload,
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

export async function updateLatestUpdateRecord(
  id: string,
  payload: LatestUpdatePayload,
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

export async function deleteLatestUpdateRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadLatestUpdateImageRequest(
  payload: LatestUpdateUploadPayload,
  accessToken: string,
): Promise<UploadedLatestUpdateImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedLatestUpdateImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
