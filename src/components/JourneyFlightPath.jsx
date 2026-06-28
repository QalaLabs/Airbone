'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from 'framer-motion'

/* ── Chapter data ─────────────────────────────────────── */
const CHAPTERS = [
  {
    num: '01', label: 'Dream',
    title: 'The sky was never the limit.',
    sub: 'It was the invitation.',
    body: "Every pilot we've sent into an Air India or IndiGo uniform began with one quiet decision — that this dream deserves serious work. Not a brochure. Not a promise. A system.",
    image: '/footage/clouds-above.jpg',
    accent: '#DB241E',
    bg: 'radial-gradient(ellipse at 20% 60%, rgba(40,0,80,0.55) 0%, rgba(0,8,22,0.97) 100%)',
  },
  {
    num: '02', label: 'Ground School',
    title: 'Concepts that stick at 40,000 ft.',
    sub: 'DGCA CPL & ATPL.',
    body: "Capt. Navrang Singh strips DGCA CPL/ATPL syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RTR — taught the way you'll actually use them in the cockpit.",
    image: '/footage/classroom.jpg',
    accent: '#D8A027',
    bg: 'radial-gradient(ellipse at 75% 35%, rgba(0,30,90,0.5) 0%, rgba(0,8,22,0.97) 100%)',
  },
  {
    num: '03', label: 'Flying Training',
    title: 'Then the runway lets go.',
    sub: 'CPL in the sky.',
    body: 'CPL flying training across partner schools in India and abroad. Practical flight pathway mentorship. From your first solo takeoff to the commercial license issue.',
    image: '/footage/aircraft-ascending.jpg',
    accent: '#DB241E',
    bg: 'radial-gradient(ellipse at 50% 55%, rgba(0,45,110,0.45) 0%, rgba(0,8,22,0.96) 100%)',
  },
  {
    num: '04', label: 'Simulator',
    title: 'Procedures, repeated. Until instinct.',
    sub: 'Airbus A320.',
    body: 'In-house Airbus A320 cockpit simulator training. Repeat multi-crew procedures, automate flight management inputs, and master standard callouts before airline selection.',
    image: '/footage/simulator-training.jpg',
    accent: '#D8A027',
    bg: 'radial-gradient(ellipse at 30% 65%, rgba(0,0,40,0.85) 0%, rgba(0,4,14,0.98) 100%)',
  },
  {
    num: '05', label: 'Airline Selection',
    title: 'The finishing line.',
    sub: 'COMPASS · CASS · ADAPT.',
    body: 'COMPASS / CASS / ADAPT pre-screening assessments. Group discussions and panel interviews. Mocks coached directly by active airline captains who know exactly what selection panels look for.',
    image: '/campus/simulator_real.jpg',
    accent: '#DB241E',
    bg: 'radial-gradient(ellipse at 65% 40%, rgba(0,20,70,0.55) 0%, rgba(0,8,22,0.97) 100%)',
  },
  {
    num: '06', label: 'Cockpit',
    title: 'Four stripes. One uniform.',
    sub: 'IndiGo · Air India · Emirates.',
    body: "Ruzal Dhral — IndiGo Cadet. Capt. Nipun Singh — Air India, restarted at 36. Capt. Himanish Sagwal — Emirates. The success club isn't a marketing slide. It's a roster.",
    image: '/footage/pilot-portrait.jpg',
    accent: '#D8A027',
    bg: 'radial-gradient(ellipse at 45% 30%, rgba(15,0,50,0.75) 0%, rgba(0,8,22,0.98) 100%)',
  },
  {
    num: '07', label: 'Career',
    title: 'A lifetime in the skies.',
    sub: 'The 35-year journey.',
    body: 'Aviation is a lifelong profession. From first officer to command upgrade, from narrow-body jets to wide-body international routes. The career only deepens.',
    image: '/footage/aircraft-ascending.jpg',
    accent: '#DB241E',
    bg: 'radial-gradient(ellipse at 55% 50%, rgba(0,30,90,0.5) 0%, rgba(0,8,22,0.96) 100%)',
  },
  {
    num: '08', label: 'Your Journey',
    title: 'Your cockpit is waiting.',
    sub: 'Chapter 08 begins now.',
    body: 'Visit our Dwarka flight academy, sit in on a live ground school batch, or experience the A320 simulator cockpit. The only flight that matters is the next one you take.',
    image: '/footage/hero-cockpit.jpg',
    accent: '#D8A027',
    bg: 'radial-gradient(ellipse at 40% 55%, rgba(15,5,40,0.8) 0%, rgba(0,8,22,0.99) 100%)',
    isCTA: true,
  },
]

