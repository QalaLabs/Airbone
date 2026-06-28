/**
 * AirborneFX.jsx
 * Premium UI effect components ported from source design.
 * Zero backend dependencies — pure UI layer.
 *
 * Components exported:
 *   RouteProgress   — aircraft scroll-progress bar at top
 *   CockpitHUD      — bottom-left flight instrument panel
 *   AmbientRadial   — mouse-following ambient glow
 *   HeroLayers      — grain + cloud drift + vignette for hero
 *   StatReveal      — animated counting stat block
 *   AirlineMarquee  — dual-row scrolling airline names
 *   JourneyMap      — interactive SVG flight-route map
 *   SuccessMosaic   — pilot wall mosaic grid
 *   Magnetic        — cursor-following magnetic wrapper
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

/* =====================================================================
 * RouteProgress — Aircraft glyph traces scroll progress at top of page
 * ===================================================================*/
export function RouteProgress() {
  const { scrollYProgress } = useScroll()
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 })

  return (
    <div
      className="route-progress-bar"
      aria-hidden
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, pointerEvents: 'none', height: '3px' }}
    >
      {/* Dashed route line */}
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,39,76,0.6) 0 8px, transparent 8px 16px)',
        }}
      />
      {/* Traced fill */}
      <motion.div
        style={{
          scaleX, transformOrigin: '0% 50%',
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, var(--red), var(--gold), var(--red))',
        }}
      />
      {/* Plane glyph */}
      <motion.div
        style={{ position: 'absolute', top: '50%', translateY: '-50%', left: x, translateX: '-50%' }}
      >
        <div style={{ position: 'relative', marginTop: '-1px' }}>
          <span style={{
            position: 'absolute', inset: '-8px', borderRadius: '50%',
            background: 'rgba(219,36,30,0.4)', filter: 'blur(6px)',
          }} />
          {/* SVG plane icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" style={{ position: 'relative', filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))', transform: 'rotate(90deg)' }}>
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
      </motion.div>
    </div>
  )
}

/* =====================================================================
 * CockpitHUD — Atmospheric hero-anchored flight instrument
 * Absolute-positioned within the hero, fades as hero scrolls away.
 * Hidden on mobile via CSS — never competes with sticky CTA.
 * ===================================================================*/
export function CockpitHUD() {
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })
  const [alt, setAlt] = useState(0)
  const [hdg, setHdg] = useState(90)
  const [spd, setSpd] = useState(220)
  const [phase, setPhase] = useState('PUSHBACK')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    return smooth.on('change', (v) => {
      setAlt(Math.round(v * 36000))
      setHdg(Math.round(90 + v * 270) % 360)
      setSpd(Math.round(220 + v * 260))
      setPhase(
        v < 0.05 ? 'PUSHBACK'
          : v < 0.2 ? 'TAXI'
          : v < 0.4 ? 'CLIMB'
          : v < 0.75 ? 'CRUISE'
          : v < 0.95 ? 'APPROACH'
          : 'GATE'
      )
    })
  }, [smooth])

  useEffect(() => {
    const hero = document.querySelector('#top')
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.aside
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.35 } }}
      aria-hidden
      className="cockpit-hud"
      style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', pointerEvents: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>
        <span style={{ position: 'relative', display: 'inline-flex', height: '6px', width: '6px' }}>
          <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--red)', opacity: 0.75 }} />
          <span style={{ position: 'relative', display: 'inline-flex', height: '6px', width: '6px', borderRadius: '50%', background: 'var(--red)' }} />
        </span>
        {phase}
      </div>
      <HudInstrument label="ALT" value={alt.toLocaleString()} unit="ft" />
      <HudInstrument label="HDG" value={String(hdg).padStart(3, '0')} unit="°" />
      <HudInstrument label="SPD" value={String(spd)} unit="kt" />
    </motion.aside>
  )
}

