import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAppError } from "./errors";
import type { ApiError, ApiSuccess, PaginationMeta } from "@/types";

export function ok<T>(data: T, meta?: PaginationMeta, status = 200): NextResponse {
  const body: ApiSuccess<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body, { status });
}

export function created<T>(data: T): NextResponse {
  return ok(data, undefined, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.errors,
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  if (isAppError(err)) {
    const body: ApiError = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    return NextResponse.json(body, { status: err.statusCode });
  }

  // Unknown — log and return generic 500
  console.error("[unhandled error]", err);
  const body: ApiError = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  };
  return NextResponse.json(body, { status: 500 });
}

// ─── Pagination helper ───────────────────────────────────────────────────────

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getPaginationParams(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;
  const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
  const sortDir = (url.searchParams.get("sortDir") ?? "desc") as "asc" | "desc";
  return { page, limit, skip, sortBy, sortDir };
}
