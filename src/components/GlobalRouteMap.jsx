'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

/* ── Hub position (SVG viewBox "0 0 100 82") ── */
const HUB = { x: 38, y: 52 }

/* ── Region accent colours ── */
const REGION = {
  India:       { color: 'var(--gold)',           stroke: 'rgba(216,160,39,0.85)',  dash: '0.8 1.4' },
  'Middle East':{ color: '#fb923c',              stroke: 'rgba(251,146,60,0.85)',  dash: '1.0 1.6' },
  'SE Asia':   { color: '#a78bfa',               stroke: 'rgba(167,139,250,0.85)', dash: '0.8 2.0' },
  Europe:      { color: 'rgba(255,255,255,0.85)', stroke: 'rgba(255,255,255,0.6)', dash: '1.2 1.8' },
}

/* ── All destinations ── */
const DESTINATIONS = [
  // India (south/southeast of hub)
  { id: 'bom', city: 'Mumbai',      iata: 'BOM', region: 'India',        x: 31, y: 62, airline: 'IndiGo',            pos: 'First Officer', alumni: 'Ruzal Dhral'   },
  { id: 'blr', city: 'Bengaluru',   iata: 'BLR', region: 'India',        x: 36, y: 68, airline: 'Air India',         pos: 'First Officer', alumni: 'Nipun Singh'   },
  { id: 'hyd', city: 'Hyderabad',   iata: 'HYD', region: 'India',        x: 40, y: 65, airline: 'Akasa',             pos: 'Cadet',         alumni: 'Adesh Yadav'   },
  { id: 'maa', city: 'Chennai',     iata: 'MAA', region: 'India',        x: 42, y: 70, airline: 'IndiGo',            pos: 'Cadet',         alumni: 'Priyanshi K.'  },
  { id: 'goi', city: 'Goa',         iata: 'GOI', region: 'India',        x: 32, y: 66, airline: 'GoFirst',           pos: 'Cadet',         alumni: 'Naveen Kumar'  },
  // Middle East (west of hub)
  { id: 'dxb', city: 'Dubai',       iata: 'DXB', region: 'Middle East',  x: 20, y: 48, airline: 'Emirates',          pos: 'First Officer', alumni: 'Himansh Sagwal'},
  { id: 'doh', city: 'Doha',        iata: 'DOH', region: 'Middle East',  x: 16, y: 50, airline: 'Qatar Airways',     pos: 'Cadet',         alumni: 'Kartik Juneja' },
  { id: 'auh', city: 'Abu Dhabi',   iata: 'AUH', region: 'Middle East',  x: 18, y: 53, airline: 'Etihad',            pos: 'First Officer', alumni: 'Nabansh Sardana'},
  { id: 'ruh', city: 'Riyadh',      iata: 'RUH', region: 'Middle East',  x: 13, y: 45, airline: 'Saudia',            pos: 'Cadet',         alumni: 'Arjun Mehta'   },
  { id: 'mct', city: 'Muscat',      iata: 'MCT', region: 'Middle East',  x: 24, y: 55, airline: 'Oman Air',          pos: 'First Officer', alumni: 'Deepak Mohan'  },
  // SE Asia (east/southeast of hub)
  { id: 'sin', city: 'Singapore',   iata: 'SIN', region: 'SE Asia',      x: 70, y: 70, airline: 'Singapore Airlines',pos: 'First Officer', alumni: 'Ankit Sharma'  },
  { id: 'bkk', city: 'Bangkok',     iata: 'BKK', region: 'SE Asia',      x: 65, y: 60, airline: 'Thai Airways',      pos: 'Cadet',         alumni: 'Rohit Verma'   },
  { id: 'kul', city: 'Kuala Lumpur',iata: 'KUL', region: 'SE Asia',      x: 68, y: 66, airline: 'AirAsia',           pos: 'First Officer', alumni: 'Priya Madan'   },
  // Europe (upper-left)
  { id: 'lhr', city: 'London',      iata: 'LHR', region: 'Europe',       x:  6, y: 18, airline: 'Air India',         pos: 'First Officer', alumni: 'Nipun Singh'   },
  { id: 'fra', city: 'Frankfurt',   iata: 'FRA', region: 'Europe',       x: 13, y: 16, airline: 'Lufthansa',         pos: 'Cadet',         alumni: 'Shreya Kapoor' },
  { id: 'ams', city: 'Amsterdam',   iata: 'AMS', region: 'Europe',       x:  9, y: 13, airline: 'KLM',               pos: 'First Officer', alumni: 'Vikram Pandey' },
]

