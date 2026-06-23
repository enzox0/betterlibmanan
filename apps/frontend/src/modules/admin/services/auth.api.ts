import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/auth`,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProfile {
  _id: string;
  id?: string; // alias populated from _id by some response shapes
  username: string;
  displayName: string;
  email: string;
  role: "superadmin" | "admin";
  isActive: boolean;
  phone?: string;
  department?: string;
  bio?: string;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  admin: AdminProfile;
}

export interface LoginPayload {
  username: string;
  password: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function loginRequest(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await apiClient.post<{ success: boolean; data: AuthTokens }>(
    "/login",
    payload,
  );
  return data.data;
}

export async function refreshRequest(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await apiClient.post<{ success: boolean; data: AuthTokens }>(
    "/refresh",
    {
      refreshToken,
    },
  );
  return data.data;
}

export async function logoutRequest(
  refreshToken: string,
  accessToken: string,
): Promise<void> {
  await apiClient.post(
    "/logout",
    { refreshToken },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

export async function getMeRequest(accessToken: string): Promise<AdminProfile> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: AdminProfile;
  }>("/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

// ─── Self-service profile payloads ───────────────────────────────────────────

export interface UpdateMePayload {
  displayName?: string;
  email?: string;
  phone?: string;
  department?: string;
  bio?: string;
}

export interface ChangeMyPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ActivityLogEntry {
  _id: string;
  action: string;
  module: string;
  description: string;
  createdAt: string;
  ipAddress?: string;
}

// ─── Self-service API calls ───────────────────────────────────────────────────

export async function updateMeRequest(
  payload: UpdateMePayload,
  accessToken: string,
): Promise<AdminProfile> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: AdminProfile;
  }>("/me", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function changeMyPasswordRequest(
  payload: ChangeMyPasswordPayload,
  accessToken: string,
): Promise<void> {
  await apiClient.post("/me/password", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getMyActivityRequest(
  accessToken: string,
): Promise<ActivityLogEntry[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ActivityLogEntry[];
  }>("/me/activity", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
