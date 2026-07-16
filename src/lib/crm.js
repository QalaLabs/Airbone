// Centralized LMSBABA CRM integration. Only this module knows the CRM endpoint —
// frontend and other server code must never call the CRM directly.

const CRM_ENDPOINT = process.env.CRM_ENDPOINT ?? ''
const CRM_COMPANY = process.env.CRM_COMPANY ?? 'Airborne Aviation'
const CRM_SOURCE = process.env.CRM_SOURCE ?? 'Airborne Website'
// Hard-capped at 8s regardless of env override — CRM latency must never drag down user response time.
const CRM_FETCH_TIMEOUT = Math.min(parseInt(process.env.CRM_FETCH_TIMEOUT || '8000', 10), 8000)
const CRM_MAX_RETRIES = parseInt(process.env.CRM_MAX_RETRIES || '2', 10)
const DEDUPE_WINDOW_MS = 60 * 1000

// In-memory dedupe cache: same lead (by uuid) submitted twice within the window
// (double-click, refresh, client retry) is forwarded to the CRM only once.
const recentSubmissions = new Map()

function isDuplicate(leadUuid) {
  const now = Date.now()
  for (const [key, expiresAt] of recentSubmissions) {
    if (expiresAt < now) recentSubmissions.delete(key)
  }
  if (recentSubmissions.has(leadUuid)) return true
  recentSubmissions.set(leadUuid, now + DEDUPE_WINDOW_MS)
  return false
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Cheap deterministic hash so the same lead content (name+phone+email+course)
// submitted twice within the dedupe window collapses to one CRM forward,
// even when the caller doesn't supply an explicit leadUuid.
function contentHash(lead) {
  const raw = `${lead.name ?? ''}|${lead.phone ?? ''}|${lead.email ?? ''}|${lead.course ?? ''}`.toLowerCase()
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0
  }
  return `h${hash}`
}

function maskEmail(email) {
  if (!email) return email
  const [user, domain] = email.split('@')
  if (!domain) return '***'
  return `${user.slice(0, 2)}***@${domain}`
}

function maskPhone(phone) {
  if (!phone) return phone
  return phone.length > 4 ? `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}` : '***'
}

function buildDescription(lead) {
  if (lead.message && lead.message.trim()) {
    return appendAttribution(lead.message.trim(), lead)
  }

  const lines = [`Selected Course: ${lead.course || 'N/A'}`]
  if (lead.pageUrl) lines.push(`Lead Source Page: ${lead.pageUrl}`)
  if (lead.pathname) lines.push(`Path: ${lead.pathname}`)
  if (lead.referrer) lines.push(`Referrer: ${lead.referrer}`)
  if (lead.pincode) lines.push(`Pincode: ${lead.pincode}`)

  return appendAttribution(lines.join('\n'), lead)
}

function appendAttribution(base, lead) {
  const attribution = []
  if (lead.utmSource) attribution.push(`utm_source: ${lead.utmSource}`)
  if (lead.utmMedium) attribution.push(`utm_medium: ${lead.utmMedium}`)
  if (lead.utmCampaign) attribution.push(`utm_campaign: ${lead.utmCampaign}`)
  if (lead.utmTerm) attribution.push(`utm_term: ${lead.utmTerm}`)
  if (lead.utmContent) attribution.push(`utm_content: ${lead.utmContent}`)
  if (lead.gclid) attribution.push(`gclid: ${lead.gclid}`)
  if (lead.fbclid) attribution.push(`fbclid: ${lead.fbclid}`)

  if (attribution.length === 0) return base
  return `${base}\n\n--- Marketing Attribution ---\n${attribution.join('\n')}`
}

/**
 * lead: { name, email, phone, city, country, course, message, pincode,
 *         pageUrl, pathname, referrer,
 *         utmSource, utmMedium, utmCampaign, utmTerm, utmContent, gclid, fbclid,
 *         leadUuid }
 * Maps site fields onto the CRM's required form-urlencoded fields and posts
 * with retry + timeout. Never throws — callers get a result object instead,
 * so a CRM outage never breaks the caller's own success response.
 */
