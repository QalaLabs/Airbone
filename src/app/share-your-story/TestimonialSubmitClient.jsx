'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Honeypot from '@/components/Honeypot'
import { HONEYPOT_FIELD, readHoneypot } from '@/utils/honeypot'
import { validateTestimonial, buildTestimonialPayload } from '@/utils/testimonial'

const inputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid rgba(0,39,76,0.15)',
  color: 'var(--ink)',
  padding: '0.75rem 0.9rem',
  fontSize: '0.9rem',
  borderRadius: '2px',
}
const labelStyle = { display: 'block', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '0.35rem', fontWeight: 700 }
const errStyle = { color: '#b91c1c', fontSize: '0.75rem', marginTop: '0.25rem' }

export default function TestimonialSubmitClient() {
  const [values, setValues] = useState({ authorName: '', authorTitle: '', authorEmail: '', content: '', rating: '', consent: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const set = (k) => (e) => setValues((prev) => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'loading') return
    const hp = readHoneypot(e.currentTarget)
    const found = validateTestimonial(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildTestimonialPayload(values), [HONEYPOT_FIELD]: hp }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('success')
        return
      }
      setStatus('error')
      setMessage(json.error || 'We could not submit your testimonial right now. Please try again later.')
    } catch {
      setStatus('error')
      setMessage('We could not submit your testimonial right now. Please check your connection and try again.')
    }
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: 'var(--paper)', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Alumni &amp; Students</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: '1rem', textTransform: 'uppercase', color: 'var(--navy)' }}>
            Share Your <em style={{ color: '#D8A027', fontStyle: 'normal' }}>Story.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1rem', marginBottom: '2.5rem', color: 'rgba(33,33,33,0.7)' }}>
            Trained with Airborne? Tell future cadets about your experience. Every testimonial is reviewed by our team before it appears on the website.
          </p>

          {status === 'success' ? (
            <div data-testid="testimonial-success" style={{ background: '#ffffff', border: '1px solid rgba(0,39,76,0.1)', padding: '2.5rem', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--navy)', fontFamily: 'var(--font-h)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Thank you!</h2>
              <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9rem' }}>
                Your testimonial has been received and will be published once our team has reviewed it.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate data-testid="testimonial-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', background: '#ffffff', border: '1px solid rgba(0,39,76,0.08)', padding: '2rem' }}>
              <Honeypot />
              {status === 'error' && (
                <div role="alert" data-testid="testimonial-error" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#b91c1c', fontSize: '0.8rem', padding: '0.75rem 1rem' }}>
                  {message}
                </div>
              )}
              <div>
                <label style={labelStyle} htmlFor="t-name">Your Name *</label>
                <input id="t-name" name="authorName" autoComplete="name" style={inputStyle} value={values.authorName} onChange={set('authorName')} />
                {errors.authorName && <p style={errStyle}>{errors.authorName}</p>}
              </div>
              <div>
                <label style={labelStyle} htmlFor="t-title">Course / Role (e.g. CPL Ground School, 2025)</label>
                <input id="t-title" name="authorTitle" style={inputStyle} maxLength={120} value={values.authorTitle} onChange={set('authorTitle')} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="t-email">Email (not published)</label>
                <input id="t-email" name="authorEmail" type="email" autoComplete="email" style={inputStyle} value={values.authorEmail} onChange={set('authorEmail')} />
                {errors.authorEmail && <p style={errStyle}>{errors.authorEmail}</p>}
              </div>
              <div>
                <label style={labelStyle} htmlFor="t-content">Your Testimonial *</label>
                <textarea id="t-content" name="content" rows={6} maxLength={2000} style={{ ...inputStyle, resize: 'vertical' }} value={values.content} onChange={set('content')} />
                {errors.content && <p style={errStyle}>{errors.content}</p>}
              </div>
              <div>
                <label style={labelStyle} htmlFor="t-rating">Rating</label>
                <select id="t-rating" name="rating" style={inputStyle} value={values.rating} onChange={set('rating')}>
                  <option value="">No rating</option>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
                </select>
                {errors.rating && <p style={errStyle}>{errors.rating}</p>}
              </div>
              <label htmlFor="t-consent" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.8rem', color: 'rgba(33,33,33,0.75)', lineHeight: 1.5 }}>
                <input id="t-consent" name="consent" type="checkbox" checked={values.consent} onChange={set('consent')} style={{ marginTop: '0.2rem' }} />
                I allow Airborne Aviation to publish my name, course and testimonial on its website after review.
              </label>
              {errors.consent && <p style={errStyle}>{errors.consent}</p>}
              <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ justifyContent: 'center' }}>
                {status === 'loading' ? 'Submitting…' : 'Submit Testimonial →'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
