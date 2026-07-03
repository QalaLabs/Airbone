'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────
   COORDINATE SYSTEM: equirectangular, viewBox "0 0 1000 500"
   DEL (Delhi Hub) is manual coordinate x: 714, y: 170.
   All other coordinates are visual/stylized.
───────────────────────────────────────────────────────── */
const HUB = { x: 714, y: 170 }

/* ─── Region palette ─── */
const REGION = {
  'North America': { color: '#DB241E' },
  Europe:          { color: '#fb923c' },
  'Middle East':   { color: '#D8A027' },
  India:           { color: '#facc15' },
  'SE Asia':       { color: '#a855f7' }
}

/* ─── Airport positions ─── */
const DESTINATIONS = [
  // India (Domestic)
  { id: 'bom', city: 'MUMBAI', iata: 'BOM', region: 'India', x: 685, y: 220, airline: 'IndiGo', pos: 'First Officer', alumni: 'Ruzal Dhral', year: '2024', labelAlign: 'left' },
  { id: 'goi', city: 'GOA', iata: 'GOI', region: 'India', x: 695, y: 250, airline: 'GoFirst', pos: 'Cadet', alumni: 'Naveen Kumar', year: '2023', labelAlign: 'right' },
  { id: 'blr', city: 'BENGALURU', iata: 'BLR', region: 'India', x: 710, y: 280, airline: 'Air India', pos: 'First Officer', alumni: 'Nipun Singh', year: '2023', labelAlign: 'right' },
  { id: 'hyd', city: 'HYDERABAD', iata: 'HYD', region: 'India', x: 730, y: 240, airline: 'Akasa', pos: 'Cadet', alumni: 'Adesh Yadav', year: '2024', labelAlign: 'right' },
  { id: 'maa', city: 'CHENNAI', iata: 'MAA', region: 'India', x: 740, y: 280, airline: 'IndiGo', pos: 'Cadet', alumni: 'Priyanshi K.', year: '2024', labelAlign: 'right' },
  
  // Middle East
  { id: 'ruh', city: 'RIYADH', country: 'SAUDI ARABIA', iata: 'RUH', region: 'Middle East', x: 610, y: 195, airline: 'Saudia', pos: 'Cadet', alumni: 'Arjun Mehta', year: '2024', labelAlign: 'left' },
  { id: 'doh', city: 'DOHA', country: 'QATAR', iata: 'DOH', region: 'Middle East', x: 625, y: 225, airline: 'Qatar Airways', pos: 'Cadet', alumni: 'Kartik Juneja', year: '2023', labelAlign: 'left' },
  { id: 'auh', city: 'ABU DHABI', country: 'UAE', iata: 'AUH', region: 'Middle East', x: 640, y: 255, airline: 'Etihad', pos: 'First Officer', alumni: 'Nabansh Sardana', year: '2023', labelAlign: 'left' },
  { id: 'mct', city: 'MUSCAT', country: 'OMAN', iata: 'MCT', region: 'Middle East', x: 655, y: 285, airline: 'Oman Air', pos: 'First Officer', alumni: 'Deepak Mohan', year: '2023', labelAlign: 'left' },
  
  // Europe
  { id: 'lhr', city: 'LONDON', country: 'UK', iata: 'LHR', region: 'Europe', x: 483, y: 100, airline: 'Air India', pos: 'First Officer', alumni: 'Nipun Singh', year: '2023', labelAlign: 'left' },
  { id: 'ams', city: 'AMSTERDAM', country: 'NETHERLANDS', iata: 'AMS', region: 'Europe', x: 515, y: 96, airline: 'KLM', pos: 'First Officer', alumni: 'Vikram Pandey', year: '2022', labelAlign: 'right' },
  { id: 'fra', city: 'FRANKFURT', country: 'GERMANY', iata: 'FRA', region: 'Europe', x: 538, y: 114, airline: 'Lufthansa', pos: 'Cadet', alumni: 'Shreya Kapoor', year: '2024', labelAlign: 'right', labelDy: 9 },
  
  // North America
  { id: 'yvr', city: 'VANCOUVER', country: 'CANADA', iata: 'YVR', region: 'North America', x: 158, y: 113, airline: 'Air India', pos: 'First Officer', alumni: 'Naman Gupta', year: '2024', labelAlign: 'right' },
  { id: 'jfk', city: 'NEW YORK', country: 'USA', iata: 'JFK', region: 'North America', x: 295, y: 137, airline: 'Air India', pos: 'First Officer', alumni: 'Rahul Sethi', year: '2023', labelAlign: 'right' },
  
  // SE Asia
  { id: 'bkk', city: 'BANGKOK', country: 'THAILAND', iata: 'BKK', region: 'SE Asia', x: 785, y: 220, airline: 'Thai Airways', pos: 'Cadet', alumni: 'Rohit Verma', year: '2024', labelAlign: 'right' },
  { id: 'kul', city: 'KUALA LUMPUR', country: 'MALAYSIA', iata: 'KUL', region: 'SE Asia', x: 795, y: 255, airline: 'AirAsia', pos: 'First Officer', alumni: 'Priya Madan', year: '2023', labelAlign: 'right' },
  { id: 'sin', city: 'SINGAPORE', country: 'SINGAPORE', iata: 'SIN', region: 'SE Asia', x: 810, y: 285, airline: 'Singapore Airlines', pos: 'First Officer', alumni: 'Ankit Sharma', year: '2022', labelAlign: 'right' }
]

