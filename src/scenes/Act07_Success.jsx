import { useRef, useMemo } from 'react'
import { seededUnit } from '@/utils/seeded-random'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── DAWN SKY DOME ── */
function DawnSky() {
  return (
    <group>
      {/* Upper sky — bright cerulean */}
      <mesh>
        <sphereGeometry args={[480, 32, 16]} />
        <meshBasicMaterial color="#1a3a6a" side={THREE.BackSide} fog={false} />
      </mesh>
      {/* Horizon band — golden hour warmth */}
      <mesh position={[0, -15, 0]}>
        <cylinderGeometry args={[478, 478, 70, 32, 1, true]} />
        <meshBasicMaterial color="#e8792a" side={THREE.BackSide} transparent opacity={0.5} fog={false} depthWrite={false} />
      </mesh>
      {/* Sun — high and bright, rising ahead */}
      <mesh position={[40, 60, -420]}>
        <circleGeometry args={[32, 24]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.75} depthWrite={false} fog={false} />
      </mesh>
      {/* Sun corona */}
      <mesh position={[40, 60, -421]}>
        <ringGeometry args={[32, 90, 24]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.18} depthWrite={false} fog={false} />
      </mesh>
      {/* Wide sun glare */}
      <mesh position={[40, 30, -418]}>
        <planeGeometry args={[360, 160]} />
        <meshBasicMaterial color="#ffaa22" transparent opacity={0.12} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

/* ── CLOUD CARPET — below the camera, stretching to horizon ── */
function CloudCarpet() {
  const ref = useRef()
  const count = 60

  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (seededUnit(0) - 0.5) * 700,
      z: -50 - seededUnit(1) * 600,
      sx: 40 + seededUnit(2) * 120,
      sz: 20 + seededUnit(3) * 50,
      y: -2 + (seededUnit(4) - 0.5) * 6,
      ry: seededUnit(5) * Math.PI,
      op: 0.5 + seededUnit(6) * 0.4,
    })), [])

  useFrame((s) => {
    if (ref.current) {
      // Clouds drift slowly forward (flying through them feel)
      ref.current.position.z = (s.clock.elapsedTime * 1.2) % 80
    }
  })

  return (
    <group ref={ref} position={[0, -3, 0]}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]} rotation={[-Math.PI / 2, 0, d.ry]}>
          <planeGeometry args={[d.sx, d.sz]} />
          <meshBasicMaterial
            color="#f0eae8"
            transparent
            opacity={d.op * 0.45}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── MID-ALTITUDE CLOUDS — scattered, lit from above ── */
function MidClouds() {
  const ref = useRef()
  const count = 24

  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (seededUnit(7) - 0.5) * 400,
      z: -80 - seededUnit(8) * 350,
      sx: 25 + seededUnit(9) * 70,
      sz: 15 + seededUnit(10) * 35,
      y: 8 + seededUnit(11) * 10,
      ry: seededUnit(12) * Math.PI,
    })), [])

  useFrame((s) => {
    if (ref.current) ref.current.position.z = (s.clock.elapsedTime * 0.8) % 60
  })

  return (
    <group ref={ref}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]} rotation={[-Math.PI / 2, 0, d.ry]}>
          <planeGeometry args={[d.sx, d.sz]} />
          <meshBasicMaterial
            color="#ede8f8"
            transparent
            opacity={0.18 + seededUnit(13) * 0.15}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── HORIZON CLOUD BANK — thick layer at distance ── */
function HorizonClouds() {
  const data = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      x: (i - 8) * 55,
      sz: 80 + seededUnit(14) * 80,
      sx: 90 + seededUnit(15) * 60,
    })), [])

  return (
    <group position={[0, -8, -380]}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[d.sx, d.sz]} />
          <meshBasicMaterial color="#e8ddd4" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ── ATMOSPHERIC PARTICLES — altitude shimmer ── */
function AltitudeParticles() {
  const ref = useRef()
  const count = 500

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (seededUnit(i * 100 + 16) - 0.5) * 300
      arr[i * 3 + 1] = (seededUnit(i * 100 + 17) - 0.5) * 40 + 5
      arr[i * 3 + 2] = (seededUnit(i * 100 + 18) - 0.5) * 400 - 100
    }
    return arr
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.003
      ref.current.position.z = (s.clock.elapsedTime * 0.5) % 50
    }
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#ffe8c0" size={0.12} sizeAttenuation transparent opacity={0.35} />
    </points>
  )
}

/* ── DEPARTING AIRCRAFT — far below in the clouds ── */
function AircraftBelow() {
  const ref = useRef()

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime * 0.3
    ref.current.position.x = Math.sin(t) * 80
    ref.current.position.z = -120 - t * 20
    ref.current.rotation.y = -Math.sin(t) * 0.1
  })

  return (
    <group ref={ref} position={[0, -18, -120]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.5, 14, 8]} />
        <meshStandardMaterial color="#1a2030" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.2, 1]}>
        <boxGeometry args={[18, 0.2, 3]} />
        <meshStandardMaterial color="#141c26" roughness={0.8} />
      </mesh>
      {/* Nav lights */}
      <mesh position={[9.2, -0.2, 1]}>
        <sphereGeometry args={[0.12, 5, 5]} />
        <meshStandardMaterial emissive="#00ff55" emissiveIntensity={10} color="#00ff55" />
      </mesh>
      <mesh position={[-9.2, -0.2, 1]}>
        <sphereGeometry args={[0.12, 5, 5]} />
        <meshStandardMaterial emissive="#ff2200" emissiveIntensity={10} color="#ff2200" />
      </mesh>
    </group>
  )
}

/* ── SCENE LIGHTING ── */
function DawnLighting() {
  return (
    <>
      <ambientLight intensity={0.4} color="#4060a0" />
      <hemisphereLight skyColor="#3070c0" groundColor="#c08040" intensity={0.6} />
      {/* Rising sun — high ahead */}
      <directionalLight position={[80, 120, -300]} intensity={2.5} color="#ffe8b0" />
      {/* Atmosphere scatter fill */}
      <directionalLight position={[-60, 80, 0]} intensity={0.5} color="#6090c8" />
    </>
  )
}

export default function Act07_Success() {
  return (
    <group>
      <DawnLighting />
      <DawnSky />
      <CloudCarpet />
      <MidClouds />
      <HorizonClouds />
      <AltitudeParticles />
      <AircraftBelow />
    </group>
  )
}
