import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Act05_Cockpit — The Interactive Flight Deck
// Features:
//   1. Background cockpit video loops + pilot crew silhouette layers.
//   2. Foreground physical bezel panels with interactive mouse parallax.
//   3. Three active CRT avionics screens (PFD, ND, ECAM) driven by custom high-performance canvas updates.
//   4. Multi-phase startup scroll progression.
// ---------------------------------------------------------------------------

/* ── Video texture hook ─────────────────────────────────────────────────── */
function useVideoTexture(src) {
  const texture = useMemo(() => {
    const video = document.createElement('video')
    video.src = src
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.play().catch(() => {})
    const tex = new THREE.VideoTexture(video)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.format = THREE.RGBAFormat
    tex.colorSpace = THREE.SRGBColorSpace
    tex.userData.video = video
    return tex
  }, [src])

  useEffect(() => {
    return () => {
      const video = texture.userData.video
      if (video) {
        video.pause()
        video.src = ''
      }
      texture.dispose()
    }
  }, [texture])

  return texture
}

/* ── PFD CANVAS DRAWER ── */
function drawPFD(canvas, progress, time) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  // Base backdrop
  ctx.fillStyle = '#070a10'
  ctx.fillRect(0, 0, w, h)

  if (progress < 0.1) {
    // Dark state
    return
  }

  // Draw digital bezel outline
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 4
  ctx.strokeRect(10, 10, w - 20, h - 20)

  // Phase 1: IRS Alignment (0.10 - 0.40)
  if (progress < 0.40) {
    const flash = Math.floor(time * 3) % 2 === 0
    ctx.fillStyle = flash ? '#ff2a20' : '#221010'
    ctx.font = 'bold 26px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('PFD SYS: ALIGNING IRS...', w / 2, h / 2 - 30)

    ctx.fillStyle = '#a0aec0'
    ctx.font = '18px monospace'
    ctx.fillText('DO NOT MOVE AIRCRAFT (30S)', w / 2, h / 2 + 10)

    // Loading indicator
    const alignP = (progress - 0.1) / 0.3
    ctx.strokeStyle = '#4a5568'
    ctx.strokeRect(w / 2 - 150, h / 2 + 40, 300, 15)
    ctx.fillStyle = '#D8A027'
    ctx.fillRect(w / 2 - 150, h / 2 + 40, alignP * 300, 15)
    return
  }

  // Active flight data calibration (progress >= 0.4)
  const activeT = Math.min((progress - 0.4) / 0.6, 1)

  // 1. Attitude Indicator (Horizon center)
  const cx = w / 2
  const cy = h / 2
  ctx.save()
  
  // Circular mask
  ctx.beginPath()
  ctx.arc(cx, cy, 120, 0, Math.PI * 2)
  ctx.clip()

  const pitch = Math.sin(time * 0.6) * 12 // pitch oscillation
  const roll = Math.sin(time * 0.4) * 0.08 // roll oscillation

  ctx.translate(cx, cy)
  ctx.rotate(roll)

  // Sky blue
  ctx.fillStyle = '#0084c7'
  ctx.fillRect(-220, -220 + pitch, 440, 220 - pitch)
  
  // Ground brown
  ctx.fillStyle = '#8a4c28'
  ctx.fillRect(-220, pitch, 440, 220 + pitch)

  // Pitch ticks
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2
  for (let i = -30; i <= 30; i += 10) {
    if (i === 0) continue
    const yOffset = -i * 3.5 + pitch
    ctx.beginPath()
    ctx.moveTo(-35, yOffset); ctx.lineTo(35, yOffset); ctx.stroke()
    ctx.font = '11px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(Math.abs(i).toString(), -50, yOffset + 4)
    ctx.fillText(Math.abs(i).toString(), 40, yOffset + 4)
  }
  ctx.restore()

  // Fixed Aircraft pitch symbol (amber wings)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 6
  ctx.fillStyle = '#ffaa00'
  ctx.beginPath()
  // Left wing tip
  ctx.moveTo(cx - 90, cy); ctx.lineTo(cx - 40, cy); ctx.lineTo(cx - 40, cy + 12)
  // Center point
  ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy)
  // Right wing tip
  ctx.moveTo(cx + 40, cy + 12); ctx.lineTo(cx + 40, cy); ctx.lineTo(cx + 90, cy)
  ctx.stroke()

  // 2. Speed Tape (Left side)
  const speedVal = Math.floor(135 + activeT * 115 + Math.sin(time) * 2)
  ctx.fillStyle = '#11151d'
  ctx.fillRect(25, 70, 75, 372)
  ctx.strokeStyle = '#4a5568'
  ctx.strokeRect(25, 70, 75, 372)

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.textAlign = 'right'
  ctx.font = '14px monospace'
  for (let s = speedVal - 30; s <= speedVal + 30; s += 10) {
    const rounded = Math.floor(s / 10) * 10
    const diff = speedVal - rounded
    const yPos = cy + diff * 4
    if (yPos > 80 && yPos < 430) {
      ctx.beginPath()
      ctx.moveTo(95, yPos); ctx.lineTo(80, yPos); ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(rounded.toString(), 75, yPos + 5)
    }
  }
  
  // Current Speed read
  ctx.fillStyle = '#00bfa5'
  ctx.fillRect(25, cy - 20, 75, 40)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px monospace'
  ctx.fillText(speedVal.toString(), 90, cy + 7)

  // 3. Altitude Tape (Right side)
  const altVal = Math.floor(2200 + activeT * 29800 + Math.sin(time * 0.8) * 15)
  ctx.fillStyle = '#11151d'
  ctx.fillRect(w - 100, 70, 75, 372)
  ctx.strokeStyle = '#4a5568'
  ctx.strokeRect(w - 100, 70, 75, 372)

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.textAlign = 'left'
  ctx.font = '14px monospace'
  for (let a = altVal - 300; a <= altVal + 300; a += 100) {
    const rounded = Math.floor(a / 100) * 100
    const diff = altVal - rounded
    const yPos = cy + diff * 0.4
    if (yPos > 80 && yPos < 430) {
      ctx.beginPath()
      ctx.moveTo(w - 100, yPos); ctx.lineTo(w - 85, yPos); ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(rounded.toString(), w - 80, yPos + 5)
    }
  }

  // Current Alt read
  ctx.fillStyle = '#00bfa5'
  ctx.fillRect(w - 100, cy - 20, 75, 40)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 16px monospace'
  ctx.fillText(altVal.toString(), w - 95, cy + 6)

  // Top header statuses
  ctx.fillStyle = '#00FF55'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('AP1   1FD2   A/THR   CPL-05', w / 2, 45)
}

