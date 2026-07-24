import { useRef, useMemo } from 'react'
import { seededUnit } from '@/utils/seeded-random'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── TWILIGHT SKY DOME ── */
function TwilightSky() {
  // Multi-layer sky: zenith deep purple → horizon warm amber
  return (
    <group>
      {/* Sky sphere — deep twilight purple/blue at top */}
      <mesh>
        <sphereGeometry args={[480, 32, 16]} />
        <meshBasicMaterial color="#0a0618" side={THREE.BackSide} fog={false} />
      </mesh>
      {/* Horizon band — warm amber/gold */}
      <mesh position={[0, -8, 0]}>
        <cylinderGeometry args={[479, 479, 60, 32, 1, true]} />
        <meshBasicMaterial color="#c85a10" side={THREE.BackSide} transparent opacity={0.55} fog={false} depthWrite={false} />
      </mesh>
      {/* Sun glow — low on horizon */}
      <mesh position={[-80, -5, -440]}>
        <planeGeometry args={[280, 120]} />
        <meshBasicMaterial color="#ff8c30" transparent opacity={0.22} depthWrite={false} fog={false} />
      </mesh>
      {/* Sun disc */}
      <mesh position={[-80, 8, -445]}>
        <circleGeometry args={[24, 24]} />
        <meshBasicMaterial color="#ffcc55" transparent opacity={0.55} depthWrite={false} fog={false} />
      </mesh>
      {/* Solar halo */}
      <mesh position={[-80, 8, -444]}>
        <ringGeometry args={[24, 55, 24]} />
        <meshBasicMaterial color="#ff9933" transparent opacity={0.12} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

/* ── STAR FIELD — twilight, only brightest stars visible ── */
function TwilightStars() {
  const ref = useRef()
  const count = 600

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = seededUnit(i * 100 + 0) * Math.PI * 2
      const phi = seededUnit(i * 100 + 1) * Math.PI * 0.38
      const r = 350 + seededUnit(i * 100 + 2) * 100
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20
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
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.0005
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#d8c8ff" size={0.45} sizeAttenuation transparent opacity={0.7} fog={false} />
    </points>
  )
}

/* ── CLOUD LAYERS — volumetric feel with flat planes ── */
function CloudLayer({ y, count, spread, opacity, color, speed }) {
  const ref = useRef()

  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (seededUnit(3) - 0.5) * spread,
      z: (seededUnit(4) - 0.5) * spread * 0.8,
      sx: 30 + seededUnit(5) * 80,
      sz: 15 + seededUnit(6) * 35,
      ry: seededUnit(7) * Math.PI,
    })), [count, spread])

  useFrame((s) => {
    if (ref.current) ref.current.position.x = Math.sin(s.clock.elapsedTime * (speed || 0.01)) * 2
  })

  return (
    <group ref={ref} position={[0, y, 0]}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, 0, d.z]} rotation={[-Math.PI / 2, 0, d.ry]}>
          <planeGeometry args={[d.sx, d.sz]} />
          <meshBasicMaterial
            color={color || '#e8d4c0'}
            transparent
            opacity={opacity * (0.4 + seededUnit(8) * 0.6)}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── HORIZON EARTH CURVE — hint of planet below ── */
function EarthHorizon() {
  return (
    <group>
      {/* Dark ocean/ground far below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -120, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial color="#04080e" />
      </mesh>
      {/* Horizon glow line — atmosphere edge */}
      <mesh position={[0, -60, -400]}>
        <planeGeometry args={[1200, 40]} />
        <meshBasicMaterial color="#ff7722" transparent opacity={0.18} depthWrite={false} fog={false} />
      </mesh>
      {/* Lower atmosphere scatter */}
      <mesh position={[0, -30, -380]}>
        <planeGeometry args={[1000, 60]} />
        <meshBasicMaterial color="#3060a0" transparent opacity={0.22} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

/* ── VAPOR TRAILS — departing aircraft contrails ── */
function ContrailPair() {
  const ref = useRef()

  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime
      ref.current.position.x = -80 - t * 0.8
      ref.current.position.y = 15 + t * 0.15
      ref.current.position.z = -200 - t * 1.2
    }
  })

  return (
    <group ref={ref}>
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.3, 0.3, 80]} />
          <meshBasicMaterial color="#e8e4f0" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ── DEPARTING AIRCRAFT SILHOUETTE ── */
function DepartingAircraft() {
  const ref = useRef()

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    ref.current.position.x = -60 - t * 1.2
    ref.current.position.y = 20 + t * 0.25
    ref.current.position.z = -150 - t * 1.8
    ref.current.rotation.x = -0.05
    ref.current.rotation.y = 0.15
  })

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 8, 8]} />
        <meshStandardMaterial color="#1a2030" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.1, 0.5]}>
        <boxGeometry args={[11, 0.12, 2]} />
        <meshStandardMaterial color="#161c24" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 3.5]}>
        <boxGeometry args={[0.2, 1.8, 1.4]} />
        <meshStandardMaterial color="#161c24" roughness={0.8} />
      </mesh>
      {/* Anti-collision beacon */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial emissive="#ff4400" emissiveIntensity={10} color="#ff4400" />
      </mesh>
    </group>
  )
}

/* ── SCENE LIGHTING ── */
function TwilightLighting() {
  return (
    <>
      <ambientLight intensity={0.12} color="#1a0e28" />
      <hemisphereLight skyColor="#1a0e28" groundColor="#04080c" intensity={0.35} />
      {/* Setting sun — low left */}
      <directionalLight position={[-200, 15, -400]} intensity={1.8} color="#ff9944" />
      {/* Counter fill — cool right */}
      <directionalLight position={[100, 60, 0]} intensity={0.3} color="#4060a0" />
    </>
  )
}

export default function Act08_Destination() {
  return (
    <group>
      <TwilightLighting />
      <TwilightSky />
      <TwilightStars />
      <EarthHorizon />
      {/* Multiple cloud layers at different heights */}
      <CloudLayer y={-5}   count={18} spread={500} opacity={0.28} color="#c8a898" speed={0.008} />
      <CloudLayer y={5}    count={14} spread={400} opacity={0.22} color="#d4b8a8" speed={0.006} />
      <CloudLayer y={18}   count={10} spread={350} opacity={0.15} color="#e0c8b0" speed={0.005} />
      <CloudLayer y={35}   count={8}  spread={300} opacity={0.10} color="#d8ccf0" speed={0.004} />
      <ContrailPair />
      <DepartingAircraft />
    </group>
  )
}
