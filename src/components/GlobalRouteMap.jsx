'use client'

import { useRef, useState, useEffect, useSyncExternalStore } from 'react'
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import {
  DESTINATIONS,
  HUB_POINT,
  REGION_COLORS,
  CITY_LIGHTS,
  GRATICULE,
  PANEL_GROUPS,
  DESKTOP_VIEWBOX,
  MOBILE_VIEWBOX,
  LABEL_FONT,
  routeArc,
  ROUTE_CATEGORIES,
} from '@/lib/routeMap'
import { WORLD_LAND_PATH } from '@/lib/worldLand'
import { whatsappHref } from '@/lib/whatsapp'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

/* Real airport positions projected onto viewBox "0 0 1000 500" — see lib/routeMap.js */
const HUB = HUB_POINT
const REGION = Object.fromEntries(Object.entries(REGION_COLORS).map(([name, color]) => [name, { color }]))

/* Mobile frames the Europe → SE Asia corridor; the Americas are listed under the map. */
const OFF_FRAME_ON_MOBILE = DESTINATIONS.filter((d) => d.region === 'North America')

/* ─── Metrics data ─── */
const STATS = [
  {
    value: '15+',
    label: 'YEARS OF LEGACY',
    desc1: 'Building pilots.',
    desc2: 'Building futures.',
    color: '#DB241E',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '20px', height: '20px' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polygon points="12 11 13.5 14 16.5 14 14 16 15 19 12 17 9 19 10 16 7.5 14 10.5 14"/>
      </svg>
    )
  },
  {
    value: '2009',
    label: 'TRAINING SINCE',
    desc1: 'From classroom lessons',
    desc2: 'to cockpit success.',
    color: '#D8A027',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '20px', height: '20px' }}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
      </svg>
    )
  },
  {
    value: '50+',
    label: 'AIRLINE PARTNERS',
    desc1: 'Global opportunities.',
    desc2: 'Limitless destinations.',
    color: '#a855f7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '20px', height: '20px' }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    )
  },
  {
    value: '100%',
    label: 'PLACEMENT SUPPORT',
    color: '#fb923c',
    desc1: 'Your journey.',
    desc2: 'Our commitment.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '20px', height: '20px' }}>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2a10 10 0 00-10 10c0 3 1.5 5.5 4 7l2-3.5M22 12a10 10 0 01-10 10c-1.5 0-3-.3-4.3-.9l2.3-3.1"/>
        <path d="M8 7a4 4 0 018 0"/>
      </svg>
    )
  }
]

/* Server snapshot is false, so SSR and hydration agree; the client value follows. */
function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/* ─── Hub pulse rings definition ─── */
const HUB_RINGS = [
  { r0: 5, r1: 20, dur: 2.8, begin: '0s',   sw: 1.4, sc: 'rgba(219,36,30,0.5)'  },
  { r0: 8, r1: 36, dur: 4.2, begin: '0.8s', sw: 1.1, sc: 'rgba(219,36,30,0.25)' },
  { r0: 7, r1: 52, dur: 6.0, begin: '1.8s', sw: 0.8, sc: 'rgba(216,160,39,0.15)' },
]

/* ─── Dust particles ─── */
const DUST = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x:  (i * 73 + 17) % 100,
  y:  (i * 53 + 31) % 100,
  sz: 0.8 + (i % 3) * 0.4,
  dur: 12 + (i % 10),
  del: (i * 0.5) % 6,
  dx: ((i % 5) - 2) * 12,
  dy: ((i % 4) - 1) * 8,
}))

