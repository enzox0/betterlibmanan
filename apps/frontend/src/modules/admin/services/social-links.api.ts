import axios from "axios";
import type { ContentRecord } from "../types/admin.types";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/social-links`,
    headers: { "Content-Type": "application/json" },
  }),
);

export type SocialLinkPlatform =
  "facebook" | "twitter" | "instagram" | "youtube" | "tiktok" | "other";

export interface SocialLinkPayload {
  name: string;
  href: string;
  platform?: SocialLinkPlatform;
  order?: number;
}

export async function listSocialLinks(): Promise<ContentRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ContentRecord[];
  }>("/");
  return data.data;
}

export async function createSocialLinkRecord(
  payload: SocialLinkPayload,
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

export async function updateSocialLinkRecord(
  id: string,
  payload: SocialLinkPayload,
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

export async function deleteSocialLinkRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
