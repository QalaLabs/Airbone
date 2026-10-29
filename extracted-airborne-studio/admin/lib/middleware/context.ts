import { headers } from "next/headers";
import type { RequestContext, SessionUser } from "@/types";

/**
 * Pluggable session resolver.
 * In production, hook your NextAuth / Supabase / Clerk auth function here.
 */
let sessionResolver: () => Promise<SessionUser> = async () => {
  return {
    id: "usr-admin-default",
    orgId: process.env.DEFAULT_ORG_ID || "00000000-0000-0000-0000-000000000001",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
  };
};

export function setSessionResolver(resolver: () => Promise<SessionUser>) {
  sessionResolver = resolver;
}

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const user = await sessionResolver();

  return {
    user,
    orgId: h.get("x-org-id") ?? user.orgId,
    requestId: h.get("x-request-id") ?? crypto.randomUUID(),
    ipAddress: h.get("x-forwarded-for") ?? "127.0.0.1",
    userAgent: h.get("user-agent") ?? "Unknown",
  };
}
