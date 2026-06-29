import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/users`,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicUser {
  _id: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface RegisterPayload {
  displayName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface UserAuthResult {
  token: string;
  user: PublicUser;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function registerRequest(
  payload: RegisterPayload,
): Promise<UserAuthResult> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UserAuthResult;
  }>("/register", payload);
  return data.data;
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<UserAuthResult> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: UserAuthResult;
  }>("/login", payload);
  return data.data;
}

export async function getMeRequest(token: string): Promise<PublicUser> {
  const { data } = await apiClient.get<{ success: boolean; data: PublicUser }>(
    "/me",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data.data;
}
