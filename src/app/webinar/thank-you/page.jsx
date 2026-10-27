'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { WHATSAPP_DISPLAY, WHATSAPP_HREF } from '@/lib/whatsapp'

const RAZORPAY_PAYMENT_URL = 'https://rzp.io/rzp/zwCm3zEe'
const WEBINAR_DATE_STRING = 'Saturday 31 Oct 2026, 11:00 AM IST · Live online'

function ThankYouContent() {
  const searchParams = useSearchParams()

  const razorpayPaymentId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id')
  const razorpayLinkId = searchParams.get('razorpay_payment_link_id') || searchParams.get('payment_link_id')
  const razorpayRefId = searchParams.get('razorpay_payment_link_reference_id') || searchParams.get('ref_id') || searchParams.get('ref')
  const razorpayStatus = searchParams.get('razorpay_payment_link_status') || searchParams.get('status')
  const razorpaySignature = searchParams.get('razorpay_signature') || searchParams.get('signature')

  const hasParams = Boolean(razorpayPaymentId || razorpayLinkId || razorpaySignature)

  // Initial state: If no payment params present, default immediately to NOT_COMPLETED (State B)
  const [paymentState, setPaymentState] = useState(() => (hasParams ? 'CHECKING' : 'NOT_COMPLETED'))
  const [paymentId] = useState(() => razorpayPaymentId || '')
  const [errorMessage, setErrorMessage] = useState('')

  // Lazy initializer reads attendee question from session storage without setState in effect
  const [attendeeQuestion] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('aaa_webinar_question') || ''
      } catch {
        return ''
      }
    }
    return ''
  })

  useEffect(() => {
    if (!hasParams) return

    // Verify payment parameters server-side
    const query = new URLSearchParams()
    if (razorpayPaymentId) query.set('razorpay_payment_id', razorpayPaymentId)
    if (razorpayLinkId) query.set('razorpay_payment_link_id', razorpayLinkId)
    if (razorpayRefId) query.set('razorpay_payment_link_reference_id', razorpayRefId)
    if (razorpayStatus) query.set('razorpay_payment_link_status', razorpayStatus)
    if (razorpaySignature) query.set('razorpay_signature', razorpaySignature)

    let isMounted = true

    fetch(`/api/webinar/verify-payment?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        if (data.state === 'VERIFIED') {
          setPaymentState('VERIFIED')
        } else if (data.state === 'PENDING') {
          setPaymentState('PENDING')
          if (data.message) setErrorMessage(data.message)
        } else if (data.state === 'FAILED') {
          setPaymentState('FAILED')
          if (data.message) setErrorMessage(data.message)
        } else {
          setPaymentState('NOT_COMPLETED')
        }
      })
      .catch(() => {
        if (!isMounted) return
        setPaymentState('FAILED')
        setErrorMessage('Could not connect to payment verification service.')
      })

    return () => {
      isMounted = false
    }
  }, [hasParams, razorpayPaymentId, razorpayLinkId, razorpayRefId, razorpayStatus, razorpaySignature])

    // Track verified purchase/registration in Meta Pixel and Google Tag Manager
  useEffect(() => {
    if (paymentState === 'VERIFIED') {
      if (typeof window !== 'undefined') {
        if (window.fbq) {
          window.fbq('track', 'Purchase', {
            value: 21,
            currency: 'INR',
            content_name: "Parents' Webinar Seat",
          });
        }
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'webinar_payment_verified',
            value: 21,
            currency: 'INR',
            payment_id: paymentId,
          });
        }
      }
    }
  }, [paymentState, paymentId]);

  const handleRetryVerification = () => {
    setPaymentState('CHECKING')
    const query = searchParams.toString()
    fetch(`/api/webinar/verify-payment?${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.state === 'VERIFIED') setPaymentState('VERIFIED')
        else if (data.state === 'PENDING') setPaymentState('PENDING')
        else if (data.state === 'FAILED') setPaymentState('FAILED')
        else setPaymentState('NOT_COMPLETED')
      })
      .catch(() => setPaymentState('FAILED'))
  }

  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
    encodeURIComponent("Parents' Webinar - Airborne Aviation Academy") +
    '&dates=20261031T053000Z/20261031T063000Z' +
    '&details=' +
    encodeURIComponent(
      'Live Q&A on Pilot Career, Cost & Selection with Capt. Navrang Singh. Schedule: ' +
        WEBINAR_DATE_STRING +
        '. Join link will be sent via WhatsApp/Email.'
    )

  const shareText = encodeURIComponent(
    "Parents: a live webinar on your child's pilot career with Capt. Navrang Singh. " +
      WEBINAR_DATE_STRING +
      '. Real answers on cost, exams and jobs. Register for ₹21: https://www.airborneaviation.in/webinar'
  )

  return (
    <main
      className="theme-light"
      style={{
        minHeight: '75vh',
        background: 'var(--paper, #fbf8f1)',
        padding: 'clamp(2.5rem, 5vw, 4.5rem) 1rem clamp(3.5rem, 6vw, 5rem) 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 39, 76, 0.08)',
          border: '1px solid #e2e8f0',
          padding: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
        }}
      >
        {/* Loading / Checking State */}
        {paymentState === 'CHECKING' && (
          <div style={{ padding: '2rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ color: '#00274C', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Verifying Payment Status...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Please hold on while we securely verify your registration with Razorpay.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE A: Payment Verified                                                */}
        {/* ========================================================================= */}
        {paymentState === 'VERIFIED' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              ✓
            </div>

            <span
              style={{
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#059669',
                fontWeight: 700,
                marginBottom: '8px',
                background: '#ecfdf5',
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              Payment Verified · Seat Confirmed
            </span>

            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
                color: '#00274C',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '8px 0 16px',
              }}
            >
              You&apos;re Confirmed!
            </h1>

            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#4a5568', margin: '0 0 20px' }}>
              We have verified your ₹21 fee. Your seat is confirmed for the live webinar with Capt. Navrang Singh.
            </p>

            {/* Date & Time prominent card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #00274C',
                borderRadius: '12px',
                padding: '16px 20px',
                margin: '0 0 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '4px' }}>
                Event Schedule
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00274C' }}>
                {WEBINAR_DATE_STRING}
              </div>
              {paymentId && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                  Payment Reference ID: <code>{paymentId}</code>
                </div>
              )}
            </div>

            {/* Saved attendee question */}
            {attendeeQuestion && (
              <div
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  margin: '0 0 20px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#00274C', marginBottom: '4px' }}>
                  Your question for Capt. Navrang:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#334155', fontStyle: 'italic' }}>
                  &ldquo;{attendeeQuestion}&rdquo;
                </div>
              </div>
            )}

            {/* Attendance info */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                textAlign: 'left',
                margin: '0 0 24px',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: '#334155',
              }}
            >
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#00274C' }}>
                What happens next:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li style={{ marginBottom: '6px' }}>
                  Your private webinar link will be sent to your WhatsApp number and email prior to 11:00 AM IST.
                </li>
                <li style={{ marginBottom: '6px' }}>
                  A session reminder will arrive 1 hour before takeoff.
                </li>
                <li>
                  Your question has been logged for the live 30-minute parent Q&amp;A segment.
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px', margin: '0 auto 24px' }}>
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 20px',
                  background: '#00274C',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                📅 Add to Google Calendar
              </a>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 20px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                Share with Another Parent on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE B: Payment Not Completed (Default for direct visit or incomplete)   */}
        {/* ========================================================================= */}
        {paymentState === 'NOT_COMPLETED' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              ⚠️
            </div>

            <span
              style={{
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#dc2626',
                fontWeight: 700,
                marginBottom: '8px',
                background: '#fef2f2',
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              Seat Not Confirmed · Payment Due
            </span>

            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
                color: '#00274C',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '8px 0 16px',
              }}
            >
              Seat not confirmed yet – complete ₹21
            </h1>

            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#4a5568', margin: '0 0 20px' }}>
              Your seat for the Parents&apos; Webinar is held temporarily, but <b>is not confirmed</b> until the ₹21 registration fee is received and verified.
            </p>

            {/* Date & Time prominent card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px 20px',
                margin: '0 0 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '4px' }}>
                Webinar Schedule
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00274C' }}>
                {WEBINAR_DATE_STRING}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '400px',
                margin: '0 auto 28px',
              }}
            >
              <a
                href={RAZORPAY_PAYMENT_URL}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 24px',
                  background: '#DB241E',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(219, 36, 30, 0.35)',
                }}
              >
                Pay ₹21 Securely on Razorpay →
              </a>

              <Link
                href="/webinar"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: '#00274C',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1.5px solid #00274C',
                }}
              >
                ← Return to Webinar Details
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE C: Payment Verification Pending                                    */}
        {/* ========================================================================= */}
        {paymentState === 'PENDING' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              ⏳
            </div>

            <span
              style={{
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#d97706',
                fontWeight: 700,
                marginBottom: '8px',
                background: '#fffbeb',
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              Verification In Progress
            </span>

            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
                color: '#00274C',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '8px 0 16px',
              }}
            >
              Payment Verification Pending
            </h1>

            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#4a5568', margin: '0 0 20px' }}>
              We received your payment reference. Server verification is currently processing or awaiting gateway settlement confirmation.
            </p>

            {/* Date & Time prominent card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px 20px',
                margin: '0 0 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '4px' }}>
                Session Timing
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00274C' }}>
                {WEBINAR_DATE_STRING}
              </div>
              {paymentId && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                  Transaction ID: <code>{paymentId}</code>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', margin: '0 auto 28px' }}>
              <button
                type="button"
                onClick={handleRetryVerification}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  background: '#00274C',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🔄 Check Verification Again
              </button>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                WhatsApp Admissions Team
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE D: Payment Status Unknown / Verification Failed                    */}
        {/* ========================================================================= */}
        {paymentState === 'FAILED' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              ✕
            </div>

            <span
              style={{
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#dc2626',
                fontWeight: 700,
                marginBottom: '8px',
                background: '#fef2f2',
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              Verification Failed
            </span>

            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
                color: '#00274C',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '8px 0 16px',
              }}
            >
              Payment Status Unverified
            </h1>

            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#4a5568', margin: '0 0 20px' }}>
              We could not verify your transaction automatically. If ₹21 was deducted from your account, your seat is safe—please WhatsApp our admissions team with your transaction screenshot.
            </p>

            {errorMessage && (
              <p style={{ fontSize: '0.85rem', color: '#b91c1c', margin: '-10px 0 16px' }}>
                Note: {errorMessage}
              </p>
            )}

            {/* Date & Time prominent card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px 20px',
                margin: '0 0 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '4px' }}>
                Webinar Schedule
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00274C' }}>
                {WEBINAR_DATE_STRING}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', margin: '0 auto 28px' }}>
              <a
                href={RAZORPAY_PAYMENT_URL}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  background: '#DB241E',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                Retry ₹21 Payment on Razorpay
              </a>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                Contact Admissions on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Support contacts */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', fontSize: '0.88rem', color: '#64748b' }}>
          <p style={{ margin: '0 0 8px' }}>
            Questions about your webinar registration or need assistance?
          </p>
          <p style={{ margin: 0 }}>
            WhatsApp admissions:{' '}
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00274C', fontWeight: 600, textDecoration: 'underline' }}
            >
              {WHATSAPP_DISPLAY}
            </a>
            {' · '}
            Email:{' '}
            <a
              href="mailto:info@airborneaviation.in"
              style={{ color: '#00274C', fontWeight: 600, textDecoration: 'underline' }}
            >
              info@airborneaviation.in
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

function StateBFallback() {
  return (
    <main
      className="theme-light"
      style={{
        minHeight: '75vh',
        background: 'var(--paper, #fbf8f1)',
        padding: 'clamp(2.5rem, 5vw, 4.5rem) 1rem clamp(3.5rem, 6vw, 5rem) 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 39, 76, 0.08)',
          border: '1px solid #e2e8f0',
          padding: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
          }}
        >
          ⚠️
        </div>

        <span
          style={{
            display: 'inline-block',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#dc2626',
            fontWeight: 700,
            marginBottom: '8px',
            background: '#fef2f2',
            padding: '4px 12px',
            borderRadius: '20px',
          }}
        >
          Seat Not Confirmed · Payment Due
        </span>

        <h1
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.2rem)',
            color: '#00274C',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '8px 0 16px',
          }}
        >
          Seat not confirmed yet – complete ₹21
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#4a5568', margin: '0 0 20px' }}>
          Your seat for the Parents&apos; Webinar is held temporarily, but <b>is not confirmed</b> until the ₹21 registration fee is received and verified.
        </p>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '16px 20px',
            margin: '0 0 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '4px' }}>
            Webinar Schedule
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00274C' }}>
            {WEBINAR_DATE_STRING}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
            margin: '0 auto 28px',
          }}
        >
          <a
            href={RAZORPAY_PAYMENT_URL}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 24px',
              background: '#DB241E',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.05rem',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(219, 36, 30, 0.35)',
            }}
          >
            Pay ₹21 Securely on Razorpay →
          </a>

          <Link
            href="/webinar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              background: '#ffffff',
              color: '#00274C',
              fontWeight: 600,
              borderRadius: '10px',
              textDecoration: 'none',
              border: '1.5px solid #00274C',
            }}
          >
            ← Return to Webinar Details
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function WebinarThankYouPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<StateBFallback />}>
        <ThankYouContent />
      </Suspense>
      <Footer />
    </>
  )
}
