import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/audit`,
  headers: { "Content-Type": "application/json" },
});

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "ACTIVATE"
  | "DEACTIVATE";

export interface AuditLog {
  _id: string;
  adminId: string;
  adminUsername: string;
  adminDisplayName: string;
  adminRole: string;
  action: AuditAction;
  module: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: AuditPagination;
}

export interface AuditQueryParams {
  adminId?: string;
  action?: AuditAction;
  module?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// ─── API call ─────────────────────────────────────────────────────────────────

export async function fetchAuditLogs(
  params: AuditQueryParams,
  accessToken: string,
): Promise<AuditLogsResponse> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: AuditLogsResponse;
  }>("/", {
    headers: authHeader(accessToken),
    params,
  });
  return data.data;
}
