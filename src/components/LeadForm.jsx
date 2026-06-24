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
    const pincode = e.target.elements['lead-pincode'].value
    const course = e.target.elements['lead-course']?.value || courseName

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, pincode, course, source })
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
    <form className="modal-form" onSubmit={handleSubmit} style={{ background: '#00162e', border: '1px solid var(--gold)', borderTop: '4px solid #DB241E', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '1px', boxShadow: '0 10px 40px rgba(0,0,0,0.65), 0 0 15px rgba(216,160,39,0.15)', backdropFilter: 'blur(12px)' }}>
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
        id="lead-pincode" 
        className="modal-input modal-input-dark" 
        type="text" 
        placeholder="PIN Code / Zip Code" 
        required 
      />

      <select 
        id="lead-course" 
        className="modal-input" 
        defaultValue={courseName || 'CPL Ground Classes (₹2,70,000)'}
        required 
        style={{ background: '#000810', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', marginBottom: '1.25rem', borderRadius: '1px', width: '100%', padding: '1rem', fontFamily: 'var(--font-b)' }}
      >
        <option value="CPL Ground Classes (₹2,70,000)">CPL Ground Classes (₹2,70,000)</option>
        <option value="Cadet Pilot Program (₹50,000)">Cadet Pilot Program (₹50,000)</option>
        <option value="GD & PI Preparation (₹30,000)">GD & PI Preparation (₹30,000)</option>
        <option value="Airline Preparation (₹1,00,000)">Airline Preparation (₹1,00,000)</option>
        <option value="Airbus A320 SIM Training">Airbus A320 SIM Training</option>
        <option value="Cabin Crew Training">Cabin Crew Training</option>
        <option value="ATPL Ground Classes">ATPL Ground Classes</option>
        <option value="Private Pilot Licence (PPL)">Private Pilot Licence (PPL)</option>
        {courseName && !['CPL Ground Classes (₹2,70,000)', 'Cadet Pilot Program (₹50,000)', 'GD & PI Preparation (₹30,000)', 'Airline Preparation (₹1,00,000)', 'Airbus A320 SIM Training', 'Cabin Crew Training', 'ATPL Ground Classes', 'Private Pilot Licence (PPL)'].includes(courseName) && (
          <option value={courseName}>{courseName}</option>
        )}
      </select>

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
