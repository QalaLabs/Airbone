'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import ProgramCard from '@/components/ProgramCard'
import { resolveCatalogItems, LEGACY_COURSE_ITEMS } from '@/lib/publicCourses'

/* Sequence matches homepage / courses listing (feedback C6 / L12).
   Canonical catalog (Admin PUBLISHED courses) is fetched on mount via the
   public-proxy; LEGACY_COURSE_ITEMS is the documented offline fallback and is
   shown/swapped until the fetch resolves. */

const FALLBACK_PROGRAMS = LEGACY_COURSE_ITEMS

export default function ProgramGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const [programs, setPrograms] = useState(FALLBACK_PROGRAMS)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/public-proxy/courses?limit=100', {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('courses proxy failed')
        const json = await res.json()
        if (cancelled) return
        if (Array.isArray(json?.data) && json.data.length > 0) {
          setPrograms(resolveCatalogItems(json.data))
        }
      } catch {
        // Offline — keep the documented legacy fallback.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
          {programs.map((program, i) => (
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
