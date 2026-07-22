'use client'

import { useState, useCallback, useMemo } from 'react'
import { triggerToast } from '@/components/Toast'
import useFormValidation from '@/hooks/useFormValidation'
import { validateName, validatePhone, validateEmail, validateRequired } from '@/utils/validation'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'

const validators = { name: validateName, phone: validatePhone, email: validateEmail, course: validateRequired }

function genUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function YesNo({ label, value, onChange, name }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <span style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontFamily: 'var(--font-b)' }}>{label}</span>
      <div style={{ display: 'flex', gap: '0.75rem' }} role="radiogroup" aria-label={label}>
        {['Yes', 'No'].map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-h)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '2px',
              cursor: 'pointer',
              border: value === opt ? '1px solid #D8A027' : '1px solid rgba(255,255,255,0.15)',
              background: value === opt ? 'rgba(216,160,39,0.15)' : 'transparent',
              color: value === opt ? '#D8A027' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

const STEP_LABELS = ['Your Details', 'Verify Phone', 'A Few Questions', 'Review & Submit']

function ProgressIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }} aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-h)', fontSize: '0.72rem', fontWeight: 800,
            background: i <= step ? '#DB241E' : 'rgba(255,255,255,0.08)',
            color: i <= step ? '#fff' : 'rgba(255,255,255,0.4)',
            border: i === step ? '2px solid #D8A027' : 'none',
            transition: 'background 0.3s, border 0.3s',
          }}>
            {i < step ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < step ? '#DB241E' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Multi-step enquiry form with OTP phone verification and conditional
 * screening questions. courseCategory drives which Step 2 questions render:
 *  - 'cabin-crew' -> tattoo / hearing / criminal record / height / weight advisories
 *  - 'pilot' (default) -> budget affordability routing
 * Screening answers are advisory only and never block submission.
 */
export default function MultiStepLeadForm({ courseName = '', source = 'Multi-Step Form', courseCategory = 'pilot', successMessage = '' }) {
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState('idle')
  const [otp, setOtp] = useState('')
  const [otpStatus, setOtpStatus] = useState('idle') // idle | sending | sent | verifying | verified | error
  const [otpError, setOtpError] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [screening, setScreening] = useState({})
  const leadUuid = useMemo(() => genUuid(), [])

  const { values, errors, touched, handleChange, handleBlur, validate, isValid } = useFormValidation(
    { name: '', phone: '', email: '', course: courseName },
    validators
  )

  const requestOtp = useCallback(async () => {
    if (!validatePhone(values.phone).valid) {
      handleBlur('phone')
      return
    }
    setOtpStatus('sending')
    setOtpError('')
    try {
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: values.phone }),
      })
      if (res.ok) {
        setOtpStatus('sent')
        triggerToast('OTP Sent', 'Check your phone/WhatsApp for the 6-digit code.')
      } else {
        const data = await res.json().catch(() => ({}))
        setOtpStatus('error')
        setOtpError(data.error || 'Could not send OTP. Please try again.')
      }
    } catch {
      setOtpStatus('error')
      setOtpError('Could not send OTP. Please check your connection and try again.')
    }
  }, [values.phone, handleBlur])

  const verifyOtpCode = useCallback(async () => {
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code.')
      return
    }
    setOtpStatus('verifying')
    setOtpError('')
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: values.phone, code: otp }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.verifyToken) {
        setOtpStatus('verified')
        setVerifyToken(data.verifyToken)
      } else {
        setOtpStatus('sent')
        setOtpError(data.error || 'Incorrect code. Please try again.')
      }
    } catch {
      setOtpStatus('sent')
      setOtpError('Verification failed. Please check your connection and try again.')
    }
  }, [otp, values.phone])

  const goNext = useCallback(() => {
    if (step === 0) {
      if (!validate()) return
    }
    if (step === 1 && otpStatus !== 'verified') return
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1))
  }, [step, validate, otpStatus])

  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])

  const handleSubmit = useCallback(async () => {
    if (status === 'loading') return
    setStatus('loading')
    const urlParams = new URLSearchParams(window.location.search)
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          source,
          screening,
          verify_token: verifyToken,
          lead_uuid: leadUuid,
          utm_source: urlParams.get('utm_source') || undefined,
          utm_medium: urlParams.get('utm_medium') || undefined,
          utm_campaign: urlParams.get('utm_campaign') || undefined,
          referrer: document.referrer || undefined,
          landing_page: window.location.href || undefined,
          pathname: window.location.pathname || undefined,
        }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        triggerToast("We couldn't submit your enquiry", 'Please try again in a few moments or contact us directly via WhatsApp or phone.')
      }
    } catch {
      setStatus('error')
      triggerToast("We couldn't submit your enquiry", 'Please try again in a few moments or contact us directly via WhatsApp or phone.')
    }
  }, [values, source, screening, verifyToken, leadUuid, status])

  const cardStyle = { background: '#00162e', border: '1px solid var(--gold)', borderTop: '4px solid #DB241E', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '1px', boxShadow: '0 10px 40px rgba(0,0,0,0.65), 0 0 15px rgba(216,160,39,0.15)', backdropFilter: 'blur(12px)' }

  if (status === 'success') {
    return (
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', color: '#D8A027', marginBottom: '0.6rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Enquiry Received</h3>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {successMessage || (courseName
            ? `Thank you! Your enquiry for ${courseName} has been received successfully. Our admissions team will contact you shortly.`
            : 'Thank you! Your enquiry has been received successfully. Our admissions team will contact you shortly.')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <a href="tel:+919953777320" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem' }}>📞 Call Us</a>
          <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem', borderColor: '#25D366', color: '#25D366' }}>💬 WhatsApp</a>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <ProgressIndicator step={step} total={STEP_LABELS.length} />
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
      </h3>

      {/* Step 0: Details */}
      {step === 0 && (
        <>
          <FormField id="msf-name" label="Full Name" type="text" placeholder="Full Name" dark value={values.name} onChange={(v) => handleChange('name', v)} onBlur={() => handleBlur('name')} error={touched.name ? errors.name : null} required />
          <FormField id="msf-phone" label="Contact Number" type="tel" placeholder="Contact Number (10 digits)" dark value={values.phone} onChange={(v) => handleChange('phone', v)} onBlur={() => handleBlur('phone')} error={touched.phone ? errors.phone : null} required maxLength={10} />
          <FormField id="msf-email" label="Email Address" type="email" placeholder="Email Address" dark value={values.email} onChange={(v) => handleChange('email', v)} onBlur={() => handleBlur('email')} error={touched.email ? errors.email : null} required />
          <SubmitButton id="msf-next-0" type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={goNext}>
            Continue →
          </SubmitButton>
        </>
      )}
      {step === 0 && null}

      {/* Step 1: OTP */}
      {step === 1 && (
        <>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            We'll send a 6-digit verification code to <strong style={{ color: '#fff' }}>+91 {values.phone}</strong>.
          </p>
          {otpStatus === 'idle' || otpStatus === 'error' || otpStatus === 'sending' ? (
            <SubmitButton id="msf-send-otp" type="button" className="btn btn-primary" loading={otpStatus === 'sending'} style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }} onClick={requestOtp}>
              Send OTP
            </SubmitButton>
          ) : (
            <>
              <FormField id="msf-otp" label="OTP" type="tel" placeholder="Enter 6-digit code" dark value={otp} onChange={setOtp} maxLength={6} />
              {otpStatus !== 'verified' && (
                <SubmitButton id="msf-verify-otp" type="button" className="btn btn-primary" loading={otpStatus === 'verifying'} style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }} onClick={verifyOtpCode}>
                  Verify Code
                </SubmitButton>
              )}
              {otpStatus === 'verified' && (
                <p role="status" style={{ color: '#25D366', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>✓ Phone verified</p>
              )}
              <button type="button" onClick={requestOtp} style={{ background: 'none', border: 'none', color: '#D8A027', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginBottom: '1rem', textDecoration: 'underline' }}>
                Resend code
              </button>
            </>
          )}
          {otpError && <p role="alert" style={{ fontSize: '0.78rem', color: '#ff4444', marginBottom: '1rem' }}>{otpError}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={goBack} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
            <SubmitButton id="msf-next-1" type="button" className="btn btn-primary" disabled={otpStatus !== 'verified'} style={{ flex: 1, justifyContent: 'center' }} onClick={goNext}>
              Continue →
            </SubmitButton>
          </div>
        </>
      )}

      {/* Step 2: Conditional questions */}
      {step === 2 && (
        <>
          {courseCategory === 'cabin-crew' ? (
            <>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                These help our counsellor prepare for your session — they never block your application.
              </p>
              <YesNo label="Do you have any visible tattoos?" value={screening.tattoo} onChange={(v) => setScreening((s) => ({ ...s, tattoo: v }))} />
              <YesNo label="Any known hearing impairment?" value={screening.hearing} onChange={(v) => setScreening((s) => ({ ...s, hearing: v }))} />
              <YesNo label="Any criminal record?" value={screening.criminalRecord} onChange={(v) => setScreening((s) => ({ ...s, criminalRecord: v }))} />
              <FormField id="msf-height" label="Height (cm)" type="tel" placeholder="Height in cm" dark value={screening.height || ''} onChange={(v) => setScreening((s) => ({ ...s, height: v.replace(/\D/g, '') }))} maxLength={3} />
              <FormField id="msf-weight" label="Weight (kg)" type="tel" placeholder="Weight in kg" dark value={screening.weight || ''} onChange={(v) => setScreening((s) => ({ ...s, weight: v.replace(/\D/g, '') }))} maxLength={3} />
              {screening.height && Number(screening.height) < 157 && (
                <p style={{ fontSize: '0.75rem', color: '#D8A027', marginBottom: '1rem' }}>Note: minimum height guidance for cabin crew is 157cm — our counsellor will discuss this with you.</p>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                This helps us recommend the right path and financing options for you.
              </p>
              <YesNo label="Are you able to comfortably afford the full training cost at this time?" value={screening.canAfford} onChange={(v) => setScreening((s) => ({ ...s, canAfford: v }))} />
              {screening.canAfford === 'No' && (
                <p style={{ fontSize: '0.78rem', color: '#D8A027', marginBottom: '1rem', lineHeight: 1.6 }}>
                  No problem — our admissions team will reach out with EMI and education loan guidance options.
                </p>
              )}
            </>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={goBack} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
            <SubmitButton id="msf-next-2" type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={goNext}>
              Continue →
            </SubmitButton>
          </div>
        </>
      )}

      {/* Step 3: Review + Submit */}
      {step === 3 && (
        <>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '2px', padding: '1.25rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>
            <div><strong style={{ color: '#fff' }}>Name:</strong> {values.name}</div>
            <div><strong style={{ color: '#fff' }}>Phone:</strong> +91 {values.phone} ✓ verified</div>
            <div><strong style={{ color: '#fff' }}>Email:</strong> {values.email}</div>
            <div><strong style={{ color: '#fff' }}>Course:</strong> {values.course}</div>
          </div>
          {status === 'error' && (
            <p role="alert" style={{ fontSize: '0.78rem', color: '#ff4444', lineHeight: '1.5', margin: '0 0 1rem' }}>
              We couldn't submit your enquiry right now. Please try again in a few moments or contact us directly via WhatsApp or phone.
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={goBack} className="btn btn-outline" style={{ flex: 1 }} disabled={status === 'loading'}>← Back</button>
            <SubmitButton id="msf-submit" type="button" className="btn btn-primary" loading={status === 'loading'} disabled={!isValid || status === 'loading'} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit}>
              Submit Enquiry
            </SubmitButton>
          </div>
        </>
      )}
    </div>
  )
}
