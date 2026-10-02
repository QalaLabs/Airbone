'use client'

import { useState, useCallback, useEffect } from 'react'
import { triggerToast } from '@/components/Toast'
import useFormValidation from '@/hooks/useFormValidation'
import { validateName, validatePhone, validateEmailRequired, validatePincode, validateRequired } from '@/utils/validation'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'
import Honeypot from '@/components/Honeypot'
import { WHATSAPP_HREF } from '@/lib/whatsapp'
import { HONEYPOT_FIELD, readHoneypot } from '@/utils/honeypot'

const validators = { name: validateName, phone: validatePhone, email: validateEmailRequired, pincode: validatePincode, course: validateRequired }

const COURSES = [
  'DGCA CPL Ground Classes (₹2,70,000)',
  'Commercial Pilot License (CPL)',
  'Cadet Preparation (₹50,000)',
  'Airline Preparation (₹1,25,000)',
  'GD & PI Course (₹30,000)',
  'CASS Compass Adapt (₹30,000)',
  'ATPL Ground School (₹1,50,000)',
  'Airbus A320 Simulator FBS (₹10,000)',
  "Securing Your Child's Future in Aviation",
  'Cabin Crew Training (₹54,000)',
  'Private Pilot License (PPL)',
]

const ELIGIBILITY_RESULT = {
  eligible: { title: '✓ You meet the listed criteria for this course', tone: '#25D366' },
  review: { title: 'Some criteria need a counsellor review', tone: '#D8A027' },
  not_applicable: { title: 'No eligibility pre-check is needed for this course', tone: 'rgba(255,255,255,0.7)' },
}

