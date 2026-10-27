import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const htmlPath = path.resolve('public/webinar/page.html')
const html = fs.readFileSync(htmlPath, 'utf8')
const sourceHtml = fs.readFileSync(path.resolve('src/app/webinar/index-v2.html'), 'utf8')
const thankYouCode = fs.readFileSync(path.resolve('src/app/webinar/thank-you/page.jsx'), 'utf8')
const footerCode = fs.readFileSync(path.resolve('src/components/PremiumFooter.jsx'), 'utf8')

const EXACT_DATE = 'Saturday 31 Oct 2026, 11:00 AM IST · Live online'

// ============================================================================
// 1. WEBINAR PAGE TESTS
// ============================================================================
test('webinar HTML has configured Razorpay paymentUrl', () => {
  assert.ok(
    html.includes('paymentUrl: "https://rzp.io/rzp/zwCm3zEe"'),
    'paymentUrl must be configured with the official Razorpay link'
  )
})

test('webinar HTML contains prominent exact date and time string in hero and meta', () => {
  assert.ok(html.includes(EXACT_DATE), `webinar page must include "${EXACT_DATE}"`)
  assert.ok(sourceHtml.includes(EXACT_DATE), `source HTML must include "${EXACT_DATE}"`)
})

test('webinar HTML has attendee question field with 500 char limit', () => {
  assert.ok(
    html.includes('Your question for Capt. Navrang'),
    'form must include label for Capt. Navrang question'
  )
  assert.ok(html.includes('maxlength="500"'), 'question field must have maxlength="500"')
  assert.ok(html.includes('aaa_webinar_question'), 'client JS must store attendee question in session')
  assert.ok(html.includes('Question: " + userQuestion'), 'payload must include attendee question')
})

test('webinar HTML has canonical UTM and attribution fields', () => {
  assert.ok(html.includes('utm_source: attrib.utm_source'), 'payload must include utm_source')
  assert.ok(html.includes('utm_medium: attrib.utm_medium'), 'payload must include utm_medium')
  assert.ok(html.includes('utm_campaign: attrib.utm_campaign'), 'payload must include utm_campaign')
  assert.ok(html.includes('utmSource: attrib.utm_source'), 'payload must include utmSource for backward compatibility')
  assert.ok(html.includes('lead_uuid: uuid'), 'payload must include lead_uuid')
  assert.ok(html.includes('pathname: "/webinar"'), 'payload must include pathname')
  assert.ok(html.includes('course: form.courseInterest.value'), 'payload must map courseInterest to course')
})

test('webinar HTML applies all requested client copy corrections', () => {
  // Capt Navrang
  assert.ok(
    !html.includes('active airline captain') && !html.includes('Active airline captain'),
    'must not describe Capt. Navrang as an active airline captain'
  )
  assert.ok(
    html.includes('Airline-trained pilot & instructor – chose teaching over airline offers'),
    'must describe Capt. Navrang with chosen teaching copy'
  )

  // DGCA terminology
  assert.ok(!html.includes('DGCA-complied'), 'must not contain bad grammar "DGCA-complied"')
  assert.ok(html.includes('DGCA-compliant training'), 'must use "DGCA-compliant training"')
  assert.ok(!html.includes('DGCA approval'), 'must not claim DGCA approval for ground school')

  // Career FAQ
  assert.ok(!html.includes('How safe is the career?'), 'must replace "How safe" with "How stable"')
  assert.ok(html.includes('How stable is the career?'), 'must include "How stable is the career?"')

  // Question CTA
  assert.ok(
    html.includes('Reserve my seat & ask your question'),
    'must include updated CTA "Reserve my seat & ask your question"'
  )
})

// ============================================================================
// 2. FOOTER STATS & COURSE NAME TESTS
// ============================================================================
test('PremiumFooter has updated course name and stats', () => {
  assert.ok(
    footerCode.includes('cut-e, COMPASS & ADAPT Prep'),
    'footer must include "cut-e, COMPASS & ADAPT Prep"'
  )
  assert.ok(
    footerCode.includes('17 Years') && footerCode.includes('· Since 2009'),
    'footer must include 17 years · since 2009'
  )
  assert.ok(
    footerCode.includes('DGCA-Compliant') && footerCode.includes('Training'),
    'footer must include DGCA-Compliant Training'
  )
  assert.ok(
    footerCode.includes('25 Per Class') && footerCode.includes('(Navigation 50)'),
    'footer must include 25 per class (Navigation 50)'
  )
})

// ============================================================================
// 3. THANK-YOU PAGE TESTS
// ============================================================================
test('thank-you page renders 4 mutually exclusive states and prominent date string', () => {
  assert.ok(thankYouCode.includes(EXACT_DATE), `thank-you page must include "${EXACT_DATE}"`)
  assert.ok(thankYouCode.includes('STATE A: Payment Verified'), 'must define State A')
  assert.ok(thankYouCode.includes('STATE B: Payment Not Completed'), 'must define State B')
  assert.ok(thankYouCode.includes('STATE C: Payment Verification Pending'), 'must define State C')
  assert.ok(thankYouCode.includes('STATE D: Payment Status Unknown'), 'must define State D')

  // State B is default for direct access
  assert.ok(
    thankYouCode.includes("setPaymentState('NOT_COMPLETED')"),
    'direct visit without params must default to NOT_COMPLETED'
  )
  assert.ok(
    thankYouCode.includes('Seat not confirmed yet – complete ₹21'),
    'State B must clearly state seat not confirmed yet'
  )
  assert.ok(
    thankYouCode.includes('https://rzp.io/rzp/zwCm3zEe'),
    'State B must link to Razorpay link https://rzp.io/rzp/zwCm3zEe'
  )

  // Displays attendee question when saved
  assert.ok(
    thankYouCode.includes('Your question for Capt. Navrang:'),
    'thank-you page must display attendee question when saved'
  )
})

