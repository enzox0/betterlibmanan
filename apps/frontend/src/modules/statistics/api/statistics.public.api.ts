/**
 * Public-facing API helpers for the Statistics module.
 * All read routes are unauthenticated — no auth header required.
 */

const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/statistics`;

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Statistics API error ${res.status}: ${path}`);
  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiMunicipalStat {
  _id: string;
  value: string;
  label: string;
  subLabel: string;
  order: number;
}

export interface ApiFinanceStat {
  _id: string;
  label: string;
  value: string;
  subValue: string;
  order: number;
}

export interface ApiFinanceComposition {
  _id: string;
  label: string;
  percentage: number;
  color: string;
  order: number;
}

export interface ApiPopulationPoint {
  _id: string;
  year: number;
  pop: number;
}

export interface ApiBarangay {
  _id: string;
  rank: number;
  name: string;
  population: number;
}

export interface ApiEconomyIndicator {
  _id: string;
  label: string;
  value: string;
  subLabel: string;
  order: number;
}

export interface ApiEconomySector {
  _id: string;
  name: string;
  percentage: number;
  order: number;
}

export interface ApiPovertyEntry {
  _id: string;
  year: number;
  rate: number;
  confidenceInterval: string;
  change: number;
  status: "improved" | "worsened" | "stable";
}

export interface ApiCompetitivenessItem {
  _id: string;
  category: string;
  score: number;
  change: number;
  changeLabel: string;
  order: number;
}

export interface PublicStatisticsBundle {
  municipal: ApiMunicipalStat[];
  financeStats: ApiFinanceStat[];
  financeComposition: ApiFinanceComposition[];
  populationHistory: ApiPopulationPoint[];
  barangays: ApiBarangay[];
  economyIndicators: ApiEconomyIndicator[];
  economySectors: ApiEconomySector[];
  poverty: ApiPovertyEntry[];
  competitiveness: ApiCompetitivenessItem[];
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

/** Fetch the full statistics bundle in one request. */
export function fetchPublicStatistics(): Promise<PublicStatisticsBundle> {
  return apiFetch<PublicStatisticsBundle>("/");
}
