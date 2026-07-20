import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

// Public API client (no auth needed for initiate, resend, verify, lookup)
const publicClient = axios.create({
  baseURL: `${BASE_URL}/api/admin-registrations`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Admin API client (requires auth)
const adminClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/admin-registrations`,
    headers: { "Content-Type": "application/json" },
  }),
);

// Helper to add auth header
function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const AdminRegistrationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type AdminRegistrationStatus =
  (typeof AdminRegistrationStatus)[keyof typeof AdminRegistrationStatus];

export interface AdminRegistration {
  _id: string;
  displayName: string;
  username: string;
  email: string;
  phone?: string;
  department?: string;
  reason?: string;
  status: AdminRegistrationStatus;
  isEmailVerified: boolean;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string | null;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationLookup = Pick<
  AdminRegistration,
  "status" | "displayName" | "username" | "createdAt" | "rejectionReason"
>;

export interface SubmitRegistrationData {
  displayName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  reason?: string;
}

// PUBLIC API

export async function initiateAdminRegistration(
  data: SubmitRegistrationData,
): Promise<{ tempId: string }> {
  const { data: responseData } = await publicClient.post("/initiate", data);
  return responseData.data;
}

export async function resendAdminRegistrationOtp(
  tempId: string,
): Promise<void> {
  await publicClient.post("/resend-otp", { tempId });
}

export async function verifyAdminRegistrationOtp(
  tempId: string,
  otp: string,
): Promise<AdminRegistration> {
  const { data } = await publicClient.post("/verify", { tempId, otp });
  return data.data;
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

// ADMIN API

export async function fetchAdminRegistrations(
  accessToken: string,
  status?: AdminRegistrationStatus,
): Promise<AdminRegistration[]> {
  const { data } = await adminClient.get<{
    success: boolean;
    data: AdminRegistration[];
  }>("/", {
    params: status ? { status } : {},
    headers: authHeader(accessToken),
  });
  return data.data;
}

export async function getAdminRegistration(
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
  const { data } = await adminClient.post<{
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
  const { data } = await adminClient.post<{
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
