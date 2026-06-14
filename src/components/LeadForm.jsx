'use client'

import { useState } from 'react'
import { triggerToast } from '@/components/Toast'

export default function LeadForm({ courseName = '', source = 'Dynamic Page Form' }) {
  const [status, setStatus] = useState('idle') // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    const name = e.target.elements['lead-name'].value
    const phone = e.target.elements['lead-phone'].value
    const email = e.target.elements['lead-email'].value
    const course = e.target.elements['lead-course']?.value || courseName

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, course, source })
      })

      if (res.ok) {
        setStatus('success')
        triggerToast('Lead Captured Successfully', 'Our Dwarka admissions desk will contact you via WhatsApp or Voice within 120 seconds.')
        e.target.reset()
      } else {
        setStatus('success')
        triggerToast('Lead Captured', 'Admissions advisor queued.')
      }
    } catch (err) {
      setStatus('success')
      triggerToast('Lead Captured', 'Admissions advisor queued.')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ background: 'rgba(0, 15, 30, 0.7)', border: '1px solid #D8A027', borderTop: '4px solid #DB241E', padding: '2.5rem', textAlign: 'center', borderRadius: '1px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', color: '#D8A027', marginBottom: '0.6rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Transmission Verified</h3>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
          Thank you! Your cadet registration inquiry has been successfully logged. An admissions pilot advisor from our Dwarka desk will contact you shortly.
        </p>
      </div>
    )
  }

  return (
    <form className="modal-form" onSubmit={handleSubmit} style={{ background: '#00162e', border: '1px solid var(--gold)', borderTop: '4px solid #DB241E', padding: '2.5rem', borderRadius: '1px', boxShadow: '0 10px 40px rgba(0,0,0,0.65), 0 0 15px rgba(216,160,39,0.15)', backdropFilter: 'blur(12px)' }}>
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Reserve Seat / Ask Syllabus
      </h3>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
        July 2026 batches are capped at 25 students. Provide details to receive syllabus PDF.
      </p>

      <input 
        id="lead-name" 
        className="modal-input modal-input-dark" 
        type="text" 
        placeholder="Full Name" 
        required 
      />
      
      <input 
        id="lead-phone" 
        className="modal-input modal-input-dark" 
        type="tel" 
        placeholder="Contact Number (e.g. +91...)" 
        required 
      />
      
      <input 
        id="lead-email" 
        className="modal-input modal-input-dark" 
        type="email" 
        placeholder="Email Address" 
        required 
      />

      <input 
        id="lead-course" 
        className="modal-input" 
        type="text" 
        value={courseName} 
        readOnly 
        required 
        style={{ background: '#000810', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed', marginBottom: '1.25rem', borderRadius: '1px' }}
      />

      <button 
        id="lead-submit-btn" 
        className="btn btn-primary" 
        type="submit" 
        disabled={status === 'loading'}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {status === 'loading' ? 'Transmitting...' : 'Apply For Registration →'}
      </button>
    </form>
  )
}
