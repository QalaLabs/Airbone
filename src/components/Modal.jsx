'use client'

import GoogleReviewsWidget from '@/components/GoogleReviewsWidget'

import { useState, useEffect, useRef, useCallback } from 'react'
import useFormValidation from '@/hooks/useFormValidation'
import { validateName, validatePhone, validateEmail, validateEmailRequired, validatePincode, validateRequired } from '@/utils/validation'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'
import Honeypot from '@/components/Honeypot'
import { HONEYPOT_FIELD, readHoneypot } from '@/utils/honeypot'
import { WHATSAPP_HREF } from '@/lib/whatsapp'
import { submitLead, triggerClientDownload } from '@/lib/api'
import { CANONICAL_COURSE_OPTIONS } from '@/lib/publicCourses'

const COURSES = CANONICAL_COURSE_OPTIONS

export default function Modal({
  type = 'demo',
  isOpen,
  onClose,
  downloadUrl = '/assets/downloads/cabin-crew-starter-kit.pdf',
  course = 'Cabin Crew Training',
  title,
  subtitle,
}) {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submitLock = useRef(false)
  const isDemo = type === 'demo'
  const isStarterKit = type === 'starter-kit' || !!downloadUrl && type === 'download'

  const validators = {
    name: validateName,
    phone: validatePhone,
    email: isStarterKit ? validateEmailRequired : validateEmail,
    pincode: validatePincode,
    course: validateRequired,
  }

  const { values, errors, touched, handleChange, handleBlur, validate, setValues } = useFormValidation(
    { name: '', phone: '', email: '', pincode: '', course: course || '', persona: 'Student' },
    validators
  )

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setSubmitted(false)
    setSubmitError('')
    submitLock.current = false
    setValues({ name: '', phone: '', email: '', pincode: '', course: course || '', persona: 'Student' })
    onClose()
  }, [onClose, setValues, course])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const hp = readHoneypot(e.currentTarget)
    if (!validate() || submitLock.current) return
    submitLock.current = true
    setSubmitError('')
    const urlParams = new URLSearchParams(window.location.search)
    const utm_source = urlParams.get('utm_source') || undefined
    const utm_medium = urlParams.get('utm_medium') || undefined
    const utm_campaign = urlParams.get('utm_campaign') || undefined
    const utm_term = urlParams.get('utm_term') || undefined
    const utm_content = urlParams.get('utm_content') || undefined
    const referrer = document.referrer || undefined
    const landing_page = window.location.href || undefined

    try {
      await submitLead({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        pincode: values.pincode,
        course: values.course || course || 'DGCA CPL Ground School',
        tags: isStarterKit ? ['starter_kit_download'] : undefined,
        persona: values.persona || 'Student',
        message: `Applicant: ${values.persona || 'Student'}`,
        source: isStarterKit ? 'Starter Kit Download' : 'Homepage Modal',
        [HONEYPOT_FIELD]: hp,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        referrer,
        landing_page,
      })

      // Trigger direct client-side PDF download upon successful submission
      if (isStarterKit && downloadUrl) {
        triggerClientDownload(downloadUrl, 'cabin-crew-starter-kit.pdf')
      }
    } catch (err) {
      setSubmitError(err.message === 'Lead submit failed' || !err.message
        ? 'We could not submit your details right now. Please try again or call +91 9953 777 320.'
        : err.message)
      submitLock.current = false
      return
    }
    setSubmitted(true)
  }, [values, validate, isStarterKit, course, downloadUrl])

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={isStarterKit ? 'Download Starter Kit' : isDemo ? 'Book Free Demo Class' : 'Apply Now'}
    >
      <div className="modal">
        <button className="modal-close" onClick={handleClose} aria-label="Close">Ã—</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: 64, height: 64,
              background: 'rgba(219,36,30,0.12)',
              border: '2px solid var(--red)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.75rem',
            }}>âœ“</div>
            <div className="modal-title" style={{ marginBottom: '0.75rem' }}>
              {isStarterKit ? 'Download Started!' : isDemo ? 'Demo Confirmed!' : 'Application Received!'}
            </div>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>
              {isStarterKit
                ? 'Your Cabin Crew Starter Kit PDF has been downloaded to your device.'
                : isDemo
                ? 'We\'ll call you within 2 hours to confirm your free demo class. Capt. Navrang Singh will personally meet you.'
                : 'Our team will contact you within 24 hours. Welcome to the journey from dream to cockpit.'}
            </p>

            {isStarterKit && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
                Didn&apos;t start automatically?{' '}
                <a
                  href={downloadUrl}
                  download="cabin-crew-starter-kit.pdf"
                  style={{ color: 'var(--gold)', textDecoration: 'underline', fontWeight: 700 }}
                >
                  Click here to download directly
                </a>
              </p>
            )}

            <div style={{
              background: 'rgba(216,160,39,0.1)',
              border: '1px solid rgba(216,160,39,0.25)',
              borderRadius: '2px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--label-size)', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Or connect instantly
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a href="tel:+919953777320" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 900, color: 'var(--white)', textDecoration: 'none' }}>
                  ðŸ“ž +91 9953 777 320
                </a>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 900, color: '#25D366', textDecoration: 'none' }}>
                  ðŸ’¬ WhatsApp
                </a>
              </div>
            </div>
            <button className="btn btn-outline" onClick={handleClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'inline-block',
                background: 'var(--red)',
                color: 'var(--white)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                padding: '0.3rem 0.75rem',
                borderRadius: '1px',
                marginBottom: '0.75rem',
              }}>
                {isStarterKit
                  ? 'Free PDF Download Â· Instant Access'
                  : isDemo
                  ? '100% Free Â· No Obligation'
                  : 'June 2026 Batch Â· Limited Seats'}
              </div>
              <div className="modal-title">
                {title || (isStarterKit ? 'Download: Cabin Crew Starter Kit' : isDemo ? 'Book Free Demo Class' : 'Apply Now')}
              </div>
              <p className="modal-sub">
                {subtitle || (
                  isStarterKit
                    ? 'Enter your details below for instant access to the Cabin Crew Starter Kit PDF.'
                    : isDemo
                    ? 'Experience Capt. Navrang Singh\'s teaching method firsthand. Max 25 students. Dwarka, New Delhi.'
                    : 'Join the next batch of serious CPL aspirants. We\'ll review your profile and contact you within 24 hours.'
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="form-grid" noValidate>
              <Honeypot />
              {/* I am a: Student / Parent selector */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.45rem' }}>I am a: *</label>
                <div role="radiogroup" aria-label="I am a" style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Student', 'Parent'].map((opt) => {
                    const selected = (values.persona || 'Student') === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleChange('persona', opt)}
                        style={{
                          flex: 1,
                          padding: '0.55rem 1rem',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontFamily: 'var(--font-h)',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          border: selected ? '1.5px solid var(--gold)' : '1px solid rgba(0, 39, 76, 0.15)',
                          background: selected ? 'rgba(216, 160, 39, 0.12)' : '#ffffff',
                          color: selected ? 'var(--navy)' : 'rgba(0, 39, 76, 0.65)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-name">Full Name *</label>
                  <FormField
                    id="modal-name"
                    type="text"
                    placeholder="Your full name"
                    value={values.name}
                    onChange={(v) => handleChange('name', v)}
                    onBlur={() => handleBlur('name')}
                    error={touched.name ? errors.name : null}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-phone">Phone Number *</label>
                  <FormField
                    id="modal-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={values.phone}
                    onChange={(v) => handleChange('phone', v)}
                    onBlur={() => handleBlur('phone')}
                    error={touched.phone ? errors.phone : null}
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-email">Email Address (Optional)</label>
                <FormField
                  id="modal-email"
                  type="email"
                  placeholder="you@email.com (optional)"
                  value={values.email}
                  onChange={(v) => handleChange('email', v)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email ? errors.email : null}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-pincode">PIN Code / Zip Code *</label>
                <FormField
                  id="modal-pincode"
                  type="text"
                  placeholder="e.g. 110075"
                  value={values.pincode}
                  onChange={(v) => handleChange('pincode', v)}
                  onBlur={() => handleBlur('pincode')}
                  error={touched.pincode ? errors.pincode : null}
                  required
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-course">Course of Interest *</label>
                <FormField
                  id="modal-course"
                  as="select"
                  value={values.course}
                  onChange={(v) => handleChange('course', v)}
                  error={touched.course ? errors.course : null}
                  required
                >
                  <option value="">Select a program</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {course && !COURSES.includes(course) && (
                    <option value={course}>{course}</option>
                  )}
                </FormField>
              </div>

              <SubmitButton
                className="btn btn-primary"
                id={isStarterKit ? 'submit-starter-kit-form' : isDemo ? 'submit-demo-form' : 'submit-apply-form'}
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              >
                {isStarterKit ? 'Download Starter Kit PDF â†’' : isDemo ? 'Book My Free Demo â†’' : 'Submit Application â†’'}
              </SubmitButton>

              {submitError && (
                <p className="modal-sub" style={{ color: 'var(--red)', marginTop: '1rem', marginBottom: 0 }}>
                  {submitError}
                </p>
              )}

              <GoogleReviewsWidget dark={false} compact={true} />

              <p className="form-legal">
                By submitting, you consent to being contacted by Airborne Aviation Academy
                regarding your inquiry. Airborne Aviation Pvt. Ltd. Â· <span style={{ whiteSpace: 'nowrap' }}>CIN: U85306DL2026PTC465670</span>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
