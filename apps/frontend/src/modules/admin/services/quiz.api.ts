import axios from "axios";
import type { ContentRecord, ContentStatus } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/quiz`,
    headers: { "Content-Type": "application/json" },
  }),
);

export interface QuizPayload {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
  status: ContentStatus;
}

export interface QuizBulkImportItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
  status?: ContentStatus;
}

export interface QuizBulkImportResult {
  imported: number;
  data: ContentRecord[];
}

export async function listPublicQuiz(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function listAdminQuiz(
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

export async function createQuizRecord(
  payload: QuizPayload,
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

export async function updateQuizRecord(
  id: string,
  payload: QuizPayload,
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

export async function deleteQuizRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function bulkImportQuizRecords(
  items: QuizBulkImportItem[],
  accessToken: string,
): Promise<QuizBulkImportResult> {
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