/* ── SVG waypoints (viewBox 0 0 100 800) ─────────────── */
const WP = [
  [50, 52],
  [32, 162],
  [68, 272],
  [32, 382],
  [68, 492],
  [32, 602],
  [68, 700],
  [50, 775],
]

function buildPath(pts) {
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const my = (py + cy) / 2
    d += ` C ${px},${my} ${cx},${my} ${cx},${cy}`
  }
  return d
}
const PATH_D = buildPath(WP)

function AircraftIcon() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={1.5} ry={7.5} fill="white" />
      <path d="M -1.2,1 L -9.5,6 L -9.5,7.5 L -1.2,3.2 Z" fill="white" opacity={0.9} />
      <path d="M 1.2,1 L 9.5,6 L 9.5,7.5 L 1.2,3.2 Z" fill="white" opacity={0.9} />
      <ellipse cx={-5.5} cy={5} rx={1} ry={2.2} fill="rgba(255,255,255,0.55)" />
      <ellipse cx={5.5} cy={5} rx={1} ry={2.2} fill="rgba(255,255,255,0.55)" />
      <path d="M -1,-5.5 L -4.5,-7.5 L -4,-6.5 L -1,-4.5 Z" fill="white" opacity={0.75} />
      <path d="M 1,-5.5 L 4.5,-7.5 L 4,-6.5 L 1,-4.5 Z" fill="white" opacity={0.75} />
    </g>
  )
}

