import axios from "axios";
import { attachAdminUnauthorizedInterceptor } from "./admin-api-client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = attachAdminUnauthorizedInterceptor(
  axios.create({
    baseURL: `${BASE_URL}/api/statistics`,
    headers: { "Content-Type": "application/json" },
  }),
);

// ─── Shared helper ────────────────────────────────────────────────────────────

async function authGet<T>(path: string): Promise<T> {
  const { data } = await apiClient.get<{ success: boolean; data: T }>(path);
  return data.data;
}
async function authPost<T>(
  path: string,
  payload: unknown,
  token: string,
): Promise<T> {
  const { data } = await apiClient.post<{ success: boolean; data: T }>(
    path,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data.data;
}
async function authPatch<T>(
  path: string,
  payload: unknown,
  token: string,
): Promise<T> {
  const { data } = await apiClient.patch<{ success: boolean; data: T }>(
    path,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data.data;
}
async function authDelete(path: string, token: string): Promise<void> {
  await apiClient.delete(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Record Types ─────────────────────────────────────────────────────────────

export interface MunicipalStatRecord {
  _id: string;
  value: string;
  label: string;
  subLabel: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceStatRecord {
  _id: string;
  label: string;
  value: string;
  subValue: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceCompositionRecord {
  _id: string;
  label: string;
  percentage: number;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PopulationPointRecord {
  _id: string;
  year: number;
  pop: number;
  createdAt: string;
  updatedAt: string;
}

export interface BarangayRecord {
  _id: string;
  rank: number;
  name: string;
  population: number;
  createdAt: string;
  updatedAt: string;
}

export interface EconomyIndicatorRecord {
  _id: string;
  label: string;
  value: string;
  subLabel: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EconomySectorRecord {
  _id: string;
  name: string;
  percentage: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PovertyEntryRecord {
  _id: string;
  year: number;
  rate: number;
  confidenceInterval: string;
  change: number;
  status: "improved" | "worsened" | "stable";
  createdAt: string;
  updatedAt: string;
}

export interface CompetitivenessItemRecord {
  _id: string;
  category: string;
  score: number;
  change: number;
  changeLabel: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Payload Types ────────────────────────────────────────────────────────────

export type MunicipalStatPayload = Pick<
  MunicipalStatRecord,
  "value" | "label" | "subLabel" | "order"
>;
export type FinanceStatPayload = Pick<
  FinanceStatRecord,
  "label" | "value" | "subValue" | "order"
>;
export type FinanceCompositionPayload = Pick<
  FinanceCompositionRecord,
  "label" | "percentage" | "color" | "order"
>;
export type PopulationPointPayload = Pick<
  PopulationPointRecord,
  "year" | "pop"
>;
export type BarangayPayload = Pick<BarangayRecord, "name" | "population">;
export type EconomyIndicatorPayload = Pick<
  EconomyIndicatorRecord,
  "label" | "value" | "subLabel" | "order"
>;
export type EconomySectorPayload = Pick<
  EconomySectorRecord,
  "name" | "percentage" | "order"
>;
export type PovertyEntryPayload = Pick<
  PovertyEntryRecord,
  "year" | "rate" | "confidenceInterval" | "change" | "status"
>;
export type CompetitivenessItemPayload = Pick<
  CompetitivenessItemRecord,
  "category" | "score" | "change" | "changeLabel" | "order"
>;

// ─── Municipal Stats ──────────────────────────────────────────────────────────

export const listMunicipalStats = () =>
  authGet<MunicipalStatRecord[]>("/municipal-stats");
export const createMunicipalStat = (p: MunicipalStatPayload, t: string) =>
  authPost<MunicipalStatRecord>("/municipal-stats", p, t);
export const updateMunicipalStat = (
  id: string,
  p: MunicipalStatPayload,
  t: string,
) => authPatch<MunicipalStatRecord>(`/municipal-stats/${id}`, p, t);
export const deleteMunicipalStat = (id: string, t: string) =>
  authDelete(`/municipal-stats/${id}`, t);

// ─── Finance Stats ────────────────────────────────────────────────────────────

export const listFinanceStats = () =>
  authGet<FinanceStatRecord[]>("/finance-stats");
export const createFinanceStat = (p: FinanceStatPayload, t: string) =>
  authPost<FinanceStatRecord>("/finance-stats", p, t);
export const updateFinanceStat = (
  id: string,
  p: FinanceStatPayload,
  t: string,
) => authPatch<FinanceStatRecord>(`/finance-stats/${id}`, p, t);
export const deleteFinanceStat = (id: string, t: string) =>
  authDelete(`/finance-stats/${id}`, t);

// ─── Finance Composition ──────────────────────────────────────────────────────

export const listFinanceComposition = () =>
  authGet<FinanceCompositionRecord[]>("/finance-composition");
export const createFinanceCompositionItem = (
  p: FinanceCompositionPayload,
  t: string,
) => authPost<FinanceCompositionRecord>("/finance-composition", p, t);
export const updateFinanceCompositionItem = (
  id: string,
  p: FinanceCompositionPayload,
  t: string,
) => authPatch<FinanceCompositionRecord>(`/finance-composition/${id}`, p, t);
export const deleteFinanceCompositionItem = (id: string, t: string) =>
  authDelete(`/finance-composition/${id}`, t);

// ─── Population History ───────────────────────────────────────────────────────

export const listPopulationHistory = () =>
  authGet<PopulationPointRecord[]>("/population");
export const createPopulationPoint = (p: PopulationPointPayload, t: string) =>
  authPost<PopulationPointRecord>("/population", p, t);
export const updatePopulationPoint = (
  id: string,
  p: PopulationPointPayload,
  t: string,
) => authPatch<PopulationPointRecord>(`/population/${id}`, p, t);
export const deletePopulationPoint = (id: string, t: string) =>
  authDelete(`/population/${id}`, t);

// ─── Barangays ────────────────────────────────────────────────────────────────

export const listBarangays = () => authGet<BarangayRecord[]>("/barangays");
/** Create returns the full re-ranked list */
export const createBarangay = (p: BarangayPayload, t: string) =>
  authPost<BarangayRecord[]>("/barangays", p, t);
/** Update returns the full re-ranked list */
export const updateBarangay = (id: string, p: BarangayPayload, t: string) =>
  authPatch<BarangayRecord[]>(`/barangays/${id}`, p, t);
/** Delete returns the full re-ranked list */
export const deleteBarangay = (id: string, t: string) =>
  apiClient
    .delete<{ success: boolean; data: BarangayRecord[] }>(`/barangays/${id}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    .then((r) => r.data.data);

// ─── Economy Indicators ───────────────────────────────────────────────────────

export const listEconomyIndicators = () =>
  authGet<EconomyIndicatorRecord[]>("/economy-indicators");
export const createEconomyIndicator = (p: EconomyIndicatorPayload, t: string) =>
  authPost<EconomyIndicatorRecord>("/economy-indicators", p, t);
export const updateEconomyIndicator = (
  id: string,
  p: EconomyIndicatorPayload,
  t: string,
) => authPatch<EconomyIndicatorRecord>(`/economy-indicators/${id}`, p, t);
export const deleteEconomyIndicator = (id: string, t: string) =>
  authDelete(`/economy-indicators/${id}`, t);

// ─── Economy Sectors ──────────────────────────────────────────────────────────

export const listEconomySectors = () =>
  authGet<EconomySectorRecord[]>("/economy-sectors");
export const createEconomySector = (p: EconomySectorPayload, t: string) =>
  authPost<EconomySectorRecord>("/economy-sectors", p, t);
export const updateEconomySector = (
  id: string,
  p: EconomySectorPayload,
  t: string,
) => authPatch<EconomySectorRecord>(`/economy-sectors/${id}`, p, t);
export const deleteEconomySector = (id: string, t: string) =>
  authDelete(`/economy-sectors/${id}`, t);

// ─── Poverty Entries ──────────────────────────────────────────────────────────

export const listPovertyEntries = () =>
  authGet<PovertyEntryRecord[]>("/poverty");
export const createPovertyEntry = (p: PovertyEntryPayload, t: string) =>
  authPost<PovertyEntryRecord>("/poverty", p, t);
export const updatePovertyEntry = (
  id: string,
  p: PovertyEntryPayload,
  t: string,
) => authPatch<PovertyEntryRecord>(`/poverty/${id}`, p, t);
export const deletePovertyEntry = (id: string, t: string) =>
  authDelete(`/poverty/${id}`, t);

// ─── Competitiveness Items ────────────────────────────────────────────────────

export const listCompetitivenessItems = () =>
  authGet<CompetitivenessItemRecord[]>("/competitiveness");
export const createCompetitivenessItem = (
  p: CompetitivenessItemPayload,
  t: string,
) => authPost<CompetitivenessItemRecord>("/competitiveness", p, t);
export const updateCompetitivenessItem = (
  id: string,
  p: CompetitivenessItemPayload,
  t: string,
) => authPatch<CompetitivenessItemRecord>(`/competitiveness/${id}`, p, t);
export const deleteCompetitivenessItem = (id: string, t: string) =>
  authDelete(`/competitiveness/${id}`, t);