function HudInstrument({ label, value, unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{ fontSize: '0.5625rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
      <span style={{ marginTop: '0.25rem', fontSize: '0.9375rem', fontWeight: 700 }}>
        {value}
        <span style={{ marginLeft: '0.25rem', fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)' }}>{unit}</span>
      </span>
    </div>
  )
}

/* =====================================================================
 * AmbientRadial — Mouse-following dual radial glow overlay
 * ===================================================================*/
export function AmbientRadial() {
  const mx = useMotionValue(50)
  const my = useMotionValue(30)
  const x = useSpring(mx, { stiffness: 40, damping: 20 })
  const y = useSpring(my, { stiffness: 40, damping: 20 })
  const bg = useTransform([x, y], ([vx, vy]) =>
    `radial-gradient(600px circle at ${vx}% ${vy}%, rgba(219,36,30,0.10), transparent 60%),
     radial-gradient(800px circle at ${100 - vx}% ${100 - vy}%, rgba(216,160,39,0.08), transparent 65%)`
  )

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    if (isTouch) return

    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth) * 100)
      my.set((e.clientY / window.innerHeight) * 100)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my])

  return (
    <motion.div
      aria-hidden
      style={{ background: bg, position: 'fixed', inset: 0, zIndex: 5, mixBlendMode: 'screen', pointerEvents: 'none' }}
    />
  )
}

/* =====================================================================
 * HeroLayers — Grain + cloud drift + vignette for hero section
 * ===================================================================*/
export function HeroLayers() {
  return (
    <>
      {/* Soft cloud drift */}
      <div
        aria-hidden
        className="animate-drift"
        style={{
          position: 'absolute', inset: 0, zIndex: 1, opacity: 0.4, mixBlendMode: 'screen', pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.15), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(216,160,39,0.18), transparent 55%)',
        }}
      />
      {/* Center vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,8,22,0.55) 100%)',
        }}
      />
      {/* SVG film grain */}
      <svg
        aria-hidden
        style={{ position: 'absolute', inset: 0, zIndex: 3, height: '100%', width: '100%', opacity: 0.07, pointerEvents: 'none', mixBlendMode: 'overlay' }}
      >
        <filter id="airborne-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#airborne-grain)" />
      </svg>
      {/* Gold horizon hairline */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: 0, right: 0, top: '62%', zIndex: 2, height: '1px', pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent, rgba(216,160,39,0.4) 50%, transparent)',
        }}
      />
    </>
  )
}

/* =====================================================================
 * StatReveal — Count-up animated number + label
 * ===================================================================*/
export function StatReveal({ value, label, prefix = '', suffix = '', decimals = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: 1600, bounce: 0 })
  const [display, setDisplay] = useState(prefix + '0' + suffix)

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, mv, value])

  useEffect(() => {
    return spring.on('change', (v) => {
      setDisplay(prefix + v.toFixed(decimals) + suffix)
    })
  }, [spring, prefix, suffix, decimals])

  return (
    <div ref={ref} style={style}>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.6rem,3vw,2.25rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
        {display}
      </div>
      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'rgba(0,39,76,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  )
}

/* =====================================================================
 * AirlineMarquee — Two counter-scrolling rows of airline names
 * ===================================================================*/
const AIRLINES = [
  'IndiGo', 'Air India', 'Emirates', 'Qatar Airways', 'Vistara',
  'Etihad', 'SpiceJet', 'Akasa Air', 'Lufthansa', 'Singapore Airlines',
  'Air Arabia', 'Oman Air',
]

