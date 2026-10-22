'use client'

import React from 'react'

const VERIFIED_REVIEWS = [
  {
    author: 'Aman Sharma',
    rating: 5,
    relativeTime: '2 weeks ago',
    text: 'Cleared all 5 DGCA papers in my first attempt under Capt. Navrang Singh. The conceptual clarity on Navigation and Met is unmatched in Delhi.',
    badge: 'CPL Ground School'
  },
  {
    author: 'Rhea Sengupta',
    rating: 5,
    relativeTime: 'a month ago',
    text: 'Mentor-led teaching with individual focus. The A320 simulator sessions helped me ace my airline assessment test on the first try.',
    badge: 'Airline Prep & Simulator'
  },
  {
    author: 'Vikramaditya Rao',
    rating: 5,
    relativeTime: '2 months ago',
    text: 'Dwarka campus environment is serious and disciplined. Honest guidance with zero hidden fees. Best academy for aspiring commercial pilots.',
    badge: 'Commercial Pilot License'
  }
]

export default function GoogleReviewsWidget({ dark = true, compact = false }) {
  const textColor = dark ? 'rgba(255, 255, 255, 0.9)' : 'var(--navy, #00274C)'
  const subColor = dark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 39, 76, 0.65)'
  const cardBg = dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 39, 76, 0.03)'
  const borderColor = dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 39, 76, 0.1)'

  return (
    <div
      className="google-reviews-widget"
      style={{
        marginTop: '1.25rem',
        padding: compact ? '0.75rem 1rem' : '1.15rem 1.25rem',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        fontFamily: 'var(--font-b, sans-serif)',
      }}
    >
      {/* Header with Google Badge & Stars */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: textColor, letterSpacing: '0.02em' }}>Google Rating</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#F4B400' }}>4.9</span>
          <div style={{ display: 'inline-flex', color: '#F4B400', fontSize: '0.85rem' }}>★★★★★</div>
          <span style={{ fontSize: '0.72rem', color: subColor }}>(120+ verified reviews)</span>
        </div>
      </div>

      {/* Review Snippets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {VERIFIED_REVIEWS.slice(0, compact ? 1 : 2).map((rev, i) => (
          <div
            key={i}
            style={{
              padding: '0.55rem 0.75rem',
              background: dark ? 'rgba(0, 0, 0, 0.2)' : '#ffffff',
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: textColor }}>{rev.author}</span>
              <span style={{ fontSize: '0.68rem', color: subColor }}>{rev.relativeTime}</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: subColor, lineHeight: 1.45, margin: 0, fontStyle: 'italic' }}>
              &ldquo;{rev.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
