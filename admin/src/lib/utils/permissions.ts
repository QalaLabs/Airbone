import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types";
import { ForbiddenError } from "@/lib/utils/errors";

// ─── Static permission matrix (baseline — overridden by DB rows) ─────────────

type PermissionMatrix = Record<UserRole, Record<string, string[]>>;

export const PERMISSION_MATRIX: PermissionMatrix = {
  SUPER_ADMIN: {
    "*": ["read", "write", "delete", "export", "publish", "admin"],
  },
  ADMIN: {
    leads: ["read", "write", "delete", "export", "assign"],
    users: ["read", "write", "delete"],
    students: ["read", "write", "delete", "export"],
    admissions: ["read", "write", "delete"],
    documents: ["read", "write", "delete", "approve"],
    payments: ["read", "write", "delete", "export"],
    courses: ["read", "write", "delete", "publish"],
    resources: ["read", "write", "delete", "publish"],
    jobs: ["read", "write", "delete", "publish"],
    job_applications: ["read", "write", "delete"],
    hiring_partners: ["read", "write", "delete"],
    placements: ["read", "write", "delete"],
    testimonials: ["read", "write", "delete", "approve"],
    settings: ["read", "write"],
    media: ["read", "write", "delete"],
    blocks: ["read", "write", "delete", "publish"],
    pages: ["read", "write", "delete", "publish"],
    nav: ["read", "write", "delete"],
    seo: ["read", "write"],
    notifications: ["read", "write"],
    analytics: ["read"],
    audit: ["read"],
    organizations: ["read", "write", "admin"],
    campuses: ["read", "write", "delete"],
    workflows: ["read", "write", "delete"],
  },
  MARKETING_MANAGER: {
    leads: ["read", "write", "export", "assign"],
    resources: ["read", "write", "publish"],
    jobs: ["read", "write", "publish"],
    media: ["read", "write"],
    blocks: ["read"],
    pages: ["read"],
    nav: ["read"],
    seo: ["read", "write"],
    analytics: ["read"],
    testimonials: ["read", "approve"],
    campaigns: ["read", "write"],
  },
  CONTENT_MANAGER: {
    courses: ["read", "write", "delete", "publish"],
    resources: ["read", "write", "publish"],
    media: ["read", "write", "delete"],
    blocks: ["read", "write", "delete", "publish"],
    pages: ["read", "write", "delete", "publish"],
    nav: ["read", "write"],
    seo: ["read", "write"],
    testimonials: ["read", "approve"],
    cms: ["read", "write", "publish"],
  },
  ADMISSIONS_COUNSELOR: {
    leads: ["read", "write", "assign"],
    students: ["read", "write"],
    admissions: ["read", "write"],
    documents: ["read", "write"],
    payments: ["read"],
    enquiries: ["read", "write"],
    analytics: ["read"],
  },
  PLACEMENT_MANAGER: {
    placements: ["read", "write", "delete"],
    testimonials: ["read", "write", "approve"],
    jobs: ["read", "write", "publish"],
    job_applications: ["read", "write"],
    hiring_partners: ["read", "write"],
    students: ["read"],
    admissions: ["read"],
    courses: ["read"],
    media: ["read", "write"],
    analytics: ["read"],
  },
  SUPPORT_STAFF: {
    leads: ["read"],
    students: ["read"],
    admissions: ["read"],
    documents: ["read"],
    enquiries: ["read", "write"],
  },
};

// ─── ABAC condition types ────────────────────────────────────────────────────

export interface ABACCondition {
  assigned_to?: "self";
  org_id?: "own";
  campus_id?: "own";
}

// ─── Permission checker ──────────────────────────────────────────────────────

export function hasPermission(
  user: SessionUser,
  action: string,
  resource: string,
): boolean {
  const matrix = PERMISSION_MATRIX[user.role];
  if (!matrix) return false;

  // Super admin wildcard
  if (matrix["*"]?.includes(action)) return true;

  const allowed = matrix[resource];
  if (!allowed) return false;

  return allowed.includes(action);
}

// Check ownership condition (ABAC layer)
export function meetsCondition(
  user: SessionUser,
  condition: ABACCondition | null,
  record: Record<string, unknown>,
): boolean {
  if (!condition) return true;

  if (condition.assigned_to === "self") {
    return record["assignedTo"] === user.id || record["createdBy"] === user.id;
  }

  if (condition.campus_id === "own" && user.campusId) {
    return record["campusId"] === user.campusId;
  }

  return true;
}

export function requirePermission(
  user: SessionUser,
  action: string,
  resource: string,
): void {
  if (!hasPermission(user, action, resource)) {
    throw new ForbiddenError(action, resource);
  }
}
