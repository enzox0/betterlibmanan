import { ApiResponse, FetchProjectsParams } from '../types/types';

const API_BASE_URL = 'https://api.transparency.dpwh.gov.ph';

/**
 * Fetches DPWH projects from the transparency API
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
 * Fetches a single project by contract ID
 * @param contractId - The contract ID of the project
 * @returns Promise with project data
 */
export const fetchProjectById = async (contractId: string) => {
  const response = await fetch(`${API_BASE_URL}/projects/${contractId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
