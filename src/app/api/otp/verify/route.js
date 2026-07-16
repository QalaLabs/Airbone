import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rate-limit'
import { verifyOtp } from '@/utils/otp-store'

export async function POST(req) {
  const rateLimitResult = rateLimit(req, 8, 5 * 60 * 1000)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 })
  }

  const phone = typeof payload?.phone === 'string' ? payload.phone.replace(/\D/g, '') : ''
  const code = typeof payload?.code === 'string' ? payload.code.replace(/\D/g, '') : ''

  if (phone.length !== 10 || code.length !== 6) {
    return NextResponse.json({ error: 'A valid phone number and 6-digit code are required.' }, { status: 400 })
  }

  const result = verifyOtp(phone, code)
  if (!result.ok) {
    const messages = {
      not_requested_or_expired: 'OTP expired or not requested. Please request a new one.',
      expired: 'OTP expired. Please request a new one.',
      too_many_attempts: 'Too many incorrect attempts. Please request a new OTP.',
      incorrect_code: 'Incorrect code. Please try again.',
    }
    return NextResponse.json({ error: messages[result.reason] || 'Verification failed.' }, { status: 400 })
  }

  return NextResponse.json({ success: true, verifyToken: result.verifyToken }, { status: 200 })
}
