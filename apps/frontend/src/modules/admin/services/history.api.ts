import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/history`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface HistoryPayload {
  title: string;
  content?: string;
  year?: string;
  status: ContentStatus;
}

export interface HistoryBulkImportItem {
  title: string;
  content?: string;
  year?: string;
  status?: ContentStatus;
}

export interface HistoryBulkImportResult {
  imported: number;
  data: ContentRecord[];
}

export async function listPublicHistory(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminHistory(
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

export async function createHistoryRecord(
  payload: HistoryPayload,
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

export async function updateHistoryRecord(
  id: string,
  payload: HistoryPayload,
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

export async function deleteHistoryRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function bulkImportHistoryRecords(
  items: HistoryBulkImportItem[],
  accessToken: string,
): Promise<HistoryBulkImportResult> {
  const { data } = await apiClient.post<{
    success: boolean;
    imported: number;
    data: ContentRecord[];
  }>(
    "/bulk-import",
    { items },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return { imported: data.imported, data: data.data };
}
