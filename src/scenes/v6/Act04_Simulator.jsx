import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Act04_Simulator — The Simulator Reveal
// The user approaches the Airborne Aviation sim for the first time.
// Real /footage/simulator_session_video.mp4 drives the hero billboard.
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
    // Store video ref on texture for cleanup
    tex.userData.video = video
    return tex
  }, [src])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
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

/* ── Canvas texture for the data readout HUD ────────────────────────────── */
function makeDataReadout() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 96
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#020a06'
  ctx.fillRect(0, 0, 512, 96)
  ctx.strokeStyle = '#00ff60'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, 504, 88)
  ctx.strokeStyle = '#003a18'
  ctx.lineWidth = 1
  ctx.strokeRect(9, 9, 494, 78)

  ctx.fillStyle = '#00ff60'
  ctx.font = 'bold 26px "Courier New", Courier, monospace'
  ctx.textBaseline = 'middle'
  ctx.fillText('FTD LVL 5  //  A320 CEF', 28, 38)

  ctx.fillStyle = '#007a30'
  ctx.font = '14px "Courier New", Courier, monospace'
  ctx.fillText('AIRBORNE AVIATION  ·  SIM-04  ·  ACTIVE', 28, 68)

  return new THREE.CanvasTexture(canvas)
}

/* ── Random amber particle positions ────────────────────────────────────── */
function useParticlePositions(count = 100) {
  return useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2
    }
    return pos
  }, [count])
}

/* ── Particles sub-component ────────────────────────────────────────────── */
function AmbientParticles({ count = 100 }) {
  const pointsRef = useRef()
  const initialPositions = useParticlePositions(count)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(initialPositions.slice(), 3))
    return geo
  }, [initialPositions])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    const posAttr = pointsRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const base = initialPositions[i * 3 + 1]
      posAttr.setY(i, base + Math.sin(t * 0.8 + i * 0.37) * 0.12)
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#FFB030"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Floor reflection plane ─────────────────────────────────────────────── */
function FloorReflection() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, -3]}>
      <planeGeometry args={[22, 14]} />
      <meshStandardMaterial
        color="#0d1826"
        roughness={0.1}
        metalness={0.6}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

/* ── Main scene ─────────────────────────────────────────────────────────── */
export default function Act04_Simulator({ progress = 0 }) {
  const groupRef = useRef()
  const billboardRef = useRef()
  const dataRef = useRef()

  const simVideoTex = useVideoTexture('/footage/simulator_session_video.mp4')
  const dataTexture = useMemo(() => makeDataReadout(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.position.z = -progress * 2
    }

    if (billboardRef.current) {
      const s = 1.0 + progress * 0.05
      billboardRef.current.scale.set(s, s, 1)
    }

    if (dataRef.current) {
      dataRef.current.material.opacity =
        0.85 + Math.sin(t * 3.5 + 1) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* ── Lighting ──────────────────────────────────────────────────── */}
      <ambientLight color="#020508" intensity={0.2} />
      <pointLight position={[0, 3, -1]}  color="#FFB840" intensity={15} distance={8}  decay={2} />
      <pointLight position={[-3, 1, 2]}  color="#2040FF" intensity={3}  distance={6}  decay={2} />
      <pointLight position={[0, 6, 0]}   color="#102030" intensity={2}  distance={10} decay={2} />

      {/* ── Background billboard with live simulator video ───────────── */}
      <mesh ref={billboardRef} position={[0, 0.5, -6]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial map={simVideoTex} toneMapped={false} color="#FFEAA0" />
      </mesh>

      {/* Outer gold border frame */}
      <mesh position={[0, 0.5, -6.05]}>
        <planeGeometry args={[20.3, 12.3]} />
        <meshBasicMaterial color="#D8A027" />
      </mesh>

      {/* Projected screen grid overlay */}
      <mesh position={[0, 0.5, -5.99]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial
          color="#001808"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* ── Ambient glow particles ───────────────────────────────────── */}
      <AmbientParticles count={100} />

      {/* ── Floor reflection ─────────────────────────────────────────── */}
      <FloorReflection />

      {/* ── Data readout HUD billboard ───────────────────────────────── */}
      <mesh ref={dataRef} position={[3.5, -1.5, -0.5]}>
        <planeGeometry args={[3, 0.6]} />
        <meshBasicMaterial
          map={dataTexture}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary left HUD accent */}
      <mesh position={[-3.5, -1.5, -0.5]}>
        <planeGeometry args={[2.4, 0.4]} />
        <meshBasicMaterial color="#001a08" transparent opacity={0.7} depthWrite={false} />
      </mesh>
    </group>
  )
}
