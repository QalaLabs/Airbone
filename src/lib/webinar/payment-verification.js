import crypto from 'node:crypto'

export function evaluatePaymentStatus({ paymentId, linkId, refId, status, signature }) {
  // If no transaction reference is present, payment is not completed
  if (!paymentId && !linkId && !signature) {
    return {
      verified: false,
      state: 'NOT_COMPLETED',
      message: 'No payment parameters provided',
    }
  }

  // If status is explicitly failed or cancelled
  if (status && (status.toLowerCase() === 'failed' || status.toLowerCase() === 'cancelled')) {
    return {
      verified: false,
      state: 'FAILED',
      paymentId: paymentId || null,
      message: 'Payment status returned as failed or cancelled by gateway',
    }
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET

  // If secret is not configured in runtime environment, server cannot authoritatively verify
  if (!secret) {
    return {
      verified: false,
      state: 'PENDING',
      paymentId: paymentId || null,
      message: 'Payment reference received; server cryptographic verification secret is not configured in environment',
    }
  }

  // If secret is present and signature is supplied, verify HMAC SHA-256
  if (signature && linkId && refId && status && paymentId) {
    try {
      const payload = `${linkId}|${refId}|${status}|${paymentId}`
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')

      const bufExpected = Buffer.from(expected, 'hex')
      const bufActual = Buffer.from(signature, 'hex')

      if (bufExpected.length === bufActual.length && crypto.timingSafeEqual(bufExpected, bufActual)) {
        if (status.toLowerCase() === 'paid') {
          return {
            verified: true,
            state: 'VERIFIED',
            paymentId,
            message: 'Payment signature verified successfully',
          }
        }
      }
      return {
        verified: false,
        state: 'FAILED',
        paymentId,
        message: 'Signature mismatch or payment status is not paid',
      }
    } catch {
      return {
        verified: false,
        state: 'FAILED',
        paymentId,
        message: 'Cryptographic verification error',
      }
    }
  }

  // Fallback for incomplete parameters with secret configured
  return {
    verified: false,
    state: 'PENDING',
    paymentId: paymentId || null,
    message: 'Awaiting full webhook confirmation',
  }
}
