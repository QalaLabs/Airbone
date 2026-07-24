import { useRef, useMemo } from 'react'
import { seededUnit } from '@/utils/seeded-random'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── DEEP SPACE VOID — dark command presence ── */
function VoidBackground() {
  return (
    <mesh>
      <sphereGeometry args={[480, 24, 12]} />
      <meshBasicMaterial color="#020408" side={THREE.BackSide} fog={false} />
    </mesh>
  )
}

/* ── FLOATING KNOWLEDGE PARTICLES — wisdom/depth metaphor ── */
function WisdomParticles() {
  const ref = useRef()
  const count = 1800

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Arrange in rough sphere around origin
      const phi   = Math.acos(2 * seededUnit(i * 100 + 0) - 1)
      const theta = seededUnit(i * 100 + 1) * Math.PI * 2
      const r     = 8 + seededUnit(i * 100 + 2) * 55
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) + 10
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      velocities[i * 3]     = (seededUnit(i * 100 + 3) - 0.5) * 0.002
      velocities[i * 3 + 1] = (seededUnit(i * 100 + 4) - 0.5) * 0.001
      velocities[i * 3 + 2] = (seededUnit(i * 100 + 5) - 0.5) * 0.002
    }
    return { positions }
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return g
  }, [positions])

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    ref.current.rotation.y = t * 0.018
    ref.current.rotation.x = Math.sin(t * 0.08) * 0.06
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#c8d8f8"
        size={0.14}
        sizeAttenuation
        transparent
        opacity={0.65}
        fog={false}
      />
    </points>
  )
}

/* ── GOLD ACCENT PARTICLES — achievement, prestige ── */
function GoldParticles() {
  const ref = useRef()
  const count = 350

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const phi   = Math.acos(2 * seededUnit(i * 100 + 6) - 1)
      const theta = seededUnit(i * 100 + 7) * Math.PI * 2
      const r     = 5 + seededUnit(i * 100 + 8) * 30
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.cos(phi) + 10
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.y = -s.clock.elapsedTime * 0.012
    ref.current.rotation.z = s.clock.elapsedTime * 0.006
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#d8a030"
        size={0.22}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  )
}

/* ── ABSTRACT DEPTH RINGS — authority circles ── */
function DepthRings() {
  const ref = useRef()

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.z = s.clock.elapsedTime * 0.025
      ref.current.rotation.x = s.clock.elapsedTime * 0.01
    }
  })

  const rings = [
    { r: 6,  tube: 0.025, color: '#2a4070', opacity: 0.5 },
    { r: 12, tube: 0.02,  color: '#1e3060', opacity: 0.35 },
    { r: 20, tube: 0.015, color: '#142040', opacity: 0.25 },
    { r: 30, tube: 0.01,  color: '#d8a030', opacity: 0.12 },
  ]

  return (
    <group ref={ref} position={[0, 10, 0]}>
      {rings.map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, i * 0.3, 0]}>
          <torusGeometry args={[r.r, r.tube, 6, 64]} />
          <meshBasicMaterial color={r.color} transparent opacity={r.opacity} fog={false} />
        </mesh>
      ))}
      {/* A second set tilted */}
      {rings.slice(0, 2).map((r, i) => (
        <mesh key={`t-${i}`} rotation={[0.6, i * 0.5, 0.2]}>
          <torusGeometry args={[r.r * 1.3, r.tube * 0.8, 6, 64]} />
          <meshBasicMaterial color="#d8a030" transparent opacity={r.opacity * 0.3} fog={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ── PORTRAIT PLANE — where instructor photo would be ── */
function PresencePlane() {
  const ref = useRef()

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    ref.current.position.y = 10 + Math.sin(t * 0.4) * 0.15
  })

  return (
    <group ref={ref} position={[0, 10, 0]}>
      {/* Outer halo glow — authority feel */}
      <mesh>
        <circleGeometry args={[4.5, 32]} />
        <meshBasicMaterial color="#1a3060" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* Mid ring */}
      <mesh>
        <ringGeometry args={[3.8, 4.5, 32]} />
        <meshBasicMaterial color="#2a4a80" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Gold ring accent */}
      <mesh>
        <ringGeometry args={[4.5, 4.7, 32]} />
        <meshBasicMaterial color="#d8a030" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Center core */}
      <mesh>
        <circleGeometry args={[3.8, 32]} />
        <meshBasicMaterial color="#0e1828" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* Emissive glow point */}
      <pointLight position={[0, 0, 2]} intensity={8} color="#4060c0" distance={30} decay={2} />
    </group>
  )
}

/* ── AMBIENT NEBULA — soft depth atmosphere ── */
function NebulaFog() {
  return (
    <group position={[0, 10, -20]}>
      {[
        { x: -20, y: 5,   c: '#0a1830', op: 0.4 },
        { x:  25, y: -5,  c: '#0c1420', op: 0.3 },
        { x:  5,  y: 18,  c: '#1a1030', op: 0.25 },
        { x: -15, y: -10, c: '#0a2018', op: 0.2 },
      ].map((n, i) => (
        <mesh key={i} position={[n.x, n.y, 0]} rotation={[-Math.PI / 2, 0, i * 0.7]}>
          <planeGeometry args={[70, 60]} />
          <meshBasicMaterial color={n.c} transparent opacity={n.op} depthWrite={false} fog={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ── FLOATING DATA SHARDS — knowledge discipline symbols ── */
function KnowledgeShards() {
  const ref = useRef()

  const shards = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const r = 12 + seededUnit(9) * 8
      return {
        x: Math.cos(angle) * r,
        y: 10 + (seededUnit(10) - 0.5) * 10,
        z: Math.sin(angle) * r,
        sx: 0.6 + seededUnit(11) * 1.2,
        sy: 1.5 + seededUnit(12) * 2.5,
        rx: seededUnit(13) * Math.PI,
        ry: angle,
      }
    }), [])

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.015
  })

  return (
    <group ref={ref}>
      {shards.map((sh, i) => (
        <mesh key={i} position={[sh.x, sh.y, sh.z]} rotation={[sh.rx, sh.ry, 0]}>
          <planeGeometry args={[sh.sx, sh.sy]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#d8a030' : '#2a4070'}
            transparent
            opacity={0.2 + seededUnit(14) * 0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── SCENE LIGHTING ── */
function VoidLighting() {
  return (
    <>
      <ambientLight intensity={0.05} color="#050814" />
      {/* Key — cool authority from front-above */}
      <pointLight position={[0, 25, 15]} intensity={15} color="#4070c0" distance={80} decay={2} />
      {/* Gold fill — achievement warmth from one side */}
      <pointLight position={[20, 5, 10]} intensity={6} color="#c08820" distance={60} decay={2} />
      {/* Rim — cold separation */}
      <pointLight position={[0, 0, -30]} intensity={8} color="#203060" distance={80} decay={2} />
    </>
  )
}

export default function Act02_Mentor() {
  return (
    <group>
      <VoidLighting />
      <VoidBackground />
      <NebulaFog />
      <DepthRings />
      <WisdomParticles />
      <GoldParticles />
      <PresencePlane />
      <KnowledgeShards />
    </group>
  )
}