export async function sendLeadToCRM(lead, correlationId) {
  const maskedPayload = {
    name: lead.name,
    email: maskEmail(lead.email),
    phone: maskPhone(lead.phone),
    course: lead.course,
  }

  if (!CRM_ENDPOINT) {
    console.error(JSON.stringify({
      correlationId,
      event: 'crm_forward_skipped',
      reason: 'crm_endpoint_not_configured',
      payload: maskedPayload,
      timestamp: new Date().toISOString(),
    }))
    return { ok: false, reason: 'crm_endpoint_not_configured' }
  }

  const dedupeKey = lead.leadUuid || contentHash(lead)
  if (isDuplicate(dedupeKey)) {
    console.log(JSON.stringify({
      correlationId,
      event: 'crm_forward_deduped',
      leadUuid: dedupeKey,
      payload: maskedPayload,
      timestamp: new Date().toISOString(),
    }))
    return { ok: true, deduped: true }
  }

  const describeRequirement = buildDescription(lead)

  const body = new URLSearchParams({
    contact_person: lead.name ?? '',
    email: lead.email ?? '',
    mobile: lead.phone ?? '',
    company_name: CRM_COMPANY,
    country: lead.country ?? 'India',
    city: lead.city ?? '',
    product_service: lead.course ?? '',
    describe_requirement: describeRequirement,
    source: CRM_SOURCE,
  })

  let lastError = null
  const startedAt = Date.now()

  for (let attempt = 1; attempt <= CRM_MAX_RETRIES + 1; attempt++) {
    const attemptStart = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CRM_FETCH_TIMEOUT)

    try {
      const res = await fetch(CRM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const responseText = await res.text().catch(() => '')
      const duration_ms = Date.now() - attemptStart

      // Only 2xx counts as success — CRM can return HTTP 200 with an error body,
      // so 4xx/5xx are always treated as failures regardless of payload.
      if (res.status < 200 || res.status >= 300) {
        console.error(JSON.stringify({
          correlationId,
          event: 'crm_forward_http_error',
          status: res.status,
          attempt,
          duration_ms,
          responseBody: responseText.slice(0, 500),
          payload: maskedPayload,
          timestamp: new Date().toISOString(),
        }))
        throw new Error(`CRM returned HTTP ${res.status}`)
      }

      console.log(JSON.stringify({
        event: 'crm_forward_success',
        status: res.status,
        correlationId,
        attempt,
        duration_ms,
        total_duration_ms: Date.now() - startedAt,
        responseBody: responseText.slice(0, 500),
        payload: maskedPayload,
        timestamp: new Date().toISOString(),
      }))
      return { ok: true, status: res.status }
    } catch (err) {
      clearTimeout(timeoutId)
      const duration_ms = Date.now() - attemptStart
      const isTimeout = err.name === 'AbortError'
      lastError = isTimeout ? new Error('CRM request timed out') : err

      console.error(JSON.stringify({
        correlationId,
        event: isTimeout ? 'crm_forward_timeout' : 'crm_forward_network_error',
        attempt,
        duration_ms,
        reason: lastError.message,
        payload: maskedPayload,
        timestamp: new Date().toISOString(),
      }))

      if (attempt <= CRM_MAX_RETRIES) {
        await sleep(300 * 2 ** (attempt - 1)) // 300ms, 600ms, ...
      }
    }
  }

  console.error(JSON.stringify({
    correlationId,
    event: 'crm_forward_failed',
    reason: lastError?.message ?? 'unknown_error',
    total_duration_ms: Date.now() - startedAt,
    payload: maskedPayload,
    timestamp: new Date().toISOString(),
  }))
  return { ok: false, reason: lastError?.message ?? 'unknown_error' }
}
