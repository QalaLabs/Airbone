import { seededUnit } from '@/utils/seeded-random'
/**
 * Act02_Mentor — Late-night classroom
 * Dark environment. A single spotlight on the whiteboard.
 * The feeling of mastery being transferred.
 * No human model — pure atmosphere.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

/* ── Mentor Panel ── */
function MentorPanel() {
  const tex = useTexture('/photos/classroom_mentor.jpg')
  return (
    <group position={[-2.2, 1.8, -3]}>
      {/* High-quality classroom mentorship panel */}
      <mesh castShadow>
        <planeGeometry args={[4.2, 2.6]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Outer gold border frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.35, 2.75]} />
        <meshBasicMaterial color="#D8A027" />
      </mesh>
    </group>
  )
}

/* ── Floating dust motes in spotlight ── */
function DustMotes() {
  const pointsRef = useRef()
  const count = 200

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (seededUnit(i * 100 + 0) - 0.5) * 4
      arr[i * 3 + 1] = seededUnit(i * 100 + 1) * 6
      arr[i * 3 + 2] = (seededUnit(i * 100 + 2) - 0.5) * 4 - 1
    }
    return arr
  }, [])

  const phases = useMemo(() => Float32Array.from({ length: count }, () => seededUnit(3) * Math.PI * 2), [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      pos.array[i * 3]     += Math.sin(t * 0.3 + phases[i]) * 0.002
      pos.array[i * 3 + 1] += Math.cos(t * 0.2 + phases[i] * 1.3) * 0.001
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFE0A0" size={0.03} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ── Academy study illustration panel (replaces low-poly desk) ── */
function StudyPanel() {
  const tex = useTexture('/photos/instructor_hero.jpg')
  return (
    <group position={[2.2, 1.8, -3]}>
      {/* Visual illustration of cockpit training */}
      <mesh castShadow>
        <planeGeometry args={[4.2, 2.6]} />
        <meshStandardMaterial map={tex} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Outer frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.35, 2.75]} />
        <meshBasicMaterial color="#D8A027" />
      </mesh>
    </group>
  )
}

/* ── Main Scene ── */
export default function Act02_Mentor({ progress = 0 }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = progress * 0.28
    }
  })

  return (
    <group ref={groupRef}>
      <MentorPanel />
      <StudyPanel />
      <DustMotes />

      {/* Spotlight on panels */}
      <spotLight
        position={[0, 8, 3]}
        target-position={[0, 1.8, -3]}
        color="#FFF5E8"
        intensity={80}
        angle={0.75}
        penumbra={0.65}
        castShadow
      />

      {/* Cool ambient fill */}
      <ambientLight color="#050c18" intensity={0.25} />

      {/* Rim light from side */}
      <pointLight position={[-4, 3, -1]} color="#1a3060" intensity={6} distance={8} />
    </group>
  )
}
