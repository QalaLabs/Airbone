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

/* ── SVG flight path ──────────────────────────────────── */
// viewBox 0 0 100 800, preserveAspectRatio none → fills container
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

/* ── Aircraft icon (top-down silhouette) ─────────────── */
function AircraftIcon() {
  return (
    <g>
      {/* Fuselage */}
      <ellipse cx={0} cy={0} rx={1.5} ry={7.5} fill="white" />
      {/* Wings */}
      <path d="M -1.2,1 L -9.5,6 L -9.5,7.5 L -1.2,3.2 Z" fill="white" opacity={0.9} />
      <path d="M 1.2,1 L 9.5,6 L 9.5,7.5 L 1.2,3.2 Z" fill="white" opacity={0.9} />
      {/* Engines */}
      <ellipse cx={-5.5} cy={5} rx={1} ry={2.2} fill="rgba(255,255,255,0.55)" />
      <ellipse cx={5.5} cy={5} rx={1} ry={2.2} fill="rgba(255,255,255,0.55)" />
      {/* Tail */}
      <path d="M -1,-5.5 L -4.5,-7.5 L -4,-6.5 L -1,-4.5 Z" fill="white" opacity={0.75} />
      <path d="M 1,-5.5 L 4.5,-7.5 L 4,-6.5 L 1,-4.5 Z" fill="white" opacity={0.75} />
    </g>
  )
}

