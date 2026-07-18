import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/transparency`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DpwhProjectRecord {
  id: string;
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  location: { province: string; region: string };
  contractor: string;
  startDate: string;
  completionDate: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  totalProjects: number;
  completed: number;
  ongoing: number;
  notStarted: number;
  totalBudget: number;
}

export interface ProjectPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProjectListResponse {
  data: DpwhProjectRecord[];
  summary: ProjectSummary;
  pagination: ProjectPagination;
}

export interface ProjectPayload {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  province: string;
  region: string;
  contractor: string;
  startDate: string;
  completionDate?: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listProjects(
  params: ProjectListParams = {},
): Promise<ProjectListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "All")
    query.set("category", params.category);
  if (params.status && params.status !== "All")
    query.set("status", params.status);

  const { data } = await apiClient.get<{
    success: boolean;
    data: ProjectListResponse;
  }>(`/projects?${query.toString()}`);
  return data.data;
}

export async function createProjectRecord(
  payload: ProjectPayload,
  accessToken: string,
): Promise<DpwhProjectRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: DpwhProjectRecord;
  }>("/projects", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateProjectRecord(
  id: string,
  payload: ProjectPayload,
  accessToken: string,
): Promise<DpwhProjectRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: DpwhProjectRecord;
  }>(`/projects/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteProjectRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/projects/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Financial Report Types ───────────────────────────────────────────────────

export interface BreakdownItem {
  source?: string;
  category?: string;
  amount: number;
  percentage: number;
}

export interface FinancialReportRecord {
  id: string;
  fiscalYear: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  totalIncome: number;
  totalExpenditures: number;
  netOperatingIncome: number;
  fundBalance: number;
  incomeSources: Array<{ source: string; amount: number; percentage: number }>;
  expenditureAllocations: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  reportDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialReportPayload {
  fiscalYear: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  totalIncome: number;
  totalExpenditures: number;
  netOperatingIncome: number;
  fundBalance: number;
  incomeSources: Array<{ source: string; amount: number; percentage: number }>;
  expenditureAllocations: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  reportDate?: string;
}

// ─── Financial Report API Functions ──────────────────────────────────────────

export async function listFinancialReports(): Promise<FinancialReportRecord[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: FinancialReportRecord[];
  }>("/financial-reports");
  return data.data;
}

export async function createFinancialReportRecord(
  payload: FinancialReportPayload,
  accessToken: string,
): Promise<FinancialReportRecord> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: FinancialReportRecord;
  }>("/financial-reports", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function updateFinancialReportRecord(
  id: string,
  payload: FinancialReportPayload,
  accessToken: string,
): Promise<FinancialReportRecord> {
  const { data } = await apiClient.patch<{
    success: boolean;
    data: FinancialReportRecord;
  }>(`/financial-reports/${id}`, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function deleteFinancialReportRecord(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete(`/financial-reports/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────

export interface BulkImportResult {
  inserted: number;
  skipped: number;
  errors: Array<{ contractId: string; reason: string }>;
}

export async function bulkImportProjects(
  payload: object,
  accessToken: string,
): Promise<BulkImportResult> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: BulkImportResult;
  }>("/projects/bulk-import", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}
