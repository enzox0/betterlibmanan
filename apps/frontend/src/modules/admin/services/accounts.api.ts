import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/accounts`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountRole = "superadmin" | "admin";
export type AccountStatus = "active" | "inactive";

export interface AdminAccount {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  role: AccountRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: AccountRole;
  isActive?: boolean;
}

export interface UpdateAccountPayload {
  displayName?: string;
  email?: string;
  role?: AccountRole;
  isActive?: boolean;
  password?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchAccounts(
  accessToken: string,
): Promise<AdminAccount[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: AdminAccount[];
  }>("/", { headers: authHeader(accessToken) });
  return data.data;
}

export async function createAccountRequest(
  payload: CreateAccountPayload,
  accessToken: string,
): Promise<AdminAccount> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: AdminAccount;
  }>("/", payload, { headers: authHeader(accessToken) });
  return data.data;
}

export async function updateAccountRequest(
  id: string,
  payload: UpdateAccountPayload,
  accessToken: string,
): Promise<AdminAccount> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: AdminAccount;
  }>(`/${id}`, payload, { headers: authHeader(accessToken) });
  return data.data;
}

export async function deleteAccountRequest(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/${id}`, { headers: authHeader(accessToken) });
}

export async function setAccountStatusRequest(
  id: string,
  isActive: boolean,
  accessToken: string,
): Promise<AdminAccount> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: AdminAccount;
  }>(`/${id}/status`, { isActive }, { headers: authHeader(accessToken) });
  return data.data;
}
