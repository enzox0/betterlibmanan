import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/municipal-hall`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface MunicipalHallImageUploadPayload {
  filename: string;
  mimeType: string;
  data: string;
}

export interface UploadedMunicipalHallImage {
  key: string;
  url: string;
}

export interface MunicipalHallPayload {
  title: string;
  imageUrl?: string;
  imageKey?: string;
  description?: string;
  address?: string;
  province?: string;
  barangays?: string;
  founded?: string;
  officeHoursWeekday?: string;
  officeHoursWeekend?: string;
  status: ContentStatus;
}

export async function listPublicMunicipalHall(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminMunicipalHall(
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

export async function createMunicipalHallRecord(
  payload: MunicipalHallPayload,
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

export async function updateMunicipalHallRecord(
  id: string,
  payload: MunicipalHallPayload,
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

export async function deleteMunicipalHallRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function uploadMunicipalHallImageRequest(
  payload: MunicipalHallImageUploadPayload,
  accessToken: string,
): Promise<UploadedMunicipalHallImage> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UploadedMunicipalHallImage;
  }>("/upload", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
