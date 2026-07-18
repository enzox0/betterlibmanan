import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/better-lugs`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface BetterLugPayload {
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  logoKey?: string;
  status: ContentStatus;
}

export interface BetterLugUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedBetterLugImage {
  key: string;
  url: string;
}

export async function listPublicBetterLugsRequest(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminBetterLugsRequest(
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

export async function createBetterLugRequest(
  payload: BetterLugPayload,
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

export async function updateBetterLugRequest(
  id: string,
  payload: BetterLugPayload,
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

export async function deleteBetterLugRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadBetterLugImageRequest(
  payload: BetterLugUploadPayload,
  accessToken: string,
): Promise<UploadedBetterLugImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedBetterLugImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
