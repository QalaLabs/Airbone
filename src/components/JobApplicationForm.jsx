'use client'

import { useState } from 'react'
import Honeypot from '@/components/Honeypot'
import { HONEYPOT_FIELD, readHoneypot } from '@/utils/honeypot'
import { validateJobApplication } from '@/utils/jobApplication'

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
        <h3 style={{ color: 'var(--navy)', fontFamily: 'var(--font-h)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Application Submitted</h3>
        <p style={{ fontSize: '0.88rem', color: '#2b3a4a', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Thank you. Our placement team has received your application for {job.role} and will contact you if shortlisted.
        </p>
        <button type="button" className="jobs-btn-secondary" onClick={onCancel}>Close</button>
      </div>
    )
  }

  const fieldError = (k) => errors[k] && <p className="jobs-form-error">{errors[k]}</p>

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="job-application-form" className="jobs-form">
      <Honeypot />
      {status === 'error' && (
        <div role="alert" data-testid="job-application-error" className="jobs-form-alert">
          {message}
        </div>
      )}
      <div>
        <label className="jobs-form-label" htmlFor="ja-name">Full Name *</label>
        <input id="ja-name" name="applicantName" autoComplete="name" value={values.applicantName} onChange={set('applicantName')} />
        {fieldError('applicantName')}
      </div>
      <div>
        <label className="jobs-form-label" htmlFor="ja-email">Email *</label>
        <input id="ja-email" name="applicantEmail" type="email" autoComplete="email" value={values.applicantEmail} onChange={set('applicantEmail')} />
        {fieldError('applicantEmail')}
      </div>
      <div>
        <label className="jobs-form-label" htmlFor="ja-phone">Phone *</label>
        <input id="ja-phone" name="applicantPhone" type="tel" autoComplete="tel" value={values.applicantPhone} onChange={set('applicantPhone')} />
        {fieldError('applicantPhone')}
      </div>
      <div>
        <label className="jobs-form-label" htmlFor="ja-resume">Resume / CV link (Google Drive, Dropbox…)</label>
        <input id="ja-resume" name="resumeUrl" type="url" placeholder="https://" value={values.resumeUrl} onChange={set('resumeUrl')} />
        {fieldError('resumeUrl')}
      </div>
      <div>
        <label className="jobs-form-label" htmlFor="ja-cover">Cover note</label>
        <textarea id="ja-cover" name="coverLetter" rows={3} maxLength={5000} style={{ resize: 'vertical' }} value={values.coverLetter} onChange={set('coverLetter')} />
      </div>
      <label htmlFor="ja-consent" className="jobs-form-consent" data-testid="job-consent-label">
        <input id="ja-consent" name="consent" type="checkbox" checked={values.consent} onChange={set('consent')} />
        <span>I agree that Airborne Aviation may store and share my details with the hiring partner for this role, and contact me about my application.</span>
      </label>
      {fieldError('consent')}
      <div className="jobs-modal-actions">
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting…' : 'Submit Application →'}
        </button>
        <button type="button" className="jobs-btn-secondary" onClick={onCancel}>Back</button>
      </div>
    </form>
  )
}
