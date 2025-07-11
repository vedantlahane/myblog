import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    isAdmin: boolean;
  };
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sort?: string;
}

export interface SearchQuery extends PaginationQuery {
  q: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}