/* ─── Right panel groups ─── */
const PANEL_GROUPS = [
  { label: 'India', color: '#facc15', items: [
    { airline: 'IndiGo', route: 'DEL • BOM • MAA' },
    { airline: 'Air India', route: 'DEL • BLR' },
    { airline: 'Akasa Air', route: 'DEL • HYD' }
  ]},
  { label: 'Middle East', color: '#D8A027', items: [
    { airline: 'Emirates', route: 'DEL • DXB' },
    { airline: 'Qatar Airways', route: 'DEL • DOH' },
    { airline: 'Etihad Airways', route: 'DEL • AUH' },
    { airline: 'Saudia', route: 'DEL • RUH' },
    { airline: 'Oman Air', route: 'DEL • MCT' }
  ]},
  { label: 'SE Asia', color: '#a855f7', items: [
    { airline: 'Singapore Airlines', route: 'DEL • SIN' },
    { airline: 'AirAsia', route: 'DEL • KUL' },
    { airline: 'Thai Airways', route: 'DEL • BKK' }
  ]},
  { label: 'Europe', color: '#fb923c', items: [
    { airline: 'Air India', route: 'DEL • LHR' },
    { airline: 'Lufthansa', route: 'DEL • FRA' },
    { airline: 'KLM', route: 'DEL • AMS' }
  ]}
]

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
    value: '5000+',
    label: 'STUDENTS TRAINED',
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

/* ─── Continent outlines equirectangular 1000×500 ─── */
const CONTINENTS = [
  'M 28,58 L 61,56 L 100,67 L 128,58 L 150,53 L 192,47 L 242,47 L 281,72 L 317,83 L 342,103 L 347,117 L 322,120 L 300,131 L 289,156 L 278,183 L 261,197 L 253,219 L 208,200 L 186,200 L 167,175 L 153,144 L 145,111 L 111,94 L 72,83 Z',
  'M 347,25 L 378,14 L 408,22 L 411,42 L 394,50 L 369,50 L 353,39 Z',
  'M 281,222 L 297,217 L 319,217 L 367,225 L 400,256 L 403,278 L 381,317 L 358,350 L 336,344 L 314,369 L 306,400 L 289,386 L 292,358 L 281,319 L 275,278 L 278,250 Z',
  'M 478,150 L 476,125 L 486,111 L 483,94 L 500,89 L 519,89 L 531,100 L 564,97 L 578,92 L 581,58 L 592,61 L 589,117 L 581,128 L 578,133 L 567,144 L 556,142 L 544,142 L 536,131 L 519,133 L 511,133 L 508,139 L 494,142 L 483,147 Z',
  'M 478,147 L 503,147 L 528,144 L 556,150 L 589,161 L 594,169 L 644,219 L 617,253 L 606,278 L 594,317 L 553,347 L 517,325 L 508,300 L 519,278 L 531,264 L 525,242 L 506,233 L 500,236 L 472,222 L 456,208 L 467,192 L 475,175 Z',
  'M 594,117 L 617,117 L 636,131 L 650,156 L 664,150 L 686,139 L 722,122 L 753,103 L 806,78 L 853,64 L 906,56 L 942,78 L 917,100 L 908,111 L 892,119 L 878,133 L 856,153 L 833,164 L 822,183 L 806,206 L 789,228 L 775,242 L 767,247 L 756,244 L 742,228 L 728,214 L 719,200 L 714,197 L 708,200 L 700,214 L 694,222 L 681,219 L 664,214 L 650,208 L 644,219 L 636,206 L 625,189 L 619,175 L 611,156 L 603,147 L 597,139 Z',
  'M 669,150 L 683,148 L 706,147 L 728,153 L 742,167 L 739,181 L 731,197 L 723,211 L 717,222 L 711,225 L 706,222 L 697,214 L 689,200 L 681,186 L 675,170 Z',
  'M 569,158 L 581,150 L 597,150 L 614,156 L 628,167 L 636,181 L 644,197 L 644,211 L 633,219 L 625,219 L 614,211 L 608,200 L 600,186 L 592,172 L 583,167 Z',
  'M 756,192 L 769,194 L 778,200 L 781,211 L 783,228 L 775,242 L 764,247 L 753,247 L 744,244 L 739,236 L 728,225 L 728,214 Z',
  'M 764,247 L 769,253 L 772,261 L 769,267 L 764,261 L 761,253 Z',
  'M 803,278 L 814,261 L 828,253 L 853,258 L 869,267 L 881,275 L 894,289 L 903,308 L 906,325 L 894,342 L 875,353 L 850,353 L 825,342 L 808,325 L 803,308 L 806,294 Z',
  'M 936,336 L 942,325 L 950,328 L 950,339 L 944,344 Z',
  'M 869,144 L 878,136 L 886,142 L 883,150 L 875,153 Z'
]

