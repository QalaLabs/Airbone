/**
 * AIRBORNE AVIATION ACADEMY — V6 App
 * 3D Immersive Scroll Website
 *
 * Architecture:
 * - Fixed Three.js canvas (z:1) — the 3D world
 * - Fixed HTML overlays (z:10) — text, HUD, CTAs per act
 * - Scroll container (700vh) — drives everything
 */

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { useScrollEngine, ACTS, TOTAL_VH } from './hooks/useScrollEngine'
import MasterScene from './scenes/MasterScene'
import './index.css'

/* ─── CURSOR ─── */
function Cursor() {
  const dotRef  = useRef()
  const ringRef = useRef()

  useEffect(() => {
    let px = 0, py = 0, rx = 0, ry = 0, raf

    const move = (e) => { px = e.clientX; py = e.clientY }
    const loop = () => {
      rx += (px - rx) * 0.1
      ry += (py - ry) * 0.1
      if (dotRef.current)  dotRef.current.style.cssText  = `left:${px}px;top:${py}px`
      if (ringRef.current) ringRef.current.style.cssText = `left:${rx}px;top:${ry}px`
      raf = requestAnimationFrame(loop)
    }
    const over  = () => { dotRef.current?.classList.add('hover'); ringRef.current?.classList.add('hover') }
    const out   = () => { dotRef.current?.classList.remove('hover'); ringRef.current?.classList.remove('hover') }

    window.addEventListener('mousemove', move, { passive: true })
    document.querySelectorAll('button, a').forEach(el => {
      el.addEventListener('mouseenter', over)
      el.addEventListener('mouseleave', out)
    })
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}

/* ─── LOADER ─── */
function Loader({ done }) {
  return (
    <div className={`loader ${done ? 'out' : ''}`}>
      <div>
        <div className="loader-brand">Air<em>borne</em></div>
        <div className="loader-sub">Aviation Academy</div>
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" />
      </div>
      <div className="loader-sub" style={{ fontSize: '.52rem' }}>Preparing your cockpit…</div>
    </div>
  )
}

/* ─── NAV ─── */
function Nav({ actIndex, total, onDemo }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="nav-logo" aria-label="Airborne Aviation Academy home">
        <img src="/logo-white.webp" alt="Airborne Aviation Academy" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
      </a>

      <ul className="nav-links" role="list">
        {['Courses', 'Simulator', 'Alumni', 'Contact'].map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          </li>
        ))}
      </ul>

      <button id="nav-demo-btn" className="nav-cta" onClick={onDemo}>
        Book Demo
      </button>

      {/* Progress bar */}
      <div
        className="progress-bar"
        style={{ transform: `scaleX(${total})` }}
        aria-hidden="true"
      />
    </nav>
  )
}

/* ─── SCENE DOTS ─── */
function SceneDots({ actIndex }) {
  const scrollToAct = (i) => {
    const vh = window.innerHeight
    const target = i * 100 * vh / 100
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <div className="scene-dots" role="navigation" aria-label="Scene navigation">
      {ACTS.map((act, i) => (
        <button
          key={act.id}
          className={`scene-dot ${i === actIndex ? 'active' : ''}`}
          onClick={() => scrollToAct(i)}
          title={act.label}
          aria-label={act.label}
          aria-current={i === actIndex}
        />
      ))}
    </div>
  )
}

/* ─── SCENE LABEL ─── */
function SceneLabel({ actIndex }) {
  const act = ACTS[actIndex]
  return (
    <div className="scene-label" aria-live="polite">
      <span className="scene-label-num">{String(act.id + 1).padStart(2, '0')}</span>
      <span className="scene-label-name">{act.name}</span>
    </div>
  )
}

/* ─── TICKER ─── */
const TICKER_ITEMS = [
  { name: 'Ruzal Dhral', airline: 'IndiGo Cadet' },
  { name: 'Capt. Nipun Singh', airline: 'Air India' },
  { name: 'Capt. Himanish Sagwal', airline: 'Emirates' },
  { name: 'Batch 2023', airline: '100% Pass Rate' },
  { name: 'Batch 2024', airline: '100% Pass Rate' },
  { name: 'DGCA CPL Ground School', airline: 'Dwarka, Delhi' },
  { name: 'Max 25 Students', airline: 'Per Batch' },
  { name: '15+ Years', airline: 'Teaching Excellence' },
]

