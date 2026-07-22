'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MAPS_URL = 'https://maps.app.goo.gl/1CrvhRumCLtog8VL8'
const MAPS_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=28.5845678,77.0716207&destination_place_id=0x390d1b3d46bcd1c7:0x53f77b8485d61bbe'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Step-by-step guide to becoming a pilot after Class 12', href: '/blog/how-to-become-pilot-india' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

const PROGRAMS = [
  { label: 'DGCA Ground Classes',     href: '/courses/commercial-pilot-license-cpl' },
  { label: 'ATPL Ground School',       href: '/courses/atpl' },
  { label: 'Cadet Pilot Program',      href: '/courses/cadet-preparation' },
  { label: 'Airline Preparation',      href: '/courses/airline-preparation' },
  { label: 'A320 SIM Training',        href: '/courses/a320-simulator' },
  { label: 'CAS / Compass / ADAPT',    href: '/courses/cas-compass-adapt' },
  { label: 'CPL Flying Training',      href: '/courses/flying-training-india-abroad' },
  { label: 'Cabin Crew Training',      href: '/courses/cabin-crew-training' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/airborneaviationacademy', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
  { label: 'Instagram', href: 'https://instagram.com/airborneaviationacademy', icon: 'M17.34 5.46a1.2 1.2 0 10-.05 2.4 1.2 1.2 0 00.05-2.4M12 7.92A4.08 4.08 0 007.92 12 4.08 4.08 0 0012 16.08 4.08 4.08 0 0016.08 12 4.08 4.08 0 0012 7.92M12 4a8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { label: 'LinkedIn', href: '#', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
  { label: 'YouTube', href: 'https://youtube.com/@airborneaviationacademy', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
]

const CONTACT_INFO = [
  { icon: '\u{1F4DE}', label: 'Phone', href: 'tel:+919953777320', value: '+91 9953 777 320' },
  { icon: '\u{1F4AC}', label: 'WhatsApp', href: 'https://wa.me/919953777320', value: '+91 9953 777 320' },
  { icon: '\u2709', label: 'Email', href: 'mailto:info@airborneaviation.in', value: 'info@airborneaviation.in' },
  { icon: '\u{1F558}', label: 'Office Hours', value: 'Monday to Saturday, 9:30 AM \u2013 6:00 PM (Closed on Sundays)' },
]

export default function PremiumFooter({ onBookDemo }) {
  const pathname = usePathname()
  const handleBook = onBookDemo ?? (() => { window.location.href = '/contact' })

  return (
    <footer className="pf-root" aria-label="Site footer">

      {/* ── SECTION 1: Conversion block ── */}
      <div className="pf-cta-block">
        <div className="pf-cta-glow" aria-hidden="true" />
        <div className="pf-inner pf-cta-inner">
          <div className="pf-cta-eyebrow">
            <span className="pf-red-line" />
            <span className="pf-eyebrow-text">ADMISSIONS OPEN \u00B7 JULY 2026 BATCH</span>
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
            <a href="tel:+919953777320" className="pf-btn pf-btn-outline" aria-label="Call Airborne Aviation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pf-btn-icon">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.43 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.22z"/>
              </svg>
              Call Now
            </a>
            <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" className="pf-btn pf-btn-whatsapp" aria-label="WhatsApp Airborne Aviation">
              <svg viewBox="0 0 24 24" fill="currentColor" className="pf-btn-icon">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <button onClick={handleBook} className="pf-btn pf-btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pf-btn-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Enrol Now
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Trust strip ── */}
      <div className="pf-trust-strip">
        <div className="pf-inner">
          <div className="pf-trust-grid">
            {[
              { stat: '2,500+', label: 'Students Trained' },
              { stat: '15+',    label: 'Years Experience' },
              { stat: 'DGCA',   label: 'Focused Training' },
              { stat: '25',     label: 'Max Batch Size' },
            ].map((t, i) => (
              <div key={i} className="pf-trust-item">
                <div className="pf-trust-stat">{t.stat}</div>
                <div className="pf-trust-label">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Links grid ── */}
      <div className="pf-links-section">
        <div className="pf-inner pf-links-grid">

          {/* Brand + Social */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <img
                src="/logo-white.webp"
                alt="Airborne Aviation Academy"
                style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.45)', maxWidth: '240px', margin: '0 0 1.5rem' }}>
              Building pilots. Building futures.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="pf-social-link"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="pf-col-title">Quick Links</h3>
            <ul className="pf-link-list">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`pf-link${pathname === l.href ? ' pf-link-active' : ''}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="pf-col-title">Programs</h3>
            <ul className="pf-link-list">
              {PROGRAMS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`pf-link${pathname === l.href ? ' pf-link-active' : ''}`}
                  >
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
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="pf-contact-item">
                  <span className="pf-contact-icon" aria-hidden="true">{item.icon}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') && !item.href.startsWith('tel:') && !item.href.startsWith('mailto:') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') && !item.href.startsWith('tel:') && !item.href.startsWith('mailto:') ? 'noopener noreferrer' : undefined}
                      className="pf-link"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              ))}
              <div className="pf-contact-item">
                <span className="pf-contact-icon" aria-hidden="true">{'\u{1F4CD}'}</span>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-link pf-link-address"
                  aria-label="Open Airborne Aviation location in Google Maps"
                >
                  E-549, 2nd Floor, Ramphal Chowk,<br />Sector 7, Dwarka, New Delhi - 110075
                </a>
              </div>
              <div className="pf-contact-item" style={{ marginTop: '0.25rem' }}>
                <a
                  href={MAPS_DIRECTIONS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-link pf-get-directions"
                  aria-label="Get directions to Airborne Aviation Academy"
                >
                  {'\u{1F4CD}'} Get Directions
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 4: Wordmark ── */}
      <div className="pf-wordmark-section" aria-hidden="true">
        <div className="pf-wordmark-wrap">
          <img
            src="/logo-white.webp"
            alt="Airborne Aviation Academy"
            style={{ height: '120px', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>

      {/* ── SECTION 5: Bottom bar ── */}
      <div className="pf-bottom-bar">
        <div className="pf-inner pf-bottom-inner">
          <div className="pf-bottom-copy">
            {'\u00A9'} {new Date().getFullYear()} Airborne Aviation Private Limited
            <span className="pf-bottom-sep">{'\u00B7'}</span>
            All Rights Reserved.
            <span className="pf-bottom-sep">{'\u00B7'}</span>
            <span style={{ whiteSpace: 'nowrap' }}>CIN: U85306DL2026PTC465670</span>
          </div>
          <div className="pf-bottom-links">
            <a href="/privacy" className="pf-bottom-link">Privacy Policy</a>
            <a href="/refund-policy" className="pf-bottom-link">Refund Policy</a>
            <a href="/terms" className="pf-bottom-link">Terms &amp; Conditions</a>
            <span className="pf-dgca-badge">DGCA Ground Standards Compliant</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
