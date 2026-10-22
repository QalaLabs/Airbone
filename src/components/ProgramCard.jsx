'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function getUpcomingBatchDate(customDate) {
  if (customDate) {
    const d = new Date(customDate);
    if (!Number.isNaN(d.getTime())) {
      const day = d.getDate();
      const s = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
      return `${day}${s} ${d.toLocaleDateString('en-IN', { month: 'short' })} ${d.getFullYear()}`;
    }
  }
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  let targetDate;
  if (day < 15) {
    targetDate = new Date(year, month, 15);
  } else {
    targetDate = new Date(year, month + 1, 1);
  }

  const d = targetDate.getDate();
  const suffix = d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th';
  const monthName = targetDate.toLocaleDateString('en-IN', { month: 'short' });
  const yr = targetDate.getFullYear();
  return `${d}${suffix} ${monthName} ${yr}`;
}

export default function ProgramCard({ program, index }) {
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
        minHeight: '260px',
        border: hovered
          ? '1px solid rgba(216,160,39,0.3)'
          : '1px solid rgba(0, 39, 76, 0.08)',
        boxShadow: hovered
          ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(216,160,39,0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transitionDuration: '0.4s',
        transitionProperty: 'background, border, box-shadow, transform',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxSizing: 'border-box',
      }}
      className={program.id === 'cpl' || program.id === 'dgca-ground-school' ? 'program-card-padded' : undefined}
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

      {/* Tag + Duration row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
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
        {program.duration && (
          <span
            style={{
              fontFamily: 'var(--font-h)',
              fontSize: '0.55rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: hovered ? program.accent : 'var(--red)',
              transition: 'color 0.4s',
              flexShrink: 0,
            }}
          >
            {program.duration}
          </span>
        )}
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

            {/* Dynamic Upcoming Batch Date (CMS-08) */}
      <div
        style={{
          marginTop: '0.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontFamily: 'var(--font-h)',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: hovered ? 'var(--gold)' : '#0066cc',
          transition: 'color 0.4s',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981',
            flexShrink: 0,
          }}
        />
        <span>Next Batch: {program.nextBatchDate || getUpcomingBatchDate(program.batchStartDate)}</span>
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
