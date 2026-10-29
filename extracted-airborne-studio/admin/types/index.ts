export * from "./cms";

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  cursor?: string;
}

// ─── Auth / Session / Context ───────────────────────────────────────────────

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CAMPUS_MANAGER"
  | "ADMISSIONS_COUNSELOR"
  | "INSTRUCTOR"
  | "STUDENT";

export interface SessionUser {
  id: string;
  orgId: string;
  campusId?: string | null;
  name: string;
  email: string;
  role: UserRole | string;
  avatarUrl?: string | null;
}

export interface RequestContext {
  user: SessionUser;
  orgId: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}