function AlumniTicker({ visible }) {
  if (!visible) return null
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-bar" aria-label="Alumni highlights">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-dot">✦</span>
            <strong>{item.name}</strong>
            <span>·</span>
            <span>{item.airline}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── ACT OVERLAYS ─── */

function Act1Overlay({ visible, onDemo, onApply }) {
  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div className="ov-dream">
        <p className="ov-eyebrow">Airborne Aviation Academy</p>
        <h1 className="ov-h1">
          From Dream
          <em>To Cockpit.</em>
        </h1>
        <p className="ov-body" style={{ marginTop: '1.5rem' }}>
          India's most trusted DGCA CPL ground school. Led by{' '}
          <strong style={{ color: 'white' }}>Capt. Navrang Singh</strong> with 15+ years of teaching excellence.
          Real pilots. Real results.
        </p>
        <div className="ov-dream-actions">
          <button id="act1-demo-btn" className="btn btn-primary" onClick={onDemo}>
            📅 Book Free Demo Class
          </button>
          <button id="act1-apply-btn" className="btn btn-ghost" onClick={onApply}>
            Apply for July 2026 →
          </button>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-cue-text">Scroll to begin</span>
        <div className="scroll-cue-line" />
      </div>
    </div>
  )
}

function Act2Overlay({ visible }) {
  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div className="ov-bottom-left">
        <p className="ov-eyebrow">The Mentor</p>
        <h2 className="ov-h2">
          Capt. Navrang Singh<br />
          <em>Concept Clarity.</em>
        </h2>
        <p className="ov-body" style={{ marginTop: '1rem' }}>
          15+ years of DGCA teaching expertise. You don't memorize.
          You understand. That understanding is what separates a passing student
          from a commanding pilot.
        </p>
      </div>
    </div>
  )
}

