import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { isHoneypotTripped } from '@/utils/honeypot'
import { buildTestimonialPayload } from '@/utils/testimonial'
import { LeadConfigError } from '@/lib/upstream'
import { forwardIntake, visitorResponse } from '@/lib/intakeProxy'

// POST /api/testimonial — public testimonial submission (moderated in Admin).
export async function POST(req) {
  const limited = rateLimit(req, 3, 60 * 60 * 1000, 'testimonial')
  if (!limited.success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  let payload
  try {
    payload = await req.json()
    if (!payload || typeof payload !== 'object') throw new Error('bad body')
  } catch {
    return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 })
  }

  if (isHoneypotTripped(payload)) {
    console.warn(JSON.stringify({ event: 'testimonial_honeypot_triggered', timestamp: new Date().toISOString() }))
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const body = buildTestimonialPayload(payload)
  if (!body.consent) {
    return NextResponse.json({ error: 'Please allow us to publish your testimonial.' }, { status: 400 })
  }

  try {
    const upstream = await forwardIntake('/api/public/testimonials', body, limited.ip)
    if (!upstream.ok) {
      console.error(JSON.stringify({ event: 'testimonial_rejected', upstreamStatus: upstream.status, timestamp: new Date().toISOString() }))
    }
    const out = visitorResponse(upstream)
    return NextResponse.json(out.body, { status: out.status })
  } catch (err) {
    console.error(JSON.stringify({
      event: err instanceof LeadConfigError ? 'testimonial_config_error' : 'testimonial_upstream_error',
      reason: err?.name === 'AbortError' ? 'timeout' : err?.message,
      timestamp: new Date().toISOString(),
    }))
    return NextResponse.json({ error: 'We could not submit your testimonial right now. Please try again later.' }, { status: 502 })
  }
}
