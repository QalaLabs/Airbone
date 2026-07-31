'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import ProgramCard from '@/components/ProgramCard'

/* Sequence matches homepage / courses listing (feedback C6 / L12) */
const PROGRAMS = [
  {
    id: 'cpl',
    title: 'Commercial Pilot License (CPL)',
    tag: 'Flying Training',
    duration: '12–18 Months',
    desc: 'Complete CPL path with flying training guidance and Indian CPL conversion support. Cost may vary ₹45–75 Lakh (typical ~₹65 Lakh). Duration: 12–18 months.',
    price: '₹65 Lakh*',
    href: '/courses/flying-training-india-abroad',
    accent: 'var(--red)',
  },
  {
    id: 'gd-pi',
    title: 'GD & PI Course',
    tag: 'GD / PI',
    duration: '3 Months',
    desc: 'Group discussions, panel interviews, and personal development masterclasses led by retired Air India AGM Rajeet Khalsa. Duration: 3 months.',
    price: '₹30,000',
    href: '/courses/gd-pi',
    accent: 'var(--gold)',
  },
  {
    id: 'airline-prep',
    title: 'Airline Interview Preparation',
    tag: 'Airline Prep',
    duration: '3 Months',
    desc: 'Structured airline interview preparation - GD, PI, and soft skills for IndiGo, Air India, Akasa and more. Duration: 3 months.',
    price: '₹1,50,000',
    href: '/courses/airline-preparation',
    accent: 'var(--red)',
  },
  {
    id: 'atpl',
    title: 'ATPL Ground School',
    tag: 'Ground School',
    duration: '2–3 Months',
    desc: 'DGCA ATPL written and viva preparation for commercial pilots upgrading toward command. Eligibility: 21 years. Duration: 2–3 months.',
    price: '₹1,50,000',
    href: '/courses/atpl',
    accent: 'var(--gold)',
  },
  {
    id: 'dgca-ground-school',
    title: 'DGCA CPL Ground School',
    tag: 'Ground School',
    duration: '3–6 Months',
    desc: 'Intensive ground school covering DGCA CPL subjects. Eligibility: 10+2 Physics & Maths. Duration: 3–6 months. Taught by Capt. Navrang Singh.',
    price: '₹2,70,000',
    href: '/courses/commercial-pilot-license-cpl',
    accent: 'var(--gold)',
  },
  {
    id: 'cas-compass',
    title: 'CASS Compass & ADAPT',
    tag: 'Aptitude Test',
    duration: '1 Month',
    desc: 'Structured preparation for airline pilot aptitude test batteries - numerical, spatial, psychomotor, and multi-tasking.',
    price: '₹30,000',
    href: '/courses/cas-compass-adapt',
    accent: 'var(--gold)',
  },
  {
    id: 'cadet',
    title: 'Cadet Preparation',
    tag: 'Cadet Selection',
    duration: 'Flexible',
    desc: 'The quickest entry into aviation. IndiGo, Air India, and Akasa cadet pilot program preparation.',
    price: '₹50,000',
    href: '/courses/cadet-preparation',
    accent: 'var(--red)',
  },
  {
    id: 'simulator',
    title: 'Airbus A320 Simulator FBS',
    tag: 'Simulator',
    duration: 'Flexible',
    desc: 'In-house Airbus A320 FBS simulator. Eligibility: CPL. Type rating familiarisation and airline SIM prep.',
    price: '₹12,000',
    href: '/courses/a320-simulator',
    accent: 'var(--gold)',
  },
  {
    id: 'flying-guide',
    title: "Securing Your Child's Future in Aviation",
    tag: 'Parents',
    duration: 'Flexible',
    desc: 'Comprehensive CPL flight training guidance and Indian CPL conversion support - built for parents and aspirants.',
    price: 'Free',
    href: '/courses/flying-training-india-abroad',
    accent: 'var(--red)',
  },
  {
    id: 'cabin-crew',
    title: 'Cabin Crew Training',
    tag: 'Hospitality',
    duration: '3–6 Months',
    desc: 'Cabin crew & aviation hospitality training with 100%* scholarship offer upon scoring ≥70%.',
    price: '₹59,000',
    href: '/courses/cabin-crew-training',
    accent: 'var(--gold)',
  },
]



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
