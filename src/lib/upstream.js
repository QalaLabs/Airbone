// Shared upstream-admin configuration resolution for the marketing app.
//
// P0 hardening: an empty or malformed ADMIN_API_URL must never silently produce
// a relative fetch URL (e.g. "'' + '/api/public/leads'") that the browser
// resolves against the marketing origin. Config errors fail loudly instead.

export class LeadConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'LeadConfigError'
    this.isLeadConfigError = true
  }
}

/**
 * Resolve and validate ADMIN_API_URL.
 * - strict: throws LeadConfigError when missing/invalid (used by lead intake,
 *   where a misconfigured upstream must surface as an error, never fallback).
 * - non-strict: returns null when missing/invalid (used by read proxies that
 *   gracefully degrade to empty responses / 502).
 */
export function resolveAdminApiUrl({ strict = false } = {}) {
  const raw = (process.env.ADMIN_API_URL ?? '').trim().replace(/\/+$/, '')
  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    parsed = null
  }
  const valid = parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.host)
  if (!valid) {
    if (strict) {
      throw new LeadConfigError(
        'ADMIN_API_URL is missing or not a valid absolute HTTP(S) URL. Check the marketing application environment.'
      )
    }
    return null
  }
  return raw
}

/**
 * Resolve the shared PUBLIC_INTAKE_KEY.
 * - strict: throws LeadConfigError when unset (lead intake must not attempt an
 *   upstream call that is guaranteed to 401).
 * - non-strict: returns '' when unset.
 */
export function resolveIntakeKey({ strict = false } = {}) {
  const key = (process.env.PUBLIC_INTAKE_KEY ?? '').trim()
  if (!key && strict) {
    throw new LeadConfigError(
      'PUBLIC_INTAKE_KEY is not configured. It must match the admin application PUBLIC_INTAKE_KEY.'
    )
  }
  return key
}
