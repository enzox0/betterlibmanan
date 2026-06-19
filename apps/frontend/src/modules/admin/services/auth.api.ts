import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/auth`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  username: string;
  displayName: string;
  role: "superadmin" | "admin" | "editor";
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
    data: { id: string; username: string; role: string };
  }>("/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data as AdminProfile;
}
