import { evaluatePaymentStatus } from '../../../../lib/webinar/payment-verification.js'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const paymentId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id')
  const linkId = searchParams.get('razorpay_payment_link_id') || searchParams.get('payment_link_id')
  const refId = searchParams.get('razorpay_payment_link_reference_id') || searchParams.get('ref_id') || searchParams.get('ref')
  const status = searchParams.get('razorpay_payment_link_status') || searchParams.get('status')
  const signature = searchParams.get('razorpay_signature') || searchParams.get('signature')

  const result = evaluatePaymentStatus({ paymentId, linkId, refId, status, signature })
  return Response.json(result, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const paymentId = body.razorpay_payment_id || body.payment_id
    const linkId = body.razorpay_payment_link_id || body.payment_link_id
    const refId = body.razorpay_payment_link_reference_id || body.ref_id || body.ref
    const status = body.razorpay_payment_link_status || body.status
    const signature = body.razorpay_signature || body.signature

    const result = evaluatePaymentStatus({ paymentId, linkId, refId, status, signature })
    return Response.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    })
  } catch (err) {
    return Response.json(
      { verified: false, state: 'FAILED', message: err.message },
      { status: 400 }
    )
  }
}
