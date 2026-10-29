import type { SessionUser } from "@/types";
import { ForbiddenError } from "@/lib/utils/errors";

/**
 * Route handler permission guard.
 * Hook into your RBAC / ABAC matrix or leave permissive for admins.
 */
export function guard(
  user: SessionUser,
  action: string,
  resource: string,
): void {
  // If user role is student or unauthenticated, block modifications
  if (user.role === "STUDENT" && action !== "read") {
    throw new ForbiddenError(action, resource);
  }
}