export default function JourneyFlightPath({ onBook }) {
  const wrapRef    = useRef(null)
  const pathRef    = useRef(null)   // invisible measurement path
  const trailRef   = useRef(null)   // animated trail path
  const aircraftRef= useRef(null)   // aircraft <g> — NEVER set transform in JSX
  const glowRef    = useRef(null)   // glow circle — NEVER set cx/cy in JSX
  const pathLenRef = useRef(0)      // path length; use ref to avoid re-renders
  const activeIdxRef = useRef(0)

  const [activeIdx, setActiveIdx] = useState(0)
  const [isMobile, setIsMobile]   = useState(false)

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  // Spring ONLY for visual smoothness (aircraft + trail); chapter uses raw scroll
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28, restDelta: 0.001 })

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Measure path + init DOM state — runs after first render */
  useEffect(() => {
    if (!pathRef.current) return
    const len = pathRef.current.getTotalLength()
    pathLenRef.current = len

    // Init chapter from current scroll position (handles page-load mid-scroll)
    const v = scrollYProgress.get()
    const idx = Math.min(Math.floor(v * 8), 7)
    activeIdxRef.current = idx
    setActiveIdx(idx)

    // Trail: start fully hidden
    if (trailRef.current) {
      trailRef.current.style.strokeDasharray  = String(len)
      trailRef.current.style.strokeDashoffset = String(len)
      trailRef.current.style.opacity          = '0'
      trailRef.current.style.stroke           = CHAPTERS[0].accent
    }

    // Aircraft initial position (top waypoint, pointing down)
    if (aircraftRef.current) {
      const pt = pathRef.current.getPointAtLength(0)
      aircraftRef.current.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(180)`)
    }

    // Glow initial position
    if (glowRef.current) {
      glowRef.current.setAttribute('cx', String(WP[0][0]))
      glowRef.current.setAttribute('cy', String(WP[0][1]))
      glowRef.current.setAttribute('fill', CHAPTERS[0].accent)
    }
  }, [])

  /* ── Chapter switching: raw scroll (no spring lag) ── */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(Math.floor(v * 8), 7)
    if (idx !== activeIdxRef.current) {
      activeIdxRef.current = idx
      setActiveIdx(idx)
      // Sync trail + glow color immediately when chapter changes
      if (trailRef.current) {
        trailRef.current.style.stroke = CHAPTERS[idx].accent
      }
      if (glowRef.current) {
        glowRef.current.setAttribute('fill', CHAPTERS[idx].accent)
      }
    }
  })

  /* ── Visual movement: spring-smoothed (aircraft + trail offset) ── */
  useMotionValueEvent(smooth, 'change', (v) => {
    const totalLen = pathLenRef.current
    if (!pathRef.current || totalLen === 0) return

    const traveled = Math.min(v * totalLen, totalLen)

    // Trail reveal
    if (trailRef.current) {
      trailRef.current.style.strokeDashoffset = String(totalLen - traveled)
      trailRef.current.style.opacity = v < 0.015 ? String(v / 0.015) : '1'
    }

    // Aircraft position + heading
    if (aircraftRef.current) {
      const pt  = pathRef.current.getPointAtLength(traveled)
      const ptN = pathRef.current.getPointAtLength(Math.min(traveled + 2, totalLen))
      const angle = Math.atan2(ptN.y - pt.y, ptN.x - pt.x) * (180 / Math.PI) + 90
      // setAttribute prevents React from overriding on re-render
      aircraftRef.current.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle})`)
      if (glowRef.current) {
        glowRef.current.setAttribute('cx', String(pt.x))
        glowRef.current.setAttribute('cy', String(pt.y))
      }
    }
  })

  const ch = CHAPTERS[activeIdx]

  return (
    <div ref={wrapRef} id="journey-flight-path" style={{ position: 'relative', height: '800vh' }}>

      {/* ── Sticky viewport ── */}
      <div style={{
        position: 'sticky', top: 0, height: '100dvh', width: '100%',
        overflow: 'hidden', background: 'var(--navy-deep)',
      }}>

        {/* Atmospheric bg crossfade */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg${activeIdx}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{ position: 'absolute', inset: 0, zIndex: 0, background: ch.bg }}
          />
        </AnimatePresence>

        {/* Chapter image overlay */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`img${activeIdx}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <img
              src={ch.image} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.13 }}
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient vignettes */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to right, rgba(0,8,22,0.9) 0%, rgba(0,8,22,0.2) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,8,22,0.5) 0%, transparent 20%, transparent 78%, rgba(0,8,22,0.7) 100%)' }} />

        {/* ── DESKTOP LAYOUT ── */}
        {!isMobile && (
          <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'grid', gridTemplateColumns: '130px 1fr' }}>

            {/* Flight path SVG */}
            <div style={{ height: '100%', position: 'relative', overflow: 'visible' }}>
              <svg
                viewBox="0 0 100 800"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                {/* Invisible measurement path — getTotalLength source */}
                <path ref={pathRef} d={PATH_D} fill="none" stroke="none" />

                {/* Dashed background track */}
                <path
                  d={PATH_D} fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1.2"
                  strokeDasharray="3 10"
                />

                {/*
                  Trail — CRITICAL: do NOT set strokeDasharray or strokeDashoffset in JSX.
                  They are managed entirely via DOM in the motion value event.
                  Only stroke color is React-managed (via style attribute, not inline style).
                */}
                <path
                  ref={trailRef}
                  d={PATH_D}
                  fill="none"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                {/* Waypoints */}
                {WP.map(([wx, wy], i) => (
                  <g key={i}>
                    {i < activeIdx && (
                      <circle cx={wx} cy={wy} r={2.5} fill={ch.accent} opacity={0.5}
                        style={{ transition: 'fill 0.4s' }} />
                    )}
                    {i === activeIdx && (
                      <>
                        <circle cx={wx} cy={wy} r={3.2} fill={ch.accent} style={{ transition: 'fill 0.4s' }} />
                        <circle cx={wx} cy={wy} r={3.2} fill="none" stroke={ch.accent} strokeWidth={0.7}>
                          <animate attributeName="r" values="3;14;3" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={wx} cy={wy} r={3.2} fill="none" stroke={ch.accent} strokeWidth={0.45}>
                          <animate attributeName="r" values="3;14;3" dur="2s" begin="0.65s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" begin="0.65s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                    {i > activeIdx && (
                      <circle cx={wx} cy={wy} r={2} fill="none"
                        stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />
                    )}
                    <text
                      x={wx + 6} y={wy + 4}
                      fontSize="5" fontFamily="var(--font-h)" fontWeight="700"
                      fill={i <= activeIdx ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.13)'}
                      style={{ transition: 'fill 0.4s' }}
                    >
                      {CHAPTERS[i].num}
                    </text>
                  </g>
                ))}

                {/*
                  CRITICAL: Glow + Aircraft must NOT have cx/cy/transform in JSX.
                  These attributes are managed by DOM mutations in useMotionValueEvent.
                  If React declares them in JSX, it overrides our mutations on re-render,
                  snapping the elements back to their initial position.
                */}
                <circle
                  ref={glowRef}
                  r={12}
                  opacity={0.09}
                />

                <g ref={aircraftRef}>
                  <AircraftIcon />
                </g>
              </svg>
            </div>

            {/* Chapter content */}
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: 'clamp(2rem,4vw,4rem) clamp(2rem,5vw,6rem)' }}>
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeIdx}
                  initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -28, filter: 'blur(6px)' }}
                  transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                  style={{ maxWidth: '600px', position: 'relative' }}
                >
                  {/* Ghost number */}
                  <div aria-hidden style={{
                    position: 'absolute',
                    right: '-1rem', top: '50%', transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-h)',
                    fontSize: 'clamp(8rem,18vw,16rem)',
                    fontWeight: 900, lineHeight: 1,
                    letterSpacing: '-0.06em',
                    color: 'rgba(255,255,255,0.022)',
                    pointerEvents: 'none', userSelect: 'none', zIndex: 0,
                  }}>
                    {ch.num}
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800, color: ch.accent, letterSpacing: '0.3em' }}>
                        {ch.num}
                      </span>
                      <span style={{ height: '1px', width: '2rem', background: 'rgba(255,255,255,0.12)' }} />
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                        {ch.label}
                      </span>
                    </div>

                    <h2 style={{
                      fontFamily: 'var(--font-h)',
                      fontSize: 'clamp(1.75rem,3.5vw,3rem)',
                      fontWeight: 800, color: '#fff',
                      letterSpacing: '-0.03em', lineHeight: 1.06,
                      textTransform: 'uppercase', marginBottom: '0.5rem',
                    }}>
                      {ch.title}
                    </h2>

                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.9375rem', fontWeight: 300, fontStyle: 'italic', color: ch.accent, marginBottom: '1.5rem' }}>
                      {ch.sub}
                    </div>

                    <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: '30rem', marginBottom: '1.75rem' }}>
                      {ch.body}
                    </p>

                    {ch.isCTA ? (
                      <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={onBook}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'var(--red)', color: '#fff', border: 'none',
                            borderRadius: '999px', padding: '0.875rem 1.75rem',
                            fontFamily: 'var(--font-h)', fontSize: '0.8rem', fontWeight: 700,
                            cursor: 'pointer', letterSpacing: '0.05em',
                            minHeight: '48px', // touch target
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#b01a15'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
                        >
                          Reserve Simulator Demo
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7v10"/>
                          </svg>
                        </button>
                        <a
                          href="tel:+919953777320"
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: 'rgba(255,255,255,0.05)', color: '#fff',
                            borderRadius: '999px', padding: '0.875rem 1.5rem',
                            fontFamily: 'var(--font-h)', fontSize: '0.8rem', fontWeight: 600,
                            textDecoration: 'none', letterSpacing: '0.04em',
                            border: '1px solid rgba(255,255,255,0.1)',
                            minHeight: '48px', // touch target
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                          Call Admissions
                        </a>
                      </div>
                    ) : (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        fontFamily: 'var(--font-h)', fontSize: '0.58rem', fontWeight: 700,
                        letterSpacing: '0.25em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.2)',
                      }}>
                        <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.12)' }} />
                        {activeIdx + 1} of 8
                      </div>
                    )}
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── MOBILE LAYOUT ── */}
        {isMobile && (
          <div style={{
            position: 'relative', zIndex: 10, height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: '4.5rem 1.25rem 1.5rem',
            boxSizing: 'border-box',
          }}>

            {/* Horizontal progress track */}
            <div style={{ position: 'relative', height: '24px', marginBottom: '1.75rem', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.07)', transform: 'translateY(-50%)' }} />
              <div style={{
                position: 'absolute', top: '50%', left: 0, height: '1px',
                background: ch.accent,
                width: `${(activeIdx / 7) * 100}%`,
                transform: 'translateY(-50%)',
                transition: 'width 0.45s cubic-bezier(0.16,1,0.3,1), background 0.45s',
              }} />
              {CHAPTERS.map((c, i) => (
                <div key={i} style={{
                  position: 'absolute', top: '50%',
                  left: `${(i / 7) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: i === activeIdx ? '10px' : '5px',
                  height: i === activeIdx ? '10px' : '5px',
                  borderRadius: '50%',
                  background: i <= activeIdx ? ch.accent : 'rgba(255,255,255,0.15)',
                  boxShadow: i === activeIdx ? `0 0 8px ${ch.accent}` : 'none',
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                }} />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`m${activeIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800, color: ch.accent, letterSpacing: '0.3em' }}>{ch.num}</span>
                  <span style={{ height: '1px', width: '1.5rem', background: 'rgba(255,255,255,0.12)' }} />
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{ch.label}</span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: 'clamp(1.5rem,6.5vw,2.125rem)',
                  fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.03em', lineHeight: 1.05,
                  textTransform: 'uppercase', marginBottom: '0.5rem',
                }}>
                  {ch.title}
                </h2>

                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.875rem', fontWeight: 300, fontStyle: 'italic', color: ch.accent, marginBottom: '1.1rem' }}>
                  {ch.sub}
                </div>

                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                  {ch.body}
                </p>

                {ch.isCTA && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={onBook}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        background: 'var(--red)', color: '#fff', border: 'none',
                        borderRadius: '999px', padding: '0.875rem 1.5rem',
                        fontFamily: 'var(--font-h)', fontSize: '0.825rem', fontWeight: 700,
                        cursor: 'pointer', minHeight: '52px', width: '100%',
                      }}
                    >
                      Reserve Simulator Demo →
                    </button>
                    <a
                      href="tel:+919953777320"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)',
                        borderRadius: '999px', padding: '0.875rem 1.5rem',
                        fontFamily: 'var(--font-h)', fontSize: '0.825rem', fontWeight: 600,
                        textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
                        minHeight: '52px', width: '100%',
                      }}
                    >
                      📞 Call Admissions
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Chapter counter */}
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-h)', fontSize: '0.58rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', paddingBottom: '0.25rem', flexShrink: 0 }}>
              {ch.num} / 08 · {ch.label.toUpperCase()}
            </div>
          </div>
        )}

        {/* Bottom chapter dots (desktop only) */}
        {!isMobile && (
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '0.5rem', zIndex: 20, alignItems: 'center',
          }}>
            {CHAPTERS.map((c, i) => (
              <button
                key={i}
                aria-label={`Go to ${c.label}`}
                title={c.label}
                style={{
                  width: i === activeIdx ? '24px' : '6px',
                  height: '6px', borderRadius: '999px',
                  background: i === activeIdx ? ch.accent : 'rgba(255,255,255,0.18)',
                  border: 'none', padding: 0, cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  minHeight: '24px', // touch target via clickable area
                }}
                onClick={() => {
                  if (!wrapRef.current) return
                  const el  = wrapRef.current
                  const top = el.getBoundingClientRect().top + window.scrollY
                  const range = el.scrollHeight - window.innerHeight
                  window.scrollTo({ top: top + (i / 7) * range, behavior: 'smooth' })
                }}
              />
            ))}
          </div>
        )}

        {/* Scroll cue — first chapter only */}
        <AnimatePresence>
          {activeIdx === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              style={{
                position: 'absolute', right: '2rem', bottom: '3rem', zIndex: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-h)',
                fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                pointerEvents: 'none',
              }}
            >
              <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                Scroll
              </motion.span>
              <span style={{ height: '1.5rem', width: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.28), transparent)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
