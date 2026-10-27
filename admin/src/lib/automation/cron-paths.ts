/**
 * Cron endpoints authenticated by CRON_SECRET inside the route handler.
 * These must skip NextAuth session middleware, otherwise an external scheduler
 * (Cloud Scheduler) is redirected to the login page and never reaches the job.
 */
export const CRON_PATHS = ["/api/cron/automation", "/api/cron/cpl-campaigns"] as const;

/** Back-compat alias for the automation endpoint. */
export const CRON_AUTOMATION_PATH = CRON_PATHS[0];

/** True when session auth middleware must NOT run (cron uses CRON_SECRET in the route handler). */
export function isCronAutomationPath(pathname: string): boolean {
  return (CRON_PATHS as readonly string[]).includes(pathname);
}

/** Mirrors `middleware.ts` matcher — testable without running Next.js middleware. */
export function shouldRunSessionMiddleware(pathname: string): boolean {
  if (pathname.startsWith("/_next/static")) return false;
  if (pathname.startsWith("/_next/image")) return false;
  if (pathname === "/favicon.ico") return false;
  if (isCronAutomationPath(pathname)) return false;
  return true;
}
