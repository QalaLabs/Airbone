'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StickyMobileCTA({ onBookDemo }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 400
      const footer = document.querySelector('footer')
      const cta = document.querySelector('#cta')
      const elementsToAvoid = [footer, cta].filter(Boolean)
      let nearBottom = false
      const viewportHeight = window.innerHeight
      for (const el of elementsToAvoid) {
        const rect = el.getBoundingClientRect()
        if (rect.top < viewportHeight - 60) { nearBottom = true; break }
      }
      setVisible(scrolled && !nearBottom)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleBook = onBookDemo ?? (() => {
    window.location.href = '/contact'
  })

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 800,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      background: '#000f1e',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
    }}
    className="sticky-mobile-cta"
    >
      <a
        href="tel:+919953777320"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.9rem 0.5rem', color: '#FFFFFF', textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'transparent' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, marginBottom: 4 }}>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.43 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.22z"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Call</span>
      </a>
      <a
        href="https://wa.me/919953777320"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.9rem 0.5rem', color: '#25D366', textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'transparent' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, marginBottom: 4 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>WhatsApp</span>
      </a>
      <button
        onClick={handleBook}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.9rem 0.5rem', color: '#FFFFFF', background: '#DB241E', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-h)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, marginBottom: 4 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Book Demo</span>
      </button>
    </div>
  )
}
