import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

// Public client — no auth interceptor needed (submit is public)
const publicClient = axios.create({
  baseURL: `${BASE_URL}/api/admin-registrations`,
  headers: { "Content-Type": "application/json" },
});

// Protected client — wraps with 401 interceptor for admin-authenticated calls
const adminClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/admin-registrations`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminRegistrationStatus = "pending" | "approved" | "rejected";

export interface AdminRegistration {
  _id: string;
  displayName: string;
  username: string;
  email: string;
  phone?: string;
  department?: string;
  reason?: string;
  status: AdminRegistrationStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string | null;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRegistrationPayload {
  displayName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  reason?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Public API calls ─────────────────────────────────────────────────────────

export async function submitAdminRegistration(
  payload: SubmitRegistrationPayload,
): Promise<AdminRegistration> {
  const { data } = await publicClient.post<{
    success: boolean;
    data: AdminRegistration;
  }>("/", payload);
  return data.data;
}

export interface RegistrationLookup {
  status: AdminRegistrationStatus;
  displayName: string;
  createdAt: string;
  rejectionReason?: string;
}

export async function lookupRegistrationByEmail(
  email: string,
): Promise<RegistrationLookup | null> {
  const { data } = await publicClient.get<{
    success: boolean;
    data: RegistrationLookup | null;
  }>("/lookup", { params: { email } });
  return data.data;
}

// ─── Admin API calls (superadmin only) ───────────────────────────────────────

export async function fetchAdminRegistrations(
  accessToken: string,
  status?: AdminRegistrationStatus,
): Promise<AdminRegistration[]> {
  const params = status ? { status } : {};
  const { data } = await adminClient.get<{
    success: boolean;
    data: AdminRegistration[];
  }>("/", {
    headers: authHeader(accessToken),
    params,
  });
  return data.data;
}

export async function fetchAdminRegistration(
  id: string,
  accessToken: string,
): Promise<AdminRegistration> {
  const { data } = await adminClient.get<{
    success: boolean;
    data: AdminRegistration;
  }>(`/${id}`, { headers: authHeader(accessToken) });
  return data.data;
}

export async function approveAdminRegistration(
  id: string,
  accessToken: string,
): Promise<AdminRegistration> {
  const { data } = await adminClient.patch<{
    success: boolean;
    data: AdminRegistration;
  }>(`/${id}/approve`, {}, { headers: authHeader(accessToken) });
  return data.data;
}

export async function rejectAdminRegistration(
  id: string,
  rejectionReason: string,
  accessToken: string,
): Promise<AdminRegistration> {
  const { data } = await adminClient.patch<{
    success: boolean;
    data: AdminRegistration;
  }>(
    `/${id}/reject`,
    { rejectionReason },
    { headers: authHeader(accessToken) },
  );
  return data.data;
}

export async function deleteAdminRegistration(
  id: string,
  accessToken: string,
): Promise<void> {
  await adminClient.delete(`/${id}`, { headers: authHeader(accessToken) });
}
