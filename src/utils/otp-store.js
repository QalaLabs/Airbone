import crypto from 'crypto'

// In-memory OTP store. Same caveat as rate-limit.js: resets per serverless
// container. Fine for a single-node deployment; a multi-instance production
// deployment should move this to Redis/Upstash (already a listed integration
// in admin/.env.example) without changing the request/verify/consume API below.

const OTP_TTL_MS = 5 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5
const VERIFIED_TOKEN_TTL_MS = 15 * 60 * 1000

const otpStore = new Map()      // phone -> { hash, expiresAt, attempts }
const verifiedStore = new Map() // token -> { phone, expiresAt }

function hash(code, phone) {
  return crypto.createHash('sha256').update(`${phone}:${code}:${process.env.AUTH_SECRET || 'airborne-otp-salt'}`).digest('hex')
}

function cleanup(store) {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key)
  }
}

export function generateOtp(phone) {
  cleanup(otpStore)
  const code = String(crypto.randomInt(100000, 999999))
  otpStore.set(phone, { hash: hash(code, phone), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 })
  return code
}

export function verifyOtp(phone, code) {
  cleanup(otpStore)
  const entry = otpStore.get(phone)
  if (!entry) return { ok: false, reason: 'not_requested_or_expired' }
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(phone)
    return { ok: false, reason: 'expired' }
  }
  if (entry.attempts >= OTP_MAX_ATTEMPTS) {
    otpStore.delete(phone)
    return { ok: false, reason: 'too_many_attempts' }
  }
  entry.attempts += 1
  if (hash(code, phone) !== entry.hash) {
    return { ok: false, reason: 'incorrect_code' }
  }
  otpStore.delete(phone)

  cleanup(verifiedStore)
  const token = crypto.randomBytes(24).toString('hex')
  verifiedStore.set(token, { phone, expiresAt: Date.now() + VERIFIED_TOKEN_TTL_MS })
  return { ok: true, verifyToken: token }
}

// Consumed once at final lead submission — proves this phone completed OTP
// verification within the last 15 minutes without trusting a client-supplied flag.
export function consumeVerifyToken(token, phone) {
  cleanup(verifiedStore)
  const entry = verifiedStore.get(token)
  if (!entry || entry.phone !== phone || entry.expiresAt < Date.now()) return false
  verifiedStore.delete(token)
  return true
}
