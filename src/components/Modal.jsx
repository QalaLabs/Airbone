'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import useFormValidation from '@/hooks/useFormValidation'
import { validateName, validatePhone, validateEmail, validatePincode, validateRequired } from '@/utils/validation'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'

const COURSES = [
  'CPL Ground Classes (₹2,70,000)',
  'Cadet Pilot Program (₹50,000)',
  'CAS Compass & ADAPT (₹30,000)',
  'Airline Preparation / GD & PI (₹1,00,000)',
  'Airbus A320 SIM Training (₹10,000/hr)',
  'Cabin Crew Training (₹30K–₹54K)',
  'ATPL Ground Classes (₹1,50,000)',
  'Private Pilot Licence (PPL)',
]

export default function Modal({ type = 'demo', isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const submitLock = useRef(false)
  const isDemo = type === 'demo'

  const validators = {
    name: validateName,
    phone: validatePhone,
    email: validateEmail,
    pincode: validatePincode,
    course: validateRequired,
  }

  const { values, handleChange, handleBlur, validate, isValid, setValues } = useFormValidation(
    { name: '', phone: '', email: '', pincode: '', course: '' },
    validators
  )

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (!isOpen) { setSubmitted(false); submitLock.current = false; setValues({ name: '', phone: '', email: '', pincode: '', course: '' }) }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, setValues])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate() || submitLock.current) return
    submitLock.current = true
    const urlParams = new URLSearchParams(window.location.search)
    const utm_source = urlParams.get('utm_source') || undefined
    const utm_medium = urlParams.get('utm_medium') || undefined
    const utm_campaign = urlParams.get('utm_campaign') || undefined
    const utm_term = urlParams.get('utm_term') || undefined
    const utm_content = urlParams.get('utm_content') || undefined
    const referrer = document.referrer || undefined
    const landing_page = window.location.href || undefined

    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          pincode: values.pincode,
          course: values.course || 'DGCA CPL Ground School',
          source: 'Homepage Modal',
          utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page,
        }),
      })
    } catch {}
    setSubmitted(true)
  }, [values, validate])

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={isDemo ? 'Book Free Demo Class' : 'Apply Now'}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

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
            }}>✓</div>
            <div className="modal-title" style={{ marginBottom: '0.75rem' }}>
              {isDemo ? 'Demo Confirmed!' : 'Application Received!'}
            </div>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>
              {isDemo
                ? 'We\'ll call you within 2 hours to confirm your free demo class. Capt. Navrang Singh will personally meet you.'
                : 'Our team will contact you within 24 hours. Welcome to the journey from dream to cockpit.'}
            </p>
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
                  📞 +91 9953 777 320
                </a>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 900, color: '#25D366', textDecoration: 'none' }}>
                  💬 WhatsApp
                </a>
              </div>
            </div>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
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
                {isDemo ? '100% Free · No Obligation' : 'June 2026 Batch · Limited Seats'}
              </div>
              <div className="modal-title">
                {isDemo ? 'Book Free Demo Class' : 'Apply Now'}
              </div>
              <p className="modal-sub">
                {isDemo
                  ? 'Experience Capt. Navrang Singh\'s teaching method firsthand. Max 25 students. Dwarka, New Delhi.'
                  : 'Join the next batch of serious CPL aspirants. We\'ll review your profile and contact you within 24 hours.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="form-grid" noValidate>
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
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-email">Email Address</label>
                <FormField
                  id="modal-email"
                  type="email"
                  placeholder="you@email.com"
                  value={values.email}
                  onChange={(v) => handleChange('email', v)}
                  onBlur={() => handleBlur('email')}
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
                  required
                >
                  <option value="">Select a program</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </FormField>
              </div>

              <SubmitButton
                className="btn btn-primary"
                id={isDemo ? 'submit-demo-form' : 'submit-apply-form'}
                disabled={!isValid}
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              >
                {isDemo ? 'Book My Free Demo →' : 'Submit Application →'}
              </SubmitButton>

              <p className="form-legal">
                By submitting, you consent to being contacted by Airborne Aviation Academy
                regarding your inquiry. Airborne Aviation Pvt. Ltd. · <span style={{ whiteSpace: 'nowrap' }}>CIN: U85306DL2026PTC465670</span>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
