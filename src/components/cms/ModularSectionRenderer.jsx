'use client'

import React from 'react'
import { safeMediaSrc, safeHref } from '@/lib/cms/safeContent'

/**
 * Renders modular page sections created in Pages CMS (.pages.yml) and Airborne Studio.
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
          case 'heading':
            return <HeadingBlock key={key} data={section} />
          case 'text':
            return <TextBlock key={key} data={section} />
          case 'image':
            return <ImageBlock key={key} data={section} />
          case 'video':
            return <VideoBlock key={key} data={section} />
          case 'button':
            return <ButtonBlock key={key} data={section} />
          case 'spacer':
            return <SpacerBlock key={key} data={section} />
          case 'airline_logos':
            return <AirlineLogosBlock key={key} data={section} />
          case 'cadet_stages':
            return <CadetStagesBlock key={key} data={section} />
          case 'mentor_card':
            return <MentorCardBlock key={key} data={section} />
          case 'campus_walkthrough':
            return <CampusWalkthroughBlock key={key} data={section} />
          case 'pricing_table':
            return <PricingTableBlock key={key} data={section} />
          case 'whatsapp_cta':
            return <WhatsAppCtaBlock key={key} data={section} />
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

function HeadingBlock({ data }) {
  const level = Number(data.level || 2)
  const Tag = level === 1 ? 'h1' : level === 3 ? 'h3' : level === 4 ? 'h4' : 'h2'
  const textAlign = data.align || 'left'
  return (
    <Tag style={{ fontFamily: 'var(--font-h)', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', textAlign, margin: '0 0 0.5rem 0' }}>
      {data.content}
    </Tag>
  )
}

function TextBlock({ data }) {
  const textAlign = data.align || 'left'
  return (
    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(0,39,76,0.8)', textAlign, margin: 0 }}>
      {data.content}
    </p>
  )
}

function ImageBlock({ data }) {
  const src = safeMediaSrc(data.src)
  if (!src) return null
  return (
    <figure style={{ margin: '1rem 0' }}>
      <img
        src={src}
        alt={data.alt || 'Airborne Aviation'}
        style={{ width: '100%', maxHeight: '480px', objectFit: data.objectFit || 'cover', borderRadius: '8px' }}
      />
      {data.caption ? (
        <figcaption style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(0,39,76,0.6)', marginTop: '0.5rem' }}>
          {data.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

function VideoBlock({ data }) {
  const src = data.src || ''
  const embedUrl = src.includes('watch?v=') ? src.replace('watch?v=', 'embed/') : src
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
        <iframe
          src={embedUrl}
          title={data.title || 'Video Player'}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allowFullScreen
        />
      </div>
      {data.title ? <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', marginTop: '0.5rem', textAlign: 'center' }}>{data.title}</p> : null}
    </div>
  )
}

function ButtonBlock({ data }) {
  const isPrimary = (data.variant || 'primary') === 'primary'
  return (
    <div style={{ margin: '1rem 0' }}>
      <a
        href={safeHref(data.href) || '#'}
        className={isPrimary ? 'btn btn-primary' : 'btn btn-outline'}
        style={{ padding: '0.75rem 2rem', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800 }}
      >
        {data.label || 'Learn More'}
      </a>
    </div>
  )
}

function SpacerBlock({ data }) {
  const height = Number(data.height || 48)
  return (
    <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center' }}>
      {data.showLine ? <hr style={{ width: '100%', border: 0, borderTop: '1px solid rgba(0,39,76,0.1)' }} /> : null}
    </div>
  )
}

function AirlineLogosBlock({ data }) {
  const airlines = Array.isArray(data.airlines) ? data.airlines : []
  return (
    <section style={{ textAlign: 'center', padding: '1rem 0' }}>
      {data.heading ? (
        <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-h)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,39,76,0.6)', marginBottom: '1rem' }}>
          {data.heading}
        </p>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
        {airlines.map((al, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '6px', padding: '0.5rem 1rem', boxShadow: '0 2px 8px rgba(0,39,76,0.03)' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem', color: 'var(--red)', background: 'rgba(219,36,30,0.08)', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
              {al.code}
            </span>
            <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--navy)' }}>
              {al.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function CadetStagesBlock({ data }) {
  const stages = Array.isArray(data.stages) ? data.stages : []
  return (
    <section style={{ margin: '1.5rem 0' }}>
      {data.heading ? (
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.5rem' }}>
          {data.heading}
        </h3>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {stages.map((st, idx) => (
          <div key={idx} style={{ background: '#ffffff', border: '1px solid rgba(0,39,76,0.08)', borderTop: '3px solid var(--navy)', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,39,76,0.02)' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-h)', fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', background: 'rgba(219,36,30,0.08)', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>
              {st.stage}
            </span>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0.5rem 0 0.35rem 0' }}>
              {st.name}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.7)', lineHeight: 1.6, margin: 0 }}>
              {st.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function MentorCardBlock({ data }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '8px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
          🧑‍✈️
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: 0 }}>
            {data.name}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 700, margin: '0.2rem 0 0 0' }}>
            {data.role}
          </p>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', lineHeight: 1.65, margin: 0 }}>
        {data.bio}
      </p>
    </div>
  )
}

function CampusWalkthroughBlock({ data }) {
  const features = Array.isArray(data.features) ? data.features : []
  return (
    <div style={{ background: 'rgba(0,39,76,0.02)', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '8px', padding: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
        {data.title}
      </h3>
      {data.subtitle ? <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', margin: '0 0 1.25rem 0' }}>{data.subtitle}</p> : null}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {features.map((feat, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 600 }}>
            <span style={{ color: 'var(--red)', fontWeight: 800 }}>✓</span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PricingTableBlock({ data }) {
  const includes = Array.isArray(data.includes) ? data.includes : []
  return (
    <div style={{ background: '#ffffff', border: '2px solid rgba(0,39,76,0.08)', borderTop: '4px solid var(--red)', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
        {data.courseName}
      </h3>
      <div style={{ margin: '1rem 0' }}>
        <span style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--red)' }}>
          {data.scholarshipFee || data.regularFee}
        </span>
        {data.regularFee && data.scholarshipFee ? (
          <span style={{ textDecoration: 'line-through', color: 'rgba(0,39,76,0.4)', marginLeft: '0.5rem', fontSize: '1.1rem' }}>
            {data.regularFee}
          </span>
        ) : null}
      </div>
      <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.6)', margin: '0 0 1.5rem 0' }}>
        Batch Starts: {data.batchStarts} · Duration: {data.duration}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto 1.5rem auto', maxWidth: '400px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {includes.map((inc, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--navy)' }}>
            <span style={{ color: 'var(--red)', fontWeight: 800 }}>✓</span>
            <span>{inc}</span>
          </li>
        ))}
      </ul>
      <a href="#contact" className="btn btn-primary" style={{ padding: '0.75rem 2rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
        Enrol in Next Batch
      </a>
    </div>
  )
}

function WhatsAppCtaBlock({ data }) {
  const waUrl = `https://wa.me/${(data.phone || '919999123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(data.prefilledText || 'Hi, I would like to enquire about Airborne Aviation courses.')}`
  return (
    <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: 0 }}>
          {data.headline || 'Chat with Admissions on WhatsApp'}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.7)', margin: '0.25rem 0 0 0' }}>
          {data.subtext || 'Get instant answers about flight training and DGCA batches.'}
        </p>
      </div>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: '#ffffff', padding: '0.65rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}
      >
        💬 {data.buttonText || 'Chat Now'}
      </a>
    </div>
  )
}