// ============================================================================
// 4. SERVER PAYMENT VERIFICATION ENDPOINT UNIT & CRYPTOGRAPHIC TESTS
// ============================================================================
test('payment verification endpoint evaluates states securely', async () => {
  const { GET } = await import('../api/webinar/verify-payment/route.js')
  const { evaluatePaymentStatus } = await import('../../lib/webinar/payment-verification.js')

  // Test 1: Direct visit without payment params -> NOT_COMPLETED
  const reqEmpty = new Request('http://localhost/api/webinar/verify-payment')
  const resEmpty = await GET(reqEmpty)
  const dataEmpty = await resEmpty.json()
  assert.equal(dataEmpty.state, 'NOT_COMPLETED', 'direct visit must return NOT_COMPLETED')
  assert.equal(dataEmpty.verified, false)

  // Test 2: Unconfigured secret with payment parameters -> PENDING (never falsely claims verified)
  delete process.env.RAZORPAY_KEY_SECRET
  delete process.env.RAZORPAY_WEBHOOK_SECRET
  const reqPending = new Request(
    'http://localhost/api/webinar/verify-payment?razorpay_payment_id=pay_12345&razorpay_payment_link_id=plink_123'
  )
  const resPending = await GET(reqPending)
  const dataPending = await resPending.json()
  assert.equal(dataPending.state, 'PENDING', 'unauthenticated payment check must return PENDING')
  assert.equal(dataPending.verified, false)

  // Test 3: Explicit failed status -> FAILED
  const reqFailed = new Request(
    'http://localhost/api/webinar/verify-payment?razorpay_payment_id=pay_12345&razorpay_payment_link_status=failed'
  )
  const resFailed = await GET(reqFailed)
  const dataFailed = await resFailed.json()
  assert.equal(dataFailed.state, 'FAILED', 'explicit failed status must return FAILED')
  assert.equal(dataFailed.verified, false)

  // Test 4: Cryptographic verification when secret IS present
  const TEST_SECRET = 'test_secret_key_12345'
  process.env.RAZORPAY_KEY_SECRET = TEST_SECRET

  const paymentId = 'pay_VALID123'
  const linkId = 'plink_LINK123'
  const refId = 'ref_REF123'
  const status = 'paid'
  const validSignature = crypto
    .createHmac('sha256', TEST_SECRET)
    .update(`${linkId}|${refId}|${status}|${paymentId}`)
    .digest('hex')

  const validResult = evaluatePaymentStatus({
    paymentId,
    linkId,
    refId,
    status,
    signature: validSignature,
  })
  assert.equal(validResult.state, 'VERIFIED')
  assert.equal(validResult.verified, true)
  assert.equal(validResult.paymentId, paymentId)

  // Invalid signature with secret -> FAILED
  const invalidResult = evaluatePaymentStatus({
    paymentId,
    linkId,
    refId,
    status,
    signature: 'bad_signature_hex_value',
  })
  assert.equal(invalidResult.state, 'FAILED')
  assert.equal(invalidResult.verified, false)

  // Clean up env
  delete process.env.RAZORPAY_KEY_SECRET
})


test('webinar HTML contains Google Tag Manager container and noscript fallback', () => {
  for (const [name, doc] of [['page.html', html], ['index-v2.html', sourceHtml]]) {
    const headIndex = doc.indexOf('<head>')
    const gtmScriptIndex = doc.indexOf("https://www.googletagmanager.com/gtm.js?id='+i+dl")
    const bodyIndex = doc.indexOf('<body>')
    const gtmIframeIndex = doc.indexOf('https://www.googletagmanager.com/ns.html?id=GTM-KCM9CDK9')

    assert.ok(gtmScriptIndex > headIndex, `${name} must include GTM script inside <head>`)
    assert.ok(gtmScriptIndex < doc.indexOf('</head>'), `${name} GTM script must be inside <head>`)
    assert.ok(doc.includes('GTM-KCM9CDK9'), `${name} must contain GTM container ID GTM-KCM9CDK9`)
    assert.ok(gtmIframeIndex > bodyIndex, `${name} must include GTM noscript immediately after <body>`)
  }
})

test('webinar HTML contains Meta Pixel script and noscript fallback', () => {
  for (const [name, doc] of [['page.html', html], ['index-v2.html', sourceHtml]]) {
    assert.ok(doc.includes('connect.facebook.net/en_US/fbevents.js'), `${name} must load fbevents.js`)
    assert.ok(doc.includes("fbq('init', '974236902284876')"), `${name} must initialize Meta Pixel 974236902284876`)
    assert.ok(doc.includes("fbq('track', 'PageView')"), `${name} must track PageView`)
    assert.ok(doc.includes('https://www.facebook.com/tr?id=974236902284876'), `${name} must include Meta Pixel noscript`)
    assert.ok(doc.includes('fbq("track", "Lead"') || doc.includes("fbq('track', 'Lead'"), `${name} must track Lead on form submission`)
    assert.ok(doc.includes('fbq("track", "InitiateCheckout"') || doc.includes("fbq('track', 'InitiateCheckout'"), `${name} must track InitiateCheckout on pay button`)
  }
})

test('thank-you page contains Meta Pixel and dataLayer conversion tracking', () => {
  assert.ok(thankYouCode.includes("window.fbq('track', 'Purchase'"), 'thank-you page must track Purchase event')
  assert.ok(thankYouCode.includes('webinar_payment_verified'), 'thank-you page must push webinar_payment_verified event to dataLayer')
})