/* ── Main component ───────────────────────────────────── */
export default function JourneyFlightPath({ onBook }) {
  const wrapRef = useRef(null)
  const pathRef = useRef(null)      // measurement + trail path
  const trailRef = useRef(null)     // visible animated trail
  const aircraftRef = useRef(null)  // aircraft <g>
  const glowRef = useRef(null)      // glow circle behind aircraft
  const activeIdxRef = useRef(0)

  const [activeIdx, setActiveIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [pathLen, setPathLen] = useState(1000)

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22, restDelta: 0.001 })

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Measure path length after mount */
  useEffect(() => {
    if (!pathRef.current) return
    const len = pathRef.current.getTotalLength()
    setPathLen(len)
    // Init trail hidden
    if (trailRef.current) {
      trailRef.current.style.strokeDasharray = String(len)
      trailRef.current.style.strokeDashoffset = String(len)
      trailRef.current.style.opacity = '0'
    }
    // Init aircraft position
    if (aircraftRef.current) {
      const pt = pathRef.current.getPointAtLength(0)
      aircraftRef.current.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(180)`)
    }
  }, [])

  /* Drive aircraft + trail via scroll — pure DOM, zero re-renders */
  useMotionValueEvent(smooth, 'change', (v) => {
    // Chapter
    const idx = Math.min(Math.floor(v * 8), 7)
    if (idx !== activeIdxRef.current) {
      activeIdxRef.current = idx
      setActiveIdx(idx)
    }

    if (!pathRef.current || !pathLen) return
    const len = v * pathLen

    // Trail
    if (trailRef.current) {
      trailRef.current.style.strokeDashoffset = String(pathLen - len)
      trailRef.current.style.opacity = v < 0.025 ? String(v / 0.025) : '1'
    }

    // Aircraft
    if (aircraftRef.current) {
      const pt = pathRef.current.getPointAtLength(len)
      const ptN = pathRef.current.getPointAtLength(Math.min(len + 3, pathLen))
      const angle = Math.atan2(ptN.y - pt.y, ptN.x - pt.x) * (180 / Math.PI) + 90
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
        position: 'sticky', top: 0, height: '100svh', width: '100%',
        overflow: 'hidden', background: 'var(--navy-deep)',
      }}>

        {/* Atmospheric bg crossfade */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg${activeIdx}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
            style={{ position: 'absolute', inset: 0, zIndex: 0, background: ch.bg }}
          />
        </AnimatePresence>

        {/* Chapter image — 12% opacity overlay */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`img${activeIdx}`}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
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
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to right, rgba(0,8,22,0.88) 0%, rgba(0,8,22,0.18) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,8,22,0.5) 0%, transparent 20%, transparent 80%, rgba(0,8,22,0.65) 100%)' }} />

        {/* ── DESKTOP ── */}
        {!isMobile && (
          <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'grid', gridTemplateColumns: '130px 1fr' }}>

            {/* Flight path SVG */}
            <div style={{ height: '100%', position: 'relative' }}>
              <svg
                viewBox="0 0 100 800"
                style={{ width: '100%', height: '100%' }}
                preserveAspectRatio="none"
              >
                {/* Measurement path (invisible, provides getTotalLength) */}
                <path ref={pathRef} d={PATH_D} fill="none" stroke="none" />

                {/* Dashed background track */}
                <path
                  d={PATH_D} fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="1.2"
                  strokeDasharray="3 10"
                />

                {/* Animated trail */}
                <path
                  ref={trailRef}
                  d={PATH_D} fill="none"
                  stroke={ch.accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.6s' }}
                />

                {/* Waypoints */}
                {WP.map(([wx, wy], i) => (
                  <g key={i}>
                    {i < activeIdx && (
                      <circle cx={wx} cy={wy} r={2.5} fill={ch.accent} opacity={0.55}
                        style={{ transition: 'fill 0.4s' }}
                      />
                    )}
                    {i === activeIdx && (
                      <>
                        <circle cx={wx} cy={wy} r={3} fill={ch.accent} style={{ transition: 'fill 0.4s' }} />
                        {/* Radar pulse via SVG SMIL (no JS, no React) */}
                        <circle cx={wx} cy={wy} r={3} fill="none" stroke={ch.accent} strokeWidth={0.7}>
                          <animate attributeName="r" values="3;13;3" dur="2.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.55;0;0.55" dur="2.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={wx} cy={wy} r={3} fill="none" stroke={ch.accent} strokeWidth={0.5}>
                          <animate attributeName="r" values="3;13;3" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                    {i > activeIdx && (
                      <circle cx={wx} cy={wy} r={2} fill="none"
                        stroke="rgba(255,255,255,0.18)" strokeWidth={0.8}
                      />
                    )}
                    {/* Chapter number */}
                    <text
                      x={wx + 7} y={wy + 4}
                      fontSize="5.5" fontFamily="var(--font-h)" fontWeight="700"
                      fill={i <= activeIdx ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
                      style={{ transition: 'fill 0.4s', letterSpacing: '0.02em' }}
                    >
                      {CHAPTERS[i].num}
                    </text>
                  </g>
                ))}

                {/* Aircraft glow */}
                <circle
                  ref={glowRef}
                  cx={WP[0][0]} cy={WP[0][1]} r={11}
                  fill={ch.accent} opacity={0.09}
                  style={{ transition: 'fill 0.6s' }}
                />

                {/* Aircraft — DOM-animated via setAttribute */}
                <g ref={aircraftRef} transform={`translate(${WP[0][0]},${WP[0][1]}) rotate(180)`}>
                  <AircraftIcon />
                </g>
              </svg>
            </div>

            {/* Chapter content */}
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: 'clamp(2rem,5vw,4rem) clamp(2.5rem,6vw,6rem)' }}>
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeIdx}
                  initial={{ opacity: 0, x: 48, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -36, filter: 'blur(8px)' }}
                  transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                  style={{ maxWidth: '600px', position: 'relative' }}
                >
                  {/* Ghost chapter number */}
                  <div aria-hidden style={{
                    position: 'absolute',
                    right: '-1rem', top: '50%', transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-h)',
                    fontSize: 'clamp(9rem, 20vw, 18rem)',
                    fontWeight: 900, lineHeight: 1,
                    letterSpacing: '-0.06em',
                    color: 'rgba(255,255,255,0.022)',
                    pointerEvents: 'none', userSelect: 'none', zIndex: 0,
                  }}>
                    {ch.num}
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Label row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800, color: ch.accent, letterSpacing: '0.3em' }}>
                        {ch.num}
                      </span>
                      <span style={{ height: '1px', width: '2rem', background: 'rgba(255,255,255,0.15)' }} />
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                        {ch.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontFamily: 'var(--font-h)',
                      fontSize: 'clamp(1.875rem,3.8vw,3.25rem)',
                      fontWeight: 800, color: '#fff',
                      letterSpacing: '-0.03em', lineHeight: 1.05,
                      textTransform: 'uppercase', marginBottom: '0.5rem',
                    }}>
                      {ch.title}
                    </h2>

                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.9375rem', fontWeight: 300, fontStyle: 'italic', color: ch.accent, marginBottom: '1.75rem' }}>
                      {ch.sub}
                    </div>

                    <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.9375rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.62)', maxWidth: '30rem', marginBottom: '2rem' }}>
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
                            cursor: 'pointer', letterSpacing: '0.05em', transition: 'background 0.2s',
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
                            border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s',
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
                        color: 'rgba(255,255,255,0.22)',
                      }}>
                        <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                        {activeIdx + 1} of 8
                      </div>
                    )}
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── MOBILE ── */}
        {isMobile && (
          <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', padding: '5rem 1.5rem 2rem' }}>

            {/* Horizontal progress track */}
            <div style={{ position: 'relative', height: '20px', marginBottom: '2rem' }}>
              {/* Base track */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.08)', transform: 'translateY(-50%)' }} />
              {/* Filled track */}
              <div style={{
                position: 'absolute', top: '50%', left: 0, height: '1px',
                background: ch.accent,
                width: `${((activeIdx) / 7) * 100}%`,
                transform: 'translateY(-50%)',
                transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background 0.5s',
              }} />
              {/* Waypoint dots */}
              {CHAPTERS.map((c, i) => (
                <div key={i} style={{
                  position: 'absolute', top: '50%', left: `${(i / 7) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: i === activeIdx ? '9px' : '5px',
                  height: i === activeIdx ? '9px' : '5px',
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
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800, color: ch.accent, letterSpacing: '0.3em' }}>{ch.num}</span>
                  <span style={{ height: '1px', width: '1.5rem', background: 'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{ch.label}</span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-h)', fontSize: 'clamp(1.625rem,7vw,2.25rem)',
                  fontWeight: 800, color: '#fff', letterSpacing: '-0.03em',
                  lineHeight: 1.05, textTransform: 'uppercase', marginBottom: '0.5rem',
                }}>
                  {ch.title}
                </h2>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.875rem', fontWeight: 300, fontStyle: 'italic', color: ch.accent, marginBottom: '1.25rem' }}>
                  {ch.sub}
                </div>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', marginBottom: '1.5rem' }}>
                  {ch.body}
                </p>
                {ch.isCTA && (
                  <button
                    onClick={onBook}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      background: 'var(--red)', color: '#fff', border: 'none',
                      borderRadius: '999px', padding: '0.875rem 1.5rem',
                      fontFamily: 'var(--font-h)', fontSize: '0.8rem', fontWeight: 700,
                      cursor: 'pointer', alignSelf: 'flex-start',
                    }}
                  >
                    Reserve Demo →
                  </button>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Mobile chapter counter */}
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-h)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.22)', paddingBottom: '0.5rem' }}>
              {ch.num} / 08 · {ch.label.toUpperCase()}
            </div>
          </div>
        )}

        {/* Bottom chapter navigator (desktop) */}
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
                  width: i === activeIdx ? '22px' : '6px',
                  height: '6px', borderRadius: '999px',
                  background: i === activeIdx ? ch.accent : 'rgba(255,255,255,0.18)',
                  border: 'none', padding: 0, cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}
                onClick={() => {
                  if (!wrapRef.current) return
                  const el = wrapRef.current
                  const top = el.getBoundingClientRect().top + window.scrollY
                  const range = el.scrollHeight - window.innerHeight
                  window.scrollTo({ top: top + (i / 7) * range, behavior: 'smooth' })
                }}
              />
            ))}
          </div>
        )}

        {/* Scroll cue — chapter 1 only */}
        <AnimatePresence>
          {activeIdx === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                position: 'absolute', right: '2.5rem', bottom: '3.5rem', zIndex: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem',
                color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-h)',
                fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase',
              }}
            >
              <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                Scroll
              </motion.span>
              <span style={{ height: '1.5rem', width: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
