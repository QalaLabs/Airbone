import { NextResponse } from 'next/server'

const ADMIN_API_URL = process.env.ADMIN_API_URL ?? 'http://localhost:3001'
const INTAKE_KEY = process.env.PUBLIC_INTAKE_KEY ?? ''

// Source label → LeadSource enum key expected by admin public API
const SOURCE_SLUG = {
  'homepage modal': 'homepage_cta',
  'homepage final cta': 'homepage_cta',
  'contact form': 'contact_form',
}

function resolveSource(raw = '') {
  const key = raw.toLowerCase()
  if (key.startsWith('resource gate')) return 'brochure_download'
  if (key.startsWith('course page')) return 'course_page'
  return SOURCE_SLUG[key] ?? 'homepage_cta'
}

export async function POST(req) {
  try {
    const payload = await req.json()
    const { name, phone, email, course, source } = payload

    if (!name || !phone) {
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
        name,
        phone,
        email: email || undefined,
        courseInterest: course || undefined,
        source: resolveSource(source),
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[Lead Proxy Error]:', err)
      // Still return success to user — never block form submission
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Fire optional webhooks (non-blocking)
    const leadData = { name, phone, email, course, source }

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
      { success: true, message: 'Lead captured successfully.' },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Lead API Error]:', err.message)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
