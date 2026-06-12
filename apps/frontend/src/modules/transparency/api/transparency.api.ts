import { ApiResponse, FetchProjectsParams } from '../types/types';

/**
 * Base URL for our own backend's DPWH proxy.
 *
 * The upstream `api.transparency.dpwh.gov.ph` only allows `http://localhost:3000`
 * as a CORS origin, which means the browser blocks any production frontend from
 * reading the response. We work around it by routing through our backend at
 * `/api/dpwh/*`, which performs the request server-to-server (no CORS check).
 *
 * - In development, Vite proxies `/api` to the backend on port 5000.
 * - In production, the backend serves both the SPA and the API on the same origin.
 * - Override with `VITE_DPWH_PROXY_BASE_URL` if the proxy lives elsewhere.
 */
const API_BASE_URL =
  (import.meta.env.VITE_DPWH_PROXY_BASE_URL as string | undefined) ?? '/api/dpwh';

/**
 * Fetches DPWH projects from our backend proxy
 * @param params - Query parameters for filtering projects
 * @returns Promise with API response containing projects data
 */
export const fetchProjects = async (params: FetchProjectsParams = {}): Promise<ApiResponse> => {
  const {
    page = 1,
    limit = 10000,
    search = 'Libmanan',
    region = 'Region V',
    province = 'CAMARINES SUR'
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    region,
    province
  });

  const response = await fetch(`${API_BASE_URL}/projects?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  if (data.status !== 200) {
    throw new Error(`API error! code: ${data.code}`);
  }

  return data;
};

/**
 * Fetches a single project by contract ID via our backend proxy
 * @param contractId - The contract ID of the project
 * @returns Promise with project data
 */
export const fetchProjectById = async (contractId: string) => {
  const response = await fetch(`${API_BASE_URL}/projects/${encodeURIComponent(contractId)}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
