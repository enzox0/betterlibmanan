import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/barangay-map`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface BarangayMapPayload {
  name: string;
  imageUrl?: string;
  imageKey?: string;
  description?: string;
  touristAttractions?: string;
  population?: string;
  area?: string;
  festivals?: string;
  status: ContentStatus;
}

export interface BarangayMapUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedBarangayMapImage {
  key: string;
  url: string;
}

export async function listPublicBarangayMapRequest(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminBarangayMapRequest(
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

export async function createBarangayMapRequest(
  payload: BarangayMapPayload,
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

export async function updateBarangayMapRequest(
  id: string,
  payload: BarangayMapPayload,
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

export async function deleteBarangayMapRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadBarangayMapImageRequest(
  payload: BarangayMapUploadPayload,
  accessToken: string,
): Promise<UploadedBarangayMapImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedBarangayMapImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
