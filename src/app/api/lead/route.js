import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { storeFallbackLead } from '@/utils/fallback-storage'
import { sendLeadToCRM } from '@/lib/crm'
import { consumeVerifyToken } from '@/utils/otp-store'
import { resolveAdminApiUrl, resolveIntakeKey, LeadConfigError } from '@/lib/upstream'

const UPSTREAM_FETCH_TIMEOUT = parseInt(process.env.UPSTREAM_FETCH_TIMEOUT || '10000', 10)

// Source label → LeadSource enum key expected by admin public API
const SOURCE_SLUG = {
  'homepage modal': 'homepage_cta',
  'homepage final cta': 'homepage_cta',
  'contact form': 'contact_form',
  'contact page': 'contact_form',
  'flagship featured banner': 'course_page',
}

function resolveSource(raw = '') {
  const key = raw.toLowerCase()
  if (key.startsWith('resource gate')) return 'brochure_download'
  if (key.startsWith('course')) return 'course_page'
  return SOURCE_SLUG[key] ?? 'homepage_cta'
}

function hasScriptInjection(str) {
  if (!str || typeof str !== 'string') return false
  const pattern = /<script|<iframe|<link|<style|javascript:|on\w+=|[<>]/i
  return pattern.test(str)
}

export async function POST(req) {
  const correlationId = crypto.randomUUID()
  let leadData = null
  let rawSource = 'unknown'

  // Fail loudly on invalid production configuration BEFORE any lead work.
  // A missing/empty ADMIN_API_URL or PUBLIC_INTAKE_KEY is an operator error,
  // not a transient failure — it must never route into fallback storage.
  let ADMIN_API_URL
  let INTAKE_KEY
  try {
    ADMIN_API_URL = resolveAdminApiUrl({ strict: true })
    INTAKE_KEY = resolveIntakeKey({ strict: true })
  } catch (err) {
    if (err instanceof LeadConfigError) {
      console.error(JSON.stringify({
        correlationId,
        event: 'lead_config_error',
        reason: err.message,
        timestamp: new Date().toISOString(),
      }))
      return NextResponse.json(
        { error: 'Enquiry service is temporarily unavailable. Please try again later.' },
        { status: 500 }
      )
    }
    throw err
  }

  console.log(JSON.stringify({
    correlationId,
    event: 'lead_received',
    timestamp: new Date().toISOString(),
    leadSource: rawSource,
  }))

  try {
    const rateLimitResult = rateLimit(req)
    if (!rateLimitResult.success) {
      console.error(JSON.stringify({
        correlationId,
        event: 'rate_limit_exceeded',
        reason: 'too_many_requests',
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      }))
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let payload
    try {
      payload = await req.json()
      if (!payload || typeof payload !== 'object') {
        throw new Error('Malformed payload')
      }
    } catch {
      console.error(JSON.stringify({
        correlationId,
        event: 'lead_validation_failed',
        reason: 'malformed_payload',
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      }))
      return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 })
    }

    rawSource = typeof payload.source === 'string' ? payload.source.trim() : 'unknown'

    // Input Validation & Sanitization
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''
    const email = typeof payload.email === 'string' ? payload.email.trim() : ''
    const pincode = typeof payload.pincode === 'string' ? payload.pincode.trim() : ''
    const course = typeof payload.course === 'string' ? payload.course.trim() : ''

    // Prevent script injection payloads across all fields
    if (
      hasScriptInjection(name) ||
      hasScriptInjection(phone) ||
      hasScriptInjection(email) ||
      hasScriptInjection(pincode) ||
      hasScriptInjection(course) ||
      hasScriptInjection(rawSource)
    ) {
      console.error(JSON.stringify({
        correlationId,
        event: 'lead_validation_failed',
        reason: 'script_injection_detected',
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      }))
      return NextResponse.json({ error: 'Invalid payload content.' }, { status: 400 })
    }

    // Name validation: required, max 100 chars
    if (!name || name.length > 100) {
      console.error(JSON.stringify({
        correlationId,
        event: 'lead_validation_failed',
        reason: 'invalid_name',
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      }))
      return NextResponse.json({ error: 'Valid name is required (max 100 characters).' }, { status: 400 })
    }

    // Phone validation: digits only (allowing optional leading +), length validation (7-15 digits)
    const phoneRegex = /^\+?[0-9]{7,15}$/
    if (!phone || !phoneRegex.test(phone)) {
      console.error(JSON.stringify({
        correlationId,
        event: 'lead_validation_failed',
        reason: 'invalid_phone',
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      }))
      return NextResponse.json({ error: 'Valid phone number is required.' }, { status: 400 })
    }

    // Email validation: RFC compliant validation if provided
    if (email) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(email)) {
        console.error(JSON.stringify({
          correlationId,
          event: 'lead_validation_failed',
          reason: 'invalid_email',
          timestamp: new Date().toISOString(),
          leadSource: rawSource,
        }))
        return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 })
      }
    }

    leadData = {
      name,
      phone,
      email,
      pincode,
      course,
      source: rawSource,
      utmSource: typeof payload.utm_source === 'string' ? payload.utm_source.trim() : undefined,
      utmMedium: typeof payload.utm_medium === 'string' ? payload.utm_medium.trim() : undefined,
      utmCampaign: typeof payload.utm_campaign === 'string' ? payload.utm_campaign.trim() : undefined,
      utmTerm: typeof payload.utm_term === 'string' ? payload.utm_term.trim() : undefined,
      utmContent: typeof payload.utm_content === 'string' ? payload.utm_content.trim() : undefined,
      referrerUrl: typeof payload.referrer === 'string' ? payload.referrer.trim() : undefined,
      landingPage: typeof payload.landing_page === 'string' ? payload.landing_page.trim() : undefined,
      pathname: typeof payload.pathname === 'string' ? payload.pathname.trim() : undefined,
      message: typeof payload.message === 'string' ? payload.message.trim() : undefined,
      gclid: typeof payload.gclid === 'string' ? payload.gclid.trim() : undefined,
      fbclid: typeof payload.fbclid === 'string' ? payload.fbclid.trim() : undefined,
      // Idempotency key for this submission attempt. Generated server-side when
      // the client did not supply one so every retry of the same submission is
      // identifiable by the admin backend.
      leadUuid: typeof payload.lead_uuid === 'string' && payload.lead_uuid.trim()
        ? payload.lead_uuid.trim()
        : crypto.randomUUID(),
      // Conditional screening answers (cabin crew / pilot affordability routing).
      // Advisory only — never used to block a submission, per screening policy.
      screening: (payload.screening && typeof payload.screening === 'object') ? payload.screening : undefined,
    }

    // Optional — set only by the multi-step OTP-gated form. Consumed once;
    // absence just means this submission came through a non-OTP form path.
    const verifyToken = typeof payload.verify_token === 'string' ? payload.verify_token : ''
    const phoneVerified = verifyToken ? consumeVerifyToken(verifyToken, phone) : false
    leadData.phoneVerified = phoneVerified

    // Forward to LMSBABA CRM (fire-and-forget, never blocks or fails the response)
    sendLeadToCRM(
      {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        pincode: leadData.pincode,
        course: leadData.course,
        message: leadData.message,
        pageUrl: leadData.landingPage,
        pathname: leadData.pathname,
        referrer: leadData.referrerUrl,
        utmSource: leadData.utmSource,
        utmMedium: leadData.utmMedium,
        utmCampaign: leadData.utmCampaign,
        utmTerm: leadData.utmTerm,
        utmContent: leadData.utmContent,
        gclid: leadData.gclid,
        fbclid: leadData.fbclid,
        leadUuid: leadData.leadUuid,
      },
      correlationId
    )

    // Upstream fetch with AbortController timeout protection
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_FETCH_TIMEOUT)

    console.log(JSON.stringify({
      correlationId,
      event: 'lead_admin_request_started',
      upstreamUrl: ADMIN_API_URL,
      timestamp: new Date().toISOString(),
      leadSource: rawSource,
    }))

    const res = await fetch(`${ADMIN_API_URL}/api/public/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intake-key': INTAKE_KEY,
      },
      body: JSON.stringify({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email || undefined,
        pincode: leadData.pincode || undefined,
        courseInterest: leadData.course || undefined,
        source: resolveSource(leadData.source),
        leadUuid: leadData.leadUuid,
        utmSource: leadData.utmSource,
        utmMedium: leadData.utmMedium,
        utmCampaign: leadData.utmCampaign,
        utmTerm: leadData.utmTerm,
        utmContent: leadData.utmContent,
        referrerUrl: leadData.referrerUrl,
        landingPage: leadData.landingPage,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      // Read the upstream error body only to classify the failure. The body is
      // never forwarded verbatim to the visitor.
      let upstreamMessage = ''
      try {
        const errJson = await res.json()
        if (errJson && typeof errJson.error === 'string') {
          upstreamMessage = errJson.error
        } else if (errJson && errJson.error && typeof errJson.error.message === 'string') {
          upstreamMessage = errJson.error.message
        }
      } catch {
        // Non-JSON upstream error body — treat as a generic failure.
      }

      // Deterministic client / business / configuration rejections are returned
      // truthfully to the visitor and are NEVER stored as fallback leads.
      if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 409 || res.status === 429) {
        const rejectionMessage = {
          400: 'Some of the details provided could not be accepted. Please review and try again.',
          401: 'Enquiry submission is temporarily unavailable. Please try again later.',
          403: 'Enquiries are currently closed. Please call +91 99537 77320 for assistance.',
          409: 'An enquiry with this phone number was already received. Our team will contact you shortly.',
          429: 'Too many attempts. Please wait a moment and try again.',
        }[res.status]
        console.error(JSON.stringify({
          correlationId,
          event: res.status === 409 ? 'lead_duplicate' : 'lead_rejected',
          upstreamStatus: res.status,
          timestamp: new Date().toISOString(),
          leadSource: rawSource,
        }))
        return NextResponse.json({ error: rejectionMessage }, { status: res.status })
      }

      // Maintenance mode is a deliberate pause — never converted into a
      // fallback success. The visitor must receive a truthful 503.
      if (res.status === 503 && /maintenance/i.test(upstreamMessage)) {
        console.error(JSON.stringify({
          correlationId,
          event: 'lead_rejected',
          upstreamStatus: res.status,
          reason: 'maintenance_mode',
          timestamp: new Date().toISOString(),
          leadSource: rawSource,
        }))
        return NextResponse.json(
          { error: 'We are carrying out maintenance right now. Please try again later.' },
          { status: 503 }
        )
      }

      // Other 5xx — upstream server failure: fallback persistence is allowed,
      // but the response must never claim the lead was accepted by Admin.
      throw new Error(`Upstream server error (${res.status})`)
    }

    console.log(JSON.stringify({
      correlationId,
      event: 'lead_saved',
      timestamp: new Date().toISOString(),
      leadSource: rawSource,
    }))

    // Fire optional webhooks (non-blocking)
    const json = await res.json().catch(() => ({}))
    const gateToken = json.gateToken ?? null

    if (process.env.N8N_WHATSAPP_WEBHOOK) {
      fetch(process.env.N8N_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      }).catch(err => console.error(JSON.stringify({
        correlationId,
        event: 'n8n_webhook_failed',
        reason: err.message,
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      })))
    }

    if (process.env.VOICE_AI_WEBHOOK) {
      fetch(process.env.VOICE_AI_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      }).catch(err => console.error(JSON.stringify({
        correlationId,
        event: 'voice_ai_webhook_failed',
        reason: err.message,
        timestamp: new Date().toISOString(),
        leadSource: rawSource,
      })))
    }

    return NextResponse.json(
      { success: true, message: 'Lead captured successfully.', gateToken },
      { status: 200 }
    )
  } catch (err) {
    const isTimeout = err.name === 'AbortError' || err.message.includes('abort') || err.message.includes('timeout')
    const reason = isTimeout ? 'admin_api_timeout' : err.message

    console.error(JSON.stringify({
      correlationId,
      event: 'lead_response_failure',
      reason,
      timestamp: new Date().toISOString(),
      leadSource: rawSource,
    }))

    // Network failure / timeout / upstream 5xx — keep the established fallback
    // architecture, but truthfully signal that the lead was NOT accepted by Admin.
    if (leadData && leadData.name && leadData.phone) {
      const stored = await storeFallbackLead(leadData)
      if (stored) {
        console.log(JSON.stringify({
          correlationId,
          event: 'lead_fallback_saved',
          timestamp: new Date().toISOString(),
          leadSource: rawSource,
        }))
        return NextResponse.json(
          { success: false, message: 'We could not reach our team right now. Your details were saved and we will contact you shortly.' },
          { status: 503 }
        )
      } else {
        console.error(JSON.stringify({
          correlationId,
          event: 'lead_fallback_failed',
          reason: 'fallback_storage_write_error',
          timestamp: new Date().toISOString(),
          leadSource: rawSource,
        }))
      }
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

