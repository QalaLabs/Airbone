'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

/* ─── Cursor-reveal SVG wordmark ─────────────────────────────── */
function AirborneWordmark() {
  const svgRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [maskPos, setMaskPos] = useState({ cx: '50%', cy: '50%' })

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    setMaskPos({
      cx: `${((e.clientX - r.left) / r.width) * 100}%`,
      cy: `${((e.clientY - r.top) / r.height) * 100}%`,
    })
  }, [])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1000 170"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      aria-hidden="true"
      style={{ display: 'block', userSelect: 'none', cursor: 'default' }}
    >
      <defs>
        <linearGradient id="pf-wm-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
          <stop offset="0%"   stopColor="#D8A027" />
          <stop offset="30%"  stopColor="#DB241E" />
          <stop offset="60%"  stopColor="#D8A027" />
          <stop offset="100%" stopColor="#DB241E" />
        </linearGradient>

        <motion.radialGradient
          id="pf-wm-reveal"
          gradientUnits="userSpaceOnUse"
          r="28%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPos}
          transition={{ duration: 0, ease: 'easeOut' }}
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="pf-wm-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pf-wm-reveal)" />
        </mask>
      </defs>

      {/* Base ghost outline */}
      <text
        x="500" y="138"
        textAnchor="middle"
        fontFamily="Montserrat, var(--font-h), sans-serif"
        fontWeight="900"
        fontSize="152"
        letterSpacing="-6"
        fill="transparent"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.8"
      >AIRBORNE</text>

      {/* Animated draw-on stroke */}
      <motion.text
        x="500" y="138"
        textAnchor="middle"
        fontFamily="Montserrat, var(--font-h), sans-serif"
        fontWeight="900"
        fontSize="152"
        letterSpacing="-6"
        fill="transparent"
        stroke="rgba(216,160,39,0.10)"
        strokeWidth="0.8"
        initial={{ strokeDashoffset: 6000, strokeDasharray: 6000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 6000 }}
        transition={{ duration: 4, ease: 'easeInOut', delay: 0.5 }}
      >AIRBORNE</motion.text>

      {/* Cursor-reveal gradient fill */}
      <text
        x="500" y="138"
        textAnchor="middle"
        fontFamily="Montserrat, var(--font-h), sans-serif"
        fontWeight="900"
        fontSize="152"
        letterSpacing="-6"
        fill="url(#pf-wm-grad)"
        stroke="transparent"
        mask="url(#pf-wm-mask)"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}
      >AIRBORNE</text>
    </svg>
  )
}

/* ─── Data ───────────────────────────────────────────────────── */
const PROGRAMS = [
  { label: 'CPL Ground School',         href: '/courses/commercial-pilot-license-cpl' },
  { label: 'ATPL Ground School',         href: '/courses/atpl' },
  { label: 'Cadet Preparation',          href: '/courses/cadet-preparation' },
  { label: 'A320 Simulator',             href: '/courses/a320-simulator' },
  { label: 'CAS Compass / ADAPT',        href: '/courses/cas-compass-adapt' },
  { label: 'Airline Preparation',        href: '/courses/airline-preparation' },
  { label: 'Flying Training',            href: '/courses/flying-training-india-abroad' },
  { label: 'Cabin Crew',                 href: '/courses/cabin-crew' },
]

const RESOURCES = [
  { label: 'How to Become a Pilot After 12th', href: '/blog/how-to-become-pilot-india' },
  { label: 'Pilot Salary Guide',              href: '/blog/pilot-salary-india' },
  { label: 'DGCA Exams Guide',               href: '/blog/dgca-ground-school-guide' },
  { label: 'Resources',                       href: '/resources' },
  { label: 'Jobs',                            href: '/jobs' },
  { label: 'FAQs',                            href: '/#faq' },
]

const TRUST = [
  { stat: '2,500+', label: 'Students Trained' },
  { stat: '15+',    label: 'Years Experience' },
  { stat: 'DGCA',   label: 'Focused Training' },
  { stat: '25',     label: 'Max Batch Size' },
]

