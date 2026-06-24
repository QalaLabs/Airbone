'use client'
import Link from 'next/link'

/**
 * CoursePageFooter — shared bottom section injected into every course page.
 *
 * Props:
 *   whatsappText  {string}  Pre-filled WhatsApp message (URL-encoded)
 *   relatedCourses {Array}  [{label, href, note}]  — max 4 items
 *   nextCourses    {Array}  [{label, href, note}]  — "Recommended Next" section (optional)
 */
export default function CoursePageFooter({
  whatsappText = 'Hi, I want to know more about your aviation courses.',
  relatedCourses = [],
  nextCourses = [],
}) {
  const waHref = `https://wa.me/919953777320?text=${encodeURIComponent(whatsappText)}`

  const sectionH2Style = {
    fontFamily: 'var(--font-h)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#D8A027',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
  }

  const dividerStyle = {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '2.5rem',
  }

  return (
    <>
      {/* ── WhatsApp CTA ─────────────────────────────────── */}
      <div style={dividerStyle}>
        <div style={{
          background: 'rgba(37,211,102,0.06)',
          border: '1px solid rgba(37,211,102,0.2)',
          borderRadius: '6px',
          padding: '1.75rem 2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.8rem', color: 'rgba(37,211,102,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Prefer WhatsApp?
            </div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              Message us — response within 2 minutes
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
              +91 9953 777 320 · Dwarka Admissions
            </div>
          </div>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#25D366',
              color: '#fff',
              fontFamily: 'var(--font-h)',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '0.85rem 1.75rem',
              borderRadius: '3px',
              flexShrink: 0,
            }}
          >
            {/* WhatsApp SVG */}
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1.1rem', height: '1.1rem' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp Us Now
          </a>
        </div>
      </div>

      {/* ── Contact / Visit Us ───────────────────────────── */}
      <div style={dividerStyle}>
        <h2 style={sectionH2Style}>Talk to Our Admissions Team</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {[
            {
              icon: '📞',
              label: 'Call Us',
              value: '+91 9953 777 320',
              href: 'tel:+919953777320',
            },
            {
              icon: '✉️',
              label: 'Email',
              value: 'info@airborneaviation.in',
              href: 'mailto:info@airborneaviation.in',
            },
            {
              icon: '📍',
              label: 'Visit — Dwarka',
              value: 'E-549, Ramphal Chowk, Sector 7, Dwarka, Delhi 110075',
              href: 'https://maps.google.com/?q=Airborne+Aviation+Academy+Dwarka+Delhi',
            },
            {
              icon: '💬',
              label: 'Contact Page',
              value: 'Send a detailed enquiry →',
              href: '/contact',
            },
          ].map((c, i) => (
            <a
              key={i}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                background: '#00162e',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '1.25rem',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(216,160,39,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-h)', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D8A027', marginBottom: '0.3rem' }}>{c.label}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.4' }}>{c.value}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Recommended Next Courses ─────────────────────── */}
      {nextCourses.length > 0 && (
        <div style={dividerStyle}>
          <h2 style={sectionH2Style}>Recommended Next — Your Learning Path</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {nextCourses.map((c, i) => (
              <Link
                key={i}
                href={c.href}
                style={{
                  background: '#00162e',
                  border: '1px solid rgba(216,160,39,0.15)',
                  borderLeft: '3px solid #D8A027',
                  padding: '1.25rem 1.5rem',
                  textDecoration: 'none',
                  display: 'block',
                  borderRadius: '2px',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(216,160,39,0.4)'; e.currentTarget.style.background = 'rgba(216,160,39,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(216,160,39,0.15)'; e.currentTarget.style.background = '#00162e' }}
              >
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-h)', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D8A027', marginBottom: '0.3rem' }}>
                  Next Step
                </div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: c.note ? '0.35rem' : 0 }}>{c.label}</div>
                {c.note && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.4' }}>{c.note}</div>}
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', fontFamily: 'var(--font-h)', fontWeight: 700, color: '#D8A027', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  View Course →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Related Courses ──────────────────────────────── */}
      {relatedCourses.length > 0 && (
        <div style={dividerStyle}>
          <h2 style={sectionH2Style}>Related Courses</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {relatedCourses.map((c, i) => (
              <Link
                key={i}
                href={c.href}
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#D8A027'; e.currentTarget.style.borderColor = 'rgba(216,160,39,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Back link ────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem' }}>
        <Link
          href="/courses"
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          ← All Courses
        </Link>
      </div>
    </>
  )
}
