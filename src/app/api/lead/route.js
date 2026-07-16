import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { storeFallbackLead } from '@/utils/fallback-storage'
import { sendLeadToCRM } from '@/lib/crm'
import { consumeVerifyToken } from '@/utils/otp-store'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:3001'
const INTAKE_KEY = process.env.PUBLIC_INTAKE_KEY ?? ''
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
  const timestamp = new Date().toISOString()
  let leadData = null
  let rawSource = 'unknown'

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
    } catch (err) {
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
      leadUuid: typeof payload.lead_uuid === 'string' && payload.lead_uuid ? payload.lead_uuid : undefined,
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
      const errText = await res.text().catch(() => '')
      throw new Error(`Upstream returned ${res.status}: ${errText}`)
    }

    console.log(JSON.stringify({
      correlationId,
      event: 'lead_forward_success',
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
      event: 'lead_forward_failed',
      reason,
      timestamp: new Date().toISOString(),
      leadSource: rawSource,
    }))
    
    if (leadData && leadData.name && leadData.phone) {
      const stored = await storeFallbackLead(leadData)
      if (stored) {
        console.log(JSON.stringify({
          correlationId,
          event: 'lead_fallback_success',
          timestamp: new Date().toISOString(),
          leadSource: rawSource,
        }))
        return NextResponse.json(
          { success: true, message: 'Lead captured (fallback)' },
          { status: 200 }
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

