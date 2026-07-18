export interface Project {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  location: {
    province: string;
    region: string;
  };
  contractor: string;
  startDate: string;
  completionDate: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
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

export interface ApiResponse {
  status: number;
  code: string;
  data: {
    data: Project[];
    summary: ProjectSummary;
    pagination: ProjectPagination;
  };
}

export interface FetchProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  province?: string;
}
