import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Act03_Training — The Training Crucible
// Represents the intense preparation, the whiteboards, books, and study systems.
// Real /footage/cockpit_instruments_closeup.jpg drives the background.
// ---------------------------------------------------------------------------

/* ── Floating dust particles in spotlight ────────────────────────────────── */
function useParticlePositions(count = 80) {
  return useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1
    }
    return pos
  }, [count])
}

function FloatingDust({ count = 80 }) {
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
      // Float up and down gently, drift slightly on X
      posAttr.setY(i, base + Math.sin(t * 0.5 + i * 0.4) * 0.15)
      posAttr.setX(i, initialPositions[i * 3 + 0] + Math.cos(t * 0.3 + i * 0.2) * 0.08)
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#FFF5D0"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  )
}

/* ── Main Act Component ─────────────────────────────────────────────────── */
export default function Act03_Training({ progress = 0 }) {
  const groupRef = useRef()
  const bgRef = useRef()
  const bookRef = useRef()
  const paperRef = useRef()
  const pencilRef = useRef()

  // Load the cockpit closeup background
  const bgTexture = useTexture('/campus/classroom_navrang.jpg')

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Scene tilt as user scrolls
    if (groupRef.current) {
      groupRef.current.rotation.z = progress * 0.04
      groupRef.current.position.y = -progress * 0.5
    }

    // 2. Slow push in on the background
    if (bgRef.current) {
      const s = 1.0 + progress * 0.06
      bgRef.current.scale.set(s, s, 1)
    }

    // 3. Gentle float animations for the 3D items in front
    if (bookRef.current) {
      bookRef.current.position.y = 0.5 + Math.sin(t * 0.6) * 0.08
      bookRef.current.rotation.y = -0.4 + Math.cos(t * 0.4) * 0.05
      bookRef.current.rotation.x = 0.25 + Math.sin(t * 0.3) * 0.03
    }

    if (paperRef.current) {
      paperRef.current.position.y = -0.6 + Math.sin(t * 0.5 + 1.5) * 0.06
      paperRef.current.rotation.y = 0.35 + Math.cos(t * 0.4 + 1.0) * 0.04
    }

    if (pencilRef.current) {
      pencilRef.current.position.y = -0.45 + Math.sin(t * 0.8 - 0.5) * 0.05
      pencilRef.current.rotation.z = -0.8 + Math.cos(t * 0.5) * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      {/* ── Lighting ──────────────────────────────────────────────────── */}
      <ambientLight color="#050812" intensity={0.4} />
      <pointLight position={[1, 2.5, 1]} color="#FFE0A0" intensity={12} distance={8} decay={2} />
      <spotLight
        position={[0, 4, 2]}
        target-position={[0, 0, -2]}
        color="#FFF5E8"
        intensity={18}
        angle={0.5}
        penumbra={0.7}
      />
      <directionalLight position={[-2, 2, -1]} color="#204080" intensity={2} />

      {/* ── Background Billboard ─────────────────────────────────────── */}
      <mesh ref={bgRef} position={[0, 0, -5]}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial
          map={bgTexture}
          toneMapped={false}
          color="#FFEAA0" // Slightly warm tint
        />
      </mesh>

      {/* ── 3D Floating Book (Ground Study Material) ─────────────────── */}
      <group ref={bookRef} position={[-1.2, 0.5, -2]}>
        {/* Book cover */}
        <mesh castShadow>
          <boxGeometry args={[1.3, 0.1, 1.8]} />
          <meshStandardMaterial
            color="#0A244C" // Premium Navy brand color
            roughness={0.7}
            metalness={0.25}
          />
        </mesh>
        {/* Gold stripe detail */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[1.31, 0.005, 0.1]} />
          <meshStandardMaterial color="#D8A027" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Inner pages (white edge) */}
        <mesh position={[0.02, 0, 0]} scale={[0.96, 0.8, 0.96]}>
          <boxGeometry args={[1.3, 0.1, 1.8]} />
          <meshStandardMaterial color="#EAE8E2" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Overlapping Papers (DGCA score sheets & logs) ────────────── */}
      <group ref={paperRef} position={[1.4, -0.6, -2.2]} rotation={[0.1, -0.2, -0.15]}>
        {/* Sheet 1 */}
        <mesh rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshStandardMaterial
            color="#FCFCF9"
            roughness={0.9}
            side={THREE.DoubleSide}
            transparent
            opacity={0.95}
          />
        </mesh>
        {/* Sheet 2 (slanted underneath) */}
        <mesh position={[-0.15, -0.05, -0.02]} rotation={[-0.15, 0, 0.25]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshStandardMaterial
            color="#F2EFE8"
            roughness={0.9}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* ── Floating Pencil ─────────────────────────────────────────── */}
      <group ref={pencilRef} position={[0.3, -0.5, -1.8]} rotation={[0.4, 0.2, -0.8]}>
        {/* Pencil body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
          <meshStandardMaterial color="#D8A027" roughness={0.5} />
        </mesh>
        {/* Tip (wood cone) */}
        <mesh position={[0, 0.43, 0]}>
          <coneGeometry args={[0.03, 0.07, 6]} />
          <meshStandardMaterial color="#E8C697" roughness={0.8} />
        </mesh>
        {/* Lead point */}
        <mesh position={[0, 0.466, 0]}>
          <coneGeometry args={[0.012, 0.02, 6]} />
          <meshBasicMaterial color="#1A1A1A" />
        </mesh>
        {/* Eraser cap */}
        <mesh position={[0, -0.41, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 6]} />
          <meshStandardMaterial color="#E06C75" roughness={0.6} />
        </mesh>
      </group>

      {/* ── Ambient floating dust motes ────────────────────────────── */}
      <FloatingDust count={80} />

      {/* ── Vignette Layer in front to blend edges ─────────────────── */}
      <mesh position={[0, 0, -1.5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[6, 4.5]} />
        <meshBasicMaterial
          color="#02050A"
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.MultiplyBlending}
        />
      </mesh>
    </group>
  )
}
