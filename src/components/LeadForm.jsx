'use client'

import { useState, useCallback } from 'react'
import { triggerToast } from '@/components/Toast'
import useFormValidation from '@/hooks/useFormValidation'
import { validateName, validatePhone, validateEmail, validatePincode } from '@/utils/validation'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'

const validators = { name: validateName, phone: validatePhone, email: validateEmail, pincode: validatePincode }

const COURSES = [
  'CPL Ground Classes (₹2,70,000)',
  'Cadet Pilot Program (₹50,000)',
  'GD & PI Preparation (₹30,000)',
  'Airline Preparation (₹1,00,000)',
  'Airbus A320 SIM Training',
  'Cabin Crew Training',
  'ATPL Ground Classes',
  'Private Pilot Licence (PPL)',
]

export default function LeadForm({ courseName = '', source = 'Dynamic Page Form' }) {
  const [status, setStatus] = useState('idle')
  const { values, handleChange, handleBlur, validate, isValid, setValues } = useFormValidation(
    { name: '', phone: '', email: '', pincode: '', course: courseName || COURSES[0] },
    validators
  )

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    const urlParams = new URLSearchParams(window.location.search)
    const utm_source = urlParams.get('utm_source') || undefined
    const utm_medium = urlParams.get('utm_medium') || undefined
    const utm_campaign = urlParams.get('utm_campaign') || undefined
    const utm_term = urlParams.get('utm_term') || undefined
    const utm_content = urlParams.get('utm_content') || undefined
    const referrer = document.referrer || undefined
    const landing_page = window.location.href || undefined

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page })
      })
      if (res.ok) {
        triggerToast('Lead Captured Successfully', 'Our Dwarka admissions desk will contact you via WhatsApp or Voice within 120 seconds.')
      } else {
        triggerToast('Lead Captured', 'Admissions advisor queued.')
      }
    } catch {
      triggerToast('Lead Captured', 'Admissions advisor queued.')
    }
    setStatus('success')
  }, [values, source, validate])

  if (status === 'success') {
    return (
      <div style={{ background: 'rgba(0, 15, 30, 0.7)', border: '1px solid #D8A027', borderTop: '4px solid #DB241E', padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center', borderRadius: '1px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', color: '#D8A027', marginBottom: '0.6rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Enquiry Received</h3>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Thank you! Your {courseName || 'aviation training'} enquiry has been received. An Airborne admissions counsellor will contact you within 24 hours.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <a href="tel:+919953777320" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem' }}>📞 Call Us</a>
          <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem', borderColor: '#25D366', color: '#25D366' }}>💬 WhatsApp</a>
          <a href="/courses" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem' }}>Explore Courses →</a>
        </div>
      </div>
    )
  }

  return (
    <form className="modal-form" onSubmit={handleSubmit} noValidate style={{ background: '#00162e', border: '1px solid var(--gold)', borderTop: '4px solid #DB241E', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '1px', boxShadow: '0 10px 40px rgba(0,0,0,0.65), 0 0 15px rgba(216,160,39,0.15)', backdropFilter: 'blur(12px)' }}>
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Reserve Seat / Ask Syllabus
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
        July 2026 batches are capped at 25 students. Provide details to receive syllabus PDF.
      </p>

      <FormField id="lead-name" type="text" placeholder="Full Name" dark value={values.name} onChange={(v) => handleChange('name', v)} onBlur={() => handleBlur('name')} required />
      <FormField id="lead-phone" type="tel" placeholder="Contact Number (e.g. +91...)" dark value={values.phone} onChange={(v) => handleChange('phone', v)} onBlur={() => handleBlur('phone')} required maxLength={10} />
      <FormField id="lead-email" type="email" placeholder="Email Address" dark value={values.email} onChange={(v) => handleChange('email', v)} onBlur={() => handleBlur('email')} required />
      <FormField id="lead-pincode" type="text" placeholder="PIN Code / Zip Code" dark value={values.pincode} onChange={(v) => handleChange('pincode', v)} onBlur={() => handleBlur('pincode')} required maxLength={6} />

      <FormField id="lead-course" as="select" dark value={values.course} onChange={(v) => handleChange('course', v)} required>
        {COURSES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        {courseName && !COURSES.includes(courseName) && (
          <option value={courseName}>{courseName}</option>
        )}
      </FormField>

      <SubmitButton
        id="lead-submit-btn"
        className="btn btn-primary"
        loading={status === 'loading'}
        disabled={!isValid}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Apply For Registration →
      </SubmitButton>
    </form>
  )
}