/* ── ND CANVAS DRAWER ── */
function drawND(canvas, progress, time) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  // Backdrop
  ctx.fillStyle = '#05070a'
  ctx.fillRect(0, 0, w, h)

  if (progress < 0.20) return

  // Outline
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 4
  ctx.strokeRect(10, 10, w - 20, h - 20)

  if (progress < 0.50) {
    ctx.fillStyle = '#D8A027'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('ND SYS: DIAGNOSTIC TCAS...', w / 2, h / 2 - 20)
    ctx.fillStyle = '#718096'
    ctx.font = '16px monospace'
    ctx.fillText('STANDBY GPS SIGNAL', w / 2, h / 2 + 20)
    return
  }

  const activeT = Math.min((progress - 0.5) / 0.5, 1)

  // Compass Rose Ring
  const cx = w / 2
  const cy = h - 120
  const radius = 240
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI * 1.15, Math.PI * 1.85, false)
  ctx.stroke()

  // Heading values rotating
  const heading = 275 + Math.sin(time * 0.08) * 6
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-heading * Math.PI / 180)
  ctx.font = '11px monospace'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  
  for (let angle = 0; angle < 360; angle += 15) {
    const rad = angle * Math.PI / 180
    const x1 = Math.sin(rad) * radius
    const y1 = -Math.cos(rad) * radius
    const x2 = Math.sin(rad) * (radius - 10)
    const y2 = -Math.cos(rad) * (radius - 10)

    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()

    if (angle % 30 === 0) {
      const label = angle === 0 ? 'N' : angle === 90 ? 'E' : angle === 180 ? 'S' : angle === 270 ? 'W' : (angle/10).toString()
      const lx = Math.sin(rad) * (radius - 22)
      const ly = -Math.cos(rad) * (radius - 22)
      ctx.fillText(label, lx, ly + 4)
    }
  }
  ctx.restore()

  // Centered aircraft marker
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(cx, cy - 18)
  ctx.lineTo(cx - 12, cy + 18)
  ctx.lineTo(cx + 12, cy + 18)
  ctx.closePath()
  ctx.fill()

  // Active green waypoint route line
  ctx.strokeStyle = '#00ff66'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx - 30, cy - 120)
  ctx.lineTo(cx + 50, cy - 240)
  ctx.lineTo(cx - 10, cy - 380)
  ctx.stroke()

  // Dynamic Waypoints (DEL -> AAA -> DXB) drifting
  const waypoints = [
    { name: 'DEL', x: cx - 30, y: cy - 120 + (time * 16) % 240 - 120 },
    { name: 'AAA', x: cx + 50, y: cy - 240 + (time * 16) % 240 - 120 },
    { name: 'DXB', x: cx - 10, y: cy - 380 + (time * 16) % 240 - 120 },
  ]
  waypoints.forEach(wp => {
    if (wp.y > 30 && wp.y < cy) {
      ctx.fillStyle = '#00ffff'
      ctx.beginPath(); ctx.arc(wp.x, wp.y, 5, 0, Math.PI * 2); ctx.fill()
      ctx.font = 'bold 12px monospace'
      ctx.fillText(wp.name, wp.x + 10, wp.y + 4)
    }
  })

  // Sweep line
  const sweepAngle = (time * 1.6) % (Math.PI * 2)
  const sx = cx + Math.cos(sweepAngle) * radius
  const sy = cy - Math.sin(sweepAngle) * radius
  ctx.strokeStyle = 'rgba(0,255,102,0.15)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy); ctx.stroke()

  // Telemetry details
  ctx.fillStyle = '#ffffff'
  ctx.font = '13px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`GS: ${Math.floor(410 + Math.sin(time)*2)}KT`, 30, 45)
  ctx.fillText(`TAS: ${Math.floor(415 + Math.sin(time)*2)}KT`, 30, 65)

  ctx.textAlign = 'right'
  ctx.fillText('AAA-BOM 120NM', w - 30, 45)
  ctx.fillText('ETA 16:45z', w - 30, 65)
}