export function AirlineMarquee() {
  return (
    <section
      aria-label="Airlines our pilots fly for"
      style={{ position: 'relative', padding: '4rem 0 5rem', background: 'var(--paper)', borderTop: '1px solid rgba(0,39,76,0.1)', borderBottom: '1px solid rgba(0,39,76,0.1)', overflow: 'hidden' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="chapter-num" style={{ color: 'var(--red)' }}>The Roster</div>
        <p style={{ marginTop: '0.75rem', fontFamily: 'var(--font-h)', color: 'rgba(0,39,76,0.7)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Where our cockpits are
        </p>
      </div>

      <MarqueeRow items={AIRLINES} direction={1} duration={50} />
      <div style={{ height: '1rem' }} />
      <MarqueeRow items={[...AIRLINES].reverse()} direction={-1} duration={70} />

      {/* Edge fades */}
      <div style={{ position: 'absolute', inset: '0 auto 0 0', width: '6rem', background: 'linear-gradient(to right, var(--paper), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '0 0 0 auto', width: '6rem', background: 'linear-gradient(to left, var(--paper), transparent)', pointerEvents: 'none' }} />
    </section>
  )
}

function MarqueeRow({ items, direction, duration }) {
  const loop = [...items, ...items]
  return (
    <div style={{ position: 'relative', display: 'flex', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex', gap: '3rem', paddingLeft: '1.5rem', whiteSpace: 'nowrap',
          animation: `airborne-marquee ${duration}s linear infinite`,
          animationDirection: direction === 1 ? 'normal' : 'reverse',
          willChange: 'transform',
        }}
      >
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            style={{
              fontFamily: 'var(--font-h)', fontWeight: 800,
              fontSize: 'clamp(1.4rem, 2.4vw, 2.2rem)',
              letterSpacing: '-0.02em', color: 'rgba(0,39,76,0.3)',
              transition: 'color 0.2s',
            }}
          >
            {name}
            <span style={{ marginLeft: '3rem', color: 'rgba(219,36,30,0.4)' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* =====================================================================
 * JourneyMap — Interactive SVG flight-route visualization
 * ===================================================================*/
const ROUTES = [
  { from: [38, 52], to: [55, 38], label: 'DEL → DXB', carrier: 'Emirates' },
  { from: [38, 52], to: [22, 60], label: 'DEL → BOM', carrier: 'IndiGo' },
  { from: [38, 52], to: [70, 30], label: 'DEL → LHR', carrier: 'Air India' },
  { from: [38, 52], to: [82, 70], label: 'DEL → SIN', carrier: 'Singapore' },
  { from: [38, 52], to: [52, 45], label: 'DEL → DOH', carrier: 'Qatar' },
]

export function JourneyMap() {
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)
  const inView = useInView(svgRef, { once: true, amount: 0.3 })

  const arcPath = (from, to) => {
    const [x1, y1] = from, [x2, y2] = to
    const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - 18
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
  }

  return (
    <section
      id="routes"
      style={{ position: 'relative', padding: 'clamp(6rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--navy-deep)', color: '#fff', overflow: 'hidden' }}
    >
      {/* Faint graticule grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="journey-map-grid" style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="journey-map-text">
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Flight Plan</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2rem,4.5vw,3.8rem)', color: '#fff' }}>
            Five careers.{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>One route map.</span>
          </h2>
          <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem' }}>
            From Dwarka to Dubai, Doha and beyond — every dot on this map is a cockpit one of our pilots now commands.
          </p>

          <ul style={{ marginTop: '2rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ROUTES.map((r, i) => (
              <li
                key={r.label}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  borderRadius: '0.75rem', padding: '0.625rem 1rem', fontSize: '0.8125rem',
                  cursor: 'default', transition: 'background 0.2s, color 0.2s',
                  background: hover === i ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: hover === i ? '#fff' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.05em' }}>{r.label}</span>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold)' }}>{r.carrier}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="journey-map-visual">
          <svg ref={svgRef} viewBox="0 0 100 80" style={{ width: '100%', height: 'auto' }} preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--red)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--red)" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--gold)" />
                <stop offset="100%" stopColor="var(--red)" />
              </linearGradient>
            </defs>

            <circle cx="38" cy="52" r="6" fill="url(#hub-glow)" />
            <circle cx="38" cy="52" r="1.2" fill="#fff" />

            {ROUTES.map((r, i) => {
              const isActive = hover === null || hover === i
              return (
                <g key={r.label} opacity={isActive ? 1 : 0.25} style={{ transition: 'opacity 0.3s' }}>
                  <motion.path
                    d={arcPath(r.from, r.to)}
                    fill="none"
                    stroke="url(#arc-grad)"
                    strokeWidth={0.4}
                    strokeDasharray="1 1.4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ duration: 1.4, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.circle
                    cx={r.to[0]} cy={r.to[1]} r={0.9}
                    fill="var(--gold)"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: 0.15 * i + 1.2, type: 'spring', stiffness: 220 }}
                  />
                  <text x={r.to[0] + 1.4} y={r.to[1] - 1} fill="rgba(255,255,255,0.6)" fontSize="1.8" fontFamily="var(--font-h)" fontWeight="700">
                    {r.label.split(' → ')[1]}
                  </text>
                </g>
              )
            })}
            <text x="40" y="51" fill="rgba(255,255,255,0.85)" fontSize="2.1" fontWeight="800" fontFamily="var(--font-h)">DEL</text>
          </svg>
        </div>
      </div>
    </section>
  )
}

/* =====================================================================
 * SuccessMosaic — Asymmetric pilot wall grid with stagger reveal
 * ===================================================================*/
const PILOTS = [
  { name: 'Ruzal Dhral',           role: 'Cadet · IndiGo',            year: '2024', batch: 'CPL-43',  image: '/reviews/ruzal.jpg', objectPosition: 'center 15%', badge: '✈ Selected' },
  { name: 'Capt. Nipun Singh',     role: 'First Officer · Air India', year: '2023', batch: 'CPL-39',  image: '/reviews/nipun.jpg', objectPosition: 'center 20%', badge: 'First Officer' },
  { name: 'Capt. Himansh Sagwal',  role: 'First Officer · Emirates',  year: '2022', batch: 'ATPL-12', image: '/reviews/himansh.jpg', objectPosition: 'center 12%', badge: 'First Officer' },
  { name: 'Kartik Juneja',         role: 'Cadet · IndiGo',            year: '2024', batch: 'CDT-08',  image: '/reviews/kartik.jpg', objectPosition: 'center 20%', badge: 'Cadet Pilot' },
  { name: 'Adesh Yadav',           role: 'First Officer · Air India', year: '2023', batch: 'CPL-41',  image: '/reviews/adesh.jpg', objectPosition: 'center 12%', badge: 'First Officer' },
  { name: 'Naveen Kumar',          role: 'Cadet · Akasa',             year: '2025', batch: 'CDT-11',  image: '/reviews/naveen.jpg', objectPosition: 'center 18%', badge: '✈ Selected' },
  { name: 'Nabansh Sardana',       role: 'First Officer · SpiceJet',  year: '2022', batch: 'ATPL-10', image: '/reviews/nabansh.jpg', objectPosition: 'center 15%', badge: 'First Officer' },
  { name: 'Priyanshi Kumar',       role: 'Cadet · IndiGo',            year: '2025', batch: 'CDT-12',  image: '/reviews/priyanshi.jpg', objectPosition: 'center 10%', badge: 'Cadet Pilot' },
]

export function SuccessMosaic({ image: fallbackImage }) {
  const [isMobile, setIsMobile] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  
  const containerRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll logic for mobile carousel
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isMobile || isPaused) return

    const timer = setInterval(() => {
      const card = container.querySelector('.success-carousel-card')
      if (!card) return
      
      const cardWidth = card.clientWidth
      const gap = parseFloat(window.getComputedStyle(container).gap) || 16
      const step = cardWidth + gap
      
      const nextIndex = (activeIndex + 1) % PILOTS.length
      
      container.scrollTo({
        left: nextIndex * step,
        behavior: 'smooth'
      })
      setActiveIndex(nextIndex)
    }, 6000)

    return () => clearInterval(timer)
  }, [activeIndex, isPaused, isMobile])

  const handleScroll = (e) => {
    const container = e.currentTarget
    const scrollLeft = container.scrollLeft
    const card = container.querySelector('.success-carousel-card')
    if (!card) return
    
    const cardWidth = card.clientWidth
    const gap = parseFloat(window.getComputedStyle(container).gap) || 16
    const step = cardWidth + gap
    
    const newIndex = Math.round(scrollLeft / step)
    if (newIndex >= 0 && newIndex < PILOTS.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }

  const handleTouchStart = () => {
    setIsPaused(true)
  }

  const handleTouchEnd = () => {
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      setIsPaused(false)
    }, 2000)
  }

  const scrollToIndex = (index) => {
    const container = containerRef.current
    if (!container) return
    
    const card = container.querySelector('.success-carousel-card')
    if (!card) return
    
    const cardWidth = card.clientWidth
    const gap = parseFloat(window.getComputedStyle(container).gap) || 16
    const step = cardWidth + gap
    
    container.scrollTo({
      left: index * step,
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }

  const displayedPilots = isMobile && !expanded ? PILOTS.slice(0, 3) : PILOTS

  return (
    <section style={{ position: 'relative', padding: 'clamp(3.5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--paper)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="mosaic-header-grid">
          <div className="mosaic-header-title">
            <div className="chapter-num" style={{ color: 'var(--red)', marginBottom: '0.5rem' }}>The Wall</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2rem,4.5vw,4rem)', color: 'var(--navy)', marginBottom: isMobile ? '0.5rem' : '0' }}>
              Faces on the{' '}
              <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--red)' }}>flight line.</span>
            </h2>
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 8px var(--red-glow)' }} />
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--navy)', opacity: 0.8 }}>
                  50+ Airline Placements
                </span>
              </div>
            )}
          </div>
          <div className="mosaic-header-desc">
            <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem' }}>
              Eight years. Hundreds of cockpits. A few of the captains, first officers and cadets who walked our corridors before they walked a jet bridge.
            </p>
          </div>
        </div>

        {isMobile ? (
          /* Mobile Redesign: Premium snap-scroll horizontal carousel */
          <div className="success-carousel-outer">
            <div 
              ref={containerRef}
              className="success-carousel-container"
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={handleTouchStart}
              onMouseLeave={handleTouchEnd}
            >
              {PILOTS.map((p, i) => {
                const parts = p.role.split('·')
                const roleName = parts[0]?.trim() || ''
                const airlineName = parts[1]?.trim() || ''
                
                return (
                  <div key={p.name} className="success-carousel-card">
                    <img
                      src={p.image || fallbackImage}
                      alt={p.name}
                      loading="lazy"
                      className="success-carousel-card-img"
                      style={{ objectPosition: p.objectPosition || 'center center' }}
                    />
                    <div className="success-carousel-card-gradient" />
                    
                    {p.badge && (
                      <div className={`success-carousel-card-glass-badge ${p.badge.includes('Selected') ? 'selected' : ''}`}>
                        {p.badge}
                      </div>
                    )}
                    
                    <div className="success-carousel-card-info">
                      <div className="success-carousel-card-meta">
                        <span>{p.batch}</span>
                      </div>
                      <div className="success-carousel-card-name">{p.name}</div>
                      <div className="success-carousel-card-details">
                        <span className="success-carousel-card-role-airline">{roleName} · {airlineName}</span>
                        <span className="success-carousel-card-year-batch">{p.year}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Pagination indicators */}
            <div className="success-carousel-dots">
              {PILOTS.map((_, i) => (
                <button
                  key={i}
                  className={`success-carousel-dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop Layout: Asymmetric mosaic grid remains exactly as is */
          <div className="responsive-grid-mosaic" style={{ gap: '0.75rem' }}>
            {displayedPilots.map((p, i) => {
              const tall = i === 0 || i === 5
              const wide = i === 3
              return (
                <motion.figure
                  key={p.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'relative', overflow: 'hidden', borderRadius: '1rem',
                    background: 'var(--navy)',
                    gridRow: tall ? 'span 2' : 'span 1',
                    gridColumn: wide ? 'span 2' : 'span 1',
                    margin: 0,
                  }}
                  className="mosaic-figure"
                >
                  <img
                    src={p.image || fallbackImage}
                    alt={p.name}
                    loading="lazy"
                    style={{
                      position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'cover',
                      objectPosition: 'top center',
                      transition: 'transform 1200ms ease-out',
                    }}
                    className="mosaic-img"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,8,22,0.95) 0%, rgba(0,8,22,0.2) 50%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', color: '#fff' }}>
                    <div style={{ fontSize: '0.5625rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8 }}>
                      {p.batch} · {p.year}
                    </div>
                    <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '0.875rem', marginTop: '0.25rem', lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.125rem' }}>{p.role}</div>
                  </div>
                </motion.figure>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .mosaic-figure:hover .mosaic-img { transform: scale(1.1); }
      `}</style>
    </section>
  )
}

/* =====================================================================
 * Magnetic — Subtle cursor-pull wrapper for CTA buttons
 * ===================================================================*/
export function Magnetic({ children, strength = 0.25 }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })

  return (
    <motion.span
      ref={ref}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.span>
  )
}
