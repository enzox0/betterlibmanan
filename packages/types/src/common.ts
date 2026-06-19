export interface BaseEntity {
  id: string;
  _id?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SortOptions {
  field: string;
  order: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
