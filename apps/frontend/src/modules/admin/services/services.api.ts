import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/services`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceItemRecord {
  id: string;
  title: string;
  description: string;
  fee: string;
  processingTime: string;
  link: string;
  requirements: string[];
  steps: string[];
  categorySlug: string;
}

export interface ServiceCategoryRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  status: "published" | "draft";
  services: ServiceItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface LifeEventRecord {
  id: string;
  slug: string;
  title: string;
  iconKey: string;
  serviceIds: string[];
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

// ─── Category payloads ────────────────────────────────────────────────────────

export interface CategoryPayload {
  slug?: string;
  title: string;
  description?: string;
  iconKey?: string;
  status: "published" | "draft";
  services?: ServiceItemPayload[];
}

export interface ServiceItemPayload {
  id?: string;
  title: string;
  description?: string;
  fee?: string;
  processingTime?: string;
  link?: string;
  requirements?: string[];
  steps?: string[];
}

// ─── Life event payloads ──────────────────────────────────────────────────────

export interface LifeEventPayload {
  slug?: string;
  title: string;
  iconKey?: string;
  serviceIds?: string[];
  status: "published" | "draft";
}

// ─── Category API ─────────────────────────────────────────────────────────────

export async function listPublicCategories(): Promise<ServiceCategoryRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ServiceCategoryRecord[];
  }>("/categories");
  return data.data;
}

export async function listAdminCategories(
  accessToken: string,
): Promise<ServiceCategoryRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ServiceCategoryRecord[];
  }>("/categories/admin", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function createCategoryRequest(
  payload: CategoryPayload,
  accessToken: string,
): Promise<ServiceCategoryRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ServiceCategoryRecord;
  }>("/categories", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateCategoryRequest(
  id: string,
  payload: CategoryPayload,
  accessToken: string,
): Promise<ServiceCategoryRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ServiceCategoryRecord;
  }>(`/categories/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteCategoryRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Individual service API ───────────────────────────────────────────────────

export async function addServiceRequest(
  categoryId: string,
  payload: ServiceItemPayload,
  accessToken: string,
): Promise<ServiceCategoryRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: ServiceCategoryRecord;
  }>(`/categories/${categoryId}/services`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateServiceRequest(
  categoryId: string,
  serviceId: string,
  payload: ServiceItemPayload,
  accessToken: string,
): Promise<ServiceCategoryRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: ServiceCategoryRecord;
  }>(`/categories/${categoryId}/services/${serviceId}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function removeServiceRequest(
  categoryId: string,
  serviceId: string,
  accessToken: string,
): Promise<ServiceCategoryRecord> {
  const { data } = await apiClient.delete<{
    success: boolean;
    data: ServiceCategoryRecord;
  }>(`/categories/${categoryId}/services/${serviceId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

// ─── Life Event API ───────────────────────────────────────────────────────────

export async function listPublicLifeEvents(): Promise<LifeEventRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: LifeEventRecord[];
  }>("/life-events");
  return data.data;
}

export async function listAdminLifeEvents(
  accessToken: string,
): Promise<LifeEventRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: LifeEventRecord[];
  }>("/life-events/admin", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function createLifeEventRequest(
  payload: LifeEventPayload,
  accessToken: string,
): Promise<LifeEventRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: LifeEventRecord;
  }>("/life-events", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateLifeEventRequest(
  id: string,
  payload: LifeEventPayload,
  accessToken: string,
): Promise<LifeEventRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: LifeEventRecord;
  }>(`/life-events/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteLifeEventRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/life-events/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
