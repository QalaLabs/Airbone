'use client'

import { useState } from 'react'
import { triggerToast } from '@/components/Toast'
import Honeypot from '@/components/Honeypot'
import { HONEYPOT_FIELD, readHoneypot } from '@/utils/honeypot'
import { validateName, validatePhone, validateEmailRequired } from '@/utils/validation'

const PDF_DOWNLOAD_PATH = '/documents/cabin-crew-starter-kit.pdf'
const PDF_FILE_NAME = 'Airborne-Cabin-Crew-Starter-Kit.pdf'

export default function CabinCrewStarterKit() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success'

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const triggerDownload = () => {
    const link = document.createElement('a')
    link.href = PDF_DOWNLOAD_PATH
    link.download = PDF_FILE_NAME
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'loading') return

    const hp = readHoneypot(e.currentTarget)

    // Validation
    const nameRes = validateName(formData.name)
    const phoneRes = validatePhone(formData.phone)
    const emailRes = validateEmailRequired(formData.email)

    if (!nameRes.valid || !phoneRes.valid || !emailRes.valid) {
      setErrors({
        name: nameRes.error || '',
        phone: phoneRes.error || '',
        email: emailRes.error || '',
      })
      return
    }

    setStatus('loading')

    try {
      const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          course: 'Cabin Crew Training (₹54,000)',
          source: 'Course Detail: cabin-crew-starter-kit-download',
          [HONEYPOT_FIELD]: hp,
          landing_page: typeof window !== 'undefined' ? window.location.href : undefined,
          utm_source: urlParams.get('utm_source') || undefined,
          utm_medium: urlParams.get('utm_medium') || undefined,
          utm_campaign: urlParams.get('utm_campaign') || undefined,
        }),
      })

      if (res.status === 400) {
        const data = await res.json().catch(() => ({}))
        setStatus('idle')
        triggerToast("Couldn't process download", data.error || 'Please check your contact details and try again.')
      } else {
        // Unlocks PDF on 200, 409 (already registered), 503 (fallback saved), or upstream hiccups
        setStatus('success')
        triggerDownload()
        triggerToast('Starter Kit Unlocked', 'Your Cabin Crew Starter Kit PDF download has started.')
      }
    } catch {
      // In case of client network disconnect, still allow access
      setStatus('success')
      triggerDownload()
      triggerToast('Starter Kit Unlocked', 'Your Cabin Crew Starter Kit PDF download has started.')
    }
  }

  return (
    <section
      id="starter-kit"
      aria-labelledby="starter-kit-heading"
      style={{
        marginTop: '3.5rem',
        marginBottom: '2.5rem',
        background: '#ffffff',
        border: '1px solid rgba(0, 39, 76, 0.1)',
        borderTop: '4px solid #DB241E',
        borderRadius: '8px',
        boxShadow: '0 8px 30px rgba(0, 39, 76, 0.04)',
        padding: 'clamp(1.5rem, 4vw, 2.75rem)',
      }}
    >
      {/* Header Copy */}
      <div style={{ maxWidth: '780px', marginBottom: '2rem' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-h)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#DB241E',
            fontWeight: 800,
            background: 'rgba(219,36,30,0.06)',
            padding: '0.3rem 0.75rem',
            borderRadius: '2px',
            marginBottom: '0.75rem',
          }}
        >
          📖 Day 1 Trainee Manual · Free Download
        </span>
        <h2
          id="starter-kit-heading"
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            color: 'var(--navy)',
            lineHeight: 1.2,
            margin: '0 0 0.75rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          See What You'll Actually Learn
        </h2>
        <p
          style={{
            fontSize: '0.98rem',
            color: 'rgba(0, 39, 76, 0.75)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Get a free preview from the same manual our cabin crew trainees study on Day 1 — aviation terms, the phonetic alphabet, and more.
        </p>
      </div>

      {/* 4-Card Teaser Preview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: 'rgba(0, 39, 76, 0.02)',
            border: '1px solid rgba(0, 39, 76, 0.08)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📘</span>
            <h4
              style={{
                fontFamily: 'var(--font-h)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Aviation Glossary
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: 1.55, margin: 0 }}>
            Master airline terminology from day one: <strong>Aft</strong>, <strong>Galley</strong>, <strong>Bulkhead</strong>, <strong>Crosscheck</strong>, <strong>Sterile Cockpit</strong>, and Zulu time protocols.
          </p>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: 'rgba(0, 39, 76, 0.02)',
            border: '1px solid rgba(0, 39, 76, 0.08)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🔤</span>
            <h4
              style={{
                fontFamily: 'var(--font-h)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Phonetic Alphabet
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: 1.55, margin: 0 }}>
            The complete ICAO radio alphabet (Alpha through Zulu) plus cabin crew public announcement (PA) voice pitch and pacing guidelines.
          </p>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: 'rgba(0, 39, 76, 0.02)',
            border: '1px solid rgba(0, 39, 76, 0.08)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>✈️</span>
            <h4
              style={{
                fontFamily: 'var(--font-h)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Indian Aviation
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: 1.55, margin: 0 }}>
            A concise timeline from J.R.D. Tata's maiden 1932 Karachi–Bombay flight to India becoming the world's 3rd largest civil aviation market.
          </p>
        </div>

        {/* Card 4 */}
        <div
          style={{
            background: 'rgba(0, 39, 76, 0.02)',
            border: '1px solid rgba(0, 39, 76, 0.08)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: '4px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📋</span>
            <h4
              style={{
                fontFamily: 'var(--font-h)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Full Manual Scope
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: 1.55, margin: 0 }}>
            Curriculum overview: Emergency Evacuation Drills, In-Flight First Aid & CPR, Luxury Hospitality, Grooming, and Airline GD/PI Mock Rounds.
          </p>
        </div>
      </div>

      {/* Gated Download Form / Success State */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 39, 76, 0.04) 0%, rgba(219, 36, 30, 0.03) 100%)',
          border: '1px solid rgba(0, 39, 76, 0.12)',
          borderRadius: '6px',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
        }}
      >
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                fontSize: '1.5rem',
                fontWeight: 800,
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-h)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--navy)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: '0 0 0.5rem 0',
              }}
            >
              Starter Kit Download Started!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.7)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Your Cabin Crew Starter Kit PDF has been downloaded. Our admissions team will also reach out to assist you with scholarship assessment and batch schedules.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={triggerDownload}
                className="btn btn-outline"
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.65rem 1.25rem',
                  cursor: 'pointer',
                }}
              >
                📥 Download PDF Again
              </button>
              <a
                href="#enroll-form"
                className="btn btn-primary"
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.65rem 1.25rem',
                  textDecoration: 'none',
                }}
              >
                Check Batch 1 Scholarships →
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Honeypot />
            <div style={{ marginBottom: '1.25rem' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: '0 0 0.25rem 0',
                }}
              >
                Get Instant Access to the Starter Kit
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', margin: 0 }}>
                Enter your details below to instantly download the PDF. Hosted directly on our site.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                alignItems: 'start',
              }}
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="sk-name"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--navy)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Full Name *
                </label>
                <input
                  id="sk-name"
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.85rem',
                    borderRadius: '4px',
                    border: errors.name ? '1px solid #DB241E' : '1px solid rgba(0, 39, 76, 0.2)',
                    background: '#ffffff',
                    color: 'var(--navy)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.name ? (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#DB241E', marginTop: '0.25rem' }}>
                    {errors.name}
                  </span>
                ) : null}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="sk-phone"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--navy)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Mobile Number *
                </label>
                <input
                  id="sk-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.85rem',
                    borderRadius: '4px',
                    border: errors.phone ? '1px solid #DB241E' : '1px solid rgba(0, 39, 76, 0.2)',
                    background: '#ffffff',
                    color: 'var(--navy)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.phone ? (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#DB241E', marginTop: '0.25rem' }}>
                    {errors.phone}
                  </span>
                ) : null}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="sk-email"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--navy)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Email Address *
                </label>
                <input
                  id="sk-email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.85rem',
                    borderRadius: '4px',
                    border: errors.email ? '1px solid #DB241E' : '1px solid rgba(0, 39, 76, 0.2)',
                    background: '#ffffff',
                    color: 'var(--navy)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.email ? (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#DB241E', marginTop: '0.25rem' }}>
                    {errors.email}
                  </span>
                ) : null}
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: 'auto' }}>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-h)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #DB241E 0%, #B31915 100%)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(219,36,30,0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                >
                  {status === 'loading' ? (
                    'Preparing Download...'
                  ) : (
                    <>
                      <span>Download Free Preview</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(0, 39, 76, 0.45)', margin: '0.85rem 0 0 0' }}>
              🔒 Privacy guaranteed. Your contact details are only used to send study material and course information.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