/* ── ENGINE DISPLAY CANVAS DRAWER ── */
function drawEngineDisplay(canvas, progress, time) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  ctx.fillStyle = '#06080c'
  ctx.fillRect(0, 0, w, h)

  if (progress < 0.30) return

  // Outline
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 4
  ctx.strokeRect(10, 10, w - 20, h - 20)

  if (progress < 0.60) {
    const flash = Math.floor(time * 5) % 2 === 0
    ctx.fillStyle = flash ? '#e53e3e' : '#742a2a'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SYS ENGINE: TEST FAULT', w / 2, h / 2)
    return
  }

  // Active status: engines active
  const activeT = Math.min((progress - 0.6) / 0.4, 1)
  const n1Val = (60 + activeT * 26 + Math.sin(time * 3) * 0.4).toFixed(1)
  const egtVal = Math.floor(450 + activeT * 180 + Math.sin(time * 2) * 5)

  // Title
  ctx.fillStyle = '#a0aec0'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ENGINE PARAMETERS', w / 2, 40)

  // Left Engine (ENG 1)
  ctx.fillStyle = '#ffffff'
  ctx.font = '15px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('ENG 1', 30, 90)
  ctx.fillStyle = '#00FF66'
  ctx.fillText(`N1 % :  ${n1Val}`, 30, 120)
  ctx.fillText(`EGT°C:  ${egtVal}`, 30, 150)
  ctx.fillText(`FF/H :  2140`, 30, 180)

  // Right Engine (ENG 2)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText('ENG 2', w / 2 + 30, 90)
  ctx.fillStyle = '#00FF66'
  ctx.fillText(`N1 % :  ${n1Val}`, w / 2 + 30, 120)
  ctx.fillText(`EGT°C:  ${egtVal}`, w / 2 + 30, 150)
  ctx.fillText(`FF/H :  2140`, w / 2 + 30, 180)

  // Bottom Status
  ctx.fillStyle = '#00FF66'
  ctx.font = 'bold 16px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('SYSTEM OK // STABLE COMMAND', w / 2, h - 35)

  // Draw two gauge arcs
  ctx.strokeStyle = '#4a5568'
  ctx.lineWidth = 8
  ctx.beginPath(); ctx.arc(w / 4, 300, 50, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke()
  ctx.beginPath(); ctx.arc(w * 0.75, 300, 50, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke()

  ctx.strokeStyle = '#00FF66'
  const arcEnd = Math.PI * 0.8 + (Math.PI * 1.4) * (activeT * 0.8)
  ctx.beginPath(); ctx.arc(w / 4, 300, 50, Math.PI * 0.8, arcEnd); ctx.stroke()
  ctx.beginPath(); ctx.arc(w * 0.75, 300, 50, Math.PI * 0.8, arcEnd); ctx.stroke()
}

export default function Act05_Cockpit({ progress = 0 }) {
  const groupRef      = useRef()
  const fgRef         = useRef()
  const midRef        = useRef()
  const bgRef         = useRef()
  
  const silRef        = useRef()
  const videoPlaneRef = useRef()
  
  const { pointer }   = useThree()

  // Real footage textures
  const silhouetteTex = useTexture('/footage/cockpit_pilot_silhouette.jpg')
  const videoTex      = useVideoTexture('/footage/cockpit_hero_video.mp4')
  const crewTex       = useTexture('/footage/cockpit_crew_wide.jpg')
  const instTex       = useTexture('/footage/cockpit_instruments_closeup.jpg')

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const p = progress

    // Silhouette fades out by progress 0.35
    const silOpacity = Math.max(0, 1 - p / 0.35)
    if (silRef.current) silRef.current.material.opacity = silOpacity

    // Video fades in from 0.40
    const videoOpacity = p >= 0.40 ? Math.min((p - 0.40) / 0.5, 1) : 0
    if (videoPlaneRef.current) videoPlaneRef.current.material.opacity = videoOpacity

    // ── Interactive Mouse Parallax ──────────────────────────────────────
    const mx = pointer.x * 0.4
    const my = pointer.y * 0.3

    // Lerp positions for ultra-premium slide feel
    if (fgRef.current) {
      fgRef.current.position.x = THREE.MathUtils.lerp(fgRef.current.position.x, mx * 1.4, 0.1)
      fgRef.current.position.y = THREE.MathUtils.lerp(fgRef.current.position.y, -0.6 + my * 0.8, 0.1)
    }
    if (midRef.current) {
      midRef.current.position.x = THREE.MathUtils.lerp(midRef.current.position.x, mx * 0.6, 0.1)
      midRef.current.position.y = THREE.MathUtils.lerp(midRef.current.position.y, my * 0.4, 0.1)
    }
    if (bgRef.current) {
      bgRef.current.position.x = THREE.MathUtils.lerp(bgRef.current.position.x, mx * 0.15, 0.1)
      bgRef.current.position.y = THREE.MathUtils.lerp(bgRef.current.position.y, my * 0.1, 0.1)
    }

    // Subtle cockpit vibration breathing
    const vibration = Math.sin(t * 14) * 0.0012
    if (fgRef.current) fgRef.current.position.y += vibration
  })

  return (
    <group ref={groupRef}>
      {/* ── Lighting ─────────────────────────────────────────────────── */}
      <ambientLight color="#05070f" intensity={0.25} />
      <pointLight position={[0, 2, -2]}  color="#FF9040" intensity={10} distance={12} decay={2} />
      <pointLight position={[-4, -1, 1]} color="#2050FF" intensity={3}  distance={10} decay={2} />
      <pointLight position={[4, -1, 1]}  color="#FF5020" intensity={2}  distance={8}  decay={2} />

      {/* ── BACKGROUND LAYER (Live Video) ── */}
      <group ref={bgRef} position={[0, 0.2, -5.5]}>
        <mesh ref={videoPlaneRef}>
          <planeGeometry args={[20, 12]} />
          <meshBasicMaterial map={videoTex} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
        {/* Outer gold border frame */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[20.3, 12.3]} />
          <meshBasicMaterial color="#D8A027" />
        </mesh>
      </group>

      {/* ── MIDGROUND LAYER (Silhouette) ── */}
      <group ref={midRef} position={[0, 0, -4.5]}>
        <mesh ref={silRef}>
          <planeGeometry args={[16, 9.6]} />
          <meshBasicMaterial map={silhouetteTex} transparent opacity={1} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>

      {/* ── FOREGROUND LAYER (HUD Bezel & Active Avionics Screens) ── */}
      <group ref={fgRef} position={[0, -0.6, -3.5]}>
        {/* 1. Cockpit Crew Panel */}
        <group position={[-2.4, -0.8, 0]}>
          <mesh castShadow>
            <planeGeometry args={[4.2, 2.6]} />
            <meshStandardMaterial map={crewTex} roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Outer gold border frame */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[4.35, 2.75]} />
            <meshBasicMaterial color="#D8A027" />
          </mesh>
        </group>

        {/* 2. Cockpit Instruments Panel */}
        <group position={[2.4, -0.8, 0]}>
          <mesh castShadow>
            <planeGeometry args={[4.2, 2.6]} />
            <meshStandardMaterial map={instTex} roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Outer gold border frame */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[4.35, 2.75]} />
            <meshBasicMaterial color="#D8A027" />
          </mesh>
        </group>
      </group>
    </group>
  )
}
