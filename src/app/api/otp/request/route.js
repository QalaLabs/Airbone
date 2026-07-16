import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { generateOtp } from '@/utils/otp-store'

const N8N_WHATSAPP_WEBHOOK = process.env.N8N_WHATSAPP_WEBHOOK

export async function POST(req) {
  const rateLimitResult = rateLimit(req, 3, 5 * 60 * 1000) // 3 OTP requests per 5 min per IP
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many OTP requests. Please try again shortly.' }, { status: 429 })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 })
  }

  const phone = typeof payload?.phone === 'string' ? payload.phone.replace(/\D/g, '') : ''
  if (phone.length !== 10) {
    return NextResponse.json({ error: 'A valid 10-digit phone number is required.' }, { status: 400 })
  }

  const code = generateOtp(phone)

  // Deliver via the existing WhatsApp automation webhook if configured.
  // Never blocks the response — OTP is generated and verifiable regardless
  // of delivery outcome, matching the fire-and-forget pattern used for leads.
  if (N8N_WHATSAPP_WEBHOOK) {
    fetch(N8N_WHATSAPP_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'otp_verification', phone: `+91${phone}`, code }),
    }).catch((err) => console.error(JSON.stringify({ event: 'otp_whatsapp_delivery_failed', phone, reason: err.message })))
  } else {
    // No delivery channel configured — log server-side so the flow is testable end to end.
    console.log(JSON.stringify({ event: 'otp_generated_no_delivery_channel', phone, code }))
  }

  return NextResponse.json({ success: true, message: 'OTP sent.' }, { status: 200 })
}
