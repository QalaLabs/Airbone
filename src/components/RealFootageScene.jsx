/**
 * AIRBORNE AVIATION — Real Footage Cinematic Scenes
 * Philosophy: Real footage > CGI
 */

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────
   UTILITY: Smooth parallax on mouse move
───────────────────────────────────────────────────────────────── */
function useParallax(containerRef, strength = 12) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let raf
    let targetX = 0, targetY = 0
    let currentX = 0, currentY = 0

    const onMove = (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      targetX = ((e.clientX - cx) / cx) * strength
      targetY = ((e.clientY - cy) / cy) * strength
    }

    const loop = () => {
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05
      if (el) el.style.transform = `translate(${currentX}px, ${currentY}px)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [containerRef, strength])
}

/* ─────────────────────────────────────────────────────────────────
   SIMULATOR SCENE — Act 4
───────────────────────────────────────────────────────────────── */
export function SimulatorScene({ visible }) {
  const parallaxRef = useRef()
  useParallax(parallaxRef, 8)

  return (
    <div
      className="footage-scene"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: 'none',
      }}
      aria-hidden={!visible}
    >
      <div ref={parallaxRef} className="footage-parallax-layer">
        <img
          src="/campus/simulator_real.jpg"
          alt="Airborne Aviation A320 Simulator"
          className="footage-img footage-kenburns-in"
          style={{ filter: 'contrast(1.1) saturate(1.2) brightness(0.85)' }}
        />
      </div>
      <div className="footage-vignette" />
      <div className="footage-gradient-bottom" />
      <div className="footage-gradient-top" />
      <div
        className="footage-glow-overlay"
        style={{ background: 'radial-gradient(ellipse at 60% 60%, rgba(180, 120, 30, 0.12) 0%, transparent 60%)' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TRAINING SCENE — Act 3
───────────────────────────────────────────────────────────────── */
export function TrainingRealScene({ visible }) {
  const parallaxRef = useRef()
  useParallax(parallaxRef, 6)

  return (
    <div
      className="footage-scene"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: 'none',
      }}
      aria-hidden={!visible}
    >
      <div ref={parallaxRef} className="footage-parallax-layer">
        <img
          src="/footage/cockpit_instruments_closeup.jpg"
          alt="Airborne Aviation instrument training"
          className="footage-img footage-kenburns-slow"
          style={{ filter: 'contrast(1.1) brightness(0.7) saturate(1.3)', objectPosition: 'center 40%' }}
        />
      </div>
      <div className="footage-vignette footage-vignette--heavy" />
      <div className="footage-gradient-bottom" />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 25, 60, 0.25)', pointerEvents: 'none' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   COCKPIT STARTUP SCENE — Act 6 (unified, scroll-driven)

   sceneProgress 0→1 drives a 7-phase aircraft startup sequence:
   0.00 → Cold + Dark
   0.18 → Battery On
   0.35 → APU Available
   0.50 → Avionics Powered
   0.65 → Engine 1 Running
   0.78 → Engine 2 Running
   0.90 → Before Taxi Complete

   Visual layers:
   - silhouette.jpg    : base, full opacity → fades at 0.55
   - instruments.jpg   : fades in at 0.35→0.50
   - throttle_hero.jpg : fades in at 0.58→0.72
   - video             : fades in at 0.75→0.88
   - darkness overlay  : 0.80 → 0.30 across progress
   - amber instrument glow : 0 → peaks at 0.60 → holds
   - blue screen glow  : appears at 0.38 → peaks at 0.58
   - green ECAM glow   : appears at 0.65
───────────────────────────────────────────────────────────────── */
export function CockpitStartupScene({ visible, sceneProgress = 0 }) {
  const videoRef = useRef()
  const imgRef = useRef()
  const parallaxRef = useRef()

  // Scroll-driven parallax (subtle during cockpit hold)
  useEffect(() => {
    const el = parallaxRef.current
    if (!el) return
    let raf
    let tX = 0, tY = 0, cX = 0, cY = 0
    const onMove = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      tX = ((e.clientX - cx) / cx) * 6
      tY = ((e.clientY - cy) / cy) * 4
    }
    const loop = () => {
      cX += (tX - cX) * 0.04
      cY += (tY - cY) * 0.04
      if (el) el.style.transform = `translate(${cX * 0.4}px, ${cY * 0.4}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  // Video control
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (visible && sceneProgress >= 0.75) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [visible, sceneProgress >= 0.75])

  // Smooth 0→1 ramp helper
  const ramp = (p, start, end) => Math.max(0, Math.min(1, (p - start) / (end - start)))

  const p = sceneProgress

  // Layer opacities
  const silhouetteOp = 1 - ramp(p, 0.45, 0.62)
  const instrumentsOp = ramp(p, 0.32, 0.50)
  const throttleOp    = ramp(p, 0.58, 0.72)
  const videoOp       = ramp(p, 0.75, 0.88)

  // Overlay darkness: 0.82 (pitch dark) → 0.28 (bright operational)
  const darkness = 0.82 - ramp(p, 0, 1) * 0.54

  // Amber instrument glow: appears at 0.18, peaks at 0.60
  const amberGlow = ramp(p, 0.18, 0.60)
  const amberOp = amberGlow * 0.32

  // Blue screen glow: appears at 0.35, peaks at 0.60
  const blueGlow = ramp(p, 0.35, 0.58)
  const blueOp = blueGlow * 0.22

  // Green ECAM glow: appears at 0.65 (engine start confirmation)
  const greenOp = ramp(p, 0.65, 0.78) * 0.15

  // Scan-line flash at phase crossings (creates "boot" feel)
  const flashPhases = [0.18, 0.35, 0.50, 0.65, 0.78]
  const flashOp = flashPhases.reduce((acc, ph) => {
    const dist = Math.abs(p - ph)
    return acc + Math.max(0, 0.08 - dist * 1.2)
  }, 0)

  return (
    <div
      className="footage-scene"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: 'none',
      }}
      aria-hidden={!visible}
    >
      {/* ── LAYER 1: Silhouette — base cold+dark cockpit ── */}
      <div
        ref={parallaxRef}
        style={{ position: 'absolute', inset: '-5%', opacity: silhouetteOp, willChange: 'transform' }}
      >
        <img
          src="/footage/cockpit_pilot_silhouette.jpg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── LAYER 2: Instruments closeup — fades in as avionics boot ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: instrumentsOp, transition: 'opacity 0.8s ease' }}>
        <img
          src="/footage/cockpit_instruments_closeup.jpg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', objectPosition: 'center 35%' }}
        />
      </div>

      {/* ── LAYER 3: Throttle hero — fades in at engine start ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: throttleOp }}>
        <img
          ref={imgRef}
          src="/footage/cockpit_throttle_hero.jpg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            filter: 'contrast(1.15) brightness(0.9) saturate(1.1)' }}
        />
      </div>

      {/* ── LAYER 4: Video — fully operational ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: videoOp }}>
        <video
          ref={videoRef}
          src="/footage/cockpit_hero_video.mp4"
          muted loop playsInline preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            filter: 'contrast(1.1) brightness(0.85) saturate(1.1)' }}
        />
      </div>

      {/* ── DARKNESS OVERLAY ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `rgba(0, 2, 8, ${darkness})`,
          transition: 'background 0.4s ease',
        }}
      />

      {/* ── AMBER INSTRUMENT GLOW (warm cockpit light) ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 50% 62%, rgba(220, 140, 30, ${amberOp}) 0%, rgba(180, 100, 20, ${amberOp * 0.5}) 35%, transparent 65%)`,
          mixBlendMode: 'screen',
          transition: 'background 0.6s ease',
        }}
      />

      {/* ── BLUE SCREEN GLOW (avionics displays) ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 50% 28%, rgba(40, 100, 220, ${blueOp}) 0%, rgba(20, 60, 180, ${blueOp * 0.4}) 30%, transparent 55%)`,
          transition: 'background 0.5s ease',
        }}
      />

      {/* ── GREEN ECAM GLOW (engine confirmation) ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 50% 45%, rgba(30, 180, 80, ${greenOp}) 0%, transparent 45%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* ── PHASE SCAN FLASH (brief white flash at threshold crossings) ── */}
      {flashOp > 0.001 && (
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `rgba(180, 220, 255, ${Math.min(flashOp, 0.12)})`,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* ── COCKPIT VIGNETTE ── */}
      <div className="footage-vignette footage-vignette--cockpit" />

      {/* ── BOTTOM GRADIENT (text legibility) ── */}
      <div className="footage-gradient-bottom--deep" />
    </div>
  )
}

// Keep legacy exports as no-ops so old imports don't break
export function CockpitEntryScene() { return null }
export function CockpitHeroScene()  { return null }
export function CockpitVideoScene() { return null }