/** Per-course eligibility questions served by the admin (selected course drives the set). */
function useCourseEligibility(course) {
  const [state, setState] = useState({ course: null, courseSlug: null, questions: [] })
  useEffect(() => {
    if (!course) return undefined
    const controller = new AbortController()
    fetch(`/api/public-proxy/eligibility?course=${encodeURIComponent(course)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const data = body?.data
        setState({
          course,
          courseSlug: typeof data?.courseSlug === 'string' ? data.courseSlug : null,
          questions: Array.isArray(data?.questions) ? data.questions.filter((q) => q && typeof q.key === 'string' && typeof q.label === 'string') : [],
        })
      })
      // Advisory only: if the questions cannot be loaded the enquiry still works.
      .catch(() => {})
    return () => controller.abort()
  }, [course])
  return state.course === course ? state : { course, courseSlug: null, questions: [] }
}

export default function LeadForm({ courseName = '', source = 'Dynamic Page Form', successMessage = '' }) {
  const [status, setStatus] = useState('idle')
  const [answers, setAnswers] = useState({})
  const [eligibilityResult, setEligibilityResult] = useState(null)
  const { values, errors, touched, handleChange, handleBlur, validate } = useFormValidation(
    { name: '', phone: '', email: '', pincode: '', course: courseName || COURSES[0] },
    validators
  )
  const eligibility = useCourseEligibility(values.course)
  const currentAnswers = Object.fromEntries(
    eligibility.questions.filter((q) => answers[q.key]).map((q) => [q.key, answers[q.key]])
  )
  const changeCourse = (v) => {
    setAnswers({})
    handleChange('course', v)
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (status === 'loading') return // prevent duplicate submission
    const hp = readHoneypot(e.currentTarget)
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
        body: JSON.stringify({
          ...values,
          [HONEYPOT_FIELD]: hp,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          referrer,
          landing_page,
          ...(Object.keys(currentAnswers).length > 0 ? { eligibility: currentAnswers } : {}),
        })
      })
      if (res.ok || res.status === 409) {
        // 409 = this phone already has an enquiry on file — not a failure for
        // the visitor, the admin API already has their details.
        const data = await res.json().catch(() => ({}))
        setEligibilityResult(data?.eligibility ?? null)
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus('error')
        triggerToast("We couldn't submit your enquiry", data.error || 'Please try again in a few moments or contact us directly via WhatsApp or phone.')
      }
    } catch {
      setStatus('error')
      triggerToast("We couldn't submit your enquiry", 'Please try again in a few moments or contact us directly via WhatsApp or phone.')
    }
  }, [values, source, validate, status, currentAnswers])

  if (status === 'success') {
    const confirmationText = successMessage || (
      (values.course || courseName).toLowerCase().includes('cpl')
        ? 'Thank you! Your CPL Ground School enquiry has been received. An Airborne admissions counsellor will contact you shortly.'
        : 'Thank you! Your enquiry has been received successfully. Our admissions team will contact you shortly.'
    )

    return (
      <div style={{ background: 'rgba(0, 15, 30, 0.7)', border: '1px solid #D8A027', borderTop: '4px solid #DB241E', padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center', borderRadius: '1px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', color: '#D8A027', marginBottom: '0.6rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Enquiry Received</h3>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {confirmationText}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <a href="tel:+919953777320" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem' }}>📞 Call Us</a>
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem', borderColor: '#25D366', color: '#25D366' }}>💬 WhatsApp</a>
          <a href="/courses" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.6rem 1rem' }}>Explore Courses →</a>
        </div>
        {eligibilityResult && ELIGIBILITY_RESULT[eligibilityResult.result] ? (
          <div data-testid="eligibility-result" data-result={eligibilityResult.result} data-course={eligibilityResult.course ?? ''} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
            <p style={{ fontWeight: 800, fontSize: '0.85rem', color: ELIGIBILITY_RESULT[eligibilityResult.result].tone, marginBottom: '0.4rem' }}>
              {ELIGIBILITY_RESULT[eligibilityResult.result].title}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Advisory only — a counsellor makes the final eligibility assessment.</p>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <form className="modal-form" onSubmit={handleSubmit} noValidate style={{ background: '#00162e', border: '1px solid var(--gold)', borderTop: '4px solid #DB241E', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '1px', boxShadow: '0 10px 40px rgba(0,0,0,0.65), 0 0 15px rgba(216,160,39,0.15)', backdropFilter: 'blur(12px)' }}>
      <Honeypot />
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Reserve Seat / Ask Syllabus
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
        Upcoming batches are capped at 25 students. Provide details to receive syllabus PDF.
      </p>

      <FormField id="lead-name" type="text" placeholder="Full Name" dark value={values.name} onChange={(v) => handleChange('name', v)} onBlur={() => handleBlur('name')} error={touched.name ? errors.name : null} required />
      <FormField id="lead-phone" type="tel" placeholder="Contact Number (e.g. +91...)" dark value={values.phone} onChange={(v) => handleChange('phone', v)} onBlur={() => handleBlur('phone')} error={touched.phone ? errors.phone : null} required maxLength={10} />
      <FormField id="lead-email" type="email" placeholder="Email Address" dark value={values.email} onChange={(v) => handleChange('email', v)} onBlur={() => handleBlur('email')} error={touched.email ? errors.email : null} required />
      <FormField id="lead-pincode" type="text" placeholder="PIN Code / Zip Code" dark value={values.pincode} onChange={(v) => handleChange('pincode', v)} onBlur={() => handleBlur('pincode')} error={touched.pincode ? errors.pincode : null} required maxLength={6} />

      <FormField id="lead-course" as="select" dark value={values.course} onChange={changeCourse} error={touched.course ? errors.course : null} required>
        {COURSES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        {courseName && !COURSES.includes(courseName) && (
          <option value={courseName}>{courseName}</option>
        )}
      </FormField>

      {eligibility.questions.length > 0 && (
        <fieldset data-testid="eligibility-form" data-course={eligibility.courseSlug ?? ''} style={{ border: '1px dashed rgba(216,160,39,0.35)', borderRadius: '2px', padding: '0.9rem 1rem 0.4rem', margin: '0 0 1.25rem' }}>
          <legend style={{ fontFamily: 'var(--font-h)', fontSize: '0.72rem', color: '#D8A027', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', padding: '0 0.4rem' }}>
            Eligibility check (optional)
          </legend>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
            Questions for the selected course. Advisory only — never blocks your enquiry.
          </p>
          {eligibility.questions.map((q) => (
            <div key={q.key} data-testid="eligibility-question" data-key={q.key} style={{ marginBottom: '0.75rem' }}>
              <p id={`elig-${q.key}`} style={{ fontSize: '0.78rem', color: '#fff', margin: '0 0 0.4rem', fontWeight: 600 }}>{q.label}</p>
              <div role="radiogroup" aria-labelledby={`elig-${q.key}`} style={{ display: 'flex', gap: '0.5rem' }}>
                {['yes', 'no'].map((opt) => {
                  const selected = answers[q.key] === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                      style={{
                        flex: 1, padding: '0.45rem', borderRadius: '2px', cursor: 'pointer', fontWeight: 700,
                        fontFamily: 'var(--font-h)', fontSize: '0.7rem', textTransform: 'uppercase',
                        border: selected ? '1px solid #D8A027' : '1px solid rgba(255,255,255,0.15)',
                        background: selected ? 'rgba(216,160,39,0.15)' : 'transparent',
                        color: selected ? '#D8A027' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {opt === 'yes' ? 'Yes' : 'No'}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {status === 'error' && (
        <p role="alert" style={{ fontSize: '0.78rem', color: '#ff4444', lineHeight: '1.5', margin: '0 0 1rem' }}>
          We couldn't submit your enquiry right now. Please try again in a few moments or contact us directly via WhatsApp or phone.
        </p>
      )}

      <SubmitButton
        id="lead-submit-btn"
        className="btn btn-primary"
        loading={status === 'loading'}
        disabled={status === 'loading'}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Apply For Registration →
      </SubmitButton>
    </form>
  )
}