/* ─── Animated counter hook ─── */
function useCounter(rawValue, active) {
  const str    = String(rawValue)
  const num    = parseInt(str.replace(/\D/g, ''))
  const suffix = str.replace(/\d/g, '')
  const [display, setDisplay] = useState(num || 0)
  useEffect(() => {
    if (!active || isNaN(num)) return
    let raf
    const t0 = performance.now(), dur = 2000
    const tick = now => {
      const t = Math.min((now - t0) / dur, 1)
      setDisplay(Math.round(num * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, num])
  return isNaN(num) ? rawValue : `${display}${suffix}`
}

function StatCell({ stat, index, active }) {
  const val = useCounter(stat.value, active)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.6 + index * 0.08 }}
      style={{
        padding: 'clamp(1rem,2.5vw,1.75rem) clamp(1rem,2vw,1.5rem)',
        borderRight: index < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
      className="grm-stat-cell"
    >
      <div 
        style={{ 
          width: '42px', 
          height: '42px', 
          borderRadius: '50%', 
          border: `1.5px solid ${stat.color}45`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          background: `radial-gradient(circle, ${stat.color}12 0%, transparent 80%)`,
          boxShadow: `0 0 12px ${stat.color}08`,
          flexShrink: 0
        }}
      >
        {stat.icon}
      </div>
      <div>
        <div 
          style={{ 
            fontFamily: 'var(--font-h)', 
            fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', 
            fontWeight: 900, 
            lineHeight: 1,
            color: '#fff',
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px'
          }}
        >
          {val}
        </div>
        <div 
          style={{ 
            fontFamily: 'var(--font-h)', 
            fontSize: '0.62rem', 
            fontWeight: 800, 
            letterSpacing: '0.12em', 
            textTransform: 'uppercase', 
            color: stat.color,
            marginTop: '0.35rem'
          }}
        >
          {stat.label}
        </div>
        {stat.desc1 && (
          <div 
            style={{ 
              fontFamily: 'var(--font-b)', 
              fontSize: '0.68rem', 
              color: 'rgba(255,255,255,0.4)', 
              marginTop: '0.2rem',
              lineHeight: 1.3
            }}
          >
            {stat.desc1} {stat.desc2}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function GlobalRouteMap() {
  const sectionRef = useRef(null)
  const mapWrapRef = useRef(null)
  const svgRef     = useRef(null)
  
  const inView = useInView(sectionRef, { once: true, margin: '-50px' })
  const isMobile = useMediaQuery('(max-width: 768px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const [hovered, setHovered] = useState(null)
  const [pinned, setPinned] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  
  /* Filter Category & Cadet Profile States */
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCadet, setSelectedCadet] = useState(null)

  /* ESC key to close modal */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCadet(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /* GSAP scroll-driven micro-scale */
  useEffect(() => {
    if (!mapWrapRef.current || typeof window === 'undefined') return
    const ctx = gsap.context(() => {
      gsap.fromTo(mapWrapRef.current,
        { scale: 0.96 },
        { scale: 1.03, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
      )
    })
    return () => ctx.revert()
  }, [])

  /* Mouse parallax values */
  const rawX = useMotionValue(0), rawY = useMotionValue(0)
  const mx = useSpring(rawX, { stiffness: 60, damping: 22 })
  const my = useSpring(rawY, { stiffness: 60, damping: 22 })
  const glx = useTransform(mx, v => `${v * 0.008}%`), gly = useTransform(my, v => `${v * 0.008}%`)

  const onMouseMove  = e => { const r = sectionRef.current?.getBoundingClientRect(); if(r){ rawX.set(e.clientX-r.left-r.width/2); rawY.set(e.clientY-r.top-r.height/2) } }
  const onMouseLeave = () => { rawX.set(0); rawY.set(0) }

  /* Active destination for telemetry HUD */
  const activeDestIndex = hovered !== null ? hovered : pinned !== null ? pinned : null
  const activeDest = activeDestIndex !== null ? DESTINATIONS[activeDestIndex] : null

  /* Filter matching helper */
  const isRouteMatchingCategory = (d) => {
    if (selectedCategory === 'all') return true
    return d.region === selectedCategory
  }

  /* Tooltip coordination */
  function handleEnter(i) {
    setHovered(i)
    const svg   = svgRef.current
    const ctm   = svg?.getScreenCTM?.()
    const sRect = sectionRef.current?.getBoundingClientRect()
    if (!svg || !ctm || !sRect) return
    const dest = DESTINATIONS[i]
    const pt = new DOMPoint(dest.x, dest.y).matrixTransform(ctm)
    setTooltip({
      x: pt.x - sRect.left,
      y: pt.y - sRect.top - 65,
      dest
    })
  }

  function handleLeave() {
    if (pinned === null) {
      setHovered(null)
      setTooltip(null)
    }
  }

  function handleTap(i) {
    const dest = DESTINATIONS[i]
    setSelectedCadet(dest)
    if (pinned === i) {
      setPinned(null)
      setHovered(null)
      setTooltip(null)
    } else {
      setPinned(i)
      handleEnter(i)
    }
  }

  /* Scroll shifts */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end','end start'] })
  const mapScrollY  = useTransform(scrollYProgress, [0,1], ['0%','-3%'])

  /* SVG node scaling specs */
  const SW_ROUTE   = 1.0
  const SW_GLOW    = 2.4
  const R_OUTER    = 3.2
  const R_INNER    = 2.2
  const R_CORE     = 1.5

  /* Filtered panel groups for sidebar */
  const filteredPanelGroups = selectedCategory === 'all'
    ? PANEL_GROUPS
    : PANEL_GROUPS.filter(g => g.label === selectedCategory)

  return (
    <section
      id="global-routes"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ position:'relative', minHeight:'120vh', background:'#02060d', color:'#fff', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
    >
      {/* ══ FILM GRAIN NOISE OVERLAY ══ */}
      <svg aria-hidden style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:8, opacity:0.025 }}>
        <filter id="grm-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#grm-noise)"/>
      </svg>

      {/* ══ BLUEPRINT GRID ══ */}
      <div aria-hidden style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(56,189,248,0.02) 1px, transparent 1px),linear-gradient(90deg, rgba(56,189,248,0.02) 1px, transparent 1px)', backgroundSize:'40px 40px' }}/>

      {/* ══ ATMOSPHERIC RADIAL GLOWS ══ */}
      <motion.div aria-hidden style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none', x:glx, y:gly, background:'radial-gradient(circle 350px at 71.4% 34%, rgba(219,36,30,0.28) 0%, rgba(219,36,30,0.08) 50%, transparent 100%),radial-gradient(ellipse 50% 50% at 50% 50%, rgba(56,189,248,0.03) 0%, transparent 80%),radial-gradient(circle at center, transparent 30%, #020408 90%)' }}/>

      {/* ══ DUST PARTICLES ══ */}
      {!reducedMotion && (isMobile ? DUST.slice(0, 10) : DUST).map(p=>(
        <motion.div key={p.id} aria-hidden style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, width:p.sz, height:p.sz, borderRadius:'50%', background:'rgba(255,255,255,0.3)', zIndex:3, pointerEvents:'none' }}
          animate={{ x:[0,p.dx,0], y:[0,p.dy,0], opacity:[0,0.35,0.15,0] }}
          transition={{ duration:p.dur, delay:p.del, repeat:Infinity, ease:'easeInOut' }}
        />
      ))}

      {/* ── HEADER & SECTOR FILTER BAR ── */}
      <div className="grm-header-wrap container-fluid" style={{ position:'relative', zIndex:20, padding:'2.5rem clamp(1.25rem,4vw,3.5rem) 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.7 }}
          style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.5rem' }}>
          <span style={{ color: '#DB241E', fontWeight: 900, fontSize: '0.85rem' }}>-</span>
          <span style={{ fontFamily:'var(--font-h)', fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'#fff' }}>One Headquarters.</span>
          <span style={{ color: '#DB241E', fontWeight: 900, fontSize: '0.85rem' }}>-</span>
        </motion.div>
        
        <motion.h2 initial={{ opacity:0, y:28 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.85, delay:0.1, ease:[0.16,1,0.3,1] }}
          style={{ fontFamily:'var(--font-h)', fontSize:'clamp(2.2rem,5vw,4.5rem)', fontWeight:900, lineHeight:1.05, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          A World <span style={{ color:'#DB241E' }}>of Cockpits.</span>
        </motion.h2>
        
        <motion.p initial={{ opacity:0, y:16 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.7, delay:0.25 }}
          style={{ marginTop:'0.8rem', color:'rgba(255,255,255,0.7)', fontSize:'0.95rem', lineHeight:1.65, maxWidth:'700px', fontFamily:'var(--font-b)' }}>
          From Ramphal Chowk, Dwarka - our pilots command cockpits on every continent. <br/>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>We train here. They fly everywhere.</span>
        </motion.p>
        
        <div style={{ width: '80px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #D8A027 50%, transparent)', marginTop: '1.25rem', marginBottom: '1.25rem' }} />

        {/* ── ROUTE CATEGORY FILTER PILL BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            maxWidth: '920px',
            zIndex: 25,
          }}
          className="grm-filter-bar"
        >
          {ROUTE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setPinned(null)
                  setHovered(null)
                }}
                style={{
                  position: 'relative',
                  padding: '0.42rem 0.85rem',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-h)',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: isActive ? `1.5px solid ${cat.color}` : '1px solid rgba(255,255,255,0.12)',
                  background: isActive ? `${cat.color}22` : 'rgba(5, 12, 24, 0.7)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 0 16px ${cat.color}35` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cat.color, display: 'inline-block', boxShadow: `0 0 6px ${cat.color}` }} />
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '0.58rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    background: isActive ? `${cat.color}45` : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    fontWeight: 700,
                  }}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </motion.div>
      </div>

      {/* ── MAP CONTAINER (Spans full width, positioned relatively behind sidebar) ── */}
      <motion.div className="grm-map-wrap" style={{ y:mapScrollY, flex:1, display:'flex', alignItems:'center', position:'relative', zIndex:10, width:'100%', margin: isMobile ? '1rem auto 0' : '-2rem auto 0' }} ref={mapWrapRef}>
        <div className="grm-map-outer container-fluid" style={{ padding:'0 clamp(1.25rem,4vw,3.5rem)', position:'relative', display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap:'2rem' }}>
          <div className="grm-map-canvas" style={{ position:'relative', flex:'1 1 auto', minWidth:0 }}>
          <motion.svg
            ref={svgRef}
            data-testid="route-map"
            role="img"
            aria-label="Map of routes flown by Airborne alumni from Delhi"
            viewBox={isMobile ? MOBILE_VIEWBOX : DESKTOP_VIEWBOX}
            style={{ width:'100%', height:'auto', display:'block', overflow: isMobile ? 'hidden' : 'visible' }}
            preserveAspectRatio="xMidYMid meet"
            initial={{ opacity:0 }}
            animate={inView?{opacity:1}:{}}
            transition={{ duration:1, delay:0.3 }}
          >
            <defs>
              <radialGradient id="g2-hub-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#fff"        stopOpacity="1"/>
                <stop offset="35%"  stopColor="#DB241E"  stopOpacity="0.95"/>
                <stop offset="75%"  stopColor="#DB241E"  stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#DB241E"  stopOpacity="0"/>
              </radialGradient>
              
              <radialGradient id="g2-hub-bloom" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#D8A027" stopOpacity="0.4"/>
                <stop offset="60%"  stopColor="#DB241E"  stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#DB241E"  stopOpacity="0"/>
              </radialGradient>
              
              <radialGradient id="g2-lens" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#fff" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
              </radialGradient>

              {/* High density dotted pattern for digital map */}
              <pattern id="grm-dot-grid" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.15" fill="rgba(56, 189, 248, 0.28)" />
              </pattern>

              {/* Regional path linear gradients */}
              <linearGradient id="g2-india" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#facc15" stopOpacity="0.85"/>
              </linearGradient>
              
              <linearGradient id="g2-me" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#D8A027" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#D8A027" stopOpacity="0.9"/>
              </linearGradient>
              
              <linearGradient id="g2-sea" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9"/>
              </linearGradient>
              
              <linearGradient id="g2-eu" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9"/>
              </linearGradient>

              <linearGradient id="g2-na" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#DB241E" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#DB241E" stopOpacity="0.9"/>
              </linearGradient>

              {/* Glow Filters */}
              <filter id="g2-glow-lg" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="8" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="g2-glow-xs" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* ─ Longitude / Latitude dashed grid ─ */}
            <g stroke="rgba(56,189,248,0.05)" strokeWidth="0.5" strokeDasharray="3 4" fill="none">
              {GRATICULE.parallels.map(y => <line key={`p${y}`} x1="0" y1={y} x2="1000" y2={y} />)}
              {GRATICULE.meridians.map(x => <line key={`m${x}`} x1={x} y1="0" x2={x} y2="500" />)}
            </g>

            {/* ─ Dotted world land with edge glow ─ */}
            <path
              data-testid="route-map-land"
              d={WORLD_LAND_PATH}
              fill="url(#grm-dot-grid)"
              stroke="rgba(56,189,248,0.14)"
              strokeWidth="0.6"
              style={{ filter: 'drop-shadow(0 0 1px rgba(56,189,248,0.15))' }}
            />

            {/* ─ Satellite City lights ─ */}
            {(isMobile ? CITY_LIGHTS.filter((_, idx) => idx % 2 === 0) : CITY_LIGHTS).map((c, idx) => (
              <circle
                key={idx}
                cx={c.x}
                cy={c.y}
                r={0.8 + (idx % 3) * 0.45}
                fill="#f59e0b"
                opacity={0.35 + (idx % 4) * 0.15}
                filter="url(#g2-glow-xs)"
              />
            ))}

            {/* ─ Flight routes & nodes ─ */}
            {DESTINATIONS.map((d, i) => {
              const r = REGION[d.region]
              const gid = d.region === 'India' ? 'g2-india' : d.region === 'Middle East' ? 'g2-me' : d.region === 'SE Asia' ? 'g2-sea' : d.region === 'Europe' ? 'g2-eu' : 'g2-na'
              const originPoint = d.origin ? (DESTINATIONS.find(a => a.id === d.origin) || HUB) : HUB
              const path = routeArc(originPoint, d, d.region === 'India' ? 0.12 : 0.18)
              
              const isIndigoPair = hovered !== null && ((d.id === 'bom' && DESTINATIONS[hovered]?.id === 'maa') || (d.id === 'maa' && DESTINATIONS[hovered]?.id === 'bom'))
              const matchesFilter = isRouteMatchingCategory(d)
              const dim = !matchesFilter || (hovered !== null && hovered !== i && !isIndigoPair)
              const isSelected = activeDestIndex === i

              const lx = d.x + d.label.dx
              const ly = d.y + d.label.dy

              return (
                <g
                  key={d.id}
                  data-testid="route-destination"
                  data-iata={d.iata}
                  opacity={dim ? 0.08 : 1}
                  style={{ transition:'opacity 0.35s', pointerEvents: matchesFilter ? 'auto' : 'none' }}
                >
                  
                  {/* Thick glowing route background */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={isSelected ? SW_GLOW * 1.5 : SW_GLOW}
                    strokeOpacity={isSelected ? 0.45 : 0.22}
                    filter="url(#g2-glow-xs)"
                    initial={{ pathLength:0 }}
                    animate={inView?{pathLength:1}:{}}
                    transition={{ duration:1.5+i*0.04, delay:0.06*i+0.3, ease:[0.16,1,0.3,1] }}
                  />
                  
                  {/* Main solid route line */}
                  <motion.path
                    data-testid="route-line"
                    data-iata={d.iata}
                    d={path}
                    fill="none"
                    stroke={`url(#${gid})`}
                    strokeWidth={isSelected ? SW_ROUTE * 1.8 : SW_ROUTE}
                    initial={{ pathLength:0, opacity:0 }}
                    animate={inView?{pathLength:1,opacity:1}:{}}
                    transition={{ duration:1.4+i*0.04, delay:0.06*i+0.3, ease:[0.16,1,0.3,1] }}
                  />
                  
                  {/* Animated plane arrowheads */}
                  {!reducedMotion && matchesFilter && (
                    <motion.path
                      d="M-3,-3 L4.5,0 L-3,3 L-1.5,0 Z"
                      fill={r.color}
                      filter="url(#g2-glow-xs)"
                      initial={{ offsetDistance: '0%', opacity: 0 }}
                      animate={inView ? { offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] } : {}}
                      transition={{ duration: 3.5 + (i % 3) * 1.2, delay: 0.05 * i + 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ offsetPath: `path('${path}')`, offsetRotate: 'auto' }}
                    />
                  )}

                  {/* Airport Outer Ring */}
                  <motion.circle
                    cx={d.x}
                    cy={d.y}
                    r={isSelected ? R_OUTER * 1.3 : R_OUTER}
                    fill="none"
                    stroke={r.color}
                    strokeWidth="1.1"
                    strokeOpacity={isSelected ? 0.85 : 0.35}
                    initial={{ scale:0 }}
                    animate={inView?{scale:1}:{}}
                    transition={{ delay:0.05*i+1.0, type:'spring', stiffness:200 }}
                    style={{ transformOrigin:`${d.x}px ${d.y}px`, transition:'r 0.2s' }}
                  />
                  
                  {/* Airport Inner Ring */}
                  <motion.circle
                    cx={d.x}
                    cy={d.y}
                    r={isSelected ? R_INNER * 1.25 : R_INNER}
                    fill="none"
                    stroke={r.color}
                    strokeWidth="0.8"
                    strokeOpacity={isSelected ? 0.6 : 0.2}
                    initial={{ scale:0 }}
                    animate={inView?{scale:1}:{}}
                    transition={{ delay:0.05*i+1.1, type:'spring', stiffness:200 }}
                    style={{ transformOrigin:`${d.x}px ${d.y}px`, transition:'r 0.2s' }}
                  />
                  
                  {/* Node Dot */}
                  <motion.circle
                    data-testid="route-marker"
                    data-iata={d.iata}
                    data-lat={d.lat}
                    data-lon={d.lon}
                    cx={d.x}
                    cy={d.y}
                    r={isSelected ? R_CORE * 1.4 : R_CORE}
                    fill={isSelected ? r.color : '#fff'}
                    filter={isSelected ? 'url(#g2-glow-xs)' : ''}
                    initial={{ scale:0 }}
                    animate={inView?{scale:1}:{}}
                    transition={{ delay:0.05*i+1.0, type:'spring', stiffness:220 }}
                    style={{ transformOrigin:`${d.x}px ${d.y}px`, cursor:'pointer', transition:'r 0.2s, fill 0.2s', pointerEvents:'none' }}
                  />

                  {/* Invisible touch/click target (44x44px equivalent) */}
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r={isMobile ? 7 : 8}
                    fill="transparent"
                    style={{ cursor:'pointer' }}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={handleLeave}
                    onClick={() => handleTap(i)}
                  />

                  {/* Stacked Labels */}
                  <g style={{ pointerEvents:'none' }}>
                    <motion.text
                      x={lx + (d.label.anchor === 'end' ? -LABEL_FONT.pad : LABEL_FONT.pad)}
                      y={ly + LABEL_FONT.iataY}
                      textAnchor={d.label.anchor}
                      fill="#fff"
                      fontSize={LABEL_FONT.iata}
                      fontFamily="var(--font-h)"
                      fontWeight="900"
                      letterSpacing="0.05em"
                      initial={{ opacity:0 }}
                      animate={inView?{opacity:1}:{}}
                      transition={{ delay:0.05*i+1.2 }}
                    >
                      {d.iata}
                    </motion.text>
                    <motion.text
                      x={lx + (d.label.anchor === 'end' ? -LABEL_FONT.pad : LABEL_FONT.pad)}
                      y={ly + LABEL_FONT.cityY}
                      textAnchor={d.label.anchor}
                      fill={r.color}
                      fontSize={LABEL_FONT.city}
                      fontFamily="var(--font-h)"
                      fontWeight="700"
                      letterSpacing="0.05em"
                      initial={{ opacity:0 }}
                      animate={inView?{opacity:1}:{}}
                      transition={{ delay:0.05*i+1.2 }}
                    >
                      {d.city}
                    </motion.text>
                    {d.country && (
                      <motion.text
                        x={lx + (d.label.anchor === 'end' ? -LABEL_FONT.pad : LABEL_FONT.pad)}
                        y={ly + LABEL_FONT.countryY}
                        textAnchor={d.label.anchor}
                        fill="rgba(255,255,255,0.4)"
                        fontSize={LABEL_FONT.country}
                        fontFamily="var(--font-b)"
                        fontWeight="600"
                        letterSpacing="0.04em"
                        initial={{ opacity:0 }}
                        animate={inView?{opacity:1}:{}}
                        transition={{ delay:0.05*i+1.2 }}
                      >
                        {d.country}
                      </motion.text>
                    )}
                  </g>
                </g>
              )
            })}

            {/* ─ Delhi Hub DEL ─ */}
            <circle cx={HUB.x} cy={HUB.y} r="40" fill="url(#g2-hub-bloom)" opacity={reducedMotion ? 0.45 : undefined}>
              {!reducedMotion && (
                <>
                  <animate attributeName="r"       values="30;52;30"    dur="4.5s"   repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.65;0.25;0.65"  dur="4.5s"   repeatCount="indefinite"/>
                </>
              )}
            </circle>

            {HUB_RINGS.map((ring, i) => (
              <circle key={i} cx={HUB.x} cy={HUB.y} r={ring.r0} fill="none" stroke={ring.sc} strokeWidth={ring.sw}>
                {!reducedMotion && (
                  <>
                    <animate attributeName="r"       values={`${ring.r0};${ring.r1};${ring.r0}`} dur={`${ring.dur}s`} repeatCount="indefinite" begin={ring.begin}/>
                    <animate attributeName="opacity" values="0.55;0;0.55"                          dur={`${ring.dur}s`} repeatCount="indefinite" begin={ring.begin}/>
                  </>
                )}
              </circle>
            ))}

            <circle cx={HUB.x} cy={HUB.y} r="12" fill="url(#g2-hub-core)" filter="url(#g2-glow-lg)"/>
            <ellipse cx={HUB.x-1.5} cy={HUB.y-1.5} rx="3" ry="1.5" fill="url(#g2-lens)" opacity="0.65" transform={`rotate(-35,${HUB.x},${HUB.y})`}/>
            <circle data-testid="route-hub" data-lat={HUB.lat} data-lon={HUB.lon} cx={HUB.x} cy={HUB.y} r="3.5" fill="#fff" filter="url(#g2-glow-lg)"/>

            {/* Outward drifting hub particles */}
            {!reducedMotion && Array.from({length:8}, (_,i) => {
              const ang = (i/8)*Math.PI*2
              return (
                <motion.circle key={i} r="1.8" fill={i%2===0?'var(--gold)':'#DB241E'}
                  initial={{ cx:HUB.x, cy:HUB.y, opacity:0 }}
                  animate={inView?{ cx:[HUB.x, HUB.x+Math.cos(ang)*28], cy:[HUB.y, HUB.y+Math.sin(ang)*28], opacity:[0.85,0] }:{}}
                  transition={{ duration:1.8+i*0.15, delay:i*0.25, repeat:Infinity, repeatDelay:1.2, ease:'easeOut' }}/>
              )
            })}

            {/* Dark halo behind hub text */}
            <g style={{ paintOrder:'stroke', stroke:'#02060d', strokeWidth:3, strokeLinejoin:'round', pointerEvents:'none' }}>
              <text x={HUB.x + 8} y={HUB.y - 14} textAnchor="start" fill="#fff" fontSize="9" fontFamily="var(--font-h)" fontWeight="900" letterSpacing="0.06em">DEL</text>
              <text x={HUB.x + 8} y={HUB.y - 7} textAnchor="start" fill="rgba(255,255,255,0.65)" fontSize="4.6" fontFamily="var(--font-h)" fontWeight="700" letterSpacing="0.08em">{HUB.city}</text>
              <text x={HUB.x + 8} y={HUB.y - 1.5} textAnchor="start" fill="rgba(255,255,255,0.45)" fontSize="4" fontFamily="var(--font-h)" fontWeight="600" letterSpacing="0.08em">{HUB.country}</text>
            </g>
          </motion.svg>

          {isMobile && (
            <p data-testid="route-map-offframe" style={{ margin:'0.5rem 0 0', textAlign:'center', fontFamily:'var(--font-h)', fontSize:'0.62rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.55)' }}>
              <span style={{ color: REGION['North America'].color }}>✈</span>{' '}
              Also flying: {OFF_FRAME_ON_MOBILE.map(d => `${d.city.charAt(0)}${d.city.slice(1).toLowerCase().replace(/ (\w)/g, (_, c) => ` ${c.toUpperCase()}`)} (${d.iata})`).join(' · ')}
            </p>
          )}

          {/* ── LIVE AVIONICS TELEMETRY GLASS HUD CARD ── */}
          <div
            className="grm-telemetry-hud"
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              zIndex: 30,
              minWidth: isMobile ? 'calc(100% - 2rem)' : '310px',
              maxWidth: '360px',
              background: 'rgba(5, 11, 24, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '0.75rem 0.95rem',
              boxShadow: '0 16px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              cursor: activeDest ? 'pointer' : 'default',
              transition: 'border-color 0.25s, box-shadow 0.25s',
            }}
            onClick={() => {
              if (activeDest) setSelectedCadet(activeDest)
            }}
          >
            {activeDest ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: REGION[activeDest.region]?.color || '#facc15', boxShadow: `0 0 8px ${REGION[activeDest.region]?.color || '#facc15'}` }} />
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
                      DEL ➔ {activeDest.iata}
                    </span>
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.58rem', color: REGION[activeDest.region]?.color, fontWeight: 700 }}>
                      ({activeDest.city})
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.55rem', color: '#fff', background: 'rgba(219,36,30,0.3)', border: '1px solid rgba(219,36,30,0.5)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>
                    {activeDest.flightNo || 'ACTIVE SECTOR'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>DISTANCE</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.68rem', fontWeight: 800, color: '#fff' }}>
                      {activeDest.telemetry?.distanceNM} NM
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>FLIGHT TIME</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.68rem', fontWeight: 800, color: '#fff' }}>
                      {activeDest.telemetry?.durationStr}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>CRUISE</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.68rem', fontWeight: 800, color: REGION[activeDest.region]?.color }}>
                      {activeDest.telemetry?.flightLevel}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.62rem', fontFamily: 'var(--font-b)', color: 'rgba(255,255,255,0.7)' }}>
                    <span>👨‍✈️</span>
                    <span>{activeDest.alumni} ({activeDest.pos})</span>
                  </div>
                  <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-h)', fontWeight: 800, color: '#D8A027', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Story ➔
                  </span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.3rem' }}>
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#D8A027', textTransform: 'uppercase' }}>
                    RADAR DISPATCH • LIVE TELEMETRY
                  </span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                </div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-b)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                  Hover or tap any sector to view flight metrics, cruising altitude, and alumni pilot career paths.
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                  <span style={{ fontSize: '0.52rem', fontFamily: 'var(--font-h)', fontWeight: 800, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    18 GLOBAL AIRPORTS
                  </span>
                  <span style={{ fontSize: '0.52rem', fontFamily: 'var(--font-h)', fontWeight: 800, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    50+ PARTNER AIRLINES
                  </span>
                </div>
              </>
            )}
          </div>
          </div>

          {/* Alumni Sidebar — normal flex column on desktop */}
          <motion.aside
            initial={{ opacity:0, x:24 }} animate={inView?{opacity:1,x:0}:{}} transition={{ duration:0.75, delay:0.45, ease:[0.16,1,0.3,1] }}
            className="grm-right-panel"
            style={{
              position: 'relative',
              flexShrink: 0,
              width: isMobile ? '100%' : '290px',
              background:'rgba(5,10,20,0.65)',
              backdropFilter:'blur(20px)', 
              WebkitBackdropFilter:'blur(20px)', 
              border:'1px solid rgba(255,255,255,0.08)', 
              borderRadius:'12px', 
              padding:'clamp(1rem,2vw,1.35rem)', 
              display:'flex', 
              flexDirection:'column', 
              gap:'0',
              zIndex: 30,
              boxShadow: '0 20px 45px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom:'1.1rem', borderBottom: '1px solid rgba(219,36,30,0.35)', paddingBottom: '0.25rem' }}>
              <h4 style={{ fontFamily:'var(--font-h)', fontSize:'0.55rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', margin: 0, fontWeight: 800 }}>
                AIRBORNE ALUMNI FLY WITH
              </h4>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{ background: 'none', border: 'none', color: '#D8A027', fontSize: '0.52rem', fontFamily: 'var(--font-h)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                >
                  RESET
                </button>
              )}
            </div>
            
            {filteredPanelGroups.map((group, gi) => (
              <div key={group.label} style={{ marginBottom:'0.9rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.45rem', marginBottom:'0.35rem', paddingBottom:'0.25rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width:'4.5px', height:'4.5px', borderRadius:'50%', background:group.color, display:'block', flexShrink:0, boxShadow:`0 0 5px ${group.color}` }}/>
                  <span style={{ fontFamily:'var(--font-h)', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:group.color }}>{group.label}</span>
                </div>
                
                {group.items.map((item, ii) => {
                  const prevCount = PANEL_GROUPS.slice(0,gi).reduce((a,g)=>a+g.items.length,0)+ii
                  const targetCode = item.route.split('•').map(s => s.trim()).filter(c => c !== 'DEL')[0]
                  const targetIdx = DESTINATIONS.findIndex(d => d.iata === targetCode)
                  const targetDest = targetIdx >= 0 ? DESTINATIONS[targetIdx] : null
                  const isHovered = targetIdx >= 0 && hovered === targetIdx

                  return (
                    <motion.div
                      key={`${group.label}-${item.airline}-${item.route}`}
                      initial={{ opacity:0, x:-8 }}
                      animate={inView?{opacity:1,x:0}:{}}
                      transition={{ delay:0.5+prevCount*0.03, duration:0.4 }}
                      style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'space-between',
                        padding:'0.3rem 0.45rem',
                        borderRadius:'4px',
                        cursor:'pointer',
                        transition:'all 0.2s',
                        background: isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                        borderLeft: isHovered ? `2px solid ${group.color}` : '2px solid transparent',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background='rgba(255,255,255,0.06)'
                        if(targetIdx >= 0) setHovered(targetIdx)
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background= isHovered ? 'rgba(255,255,255,0.08)' : 'transparent'
                        if(pinned === null) setHovered(null)
                      }}
                      onClick={() => {
                        if (targetDest) setSelectedCadet(targetDest)
                      }}
                    >
                      <span style={{ fontFamily:'var(--font-h)', fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.88)' }}>{item.airline}</span>
                      <span style={{ fontFamily:'var(--font-h)', fontSize:'0.56rem', letterSpacing:'0.06em', color: isHovered ? '#fff' : 'rgba(255,255,255,0.35)' }}>{item.route}</span>
                    </motion.div>
                  )
                })}
              </div>
            ))}
            
            <div style={{ height:'1.5px', background:'rgba(255,255,255,0.04)', margin:'0.4rem 0 0.8rem' }}/>
            
            {/* Address card */}
            <motion.div initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay:1.1, duration:0.65 }}
              style={{ padding:'0.75rem', borderRadius:'8px', background:'rgba(216,160,39,0.04)', border:'1px solid rgba(216,160,39,0.12)', boxShadow:'0 0 16px rgba(216,160,39,0.03)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.25rem' }}>
                <span style={{ fontSize:'0.6rem' }}>📍</span>
                <span style={{ fontFamily:'var(--font-h)', fontSize:'0.6rem', fontWeight:900, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold)' }}>Airborne Aviation Academy</span>
              </div>
              <div style={{ fontFamily:'var(--font-h)', fontSize:'0.58rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.04em' }}>Ramphal Chowk · Dwarka · Delhi · India</div>

              <div style={{ marginTop:'0.5rem', display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
                {['50+ Airlines','50+ Countries','DGCA-compliant'].map(tag=>(
                  <span key={tag} style={{ fontFamily:'var(--font-h)', fontSize:'0.48rem', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(216,160,39,0.75)', padding:'0.15rem 0.4rem', border:'1px solid rgba(216,160,39,0.15)', borderRadius:'999px' }}>{tag}</span>
                ))}
              </div>
            </motion.div>
          </motion.aside>
        </div>
      </motion.div>

      {/* ── METRICS STRIP (At the bottom, centered) ── */}
      <div className="container-fluid" style={{ position:'relative', zIndex:20, padding:'0 clamp(1.25rem,4vw,3.5rem) 4rem' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.65, delay:0.5 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'rgba(5,10,20,0.45)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden' }}
          className="grm-stats-strip">
          {STATS.map((s,i)=><StatCell key={s.label} stat={s} index={i} active={inView}/>)}
        </motion.div>
      </div>

      {/* ── TOOLTIP POPUP ── */}
      {tooltip && (
        <div style={{ position:'absolute', left:tooltip.x, top:tooltip.y, transform:'translateX(-50%)', pointerEvents:'none', zIndex:30, background:'rgba(3,8,18,0.96)', border:`1px solid ${REGION[tooltip.dest.region].color}40`, borderRadius:'8px', padding:'0.55rem 0.85rem', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', whiteSpace:'nowrap', boxShadow:`0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px ${REGION[tooltip.dest.region].color}12` }}>
          <div style={{ fontFamily:'var(--font-h)', fontSize:'0.7rem', fontWeight:900, color:REGION[tooltip.dest.region].color, letterSpacing:'0.06em' }}>
            {tooltip.dest.iata} · {tooltip.dest.city} {tooltip.dest.country ? `· ${tooltip.dest.country}` : ''}
          </div>
          <div style={{ fontFamily:'var(--font-h)', fontSize:'0.55rem', color:'rgba(255,255,255,0.65)', marginTop:'0.2rem', fontWeight: 700 }}>
            {tooltip.dest.airline}{tooltip.dest.pos ? ` · ${tooltip.dest.pos}` : ''}
          </div>
          {tooltip.dest.alumni && (
            <div style={{ fontFamily:'var(--font-b)', fontSize:'0.52rem', color:'rgba(255,255,255,0.35)', marginTop:'0.15rem' }}>
              Alumni: {tooltip.dest.alumni} · Class of {tooltip.dest.year}
            </div>
          )}
        </div>
      )}

      {/* ── CADET STORY FLY-OUT MODAL ── */}
      <AnimatePresence>
        {selectedCadet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'rgba(1, 4, 12, 0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={() => setSelectedCadet(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 16, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '520px',
                background: 'linear-gradient(145deg, rgba(10, 18, 36, 0.96), rgba(4, 9, 20, 0.98))',
                border: `1.5px solid ${REGION[selectedCadet.region]?.color || '#D8A027'}45`,
                borderRadius: '16px',
                padding: 'clamp(1.25rem, 3vw, 2rem)',
                boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 35px ${REGION[selectedCadet.region]?.color || '#D8A027'}15`,
                color: '#fff',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCadet(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(219,36,30,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              >
                ✕
              </button>

              {/* Cadet Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: `${REGION[selectedCadet.region]?.color || '#D8A027'}25`, border: `1px solid ${REGION[selectedCadet.region]?.color || '#D8A027'}50`, color: REGION[selectedCadet.region]?.color, fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {selectedCadet.airline}
                </span>
                <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-h)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                  FLEET: {selectedCadet.aircraft || 'COMMERCIAL AIRLINER'}
                </span>
              </div>

              {/* Alumni Name & Position */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0, color: '#fff' }}>
                  {selectedCadet.alumni || 'Airborne Alumni'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.8rem', fontWeight: 700, color: REGION[selectedCadet.region]?.color || '#D8A027' }}>
                    {selectedCadet.pos}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                    Class of {selectedCadet.year}
                  </span>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>SECTOR</div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                    DEL ➔ {selectedCadet.iata}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>DISTANCE</div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                    {selectedCadet.telemetry?.distanceNM} NM
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>TOTAL HOURS</div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 900, color: '#22c55e', marginTop: '0.2rem' }}>
                    {selectedCadet.hours || '1,200+ hrs'}
                  </div>
                </div>
              </div>

              {/* Alumni Quote */}
              {selectedCadet.quote && (
                <div style={{ position: 'relative', background: 'rgba(216,160,39,0.05)', borderLeft: '3px solid #D8A027', borderRadius: '0 8px 8px 0', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: 0, fontStyle: 'italic' }}>
                    "{selectedCadet.quote}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href="#courses"
                  onClick={() => setSelectedCadet(null)}
                  style={{
                    flex: '1 1 180px',
                    textAlign: 'center',
                    background: '#DB241E',
                    color: '#fff',
                    padding: '0.7rem 1.25rem',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    boxShadow: '0 4px 18px rgba(219,36,30,0.35)',
                    transition: 'transform 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e6322c' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#DB241E' }}
                >
                  Enrol in Pilot Training ➔
                </a>
                <a
                  href={whatsappHref(`Hi Airborne Aviation, I saw alumni ${selectedCadet.alumni} flying with ${selectedCadet.airline}. I am interested in joining the pilot training program!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: '1 1 180px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    padding: '0.7rem 1.25rem',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                >
                  <span style={{ color: '#22c55e' }}>●</span>
                  Talk on WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .grm-stats-strip { grid-template-columns:repeat(4,1fr) !important; }
        @media (min-width:1025px) {
          .grm-map-outer {
            min-height: 520px;
          }
        }
        @media (max-width:1024px) {
          .grm-map-wrap { margin-top:1.5rem !important; }
          .grm-map-outer { flex-direction:column !important; align-items:stretch !important; padding:0 1.25rem !important; }
          .grm-map-canvas { width:100%; }
          .grm-right-panel { position:relative !important; top:auto !important; bottom:auto !important; left:auto !important; right:auto !important; transform:none !important; width:calc(100% - 2.5rem) !important; max-width:360px !important; margin:0 auto !important; }
          .grm-stats-strip { grid-template-columns:repeat(2,1fr) !important; }
          .grm-telemetry-hud { position:relative !important; left:auto !important; bottom:auto !important; margin-top:1rem !important; width:100% !important; max-width:100% !important; }
        }
        @media (max-width:768px) {
          .grm-stats-strip { grid-template-columns:1fr !important; }
          .grm-stat-cell { border-right:none !important; border-bottom:1px solid rgba(255,255,255,0.05); }
          .grm-stat-cell:last-child { border-bottom:none !important; }
          .grm-filter-bar { gap:0.35rem !important; }
        }
      `}}/>
    </section>
  )
}
