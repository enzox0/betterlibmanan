import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/popular-services`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface PopularServicePayload {
  name: string;
  icon?: string;
  description?: string;
  status: ContentStatus;
}

export interface PopularServiceUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedPopularServiceImage {
  key: string;
  url: string;
}

export async function listPublicPopularServices(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminPopularServices(
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

export async function createPopularService(
  payload: PopularServicePayload,
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

export async function updatePopularService(
  id: string,
  payload: PopularServicePayload,
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

export async function deletePopularService(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadPopularServiceIcon(
  payload: PopularServiceUploadPayload,
  accessToken: string,
): Promise<UploadedPopularServiceImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedPopularServiceImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
