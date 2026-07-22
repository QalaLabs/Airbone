'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

const PROGRAMS = [
  {
    id: 'cpl',
    title: 'Commercial Pilot License (CPL)',
    tag: 'Flying Training',
    desc: 'The CPL is the foundation of an airline career. Covers 200 flying hours, all DGCA ground school subjects, and placement support with partner airlines. Duration: 8–18 months.',
    price: '₹2,70,000',
    href: '/courses/commercial-pilot-license-cpl',
    accent: 'var(--red)',
  },
  {
    id: 'dgca-ground-school',
    title: 'DGCA Ground School',
    tag: 'Ground School',
    desc: 'Intensive ground school covering all DGCA CPL subjects: Air Navigation, Meteorology, Air Regulations, Technical General & Specific, and RTR(A). Taught by Capt. Navrang Singh personally.',
    price: '₹2,70,000',
    href: '/courses/ground-school',
    accent: 'var(--gold)',
  },
  {
    id: 'atpl',
    title: 'ATPL Ground School',
    tag: 'Ground School',
    desc: 'The highest pilot qualification. Our ATPL ground classes in Dwarka prepare CPL holders for DGCA ATPL exams and airline upgrade requirements.',
    price: '₹1,50,000',
    href: '/courses/atpl',
    accent: 'var(--gold)',
  },
  {
    id: 'airline-prep',
    title: 'Airline Preparation',
    tag: 'GD / PI',
    desc: 'Group discussions, panel interviews, and personal development masterclasses led by retired Air India AGM Rajeet Khalsa.',
    price: '₹1,00,000',
    href: '/courses/airline-preparation',
    accent: 'var(--red)',
  },
  {
    id: 'cas-compass',
    title: 'CAS Compass & ADAPT',
    tag: 'Aptitude Test',
    desc: 'Structured preparation for airline pilot aptitude test batteries — numerical, spatial, psychomotor, and multi-tasking.',
    price: '₹30,000',
    href: '/courses/cas-compass-adapt',
    accent: 'var(--gold)',
  },
  {
    id: 'cadet',
    title: 'Cadet Preparation',
    tag: 'Cadet Selection',
    desc: 'IndiGo, Air India, and Akasa cadet pilot program preparation. Aptitude tests, group discussions, and simulator screening.',
    price: '₹45,000',
    href: '/courses/cadet-preparation',
    accent: 'var(--red)',
  },
  {
    id: 'simulator',
    title: 'A320 Simulator',
    tag: 'Simulator',
    desc: 'In-house Airbus A320 FTD Level 5 simulator. Type rating familiarisation, emergency procedures, and airline SIM prep.',
    price: '₹10,000/hr',
    href: '/courses/a320-simulator',
    accent: 'var(--gold)',
  },
  {
    id: 'flying-guide',
    title: 'Flying Training Guide',
    tag: 'Guidance',
    desc: 'India vs abroad comparison, DGCA conversion guide, and personalised roadmap counselling for your flying training path.',
    price: 'Free',
    href: '/courses/flying-training-india-abroad',
    accent: 'var(--red)',
  },
  {
    id: 'cabin-crew',
    title: 'Cabin Crew Training',
    tag: 'Hospitality',
    desc: 'Three structured pathways for cabin crew aspirants led by ex-Alliance Air and retired Air India AGM trainers. From finishing batch (3 months, scholarship available) to full foundation (6 months).',
    price: '₹30,000',
    href: '/courses/cabin-crew-training',
    accent: 'var(--gold)',
  },
]

function ProgramCard({ program, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.location.href = program.href}
      style={{
        position: 'relative',
        background: hovered
          ? 'linear-gradient(135deg, var(--navy) 0%, #001a33 100%)'
          : '#ffffff',
        borderRadius: '1px',
        padding: 'clamp(1.5rem, 2.5vw, 2rem)',
        cursor: 'pointer',
        transition: 'background 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '240px',
        border: hovered
          ? '1px solid rgba(216,160,39,0.3)'
          : '1px solid rgba(0, 39, 76, 0.08)',
        boxShadow: hovered
          ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(216,160,39,0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transitionDuration: '0.4s',
        transitionProperty: 'background, border, box-shadow, transform',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: hovered
            ? `linear-gradient(90deg, transparent, ${program.accent}, transparent)`
            : 'transparent',
          opacity: hovered ? 0.8 : 0,
          transition: 'opacity 0.4s',
        }}
      />

      {/* Tag */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontFamily: 'var(--font-h)',
          fontSize: '0.55rem',
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: hovered ? program.accent : 'var(--red)',
          transition: 'color 0.4s',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: hovered ? program.accent : 'var(--red)',
            transition: 'background 0.4s',
          }}
        />
        {program.tag}
      </div>

      {/* Title */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: 'clamp(1rem, 1.4vw, 1.25rem)',
            fontWeight: 800,
            color: hovered ? '#fff' : 'var(--navy)',
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            textTransform: 'uppercase',
            transition: 'color 0.4s',
            marginBottom: '0.6rem',
          }}
        >
          {program.title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-b)',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            color: hovered ? 'rgba(255,255,255,0.65)' : 'rgba(33, 33, 33, 0.55)',
            transition: 'color 0.4s',
          }}
        >
          {program.desc}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${
            hovered ? 'rgba(255,255,255,0.12)' : 'rgba(0, 39, 76, 0.06)'
          }`,
          transition: 'border-color 0.4s',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: '1rem',
            fontWeight: 800,
            color: hovered ? program.accent : 'var(--navy)',
            transition: 'color 0.4s',
          }}
        >
          {program.price}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-h)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: hovered ? 'var(--gold)' : 'rgba(0, 39, 76, 0.25)',
            transition: 'color 0.4s',
          }}
        >
          {hovered ? 'Explore →' : 'Learn more'}
        </span>
      </div>
    </motion.div>
  )
}

export default function ProgramGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section
      id="programs"
      style={{
        position: 'relative',
        padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'var(--paper)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(0, 39, 76, 0.06)',
        }}
      />

      <div ref={ref} className="container-fluid">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginBottom: '3.5rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  height: '1px',
                  width: '2rem',
                  background: 'var(--red)',
                }}
              />
              <span className="chapter-num" style={{ color: 'var(--red)' }}>
                Our Programs
              </span>
            </div>
            <h2
              className="display-xl"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 4rem)',
                color: 'var(--navy)',
                maxWidth: '20ch',
              }}
            >
              Pilot Training Programs{' '}
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--gold)',
                }}
              >
                at Airborne Aviation Academy
              </span>
            </h2>
          </div>
          <p
            style={{
              color: 'rgba(33, 33, 33, 0.6)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              maxWidth: '28rem',
              fontFamily: 'var(--font-b)',
              margin: 0,
            }}
          >
            Every program is mentor-led, seat-capped, and built around a real airline
            finish line. From first principles to four stripes.
          </p>
        </motion.div>

        {/* 4×2 Premium Grid */}
        <div className="program-grid-4x2">
          {PROGRAMS.map((program, i) => (
            <ProgramCard key={program.id} program={program} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            marginTop: '2.5rem',
            textAlign: 'center',
          }}
        >
          <Link
            href="/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-h)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--navy)',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(0, 39, 76, 0.15)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 39, 76, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(0, 39, 76, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(0, 39, 76, 0.15)'
            }}
          >
            View full course catalog
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .program-grid-4x2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
          gap: 1.5rem;
        }
      `}</style>
    </section>
  )
}
