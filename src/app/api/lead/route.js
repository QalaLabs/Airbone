import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { storeFallbackLead } from '@/utils/fallback-storage'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:3001'
const INTAKE_KEY = process.env.PUBLIC_INTAKE_KEY ?? ''

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

export async function POST(req) {
  let leadData = null

  try {
    const rateLimitResult = rateLimit(req)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = await req.json()
    leadData = {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      course: payload.course,
      source: payload.source,
    }

    if (!leadData.name || !leadData.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required.' },
        { status: 400 }
      )
    }

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
        courseInterest: leadData.course || undefined,
        source: resolveSource(leadData.source),
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[Lead Proxy Error]:', res.status, errText)
      throw new Error(`Upstream returned ${res.status}`)
    }

    // Fire optional webhooks (non-blocking)
    const json = await res.json().catch(() => ({}))
    const gateToken = json.gateToken ?? null

    if (process.env.N8N_WHATSAPP_WEBHOOK) {
      fetch(process.env.N8N_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      }).catch(err => console.error('[n8n Webhook Error]:', err.message))
    }

    if (process.env.VOICE_AI_WEBHOOK) {
      fetch(process.env.VOICE_AI_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      }).catch(err => console.error('[Voice AI Webhook Error]:', err.message))
    }

    return NextResponse.json(
      { success: true, message: 'Lead captured successfully.', gateToken },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Lead API Error]:', err.message)
    
    if (leadData && leadData.name && leadData.phone) {
      const stored = await storeFallbackLead(leadData)
      if (stored) {
        return NextResponse.json(
          { success: true, message: 'Lead captured (fallback)' },
          { status: 200 }
        )
      }
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
