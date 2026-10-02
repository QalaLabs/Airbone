// Canonical Admin OS origin (Cloud Run); same fallback the Admin app uses.
export const PRODUCTION_ADMIN_URL = 'https://airborne-admin-368523757732.asia-south1.run.app'
export const LOCAL_ADMIN_URL = 'http://localhost:4000'

/**
 * Student portal origin. NEXT_PUBLIC_* values are inlined at build time, so a
 * production build without the variable must still point at the live Admin
 * app — never at a developer's localhost.
 */
export function adminPortalUrl(configured, nodeEnv) {
  const value = typeof configured === 'string' ? configured.trim().replace(/\/+$/, '') : ''
  if (/^https?:\/\/[^/\s]+/i.test(value)) return value
  return nodeEnv === 'production' ? PRODUCTION_ADMIN_URL : LOCAL_ADMIN_URL
}