/* ─── Dotted city lights textures coordinates — 100+ points distributed globally ─── */
const CITY_LIGHTS = [
  // North America
  { x: 100, y: 120 }, { x: 110, y: 115 }, { x: 120, y: 110 }, { x: 130, y: 90 },
  { x: 140, y: 85 }, { x: 150, y: 110 }, { x: 160, y: 105 }, { x: 170, y: 115 },
  { x: 180, y: 125 }, { x: 190, y: 130 }, { x: 200, y: 140 }, { x: 210, y: 145 },
  { x: 220, y: 135 }, { x: 230, y: 130 }, { x: 240, y: 125 }, { x: 250, y: 120 },
  { x: 260, y: 115 }, { x: 270, y: 110 }, { x: 280, y: 115 }, { x: 290, y: 120 },
  { x: 300, y: 125 }, { x: 310, y: 130 }, { x: 320, y: 135 }, { x: 285, y: 145 },
  { x: 295, y: 150 }, { x: 305, y: 155 }, { x: 315, y: 160 }, { x: 325, y: 165 },
  // South America
  { x: 290, y: 240 }, { x: 300, y: 250 }, { x: 310, y: 260 }, { x: 320, y: 280 },
  { x: 330, y: 300 }, { x: 340, y: 320 }, { x: 350, y: 340 }, { x: 360, y: 350 },
  { x: 370, y: 330 }, { x: 380, y: 310 }, { x: 390, y: 290 }, { x: 355, y: 270 },
  // Europe
  { x: 485, y: 95 }, { x: 495, y: 100 }, { x: 505, y: 105 }, { x: 515, y: 110 },
  { x: 525, y: 115 }, { x: 535, y: 120 }, { x: 545, y: 125 }, { x: 555, y: 130 },
  { x: 500, y: 90 }, { x: 510, y: 95 }, { x: 520, y: 100 }, { x: 530, y: 105 },
  { x: 540, y: 110 }, { x: 550, y: 115 }, { x: 560, y: 120 }, { x: 570, y: 125 },
  // Africa
  { x: 490, y: 180 }, { x: 500, y: 190 }, { x: 510, y: 200 }, { x: 520, y: 220 },
  { x: 530, y: 240 }, { x: 540, y: 260 }, { x: 550, y: 280 }, { x: 560, y: 300 },
  { x: 570, y: 320 }, { x: 580, y: 310 }, { x: 590, y: 290 }, { x: 600, y: 270 },
  // Middle East
  { x: 590, y: 180 }, { x: 600, y: 185 }, { x: 610, y: 190 }, { x: 620, y: 195 },
  { x: 630, y: 200 }, { x: 640, y: 205 }, { x: 605, y: 200 }, { x: 615, y: 205 },
  { x: 625, y: 210 }, { x: 635, y: 215 }, { x: 645, y: 220 }, { x: 650, y: 210 },
  // India
  { x: 680, y: 190 }, { x: 690, y: 195 }, { x: 700, y: 200 }, { x: 710, y: 205 },
  { x: 720, y: 210 }, { x: 730, y: 215 }, { x: 685, y: 210 }, { x: 695, y: 215 },
  { x: 705, y: 220 }, { x: 715, y: 225 }, { x: 725, y: 230 }, { x: 735, y: 235 },
  // East Asia & China
  { x: 740, y: 120 }, { x: 750, y: 125 }, { x: 760, y: 130 }, { x: 770, y: 135 },
  { x: 780, y: 140 }, { x: 790, y: 145 }, { x: 800, y: 150 }, { x: 810, y: 155 },
  { x: 820, y: 160 }, { x: 830, y: 165 }, { x: 840, y: 170 }, { x: 850, y: 175 },
  { x: 765, y: 110 }, { x: 775, y: 115 }, { x: 785, y: 120 }, { x: 795, y: 125 },
  { x: 805, y: 130 }, { x: 815, y: 135 }, { x: 825, y: 140 }, { x: 835, y: 145 },
  // SE Asia
  { x: 760, y: 210 }, { x: 770, y: 215 }, { x: 780, y: 220 }, { x: 790, y: 225 },
  { x: 800, y: 230 }, { x: 810, y: 235 }, { x: 775, y: 230 }, { x: 785, y: 235 },
  { x: 795, y: 240 }, { x: 805, y: 245 }, { x: 815, y: 250 }, { x: 820, y: 260 },
  // Australia
  { x: 820, y: 310 }, { x: 830, y: 315 }, { x: 840, y: 320 }, { x: 850, y: 325 },
  { x: 860, y: 330 }, { x: 870, y: 335 }, { x: 835, y: 330 }, { x: 845, y: 335 },
  { x: 855, y: 340 }, { x: 865, y: 345 }, { x: 875, y: 350 }, { x: 880, y: 340 }
]

