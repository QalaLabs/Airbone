'use client'

import { useState } from 'react'
import Modal from '@/components/Modal'

export default function CabinCrewStarterKitTeaser() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section className="cabin-starter-kit-teaser" style={{ margin: '4rem 0 2rem 0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 39, 76, 0.04) 0%, rgba(216, 160, 39, 0.06) 100%)',
            border: '1px solid rgba(0, 39, 76, 0.1)',
            borderRadius: '12px',
            padding: 'clamp(2rem, 4vw, 3rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ maxWidth: '640px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-h)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--red)',
                  background: 'rgba(219, 36, 30, 0.08)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  marginBottom: '0.75rem',
                }}
              >
                📥 Free Career Guide &amp; Checklist
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  textTransform: 'uppercase',
                  margin: '0.25rem 0 0.75rem 0',
                  lineHeight: '1.2',
                }}
              >
                Download: Cabin Crew Starter Kit
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-b)',
                  fontSize: '0.95rem',
                  color: 'rgba(0, 39, 76, 0.75)',
                  lineHeight: '1.7',
                  margin: 0,
                }}
              >
                Everything you need to prepare for airline recruitment drives — includes eligibility criteria &amp; BMI charts, airline grooming benchmarks, GD &amp; PI interview questions, and starting salary expectations across IndiGo, Air India, Emirates, and Qatar Airways.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="reserve-seat-btn"
                id="btn-open-starter-kit-modal"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  padding: '0.9rem 1.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  borderRadius: '6px',
                  background: 'var(--red)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(219, 36, 30, 0.25)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <span>Download Starter Kit</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick value bullets */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(0, 39, 76, 0.08)',
            }}
          >
            {[
              { icon: '📋', text: 'Height & BMI Eligibility Matrix' },
              { icon: '💄', text: 'Aviation Grooming & Dress Code' },
              { icon: '💬', text: '50 Common GD / PI Questions' },
              { icon: '✈️', text: 'Domestic vs. Gulf Pay Scales' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gated Modal for Starter Kit Download */}
      <Modal
        type="starter-kit"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        downloadUrl="/assets/downloads/cabin-crew-starter-kit.pdf"
        course="Cabin Crew Training"
        title="Download: Cabin Crew Starter Kit"
        subtitle="Please enter your details below. Your PDF download will start immediately upon submit."
      />
    </>
  )
}
