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
