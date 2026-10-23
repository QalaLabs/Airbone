'use client'

import React from 'react'
import Link from 'next/link'
import { safeMediaSrc, safeHref } from '@/lib/cms/safeContent'

/**
 * Renders modular page sections created in Pages CMS (.pages.yml)
 * Supports dynamic operational data hydration (fees, live forms, etc.)
 */
export default function ModularSectionRenderer({ sections }) {
  if (!Array.isArray(sections) || sections.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2.5rem' }}>
      {sections.map((section, idx) => {
        const type = section._template || section.type || 'unknown'
        const key = section.id || `section-${type}-${idx}`

        switch (type) {
          case 'hero':
            return <HeroBlock key={key} data={section} />
          case 'features':
            return <FeaturesBlock key={key} data={section} />
          case 'faq':
            return <FaqBlock key={key} data={section} />
          case 'stats':
            return <StatsBlock key={key} data={section} />
          case 'cta_banner':
            return <CtaBannerBlock key={key} data={section} />
          case 'lead_magnet':
            return <LeadMagnetBlock key={key} data={section} />
          case 'rich_text':
            return <RichTextBlock key={key} data={section} />
          default:
            return null
        }
      })}
    </div>
  )
}

function HeroBlock({ data }) {
  const bg = safeMediaSrc(data.backgroundImage)
  return (
    <section
      style={{
        background: bg ? `linear-gradient(rgba(0,39,76,0.85), rgba(0,39,76,0.9)), url(${bg})` : 'var(--navy)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        borderRadius: '8px',
        padding: 'clamp(2rem, 5vw, 4rem)',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,39,76,0.12)',
      }}
    >
      {data.badge ? (
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-h)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            background: 'rgba(216,160,39,0.15)',
            border: '1px solid rgba(216,160,39,0.3)',
            padding: '0.35rem 0.85rem',
            borderRadius: '2px',
            marginBottom: '1rem',
          }}
        >
          {data.badge}
        </span>
      ) : null}
      <h2
        style={{
          fontFamily: 'var(--font-h)',
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          margin: '0 0 1rem 0',
          textTransform: 'uppercase',
        }}
      >
        {data.heading}
      </h2>
      {data.subheading ? (
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '680px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
          {data.subheading}
        </p>
      ) : null}
      {data.ctaText && data.ctaLink ? (
        <a
          href={safeHref(data.ctaLink) || '#'}
          className="btn btn-primary"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-h)',
            fontWeight: 800,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0.85rem 2rem',
          }}
        >
          {data.ctaText}
        </a>
      ) : null}
    </section>
  )
}

function FeaturesBlock({ data }) {
  const items = Array.isArray(data.items) ? data.items : []
  return (
    <section>
      {data.title ? (
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
            {data.title}
          </h3>
          {data.subtitle ? <p style={{ fontSize: '0.9rem', color: 'rgba(0,39,76,0.65)', margin: 0 }}>{data.subtitle}</p> : null}
        </div>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,39,76,0.08)',
              borderTop: '3px solid var(--red)',
              borderRadius: '6px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,39,76,0.02)',
            }}
          >
            {item.icon ? <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div> : null}
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
              {item.title}
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'rgba(0,39,76,0.65)', lineHeight: 1.6, margin: 0 }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FaqBlock({ data }) {
  const [openIdx, setOpenIdx] = React.useState(null)
  const items = Array.isArray(data.items) ? data.items : []

  return (
    <section style={{ background: '#ffffff', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '6px', padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
      {data.title ? (
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
          {data.title}
        </h3>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} style={{ borderBottom: '1px solid rgba(0,39,76,0.08)', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-h)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--navy)',
                }}
              >
                <span>{item.question}</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--red)', marginLeft: '1rem' }}>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? (
                <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', lineHeight: 1.65, margin: '0.5rem 0 0 0' }}>
                  {item.answer}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function StatsBlock({ data }) {
  const items = Array.isArray(data.items) ? data.items : []
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center' }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'rgba(0,39,76,0.02)', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '4px', padding: '1.25rem 1rem' }}>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--red)' }}>{item.value}</div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-h)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--navy)', marginTop: '0.25rem' }}>
            {item.label}
          </div>
        </div>
      ))}
    </section>
  )
}

function CtaBannerBlock({ data }) {
  return (
    <section style={{ background: 'linear-gradient(135deg, #00274C 0%, #001A33 100%)', color: '#ffffff', borderRadius: '6px', padding: '2.5rem', textAlign: 'center' }}>
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 0.75rem 0' }}>
        {data.title}
      </h3>
      {data.description ? <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', maxWidth: '580px', margin: '0 auto 1.5rem auto' }}>{data.description}</p> : null}
      {data.buttonText && data.buttonLink ? (
        <a href={safeHref(data.buttonLink) || '#'} className="btn btn-primary" style={{ padding: '0.75rem 2rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          {data.buttonText}
        </a>
      ) : null}
    </section>
  )
}

function LeadMagnetBlock({ data }) {
  return (
    <section style={{ background: 'rgba(219,36,30,0.03)', border: '1px solid rgba(219,36,30,0.2)', borderLeft: '4px solid var(--red)', borderRadius: '4px', padding: '1.75rem' }}>
      <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
        {data.heading || 'Download Resource Guide'}
      </h4>
      {data.description ? <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', margin: '0 0 1.25rem 0' }}>{data.description}</p> : null}
      <a href={safeHref(data.downloadFile) || '#'} className="btn btn-outline" style={{ padding: '0.65rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
        📥 {data.buttonText || 'Download Free PDF'}
      </a>
    </section>
  )
}

function RichTextBlock({ data }) {
  return (
    <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(0,39,76,0.8)' }}>
      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{data.content}</p>
    </div>
  )
}
