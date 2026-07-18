import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/marquee-images`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface MarqueeImagePayload {
  alt: string;
  imageUrl?: string;
  imageKey?: string;
  rowNumber: number;
  order: number;
  status: ContentStatus;
}

export interface MarqueeImageUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedMarqueeImage {
  key: string;
  url: string;
}

export interface ReorderUpdate {
  id: string;
  rowNumber: number;
  order: number;
}

export async function listPublicMarqueeImagesRequest(): Promise<
  ContentRecord[]
> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminMarqueeImagesRequest(
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

export async function createMarqueeImageRequest(
  payload: MarqueeImagePayload,
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

export async function updateMarqueeImageRequest(
  id: string,
  payload: MarqueeImagePayload,
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

export async function deleteMarqueeImageRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadMarqueeImageFileRequest(
  payload: MarqueeImageUploadPayload,
  accessToken: string,
): Promise<UploadedMarqueeImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedMarqueeImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function reorderMarqueeImagesRequest(
  updates: ReorderUpdate[],
  accessToken: string,
): Promise<void> {
  await apiClient.post(
    "/reorder",
    { updates },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}
