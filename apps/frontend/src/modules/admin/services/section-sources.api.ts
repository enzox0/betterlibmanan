import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/section-sources`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type SectionKey =
  | "stats-finance"
  | "stats-population"
  | "stats-barangays"
  | "stats-economy"
  | "stats-poverty"
  | "stats-competitiveness"
  | "transparency-financial-reports"
  | "transparency-dpwh-projects";

export interface SectionSourceRecord {
  _id: string;
  section: SectionKey;
  label: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionSourcePayload {
  section: SectionKey;
  label: string;
  url: string;
}

// ─── Public read (no auth) ────────────────────────────────────────────────────

export async function fetchPublicSources(): Promise<SectionSourceRecord[]> {
  const BASE = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${BASE}/api/section-sources`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: { success: boolean; data: SectionSourceRecord[] } =
    await res.json();
  return json.data;
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export async function adminListSources(): Promise<SectionSourceRecord[]> {
  const BASE = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${BASE}/api/section-sources`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: { success: boolean; data: SectionSourceRecord[] } =
    await res.json();
  return json.data;
}

export async function adminUpsertSource(
  payload: SectionSourcePayload,
  accessToken: string,
): Promise<SectionSourceRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: SectionSourceRecord;
  }>("/", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function adminUpdateSource(
  id: string,
  payload: SectionSourcePayload,
  accessToken: string,
): Promise<SectionSourceRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: SectionSourceRecord;
  }>(`/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function adminDeleteSource(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
