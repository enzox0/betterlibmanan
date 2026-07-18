import axios from "axios";
import type { ContentRecord } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/government`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Payload types ────────────────────────────────────────────────────────────

export interface ExecutiveOfficialPayload {
  title: string;
  name: string;
  email?: string;
  phone?: string;
  hours?: string;
  order?: number;
}

export interface LegislativeMemberPayload {
  name: string;
  position: string;
  committees?: string[];
  order?: number;
}

export interface MunicipalOfficePayload {
  name: string;
  description: string;
  phone?: string;
  email?: string;
  link?: string;
  order?: number;
}

export interface BarangayPayload {
  name: string;
  captain: string;
  phone: string;
  order?: number;
}

// ─── Executive Officials ──────────────────────────────────────────────────────

export async function listPublicExecutiveOfficials(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/executive");
  return data.data;
}

export async function createExecutiveOfficialRecord(
  payload: ExecutiveOfficialPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ContentRecord;
  }>("/executive", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateExecutiveOfficialRecord(
  id: string,
  payload: ExecutiveOfficialPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ContentRecord;
  }>(`/executive/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteExecutiveOfficialRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/executive/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Legislative Members ──────────────────────────────────────────────────────

export async function listPublicLegislativeMembers(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/legislative");
  return data.data;
}

export async function createLegislativeMemberRecord(
  payload: LegislativeMemberPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ContentRecord;
  }>("/legislative", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateLegislativeMemberRecord(
  id: string,
  payload: LegislativeMemberPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ContentRecord;
  }>(`/legislative/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteLegislativeMemberRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/legislative/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Municipal Offices ────────────────────────────────────────────────────────

export async function listPublicMunicipalOffices(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/offices");
  return data.data;
}

export async function createMunicipalOfficeRecord(
  payload: MunicipalOfficePayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ContentRecord;
  }>("/offices", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateMunicipalOfficeRecord(
  id: string,
  payload: MunicipalOfficePayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ContentRecord;
  }>(`/offices/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteMunicipalOfficeRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/offices/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Barangays ────────────────────────────────────────────────────────────────

export async function listPublicBarangays(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/barangays");
  return data.data;
}

export async function createBarangayRecord(
  payload: BarangayPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ContentRecord;
  }>("/barangays", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateBarangayRecord(
  id: string,
  payload: BarangayPayload,
  accessToken: string,
): Promise<ContentRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ContentRecord;
  }>(`/barangays/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteBarangayRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/barangays/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
