'use client'

import { useState } from 'react'
import Honeypot from '@/components/Honeypot'
import { HONEYPOT_FIELD, readHoneypot } from '@/utils/honeypot'
import { validateJobApplication } from '@/utils/jobApplication'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#FFFFFF',
  padding: '0.7rem 0.85rem',
  fontSize: '0.85rem',
  borderRadius: '2px',
}
const labelStyle = { display: 'block', fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '0.3rem', fontWeight: 700 }
const errStyle = { color: '#fca5a5', fontSize: '0.72rem', marginTop: '0.25rem' }

export default function JobApplicationForm({ job, onCancel }) {
  const [values, setValues] = useState({ applicantName: '', applicantEmail: '', applicantPhone: '', resumeUrl: '', coverLetter: '', consent: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const set = (k) => (e) => setValues((prev) => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'loading') return
    const hp = readHoneypot(e.currentTarget)
    const found = validateJobApplication(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/job-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, jobId: job.id, [HONEYPOT_FIELD]: hp }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('success')
        return
      }
      setStatus('error')
      setMessage(json.error || 'We could not submit your application right now. Please try again later.')
    } catch {
      setStatus('error')
      setMessage('We could not submit your application right now. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div data-testid="job-application-success" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <h3 style={{ color: '#D8A027', fontFamily: 'var(--font-h)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Application Submitted</h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
          Thank you. Our placement team has received your application for {job.role} and will contact you if shortlisted.
        </p>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Close</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="job-application-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <Honeypot />
      {status === 'error' && (
        <div role="alert" data-testid="job-application-error" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fecaca', fontSize: '0.8rem', padding: '0.7rem 0.9rem' }}>
          {message}
        </div>
      )}
      <div>
        <label style={labelStyle} htmlFor="ja-name">Full Name *</label>
        <input id="ja-name" name="applicantName" autoComplete="name" style={inputStyle} value={values.applicantName} onChange={set('applicantName')} />
        {errors.applicantName && <p style={errStyle}>{errors.applicantName}</p>}
      </div>
      <div>
        <label style={labelStyle} htmlFor="ja-email">Email *</label>
        <input id="ja-email" name="applicantEmail" type="email" autoComplete="email" style={inputStyle} value={values.applicantEmail} onChange={set('applicantEmail')} />
        {errors.applicantEmail && <p style={errStyle}>{errors.applicantEmail}</p>}
      </div>
      <div>
        <label style={labelStyle} htmlFor="ja-phone">Phone *</label>
        <input id="ja-phone" name="applicantPhone" type="tel" autoComplete="tel" style={inputStyle} value={values.applicantPhone} onChange={set('applicantPhone')} />
        {errors.applicantPhone && <p style={errStyle}>{errors.applicantPhone}</p>}
      </div>
      <div>
        <label style={labelStyle} htmlFor="ja-resume">Resume / CV link (Google Drive, Dropbox…)</label>
        <input id="ja-resume" name="resumeUrl" type="url" placeholder="https://" style={inputStyle} value={values.resumeUrl} onChange={set('resumeUrl')} />
        {errors.resumeUrl && <p style={errStyle}>{errors.resumeUrl}</p>}
      </div>
      <div>
        <label style={labelStyle} htmlFor="ja-cover">Cover note</label>
        <textarea id="ja-cover" name="coverLetter" rows={3} maxLength={5000} style={{ ...inputStyle, resize: 'vertical' }} value={values.coverLetter} onChange={set('coverLetter')} />
      </div>
      <label htmlFor="ja-consent" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
        <input id="ja-consent" name="consent" type="checkbox" checked={values.consent} onChange={set('consent')} style={{ marginTop: '0.2rem' }} />
        I agree that Airborne Aviation may store and share my details with the hiring partner for this role, and contact me about my application.
      </label>
      {errors.consent && <p style={errStyle}>{errors.consent}</p>}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'} style={{ flex: 1, justifyContent: 'center' }}>
          {status === 'loading' ? 'Submitting…' : 'Submit Application →'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ padding: '0.95rem 1.5rem' }}>Back</button>
      </div>
    </form>
  )
}
