/**
 * Public-facing API helpers for the Legislative module.
 *
 * These call the open (unauthenticated) GET endpoints on the backend.
 * No auth header required — all read routes are public.
 */

const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/legislative`;

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Legislative API error ${res.status}: ${path}`);
  }
  const json: { success: boolean; data: T } = await res.json();
  return json.data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicLegislativeSettings {
  ordinanceDescription: string;
  ordinanceDefinition: string;
  ordinanceCategories: string[];
  ordinanceExternalLink: string;
  resolutionDescription: string;
  resolutionDefinition: string;
  resolutionTypes: string[];
  resolutionExternalLink: string;
  aboutTitle: string;
  aboutDescription: string;
}

export interface PublicLegislativeDoc {
  id: string;
  fields: {
    number: string;
    title: string;
    sessionDate: string;
  };
}

export interface PublicProcessStep {
  id: string;
  fields: {
    variant: "ordinance" | "resolution";
    step: number;
    title: string;
    description: string;
  };
}

export interface PublicAboutPoint {
  id: string;
  fields: {
    title: string;
    description: string;
  };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

export function fetchLegislativeSettings(): Promise<PublicLegislativeSettings> {
  return apiFetch<PublicLegislativeSettings>("/settings");
}

export function fetchOrdinances(): Promise<PublicLegislativeDoc[]> {
  return apiFetch<PublicLegislativeDoc[]>("/ordinances");
}

export function fetchResolutions(): Promise<PublicLegislativeDoc[]> {
  return apiFetch<PublicLegislativeDoc[]>("/resolutions");
}

export function fetchProcessSteps(
  variant: "ordinance" | "resolution",
): Promise<PublicProcessStep[]> {
  return apiFetch<PublicProcessStep[]>(`/process-steps?variant=${variant}`);
}

export function fetchAboutPoints(): Promise<PublicAboutPoint[]> {
  return apiFetch<PublicAboutPoint[]>("/about-points");
}
