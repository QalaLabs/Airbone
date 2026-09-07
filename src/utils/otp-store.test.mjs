import test from 'node:test'
import assert from 'node:assert/strict'

// L-05 regression tests. The module under test reads process.env at call time
// (not import time), so each test controls the environment directly.
//
// Coverage required:
//   1. A configured OTP secret produces a working generate/verify round-trip.
//   2. With NO secret configured, OTP generation FAILS CLOSED (throws).
//   3. The old committed fallback literal 'airborne-otp-salt' can never be used
//      as a silent default.

const FALLBACK_LITERAL = 'airborne-otp-salt'
const PHONE = '+919999000000'

// Fresh module instance so the store starts empty for every test.
async function freshModule() {
  const modPath = new URL('./otp-store.js', import.meta.url).href
  return await import(`${modPath}?t=${Date.now()}-${Math.random()}`)
}

test('configured OTP_HASH_SECRET: generate + verify round-trip succeeds', async () => {
  const prev = process.env.OTP_HASH_SECRET
  const prevAuth = process.env.AUTH_SECRET
  delete process.env.AUTH_SECRET
  process.env.OTP_HASH_SECRET = 'test-secret-01'
  try {
    const { generateOtp, verifyOtp } = await freshModule()
    const code = generateOtp(PHONE)
    assert.match(code, /^\d{6}$/)
    const res = verifyOtp(PHONE, code)
    assert.equal(res.ok, true)
    assert.ok(res.verifyToken && /^[0-9a-f]{48}$/.test(res.verifyToken))
  } finally {
    if (prev === undefined) delete process.env.OTP_HASH_SECRET
    else process.env.OTP_HASH_SECRET = prev
    if (prevAuth === undefined) delete process.env.AUTH_SECRET
    else process.env.AUTH_SECRET = prevAuth
  }
})

test('AUTH_SECRET back-compat: generate + verify round-trip succeeds', async () => {
  const prev = process.env.OTP_HASH_SECRET
  const prevAuth = process.env.AUTH_SECRET
  delete process.env.OTP_HASH_SECRET
  process.env.AUTH_SECRET = 'legacy-auth-secret'
  try {
    const { generateOtp, verifyOtp } = await freshModule()
    const code = generateOtp(PHONE)
    const res = verifyOtp(PHONE, code)
    assert.equal(res.ok, true)
  } finally {
    if (prev === undefined) delete process.env.OTP_HASH_SECRET
    else process.env.OTP_HASH_SECRET = prev
    if (prevAuth === undefined) delete process.env.AUTH_SECRET
    else process.env.AUTH_SECRET = prevAuth
  }
})

test('missing secret: FAILS CLOSED (generateOtp throws, no silent fallback)', async () => {
  const prev = process.env.OTP_HASH_SECRET
  const prevAuth = process.env.AUTH_SECRET
  delete process.env.OTP_HASH_SECRET
  delete process.env.AUTH_SECRET
  try {
    const { generateOtp } = await freshModule()
    assert.throws(() => generateOtp(PHONE), /OTP_HASH_SECRET.*not configured/i)
  } finally {
    if (prev === undefined) delete process.env.OTP_HASH_SECRET
    else process.env.OTP_HASH_SECRET = prev
    if (prevAuth === undefined) delete process.env.AUTH_SECRET
    else process.env.AUTH_SECRET = prevAuth
  }
})

test('missing secret: verifyOtp cannot succeed without a stored entry', async () => {
  const prev = process.env.OTP_HASH_SECRET
  const prevAuth = process.env.AUTH_SECRET
  delete process.env.OTP_HASH_SECRET
  delete process.env.AUTH_SECRET
  try {
    const { verifyOtp } = await freshModule()
    const res = verifyOtp(PHONE, '123456')
    assert.deepEqual(res, { ok: false, reason: 'not_requested_or_expired' })
  } finally {
    if (prev === undefined) delete process.env.OTP_HASH_SECRET
    else process.env.OTP_HASH_SECRET = prev
    if (prevAuth === undefined) delete process.env.AUTH_SECRET
    else process.env.AUTH_SECRET = prevAuth
  }
})

test('fallback literal is NOT a usable secret', async () => {
  // The previous bug silently used the committed literal when no env secret
  // was set. With the fix: (a) generation FAILS CLOSED with no env secret, and
  // (b) the module source no longer contains the literal as a default.
  const prev = process.env.OTP_HASH_SECRET
  const prevAuth = process.env.AUTH_SECRET
  delete process.env.OTP_HASH_SECRET
  delete process.env.AUTH_SECRET
  try {
    const { generateOtp } = await freshModule()
    // A code MUST NOT be minted: an attacker who read the old source would know
    // the exact salt and could forge hashes.
    assert.throws(() => generateOtp(PHONE), /not configured/i)
    const src = await (
      await import('node:fs')
    ).promises.readFile(new URL('./otp-store.js', import.meta.url), 'utf8')
    assert.ok(!/->?['"]airborne-otp-salt['"]|\|\| ['"]airborne-otp-salt['"]/.test(src))
  } finally {
    if (prev === undefined) delete process.env.OTP_HASH_SECRET
    else process.env.OTP_HASH_SECRET = prev
    if (prevAuth === undefined) delete process.env.AUTH_SECRET
    else process.env.AUTH_SECRET = prevAuth
  }
})