/* ─── Main component ─────────────────────────────────────────── */
export default function PremiumFooter({ onBookDemo }) {
  const handleBook = onBookDemo ?? (() => {
    window.location.href = '/contact'
  })

  return (
    <footer className="pf-root" aria-label="Site footer">

      {/* ── SECTION 1: Conversion block ───────────────────────── */}
      <div className="pf-cta-block">
        {/* Background radial glow */}
        <div className="pf-cta-glow" aria-hidden="true" />

        <div className="pf-inner pf-cta-inner">
          <div className="pf-cta-eyebrow">
            <span className="pf-red-line" />
            <span className="pf-eyebrow-text">ADMISSIONS OPEN · JULY 2026 BATCH</span>
            <span className="pf-red-line" />
          </div>

          <h2 className="pf-cta-heading">
            Ready To Start Your<br />
            <span className="pf-cta-heading-gold">Aviation Journey?</span>
          </h2>

          <p className="pf-cta-sub">
            Speak with an aviation career counsellor and receive a personalised roadmap.
          </p>

          <div className="pf-cta-btns">
            <a
              href="tel:+919953777320"
              className="pf-btn pf-btn-outline"
              aria-label="Call Airborne Aviation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pf-btn-icon">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.43 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.22z"/>
              </svg>
              Call Now
            </a>

            <a
              href="https://wa.me/919953777320"
              target="_blank"
              rel="noopener noreferrer"
              className="pf-btn pf-btn-whatsapp"
              aria-label="WhatsApp Airborne Aviation"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="pf-btn-icon">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>

            <button
              onClick={handleBook}
              className="pf-btn pf-btn-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pf-btn-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Book Free Demo
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Trust strip ────────────────────────────── */}
      <div className="pf-trust-strip">
        <div className="pf-inner">
          <div className="pf-trust-grid">
            {TRUST.map((t, i) => (
              <div key={i} className="pf-trust-item">
                <div className="pf-trust-stat">{t.stat}</div>
                <div className="pf-trust-label">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Links grid ─────────────────────────────── */}
      <div className="pf-links-section">
        <div className="pf-inner pf-links-grid">

          {/* Programs */}
          <div>
            <h3 className="pf-col-title">Programs</h3>
            <ul className="pf-link-list">
              {PROGRAMS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="pf-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="pf-col-title">Resources</h3>
            <ul className="pf-link-list">
              {RESOURCES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="pf-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="pf-col-title">Contact</h3>
            <div className="pf-contact-list">
              <div className="pf-contact-item">
                <span className="pf-contact-icon">📍</span>
                <span>
                  E-549, 2nd Floor,<br />
                  Ramphal Chowk, Sector 7,<br />
                  Dwarka, New Delhi – 110075
                </span>
              </div>
              <div className="pf-contact-item">
                <span className="pf-contact-icon">📞</span>
                <a href="tel:+919953777320" className="pf-link">+91 9953 777 320</a>
              </div>
              <div className="pf-contact-item">
                <span className="pf-contact-icon">✉</span>
                <a href="mailto:info@airborneaviation.in" className="pf-link">info@airborneaviation.in</a>
              </div>
              <div className="pf-contact-item">
                <span className="pf-contact-icon">🕘</span>
                <span>Mon – Sat · 9:30 AM – 6:00 PM</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 4: Wordmark (desktop only) ───────────────── */}
      <div className="pf-wordmark-section" aria-hidden="true">
        <div className="pf-wordmark-wrap">
          <AirborneWordmark />
        </div>
        <p className="pf-wordmark-hint">Move cursor over wordmark</p>
      </div>

      {/* ── SECTION 5: Bottom bar ─────────────────────────────── */}
      <div className="pf-bottom-bar">
        <div className="pf-inner pf-bottom-inner">
          <div className="pf-bottom-copy">
            © {new Date().getFullYear()} Airborne Aviation Private Limited
            <span className="pf-bottom-sep">·</span>
            CIN: U85306DL2026PTC465670
          </div>
          <div className="pf-bottom-links">
            <a href="/about" className="pf-bottom-link">About</a>
            <a href="/contact" className="pf-bottom-link">Contact</a>
            <span className="pf-dgca-badge">DGCA Ground Standards Compliant</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
