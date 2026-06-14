import { useState, useEffect } from 'react'

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

export default function Modal({ type = 'demo', isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', course: '', message: '',
  })

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (!isOpen) setSubmitted(false)
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would POST to the lead API / n8n webhook
    setSubmitted(true)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isDemo = type === 'demo'

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={isDemo ? 'Book Free Demo Class' : 'Apply Now'}
    >
      <div className="modal">
        {/* Close */}
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {submitted ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: 64, height: 64,
              background: 'rgba(219,36,30,0.12)',
              border: '2px solid var(--red)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.75rem',
            }}>
              ✓
            </div>
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
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--label-size)', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Or call us directly
              </p>
              <a href="tel:+919953777320" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 900, color: 'var(--white)', textDecoration: 'none' }}>
                +91 9953-777-320
              </a>
            </div>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-name">Full Name *</label>
                  <input
                    id="modal-name"
                    name="name"
                    className="form-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-phone">Phone Number *</label>
                  <input
                    id="modal-phone"
                    name="phone"
                    className="form-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-email">Email Address</label>
                <input
                  id="modal-email"
                  name="email"
                  className="form-input"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-course">Course of Interest *</label>
                <select
                  id="modal-course"
                  name="course"
                  className="form-select"
                  value={form.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a program</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {!isDemo && (
                <div className="form-group">
                  <label className="form-label" htmlFor="modal-message">Your Aviation Background</label>
                  <input
                    id="modal-message"
                    name="message"
                    className="form-input"
                    placeholder="e.g. Student pilot, no experience, cleared ATPL..."
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                id={isDemo ? 'submit-demo-form' : 'submit-apply-form'}
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              >
                {isDemo ? 'Book My Free Demo →' : 'Submit Application →'}
              </button>

              <p className="form-legal">
                By submitting, you consent to being contacted by Airborne Aviation Academy
                regarding your inquiry. Airborne Aviation Pvt. Ltd. · CIN: U85306DL2026PTC465670
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
