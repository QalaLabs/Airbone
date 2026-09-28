import { resolveAdminApiUrl, resolveIntakeKey } from './upstream.js'

/** Pull a human-readable message out of either admin error shape ({error: string} or {error: {message}}). */
export function upstreamErrorMessage(json) {
  if (!json || typeof json !== 'object') return ''
  if (typeof json.error === 'string') return json.error
  if (json.error && typeof json.error.message === 'string') return json.error.message
  return ''
}

/**
 * POST a public submission to an admin /api/public/* intake route with the
 * shared intake key and the visitor IP (so admin rate limits are per visitor).
 * Throws LeadConfigError when ADMIN_API_URL / PUBLIC_INTAKE_KEY are missing.
 */
export async function forwardIntake(path, body, clientIp, { timeoutMs = 10_000 } = {}) {
  const base = resolveAdminApiUrl({ strict: true })
  const key = resolveIntakeKey({ strict: true })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intake-key': key,
        ...(clientIp ? { 'x-intake-client-ip': clientIp } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    })
    const json = await res.json().catch(() => ({}))
    return { status: res.status, ok: res.ok, json }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Map an admin intake response to what the visitor sees. Client-side problems
 * (400/404/409/429) are reported truthfully; auth/config/5xx are generic.
 */
export function visitorResponse({ status, ok, json }, messages = {}) {
  if (ok) return { status, body: { success: true, data: json?.data ?? null } }
  const upstream = upstreamErrorMessage(json)
  if (status === 400 || status === 404 || status === 409) {
    return { status, body: { error: upstream || messages[status] || 'Some details could not be accepted.' } }
  }
  if (status === 429) return { status, body: { error: 'Too many attempts. Please wait a moment and try again.' } }
  if (status === 403) return { status, body: { error: messages[403] || 'Submissions are currently closed.' } }
  return { status: 502, body: { error: 'We could not submit right now. Please try again later.' } }
}
