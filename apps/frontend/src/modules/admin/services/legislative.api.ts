import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/legislative`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegislativeSettings {
  _id?: string;
  ordinanceDescription: string;
  ordinanceDefinition: string;
  ordinanceCategories: string[];
  ordinanceExternalLink: string;
  resolutionDescription: string;
  resolutionDefinition: string;
  resolutionTypes: string[];
  resolutionExternalLink: string;
  aboutTitle: string;
  aboutDescription: string;
  updatedAt?: string;
}

export interface LegislativeDocRecord {
  id: string;
  sectionKey: string;
  title: string;
  status: "published";
  fields: {
    number: string;
    title: string;
    sessionDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProcessStepRecord {
  id: string;
  sectionKey: string;
  title: string;
  status: "published";
  fields: {
    variant: "ordinance" | "resolution";
    step: number;
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AboutPointRecord {
  id: string;
  sectionKey: string;
  title: string;
  status: "published";
  fields: {
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocPayload {
  number: string;
  title: string;
  sessionDate: string;
}

export interface ProcessStepPayload {
  variant: "ordinance" | "resolution";
  step: number;
  title: string;
  description?: string;
}

export interface ReplaceStepsPayload {
  variant: "ordinance" | "resolution";
  steps: Array<{
    id?: string;
    step: number;
    title: string;
    description: string;
  }>;
}

export interface AboutPointPayload {
  title: string;
  description: string;
}

export type SettingsPayload = Partial<LegislativeSettings>;

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getPublicLegislativeSettings(): Promise<LegislativeSettings> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: LegislativeSettings;
  }>("/settings");
  return data.data;
}

export async function updateLegislativeSettings(
  payload: SettingsPayload,
  accessToken: string,
): Promise<LegislativeSettings> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: LegislativeSettings;
  }>("/settings", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

// ─── Ordinances ───────────────────────────────────────────────────────────────

export async function listOrdinances(): Promise<LegislativeDocRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: LegislativeDocRecord[];
  }>("/ordinances");
  return data.data;
}

export async function createOrdinanceRecord(
  payload: DocPayload,
  accessToken: string,
): Promise<LegislativeDocRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: LegislativeDocRecord;
  }>("/ordinances", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateOrdinanceRecord(
  id: string,
  payload: DocPayload,
  accessToken: string,
): Promise<LegislativeDocRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: LegislativeDocRecord;
  }>(`/ordinances/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteOrdinanceRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/ordinances/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Resolutions ──────────────────────────────────────────────────────────────

export async function listResolutions(): Promise<LegislativeDocRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: LegislativeDocRecord[];
  }>("/resolutions");
  return data.data;
}

export async function createResolutionRecord(
  payload: DocPayload,
  accessToken: string,
): Promise<LegislativeDocRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: LegislativeDocRecord;
  }>("/resolutions", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateResolutionRecord(
  id: string,
  payload: DocPayload,
  accessToken: string,
): Promise<LegislativeDocRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: LegislativeDocRecord;
  }>(`/resolutions/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteResolutionRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/resolutions/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Process Steps ────────────────────────────────────────────────────────────

export async function listProcessSteps(
  variant: "ordinance" | "resolution",
): Promise<ProcessStepRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ProcessStepRecord[];
  }>(`/process-steps?variant=${variant}`);
  return data.data;
}

export async function createProcessStepRecord(
  payload: ProcessStepPayload,
  accessToken: string,
): Promise<ProcessStepRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ProcessStepRecord;
  }>("/process-steps", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateProcessStepRecord(
  id: string,
  payload: ProcessStepPayload,
  accessToken: string,
): Promise<ProcessStepRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ProcessStepRecord;
  }>(`/process-steps/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteProcessStepRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/process-steps/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function replaceProcessStepsRequest(
  payload: ReplaceStepsPayload,
  accessToken: string,
): Promise<ProcessStepRecord[]> {
  const { data } = await apiClient.put<{
    success: boolean;
    data: ProcessStepRecord[];
  }>("/process-steps/replace", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

// ─── About Points ─────────────────────────────────────────────────────────────

export async function listAboutPoints(): Promise<AboutPointRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: AboutPointRecord[];
  }>("/about-points");
  return data.data;
}

export async function createAboutPointRecord(
  payload: AboutPointPayload,
  accessToken: string,
): Promise<AboutPointRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: AboutPointRecord;
  }>("/about-points", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateAboutPointRecord(
  id: string,
  payload: AboutPointPayload,
  accessToken: string,
): Promise<AboutPointRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: AboutPointRecord;
  }>(`/about-points/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteAboutPointRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/about-points/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