/* ─── Perpendicular custom bezier arc calculator ─── */
function arcPath([x1, y1], [x2, y2], region, id) {
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  
  let px = cx
  let py = cy
  
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  if (region === 'India') {
    if (id === 'bom' || id === 'goi' || id === 'blr') {
      px = cx - dist * 0.14
      py = cy + dist * 0.18
    } else {
      px = cx + dist * 0.14
      py = cy + dist * 0.18
    }
  } else if (region === 'SE Asia') {
    px = cx + dist * 0.1
    py = cy + dist * 0.18
  } else if (region === 'Middle East') {
    px = cx - dist * 0.05
    py = cy - dist * 0.28
  } else if (region === 'Europe') {
    px = cx - dist * 0.02
    py = cy - dist * 0.24
  } else if (region === 'North America') {
    px = cx - dist * 0.05
    py = cy - dist * 0.22
  }
  
  return `M ${x1} ${y1} Q ${px} ${py} ${x2} ${y2}`
}

/* ─── Hub pulse rings definition ─── */
const HUB_RINGS = [
  { r0: 10, r1: 35, dur: 2.8, begin: '0s',   sw: 2,   sc: 'rgba(219,36,30,0.5)'  },
  { r0: 18, r1: 65, dur: 4.2, begin: '0.8s', sw: 1.5, sc: 'rgba(219,36,30,0.25)' },
  { r0: 15, r1: 90, dur: 6.0, begin: '1.8s', sw: 1,   sc: 'rgba(216,160,39,0.15)' },
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
  const [display, setDisplay] = useState(0)
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
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.4rem,2.2vw,1.8rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.15 }}>
          {val}
        </div>
        <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem', fontWeight: 700 }}>
          {stat.label}
        </div>
        <div style={{ fontFamily: 'var(--font-b)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem', lineHeight: 1.35 }}>
          {stat.desc1} <br/> {stat.desc2}
        </div>
      </div>
    </motion.div>
  )
}

