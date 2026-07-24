import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { generateRequestId } from "@/lib/utils/crypto";

const { auth } = NextAuth(authConfig);

// Public paths that skip auth
const PUBLIC_PATHS = [
  "/login",
  "/verify",
  "/api/auth",
  "/api/v1/auth",
  "/api/v1/users/invite/accept",
  "/api/v1/public",
  "/api/inngest",
  "/api/public",
  "/_next",
  "/favicon.ico",
];

// Dev-only paths — blocked in production, allowed in development/preview
const DEV_ONLY_PATHS = ["/dev"];

export default auth((req: NextRequest & { auth?: { user?: { orgId?: string; id?: string; role?: string } } | null }) => {
  const { pathname } = req.nextUrl;

  // Block dev-only routes in production (middleware guard — defense in depth
  // alongside the client-side check in /dev/auto-login/page.tsx)
  if (DEV_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Not found" } },
        { status: 404 },
      );
    }
    // Allow in dev/preview
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth
  if (!req.auth?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Inject request metadata into headers for downstream handlers
  const requestId = generateRequestId();
  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);
  headers.set("x-org-id", req.auth.user.orgId ?? "");
  headers.set("x-user-id", req.auth.user.id ?? "");
  headers.set("x-user-role", req.auth.user.role ?? "");
  headers.set("x-forwarded-for-real", req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown");

  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