/* Quadratic bezier arc – curves upward (great-circle feel) */
function arcPath([x1, y1], [x2, y2]) {
  const cx = (x1 + x2) / 2
  const cy = Math.min(y1, y2) - 4 - Math.abs(x2 - x1) * 0.14
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

/* ── Simplified continent outlines ── */
/* Approx artistic placement in the 0 0 100 82 viewBox (Delhi=38,52) */
const CONTINENTS = [
  /* Europe */
  'M 2 24 L 5 16 L 9 10 L 14 7 L 20 9 L 22 14 L 18 20 L 14 26 L 8 28 L 4 26 Z',
  /* Scandinavian arm */
  'M 14 7 L 17 4 L 20 5 L 18 9 Z',
  /* Iberian Peninsula */
  'M 4 28 L 8 28 L 10 34 L 6 36 L 3 32 Z',
  /* North Africa */
  'M 4 36 L 12 30 L 22 30 L 28 34 L 30 40 L 28 48 L 24 52 L 16 52 L 8 48 L 4 42 Z',
  /* West/Central Africa */
  'M 8 52 L 16 52 L 20 58 L 18 68 L 14 74 L 8 74 L 4 66 L 4 58 Z',
  /* East Africa horn */
  'M 28 50 L 34 48 L 36 54 L 32 60 L 26 60 L 24 54 Z',
  /* Arabian Peninsula */
  'M 20 40 L 28 36 L 36 38 L 38 46 L 36 58 L 30 64 L 24 60 L 20 52 Z',
  /* Indian Subcontinent */
  'M 32 38 L 40 34 L 48 36 L 50 46 L 48 56 L 44 64 L 40 72 L 37 74 L 34 70 L 30 60 L 28 48 Z',
  /* Sri Lanka */
  'M 39 74 L 41 73 L 42 76 L 40 77 Z',
  /* SE Asian Mainland */
  'M 56 46 L 66 42 L 74 46 L 76 56 L 70 64 L 64 68 L 56 68 L 52 62 L 52 54 Z',
  /* Malay Peninsula & Java */
  'M 64 68 L 68 66 L 72 70 L 70 76 L 64 76 Z',
  /* Indonesia/Sumatra rough */
  'M 58 68 L 66 70 L 68 76 L 62 78 L 56 76 L 54 72 Z',
  /* China / East Asia */
  'M 72 26 L 82 22 L 94 24 L 98 32 L 92 42 L 82 48 L 74 48 L 68 44 L 66 36 Z',
]

/* ── Right panel destination list (grouped) ── */
const PANEL_GROUPS = [
  {
    label: 'India',
    icon: '🇮🇳',
    color: 'var(--gold)',
    items: [
      { airline: 'IndiGo',   route: 'DEL → BOM / MAA' },
      { airline: 'Air India',route: 'DEL → BLR'       },
      { airline: 'Akasa',    route: 'DEL → HYD'       },
    ],
  },
  {
    label: 'Middle East',
    icon: '✈',
    color: '#fb923c',
    items: [
      { airline: 'Emirates',      route: 'DEL → DXB' },
      { airline: 'Qatar Airways', route: 'DEL → DOH' },
      { airline: 'Etihad',        route: 'DEL → AUH' },
      { airline: 'Saudia',        route: 'DEL → RUH' },
      { airline: 'Oman Air',      route: 'DEL → MCT' },
    ],
  },
  {
    label: 'SE Asia',
    icon: '🌏',
    color: '#a78bfa',
    items: [
      { airline: 'Singapore Airlines', route: 'DEL → SIN' },
      { airline: 'AirAsia',            route: 'DEL → KUL' },
      { airline: 'Thai Airways',        route: 'DEL → BKK' },
    ],
  },
  {
    label: 'Europe',
    icon: '🌍',
    color: 'rgba(255,255,255,0.8)',
    items: [
      { airline: 'Air India',  route: 'DEL → LHR' },
      { airline: 'Lufthansa',  route: 'DEL → FRA' },
      { airline: 'KLM',        route: 'DEL → AMS' },
    ],
  },
]

const STATS = [
  { value: '15+',   label: 'Years of Legacy'     },
  { value: '5000+', label: 'Students Trained'    },
  { value: '50+',   label: 'Airline Partners'    },
  { value: '100%',  label: 'Placement Support'   },
]

/* ── Hub particles data ── */
const HUB_PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  angle: i * 60,
  delay: i * 0.3,
  dur: 1.8 + i * 0.2,
}))

