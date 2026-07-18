import axios from "axios";
import type { ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/tourism`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type TourismCategory =
  "nature" | "water" | "heritage" | "viewpoint" | "photo" | "other";

export interface TouristSpotRecord {
  id: string;
  sectionKey: string;
  title: string;
  status: ContentStatus;
  fields: {
    name: string;
    location: string;
    description: string;
    category: TourismCategory;
    rating: string;
    entryFee: string;
    tags: string[];
    image: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TouristSpotPayload {
  name: string;
  location?: string;
  description?: string;
  category: TourismCategory;
  rating?: string;
  entryFee?: string;
  tags?: string[];
  imageUrl?: string;
  imageKey?: string;
  status: ContentStatus;
}

export interface TourismImageUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedTourismImage {
  key: string;
  url: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function listPublicTouristSpots(): Promise<TouristSpotRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: TouristSpotRecord[];
  }>("/");
  return data.data;
}

export async function listAdminTouristSpots(
  accessToken: string,
): Promise<TouristSpotRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: TouristSpotRecord[];
  }>("/admin", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function createTouristSpotRecord(
  payload: TouristSpotPayload,
  accessToken: string,
): Promise<TouristSpotRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: TouristSpotRecord;
  }>("/", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateTouristSpotRecord(
  id: string,
  payload: TouristSpotPayload,
  accessToken: string,
): Promise<TouristSpotRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: TouristSpotRecord;
  }>(`/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteTouristSpotRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadTourismImageRequest(
  payload: TourismImageUploadPayload,
  accessToken: string,
): Promise<UploadedTourismImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedTourismImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