function Act3Overlay({ visible }) {
  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div className="hud-strip">
        {[
          { label: 'FLEET TYPE', value: 'AIRBUS A320' },
          { label: 'WINGSPAN', value: '35.8 METERS' },
          { label: 'CRUISING SPEED', value: 'MACH 0.78' },
        ].map(c => (
          <div key={c.label} className="hud-card">
            <div className="hud-label">{c.label}</div>
            <div className="hud-value">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="ov-bottom-left">
        <div className="badge">Act 03 · The Aircraft</div>
        <h2 className="ov-h2">
          Airbus A320 CEF<br />
          <em>Scale & Command.</em>
        </h2>
        <p className="ov-body" style={{ marginTop: '1rem' }}>
          India’s only ground academy providing hands-on exposure to structural systems.
          Understand jet aerodynamics, hydraulic architectures, and system loops on the real airframe standard before you step into the cockpit.
        </p>
        <div className="subject-tags">
          {['Jet Systems', 'Aerodynamics', 'Multi-Engine', 'Type Prep', 'Safety Standards'].map(s => (
            <span key={s} className="subject-tag">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Act4Overlay({ visible }) {
  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div className="hud-strip">
        {[
          { label: 'SIMULATOR', value: 'FTD LEVEL 5' },
          { label: 'CERTIFICATE', value: 'DGCA COMPLIANT' },
          { label: 'SESSION RATE', value: '₹10,000 / HR' },
        ].map(c => (
          <div key={c.label} className="hud-card">
            <div className="hud-label">{c.label}</div>
            <div className="hud-value">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="ov-bottom-left">
        <div className="badge">Act 04 · Flight Simulator</div>
        <h2 className="ov-h2">
          Practice to Perfection<br />
          <em>FTD Level 5 Simulator.</em>
        </h2>
        <p className="ov-body" style={{ marginTop: '1rem' }}>
          Master multi-engine procedures and glass cockpit logic in Dwarka's only in-house Airbus A320 trainer.
          Real flight telemetry, hardware controls, and line operation workflows.
        </p>
      </div>
    </div>
  )
}

function Act5Overlay({ visible, actProgress, onDemo }) {
  const isBoot = actProgress < 0.35
  const isAlign = actProgress >= 0.35 && actProgress < 0.70
  const isReady = actProgress >= 0.70

  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div className="hud-strip">
        {[
          { label: 'AVIONICS STATUS', value: isBoot ? 'BOOTING...' : isAlign ? 'CALIBRATING' : 'READY TO FLY' },
          { label: 'AIRSPACE', value: 'DELHI FIR (VIDP)' },
          { label: 'SYS CHECKS', value: isReady ? 'PASS / NOMINAL' : 'INITIALIZING' },
        ].map(c => (
          <div key={c.label} className="hud-card">
            <div className="hud-label">{c.label}</div>
            <div className="hud-value">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="ov-bottom-left">
        <div className="badge">Act 05 · The Cockpit</div>
        <h2 className="ov-h2">
          {isBoot && <>Avionics Wakeup<br /><em>System Initialization.</em></>}
          {isAlign && <>Avionics Alignment<br /><em>IRS Telemetry Sync.</em></>}
          {isReady && <>The Command Seat<br /><em>Welcome to the Cockpit.</em></>}
        </h2>
        <p className="ov-body" style={{ marginTop: '1rem', maxWidth: '480px' }}>
          {isBoot && 'Scroll to engage battery buses. Watch the Primary Flight Display run self-check diagnostics.'}
          {isAlign && 'Air Navigation systems sync with Delhi GPS. Watch the Navigation map calibrate active route coordinates.'}
          {isReady && 'System fully online. Every gauge, dial, and indicator makes sense. This is the goal of Capt. Navrang Singh\'s ground preparation.'}
        </p>
      </div>
    </div>
  )
}

function Act6Overlay({ visible }) {
  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 var(--margin) 2rem' }}>
        <p className="ov-eyebrow" style={{ justifyContent: 'center' }}>Act 06 · Alumni Outcomes</p>
        <h2 className="ov-h2" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Where Airborne Alumni<br />
          <em>Fly Today.</em>
        </h2>
        <div style={{ display: 'flex', gap: '3rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { num: '15+ YRS', label: 'Teaching Excellence' },
            { num: '100%',    label: 'DGCA Pass Rate' },
            { num: '2,100+',  label: 'Aspirants Guided' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900, color: 'var(--gold)' }}>{s.num}</div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: 'var(--label)', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--w50)', marginTop: '.4rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
        
        {/* Alumni Highlights */}
        <div className="alumni-highlights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', width: '100%', maxWidth: '900px', pointerEvents: 'all' }}>
          {[
            { name: 'Ruzal Dhral', details: 'IndiGo Cadet Program', text: 'Cleared all 5 DGCA exams in his first attempt within 3 months of class.' },
            { name: 'Capt. Nipun Singh', details: 'Air India First Officer', text: 'Restarted pilot career at age 36. Guided from ground school to cockpit command.' },
            { name: 'Capt. Himanish Sagwal', details: 'Emirates First Officer', text: 'Mastered navigation & meteorology concepts. Now flying wide-body long-haul fleets.' }
          ].map(h => (
            <div key={h.name} style={{ background: 'rgba(0,15,30,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '1px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--white)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h.name}</div>
              <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '0.58rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0.2rem 0 0.6rem 0' }}>{h.details}</div>
              <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.78rem', color: 'var(--w70)', lineHeight: '1.5' }}>{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Act7Overlay({ visible, onDemo, onApply }) {
  return (
    <div className={`act-overlay ${!visible ? 'hidden' : ''}`} aria-hidden={!visible}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', padding: '0 var(--margin) 5rem', gap: '4rem' }}>
        <div>
          <p className="ov-eyebrow" style={{ color: 'var(--gold)' }}>Ready?</p>
          <h2 className="ov-h2">
            Ready For<br />
            <em style={{ color: 'var(--red)' }}>Takeoff?</em>
          </h2>
          <p className="ov-body" style={{ marginTop: '1.25rem' }}>
            Join India's most trusted DGCA CPL ground school. Batch seats are
            strictly limited to 25 students. Your airline career starts with one step.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', pointerEvents: 'all' }}>
            <button id="act7-demo-btn" className="btn btn-primary" onClick={onDemo}>📅 Book Free Demo</button>
            <button id="act7-apply-btn" className="btn btn-ghost" onClick={onApply}>Apply Now →</button>
          </div>
        </div>

        <div className="cta-panel" style={{ pointerEvents: 'all' }}>
          <div className="cta-panel-title">Academy Details</div>
          <ul className="cta-panel-list">
            {[
              { icon: '📍', label: 'Location', value: 'Dwarka, New Delhi' },
              { icon: '📅', label: 'Next Batch', value: 'July 2026' },
              { icon: '👥', label: 'Batch Size', value: 'Max 25 Students' },
              { icon: '📞', label: 'Contact', value: '+91 98765 43210' },
            ].map(i => (
              <li key={i.label} className="cta-panel-item">
                <span className="cta-panel-icon">{i.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: 'var(--label)', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--w50)', marginBottom: '.15rem' }}>{i.label}</div>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '.82rem', fontWeight: 700, color: 'var(--white)' }}>{i.value}</div>
                </div>
              </li>
            ))}
          </ul>
          <button id="cta-panel-demo-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onDemo}>
            Reserve My Seat →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── MODAL ─── */
function Modal({ open, type, onClose }) {
  const isDemo = type === 'demo'

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [open, onClose])

  return (
    <div
      className={`modal-bg ${open ? 'open' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog" aria-modal="true"
    >
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <p className="modal-eyebrow">{isDemo ? 'Free · No Commitment' : 'Limited Seats'}</p>
        <h2 className="modal-h">{isDemo ? 'Book Free Demo Class' : 'Apply for July 2026 Batch'}</h2>
        <p className="modal-body">
          {isDemo
            ? 'Experience the Airborne teaching method firsthand. A free 90-minute demo class with Capt. Navrang Singh.'
            : 'July 2026 seats are limited to 25 students. Submit your details and we will contact you within 24 hours.'}
        </p>
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); onClose(); alert('Thank you! We will be in touch within 24 hours.') }}>
          <input id="modal-name"  className="modal-input" type="text"  placeholder="Your Full Name"  required />
          <input id="modal-phone" className="modal-input" type="tel"   placeholder="Phone Number"     required />
          <input id="modal-email" className="modal-input" type="email" placeholder="Email Address"    required />
          {!isDemo && (
            <select id="modal-course" className="modal-input" defaultValue="">
              <option value="" disabled>Select Course</option>
              <option>DGCA CPL Ground School</option>
              <option>RTR (A) Radio Telephony</option>
              <option>Air Navigation</option>
              <option>Meteorology</option>
            </select>
          )}
          <button id="modal-submit-btn" className="modal-btn" type="submit">
            {isDemo ? 'Reserve My Demo Seat →' : 'Submit Application →'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── APP ROOT ─── */
export default function App() {
  const [loaded, setLoaded]  = useState(false)
  const [dpr,    setDpr]     = useState(1.5)
  const [modal,  setModal]   = useState({ open: false, type: 'demo' })
  const { total, actIndex, actProgress } = useScrollEngine()

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2500)
    return () => clearTimeout(t)
  }, [])

  const openDemo  = useCallback(() => setModal({ open: true, type: 'demo' }),  [])
  const openApply = useCallback(() => setModal({ open: true, type: 'apply' }), [])
  const closeModal = useCallback(() => setModal(m => ({ ...m, open: false })), [])

  return (
    <>
      <Loader done={loaded} />
      <Cursor />
      <div className="grain" aria-hidden="true" />

      <Nav actIndex={actIndex} total={total} onDemo={openDemo} />
      <SceneDots actIndex={actIndex} />
      <SceneLabel actIndex={actIndex} />

      {/* ── THE 3D CANVAS ── */}
      <div className="canvas-wrap" aria-hidden="true">
        <Canvas
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: 2,      // ACESFilmic
            toneMappingExposure: 1.0,
          }}
          shadows
          dpr={dpr}
          camera={{ position: [0, 1.2, 18], fov: 65 }}
          frameloop="always"
        >
          <PerformanceMonitor
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(1.5)}
          />
          <AdaptiveDpr pixelated />
          <Suspense fallback={null}>
            <MasterScene actIndex={actIndex} actProgress={actProgress} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── HTML ACT OVERLAYS ── */}
      <Act1Overlay visible={actIndex === 0} onDemo={openDemo}  onApply={openApply} />
      <Act2Overlay visible={actIndex === 1} />
      <Act3Overlay visible={actIndex === 2} />
      <Act4Overlay visible={actIndex === 3} />
      <Act5Overlay visible={actIndex === 4} actProgress={actProgress} onDemo={openDemo} />
      <Act6Overlay visible={actIndex === 5} />
      <Act7Overlay visible={actIndex === 6} onDemo={openDemo} onApply={openApply} />

      <AlumniTicker visible={actIndex === 5} />

      {/* ── SCROLL BODY ─ creates the page height ── */}
      <div
        className="scroll-body"
        style={{ height: `${TOTAL_VH}vh` }}
        id="top"
        role="main"
      />

      <Modal open={modal.open} type={modal.type} onClose={closeModal} />
    </>
  )
}