export default function GlobalRouteMap() {
  const sectionRef = useRef(null)
  const svgRef     = useRef(null)
  const mapWrapRef = useRef(null)
  const inView     = useInView(sectionRef, { once: true, amount: 0.15 })
  const [hovered, setHovered]   = useState(null)
  const [tooltip, setTooltip]   = useState(null)
  const [pinned, setPinned]     = useState(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  /* Respect prefers-reduced-motion + cut particle density on small screens */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onMqChange = e => setReducedMotion(e.matches)
    mq.addEventListener('change', onMqChange)
    const onResize = () => setIsMobile(window.innerWidth < 769)
    onResize()
    window.addEventListener('resize', onResize)
    return () => { mq.removeEventListener('change', onMqChange); window.removeEventListener('resize', onResize) }
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
  const l1x = useTransform(mx, v => `${v * -0.006}%`), l1y = useTransform(my, v => `${v * -0.006}%`)
  const l2x = useTransform(mx, v => `${v * -0.012}%`), l2y = useTransform(my, v => `${v * -0.012}%`)
  const glx = useTransform(mx, v => `${v * 0.008}%`), gly = useTransform(my, v => `${v * 0.008}%`)

  const onMouseMove  = e => { const r = sectionRef.current?.getBoundingClientRect(); if(r){ rawX.set(e.clientX-r.left-r.width/2); rawY.set(e.clientY-r.top-r.height/2) } }
  const onMouseLeave = () => { rawX.set(0); rawY.set(0) }

  /* Tooltip coordination */
  function handleEnter(i) {
    setHovered(i)
    const rect  = svgRef.current?.getBoundingClientRect()
    const sRect = sectionRef.current?.getBoundingClientRect()
    if (!rect || !sRect) return
    const dest = DESTINATIONS[i]
    const sx = rect.width  / 1000
    const sy = rect.height / 500
    setTooltip({ 
      x: rect.left - sRect.left + dest.x * sx, 
      y: rect.top - sRect.top + dest.y * sy - 65, 
      dest 
    })
  }
  function handleLeave() { if (pinned === null) { setHovered(null); setTooltip(null) } }
  function handleTap(i) {
    if (pinned === i) { setPinned(null); setHovered(null); setTooltip(null) }
    else { setPinned(i); handleEnter(i) }
  }

  /* Scroll shifts */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end','end start'] })
  const mapScrollY  = useTransform(scrollYProgress, [0,1], ['0%','-3%'])

  /* SVG node scaling specs */
  const SW_ROUTE   = 1.15
  const SW_GLOW    = 2.8
  const R_OUTER    = 7.0
  const R_INNER    = 4.5
  const R_CORE     = 3.0

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

      {/* ── HEADER (Centered, static on top) ── */}
      <div className="grm-header-wrap container-fluid" style={{ position:'relative', zIndex:20, padding:'2.5rem clamp(1.25rem,4vw,3.5rem) 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.7 }}
          style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.5rem' }}>
          <span style={{ color: '#DB241E', fontWeight: 900, fontSize: '0.85rem' }}>—</span>
          <span style={{ fontFamily:'var(--font-h)', fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'#fff' }}>One Headquarters.</span>
          <span style={{ color: '#DB241E', fontWeight: 900, fontSize: '0.85rem' }}>—</span>
        </motion.div>
        
        <motion.h2 initial={{ opacity:0, y:28 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.85, delay:0.1, ease:[0.16,1,0.3,1] }}
          style={{ fontFamily:'var(--font-h)', fontSize:'clamp(2.2rem,5vw,4.5rem)', fontWeight:900, lineHeight:1.05, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          A World <span style={{ color:'#DB241E' }}>of Cockpits.</span>
        </motion.h2>
        
        <motion.p initial={{ opacity:0, y:16 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.7, delay:0.25 }}
          style={{ marginTop:'0.8rem', color:'rgba(255,255,255,0.7)', fontSize:'0.95rem', lineHeight:1.65, maxWidth:'700px', fontFamily:'var(--font-b)' }}>
          From Ramphal Chowk, Dwarka — our pilots command cockpits on every continent. <br/>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>We train here. They fly everywhere.</span>
        </motion.p>
        
        <div style={{ width: '80px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #D8A027 50%, transparent)', marginTop: '1.25rem' }} />
      </div>

      {/* ── MAP CONTAINER (Spans full width, positioned relatively behind sidebar) ── */}
      <motion.div className="grm-map-wrap" style={{ y:mapScrollY, flex:1, display:'flex', alignItems:'center', position:'relative', zIndex:10, width:'100%', margin:'-2rem auto 0' }} ref={mapWrapRef}>
        <div className="grm-map-outer container-fluid" style={{ padding:'0 clamp(1.25rem,4vw,3.5rem)', position:'relative', display:'flex', alignItems:'center', gap:'2rem' }}>
          <div className="grm-map-canvas" style={{ position:'relative', flex:'1 1 auto', minWidth:0 }}>
          <motion.svg
            ref={svgRef}
            viewBox="0 0 1000 500"
            style={{ width:'100%', height:'auto', display:'block', overflow:'visible' }}
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
            <g stroke="rgba(56,189,248,0.015)" strokeWidth="0.5" strokeDasharray="3 4" fill="none">
              <line x1="0" y1="80" x2="1000" y2="80" />
              <line x1="0" y1="160" x2="1000" y2="160" />
              <line x1="0" y1="240" x2="1000" y2="240" />
              <line x1="0" y1="320" x2="1000" y2="320" />
              <line x1="0" y1="400" x2="1000" y2="400" />
              <line x1="160" y1="0" x2="160" y2="500" />
              <line x1="320" y1="0" x2="320" y2="500" />
              <line x1="480" y1="0" x2="480" y2="500" />
              <line x1="640" y1="0" x2="640" y2="500" />
              <line x1="800" y1="0" x2="800" y2="500" />
            </g>

            {/* ─ Dotted world map continents fill and edge glow ─ */}
            {CONTINENTS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="url(#grm-dot-grid)"
                stroke="rgba(56,189,248,0.12)"
                strokeWidth="0.8"
                style={{ filter: 'drop-shadow(0 0 1px rgba(56,189,248,0.15))' }}
              />
            ))}

            {/* ─ Glowing India geopolitical base territory silhouette ─ */}
            <path
              d={CONTINENTS[6]}
              fill="rgba(219, 36, 30, 0.28)"
              stroke="#DB241E"
              strokeWidth="1.8"
              filter="url(#g2-glow-xs)"
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
              const r    = REGION[d.region]
              const gid  = d.region === 'India' ? 'g2-india' : d.region === 'Middle East' ? 'g2-me' : d.region === 'SE Asia' ? 'g2-sea' : d.region === 'Europe' ? 'g2-eu' : 'g2-na'
              const path = arcPath([HUB.x, HUB.y], [d.x, d.y], d.region, d.id)
              const dim  = hovered !== null && hovered !== i
              return (
                <g key={d.id} opacity={dim ? 0.12 : 1} style={{ transition:'opacity 0.35s' }}>
                  
                  {/* Thick glowing route background */}
                  <motion.path d={path} fill="none" stroke={r.color} strokeWidth={SW_GLOW} strokeOpacity="0.25" filter="url(#g2-glow-xs)"
                    initial={{ pathLength:0 }} animate={inView?{pathLength:1}:{}} transition={{ duration:1.5+i*0.04, delay:0.06*i+0.3, ease:[0.16,1,0.3,1] }}/>
                  
                  {/* Main solid route line */}
                  <motion.path d={path} fill="none" stroke={`url(#${gid})`} strokeWidth={hovered===i?SW_ROUTE*1.6:SW_ROUTE}
                    initial={{ pathLength:0, opacity:0 }} animate={inView?{pathLength:1,opacity:1}:{}} transition={{ duration:1.4+i*0.04, delay:0.06*i+0.3, ease:[0.16,1,0.3,1] }}/>
                  
                  {/* Animated plane arrowheads */}
                  {!reducedMotion && (
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

                  {/* Airport Rings */}
                  <motion.circle cx={d.x} cy={d.y} r={hovered===i?R_OUTER*1.25:R_OUTER} fill="none" stroke={r.color} strokeWidth="1.2" strokeOpacity={hovered===i?0.75:0.35}
                    initial={{ scale:0 }} animate={inView?{scale:1}:{}} transition={{ delay:0.05*i+1.0, type:'spring', stiffness:200 }}
                    style={{ transformOrigin:`${d.x}px ${d.y}px`, transition:'r 0.2s' }}/>
                  
                  <motion.circle cx={d.x} cy={d.y} r={hovered===i?R_INNER*1.25:R_INNER} fill="none" stroke={r.color} strokeWidth="0.8" strokeOpacity={hovered===i?0.5:0.2}
                    initial={{ scale:0 }} animate={inView?{scale:1}:{}} transition={{ delay:0.05*i+1.1, type:'spring', stiffness:200 }}
                    style={{ transformOrigin:`${d.x}px ${d.y}px`, transition:'r 0.2s' }}/>
                  
                  {/* Node Dot */}
                  <motion.circle cx={d.x} cy={d.y} r={hovered===i?R_CORE*1.35:R_CORE} fill={hovered===i?r.color:'#fff'} filter={hovered===i?'url(#g2-glow-xs)':''}
                    initial={{ scale:0 }} animate={inView?{scale:1}:{}} transition={{ delay:0.05*i+1.0, type:'spring', stiffness:220 }}
                    style={{ transformOrigin:`${d.x}px ${d.y}px`, cursor:'pointer', transition:'r 0.2s, fill 0.2s', pointerEvents:'none' }}/>

                  {/* Invisible larger hit target — real dot is too small to reliably tap on mobile */}
                  <circle cx={d.x} cy={d.y} r={14} fill="transparent" style={{ cursor:'pointer' }}
                    onMouseEnter={() => handleEnter(i)} onMouseLeave={handleLeave} onClick={() => handleTap(i)}/>

                  {/* Stacked Labels */}
                  <g style={{ pointerEvents:'none' }}>
                    <motion.text
                      x={d.x + (d.labelAlign === 'left' ? -10 : 10)}
                      y={d.y - 4 + (d.labelDy || 0)}
                      textAnchor={d.labelAlign === 'left' ? 'end' : 'start'}
                      fill="#fff"
                      fontSize="7.8"
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
                      x={d.x + (d.labelAlign === 'left' ? -10 : 10)}
                      y={d.y + 4 + (d.labelDy || 0)}
                      textAnchor={d.labelAlign === 'left' ? 'end' : 'start'}
                      fill={r.color}
                      fontSize="4.8"
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
                        x={d.x + (d.labelAlign === 'left' ? -10 : 10)}
                        y={d.y + 11 + (d.labelDy || 0)}
                        textAnchor={d.labelAlign === 'left' ? 'end' : 'start'}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="4.2"
                        fontFamily="var(--font-b)"
                        fontWeight="500"
                        letterSpacing="0.02em"
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
            <circle cx={HUB.x} cy={HUB.y} r="85" fill="url(#g2-hub-bloom)" opacity={reducedMotion ? 0.45 : undefined}>
              {!reducedMotion && (
                <>
                  <animate attributeName="r"       values="65;110;65"    dur="4.5s"   repeatCount="indefinite"/>
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

            <circle cx={HUB.x} cy={HUB.y} r="28" fill="url(#g2-hub-core)" filter="url(#g2-glow-lg)"/>
            <ellipse cx={HUB.x-3} cy={HUB.y-3} rx="6" ry="3" fill="url(#g2-lens)" opacity="0.65" transform={`rotate(-35,${HUB.x},${HUB.y})`}/>
            <circle cx={HUB.x} cy={HUB.y} r="7" fill="#fff" filter="url(#g2-glow-lg)"/>

            {/* Outward drifting hub particles */}
            {!reducedMotion && Array.from({length:8}, (_,i) => {
              const ang = (i/8)*Math.PI*2
              return (
                <motion.circle key={i} r="1.8" fill={i%2===0?'var(--gold)':'#DB241E'}
                  initial={{ cx:HUB.x, cy:HUB.y, opacity:0 }}
                  animate={inView?{ cx:[HUB.x, HUB.x+Math.cos(ang)*60], cy:[HUB.y, HUB.y+Math.sin(ang)*60], opacity:[0.85,0] }:{}}
                  transition={{ duration:1.8+i*0.15, delay:i*0.25, repeat:Infinity, repeatDelay:1.2, ease:'easeOut' }}/>
              )
            })}

            {/* Dark halo behind hub text so labels stay legible against the red bloom */}
            <g style={{ paintOrder:'stroke', stroke:'#02060d', strokeWidth:4, strokeLinejoin:'round' }}>
              <text x={HUB.x} y={HUB.y+20} textAnchor="middle" fill="#fff" fontSize="12" fontFamily="var(--font-h)" fontWeight="900" letterSpacing="0.06em">DEL</text>
              <text x={HUB.x} y={HUB.y+31} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="6" fontFamily="var(--font-h)" fontWeight="700" letterSpacing="0.08em">DWARKA · DELHI</text>
              <text x={HUB.x} y={HUB.y+39} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="5.2" fontFamily="var(--font-h)" fontWeight="600" letterSpacing="0.08em">INDIA</text>
            </g>
          </motion.svg>

          {/* Legend (Bottom-Left) */}
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '1rem', 
              left: '1rem', 
              background: 'rgba(5,10,20,0.65)', 
              backdropFilter: 'blur(8px)', 
              border: '1px solid rgba(255,255,255,0.06)', 
              padding: '0.65rem 0.85rem', 
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              zIndex: 30
            }}
            className="grm-legend"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontFamily: 'var(--font-h)', fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: '#DB241E', fontSize: '0.65rem', width: '12px', display: 'inline-block' }}>✈</span>
              INTERNATIONAL ROUTES
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontFamily: 'var(--font-h)', fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: '#D8A027', fontSize: '0.65rem', width: '12px', display: 'inline-block' }}>✈</span>
              DOMESTIC ROUTES
            </div>
          </div>
          </div>

          {/* Alumni Sidebar — normal flex column on desktop so it reserves its own space instead of covering map nodes */}
          <motion.aside
            initial={{ opacity:0, x:24 }} animate={inView?{opacity:1,x:0}:{}} transition={{ duration:0.75, delay:0.45, ease:[0.16,1,0.3,1] }}
            className="grm-right-panel"
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '290px',
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
            <h4 style={{ fontFamily:'var(--font-h)', fontSize:'0.55rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:'1.1rem', fontWeight: 800, borderBottom: '1px solid rgba(219,36,30,0.35)', paddingBottom: '0.25rem' }}>
              AIRBORNE ALUMNI FLY WITH
            </h4>
            
            {PANEL_GROUPS.map((group, gi) => (
              <div key={group.label} style={{ marginBottom:'0.9rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.45rem', marginBottom:'0.35rem', paddingBottom:'0.25rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width:'4.5px', height:'4.5px', borderRadius:'50%', background:group.color, display:'block', flexShrink:0, boxShadow:`0 0 5px ${group.color}` }}/>
                  <span style={{ fontFamily:'var(--font-h)', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:group.color }}>{group.label}</span>
                </div>
                
                {group.items.map((item, ii) => {
                  const prevCount = PANEL_GROUPS.slice(0,gi).reduce((a,g)=>a+g.items.length,0)+ii
                  return (
                    <motion.div key={item.airline} initial={{ opacity:0, x:-8 }} animate={inView?{opacity:1,x:0}:{}} transition={{ delay:0.5+prevCount*0.03, duration:0.4 }}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.2rem 0.4rem', borderRadius:'4px', transition:'background 0.2s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{ fontFamily:'var(--font-h)', fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{item.airline}</span>
                      <span style={{ fontFamily:'var(--font-h)', fontSize:'0.56rem', letterSpacing:'0.06em', color:'rgba(255,255,255,0.3)' }}>{item.route}</span>
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
                {['50+ Airlines','50+ Countries','DGCA Approved'].map(tag=>(
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
            {tooltip.dest.airline} · {tooltip.dest.pos}
          </div>
          <div style={{ fontFamily:'var(--font-b)', fontSize:'0.52rem', color:'rgba(255,255,255,0.35)', marginTop:'0.15rem' }}>
            Alumni: {tooltip.dest.alumni} · Class of {tooltip.dest.year}
          </div>
        </div>
      )}

      {/* ── BOTTOM CONVERSION CTA BAR ── */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '70px', 
          background: 'rgba(5,10,20,0.92)', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          zIndex: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch'
        }}
        className="grm-cta-bar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem,3vw,2.5rem)', paddingLeft: 'clamp(1.25rem,4vw,3.5rem)' }}>
          {/* Call Column */}
          <a href="tel:+919953777320" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px', color: '#D8A027' }}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.43 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.22z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', fontWeight: 800 }}>CALL US</div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 900, color: '#fff', letterSpacing: '0.02em', marginTop: '-0.05rem' }}>+91 99537 77320</div>
            </div>
          </a>

          {/* WhatsApp Column */}
          <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '15px', height: '15px', color: '#25D366' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', fontWeight: 800 }}>WHATSAPP</div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 900, color: '#fff', letterSpacing: '0.02em', marginTop: '-0.05rem' }}>Chat with our experts</div>
            </div>
          </a>
        </div>

        {/* Slanted red demo column */}
        <a 
          href="/contact?reason=demo"
          style={{ 
            background: 'var(--red)', 
            color: '#fff', 
            padding: '0 3.5rem 0 4.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            textDecoration: 'none',
            clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0% 100%)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#bd1c18'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
          className="grm-cta-slant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.1 }}>BOOK A DEMO</div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', marginTop: '0.08rem' }}>Reserve your seat today</div>
          </div>
        </a>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .grm-stats-strip { grid-template-columns:repeat(4,1fr) !important; }
        @media (min-width:1025px) {
          .grm-map-outer {
            min-height: 520px;
          }
        }
        @media (max-width:1024px) {
          .grm-map-wrap { margin-top:1.5rem !important; }
          .grm-map-outer { flex-direction:column !important; padding:0 1.25rem 37rem !important; }
          .grm-right-panel { position:absolute !important; top:auto !important; bottom:0 !important; left:50% !important; right:auto !important; transform:translate(-50%, 0) !important; width:calc(100% - 2.5rem) !important; max-width:360px !important; }
          .grm-stats-strip { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media (max-width:768px) {
          .grm-stats-strip { grid-template-columns:1fr !important; }
          .grm-stat-cell { border-right:none !important; border-bottom:1px solid rgba(255,255,255,0.05); }
          .grm-stat-cell:last-child { border-bottom:none !important; }
          .grm-cta-bar { flex-direction:column !important; height:auto !important; align-items:stretch !important; }
          .grm-cta-bar > div { padding:1rem !important; justify-content:center !important; flex-wrap:wrap; }
          .grm-cta-slant { clip-path:none !important; padding:1.2rem !important; justify-content:center !important; }
          .grm-legend { display:none !important; }
        }
      `}}/>
    </section>
  )
}