export default function GlobalRouteMap() {
  const sectionRef = useRef(null)
  const svgRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.15 })
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip]= useState(null) // { x, y, dest }

  /* Parallax */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const mapY   = useTransform(scrollYProgress, [0, 1], ['0%',  '-10%'])
  const gridY  = useTransform(scrollYProgress, [0, 1], ['0%',  '-5%' ])

  /* Tooltip position inside SVG → section coords */
  function handleEnter(i, e) {
    setHovered(i)
    const rect = svgRef.current?.getBoundingClientRect()
    const sRect = sectionRef.current?.getBoundingClientRect()
    if (!rect || !sRect) return
    // SVG is 100% wide, viewBox 100x82 → pixel coords
    const scaleX = rect.width  / 100
    const scaleY = rect.height / 82
    const dest = DESTINATIONS[i]
    setTooltip({
      x: rect.left - sRect.left + dest.x * scaleX,
      y: rect.top  - sRect.top  + dest.y * scaleY - 64,
      dest,
    })
  }
  function handleLeave() { setHovered(null); setTooltip(null) }

  return (
    <section
      id="global-routes"
      ref={sectionRef}
      style={{ position: 'relative', padding: 'clamp(5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--navy-deep)', color: '#fff', overflow: 'hidden' }}
    >
      {/* ── Continent World Map bg ── */}
      <motion.div
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', y: mapY }}
      >
        <svg
          viewBox="0 0 100 82"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.055 }}
        >
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="rgba(180,210,255,1)" stroke="rgba(180,210,255,0.5)" strokeWidth="0.25" />
          ))}
        </svg>
      </motion.div>

      {/* ── Graticule grid ── */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          y: gridY,
        }}
      />

      {/* ── Radial glow behind hub ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 40% 50% at 40% 52%, rgba(219,36,30,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 50% 50%, rgba(216,160,39,0.04) 0%, transparent 60%)',
        }}
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '3.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ height: '1px', width: '2.5rem', background: 'var(--gold)', display: 'block' }} />
            <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Global Reach
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2rem,4.5vw,3.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.12, maxWidth: '18ch' }}>
            One headquarters.{' '}
            <span
              style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)', display: 'inline-block' }}
              className={inView ? 'global-reach-shimmer' : ''}
            >
              A <span className={inView ? 'world-shimmer' : ''}>world</span> of cockpits.
            </span>
          </h2>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '34ch', fontFamily: 'var(--font-b)' }}>
            From Ramphal Chowk, Dwarka — our pilots command cockpits on every continent.
          </p>
        </motion.div>

        {/* ── Map + Panel grid ── */}
        <div className="grm-layout">

          {/* SVG Route Map */}
          <motion.div
            style={{ position: 'relative' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 100 82"
              style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Hub core gradient */}
                <radialGradient id="grm-hub-core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#fff"         stopOpacity="1"   />
                  <stop offset="35%"  stopColor="var(--red)"  stopOpacity="0.85" />
                  <stop offset="100%" stopColor="var(--red)"  stopOpacity="0"    />
                </radialGradient>
                {/* Hub outer gold bloom */}
                <radialGradient id="grm-hub-outer" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="var(--gold)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"    />
                </radialGradient>
                {/* Per-region route gradients */}
                <linearGradient id="grm-grad-india"  x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="var(--gold)"   stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--gold)"   stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="grm-grad-me"     x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%"   stopColor="#fb923c"        stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fb923c"        stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="grm-grad-sea"    x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#a78bfa"        stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a78bfa"        stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="grm-grad-eu"     x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.8)" stopOpacity="1" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.8)" stopOpacity="0" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="grm-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="grm-glow-sm" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* ── Routes ── */}
              {DESTINATIONS.map((d, i) => {
                const r = REGION[d.region]
                const gradId = d.region === 'India' ? 'grm-grad-india'
                             : d.region === 'Middle East' ? 'grm-grad-me'
                             : d.region === 'SE Asia' ? 'grm-grad-sea'
                             : 'grm-grad-eu'
                const path = arcPath([HUB.x, HUB.y], [d.x, d.y])
                const dim = hovered !== null && hovered !== i
                return (
                  <g key={d.id} style={{ transition: 'opacity 0.3s' }} opacity={dim ? 0.15 : 1}>
                    {/* Route arc */}
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={`url(#${gradId})`}
                      strokeWidth={hovered === i ? 0.55 : 0.35}
                      strokeDasharray={r.dash}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                      transition={{ duration: 1.4 + i * 0.05, delay: 0.06 * i + 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {/* Moving light particle */}
                    <motion.circle
                      r={hovered === i ? 0.85 : 0.55}
                      fill={r.color}
                      filter="url(#grm-glow-sm)"
                      initial={{ offsetDistance: '0%', opacity: 0 }}
                      animate={inView ? { offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] } : {}}
                      transition={{
                        duration: 2.2 + (i % 5) * 0.22,
                        delay: 0.06 * i + 0.8,
                        repeat: Infinity,
                        repeatDelay: 1.5 + (i % 4) * 0.35,
                        ease: 'easeInOut',
                      }}
                      style={{ offsetPath: `path('${path}')` }}
                    />

                    {/* Destination node — outer ring */}
                    <motion.circle
                      cx={d.x} cy={d.y}
                      r={hovered === i ? 2.4 : 1.8}
                      fill="none"
                      stroke={r.color}
                      strokeWidth="0.3"
                      strokeOpacity={hovered === i ? 0.6 : 0.25}
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: 0.06 * i + 1.3, type: 'spring', stiffness: 220 }}
                      style={{ transformOrigin: `${d.x}px ${d.y}px`, transition: 'r 0.25s, stroke-opacity 0.25s' }}
                    />

                    {/* Destination node — core dot */}
                    <motion.circle
                      cx={d.x} cy={d.y}
                      r={hovered === i ? 1.1 : 0.75}
                      fill={hovered === i ? r.color : 'rgba(255,255,255,0.7)'}
                      filter={hovered === i ? 'url(#grm-glow-sm)' : ''}
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: 0.06 * i + 1.3, type: 'spring', stiffness: 220 }}
                      style={{ transformOrigin: `${d.x}px ${d.y}px`, cursor: 'pointer', transition: 'r 0.25s' }}
                      onMouseEnter={e => handleEnter(i, e)}
                      onMouseLeave={handleLeave}
                    />

                    {/* City label */}
                    <motion.text
                      x={d.x + 2.0}
                      y={d.y + 0.5}
                      fill={hovered === i ? r.color : 'rgba(255,255,255,0.55)'}
                      fontSize={hovered === i ? '2.1' : '1.75'}
                      fontFamily="var(--font-h)"
                      fontWeight={hovered === i ? '800' : '600'}
                      style={{ pointerEvents: 'none', transition: 'fill 0.25s, font-size 0.25s' }}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.06 * i + 1.5 }}
                    >
                      {d.iata}
                    </motion.text>
                  </g>
                )
              })}

              {/* ── Hub ── */}
              {/* Outer bloom */}
              <circle cx={HUB.x} cy={HUB.y} r="18" fill="url(#grm-hub-outer)">
                <animate attributeName="r"       values="14;22;14"    dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.15;0.6" dur="4s" repeatCount="indefinite" />
              </circle>

              {/* Radar ring 1 */}
              <circle cx={HUB.x} cy={HUB.y} r="5" fill="none" stroke="rgba(219,36,30,0.3)" strokeWidth="0.4">
                <animate attributeName="r"       values="3;12;3"      dur="3.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5"   dur="3.2s" repeatCount="indefinite" />
              </circle>
              {/* Radar ring 2 */}
              <circle cx={HUB.x} cy={HUB.y} r="8" fill="none" stroke="rgba(219,36,30,0.15)" strokeWidth="0.3">
                <animate attributeName="r"       values="6;18;6"      dur="4.5s" repeatCount="indefinite" begin="0.8s" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="4.5s" repeatCount="indefinite" begin="0.8s" />
              </circle>

              {/* Core glow */}
              <circle cx={HUB.x} cy={HUB.y} r="6" fill="url(#grm-hub-core)" filter="url(#grm-glow)" />

              {/* Hub particles */}
              {HUB_PARTICLES.map((p, i) => {
                const rad = (p.angle * Math.PI) / 180
                const ex = HUB.x + Math.cos(rad) * 12
                const ey = HUB.y + Math.sin(rad) * 12
                return (
                  <motion.circle
                    key={i}
                    r="0.4"
                    fill="var(--gold)"
                    opacity="0"
                    animate={inView ? {
                      cx: [HUB.x, ex],
                      cy: [HUB.y, ey],
                      opacity: [0.8, 0],
                      r: [0.5, 0.15],
                    } : {}}
                    transition={{
                      duration: p.dur,
                      delay: p.delay,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      ease: 'easeOut',
                    }}
                  />
                )
              })}

              {/* Hub dot */}
              <circle cx={HUB.x} cy={HUB.y} r="1.6" fill="#fff" />

              {/* Hub label */}
              <text
                x={HUB.x}
                y={HUB.y + 4.2}
                textAnchor="middle"
                fill="rgba(255,255,255,0.9)"
                fontSize="2.2"
                fontFamily="var(--font-h)"
                fontWeight="900"
                letterSpacing="0.05em"
              >
                DEL
              </text>
              <text
                x={HUB.x}
                y={HUB.y + 6.8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="1.35"
                fontFamily="var(--font-h)"
                fontWeight="600"
                letterSpacing="0.06em"
              >
                DWARKA · DELHI
              </text>
            </svg>
          </motion.div>

          {/* ── Right panel ── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
          >
            <p style={{ fontFamily: 'var(--font-h)', fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              Airborne alumni fly with
            </p>

            {PANEL_GROUPS.map((group, gi) => (
              <div key={group.label} style={{ marginBottom: '1.1rem' }}>
                {/* Region header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', paddingBottom: '0.35rem', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: group.color, display: 'block', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: group.color }}>
                    {group.label}
                  </span>
                </div>

                {/* Airlines */}
                {group.items.map((item, ii) => {
                  const globalIdx = PANEL_GROUPS.slice(0, gi).reduce((a, g) => a + g.items.length, 0) + ii
                  const destIdx = DESTINATIONS.findIndex(d => {
                    // match by airline or region loosely
                    return d.airline === item.airline || (d.region === group.label && DESTINATIONS.filter(x => x.region === group.label)[ii]?.id === d.id)
                  })
                  return (
                    <motion.div
                      key={item.airline}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.55 + globalIdx * 0.04, duration: 0.4 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.3rem 0.6rem', borderRadius: '5px', cursor: 'default',
                        background: 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                        {item.airline}
                      </span>
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)' }}>
                        {item.route}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            ))}

            {/* Separator */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.75rem 0' }} />

            {/* HQ Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'rgba(216,160,39,0.06)',
                border: '1px solid rgba(216,160,39,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.65rem' }}>📍</span>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  Airborne Aviation Academy
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em' }}>
                Ramphal Chowk · Dwarka · Delhi · India
              </div>
              <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['50+ Airlines', '16+ Countries', 'DGCA Approved'].map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: 'var(--font-h)', fontSize: '0.48rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'rgba(216,160,39,0.7)',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid rgba(216,160,39,0.15)',
                      borderRadius: '999px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.aside>
        </div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{
            marginTop: '3.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          className="grm-stats-grid"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '1.4rem 1.75rem',
                background: 'rgba(255,255,255,0.02)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: i === 3 ? 'var(--gold)' : '#fff', letterSpacing: '-0.02em' }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '0.35rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Hover tooltip ── */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 20,
            background: 'rgba(0,8,22,0.95)',
            border: `1px solid ${REGION[tooltip.dest.region].color}40`,
            borderRadius: '8px',
            padding: '0.55rem 0.85rem',
            backdropFilter: 'blur(12px)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.7rem', fontWeight: 800, color: REGION[tooltip.dest.region].color, letterSpacing: '0.08em' }}>
            {tooltip.dest.iata} · {tooltip.dest.city}
          </div>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.2rem' }}>
            {tooltip.dest.airline} · {tooltip.dest.pos}
          </div>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>
            Alumni: {tooltip.dest.alumni}
          </div>
        </div>
      )}

      <style>{`
        .grm-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 3rem;
          align-items: center;
        }
        .world-shimmer {
          animation: world-gold-shimmer 1.6s ease-out 0.8s 1 both;
          display: inline-block;
        }
        @keyframes world-gold-shimmer {
          0%   { color: var(--gold); filter: brightness(1); }
          35%  { color: #ffe680; filter: brightness(1.7) drop-shadow(0 0 12px rgba(216,160,39,0.85)); }
          100% { color: var(--gold); filter: brightness(1); }
        }
        @media (max-width: 900px) {
          .grm-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .grm-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .grm-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
