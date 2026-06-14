import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Constants ────────────────────────────────────────────────────────────────
const JETWAY_W  = 3      // width
const JETWAY_H  = 2.5    // height
const JETWAY_L  = 15     // length (depth)
const HALF_L    = JETWAY_L / 2

// ─── Jetway Corridor ──────────────────────────────────────────────────────────
function JetwayTunnel() {
  const floorMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b2e33', roughness: 0.9 }), [])
  const wallMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8d6cf', roughness: 0.85 }), [])
  const ceilMat    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8a49e', roughness: 0.9 }), [])

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -JETWAY_H / 2, 0]} receiveShadow>
        <planeGeometry args={[JETWAY_W, JETWAY_L]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, JETWAY_H / 2, 0]}>
        <planeGeometry args={[JETWAY_W, JETWAY_L]} />
        <primitive object={ceilMat} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-JETWAY_W / 2, 0, 0]}>
        <planeGeometry args={[JETWAY_L, JETWAY_H]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[JETWAY_W / 2, 0, 0]}>
        <planeGeometry args={[JETWAY_L, JETWAY_H]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Back wall (behind camera) */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -HALF_L]}>
        <planeGeometry args={[JETWAY_W, JETWAY_H]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
    </group>
  )
}

// ─── Ceiling Spotlights ───────────────────────────────────────────────────────
function CeilingSpotlights() {
  const positions = useMemo(() => {
    const spots = []
    for (let i = 0; i < 5; i++) {
      spots.push(-HALF_L + 2 + i * 3)
    }
    return spots
  }, [])

  return (
    <group>
      {positions.map((z, i) => (
        <group key={i} position={[0, JETWAY_H / 2 - 0.05, z]}>
          {/* Lamp body */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.08, 0.18, 10]} />
            <meshStandardMaterial color="#444" roughness={0.5} />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, -0.12, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color="#fffde0"
              emissive="#fff9b0"
              emissiveIntensity={4}
            />
          </mesh>
          {/* Spot light */}
          <spotLight
            position={[0, -0.15, 0]}
            target-position={[0, -JETWAY_H, 0]}
            color="#fff5d0"
            intensity={6}
            distance={6}
            angle={0.55}
            penumbra={0.4}
            castShadow
          />
        </group>
      ))}
    </group>
  )
}

// ─── Floor Edge Guide Lights (blue strips) ────────────────────────────────────
function FloorGuideStrips() {
  const strips = useMemo(() => {
    const s = []
    for (let i = 0; i < 18; i++) {
      const z = -HALF_L + 0.8 + i * 0.8
      s.push(z)
    }
    return s
  }, [])

  return (
    <group>
      {strips.map((z, i) => (
        <group key={i}>
          {/* Left edge strip */}
          <mesh position={[-JETWAY_W / 2 + 0.08, -JETWAY_H / 2 + 0.01, z]}>
            <boxGeometry args={[0.12, 0.02, 0.35]} />
            <meshStandardMaterial
              color="#1060ff"
              emissive="#0040ff"
              emissiveIntensity={3}
            />
          </mesh>
          {/* Right edge strip */}
          <mesh position={[JETWAY_W / 2 - 0.08, -JETWAY_H / 2 + 0.01, z]}>
            <boxGeometry args={[0.12, 0.02, 0.35]} />
            <meshStandardMaterial
              color="#1060ff"
              emissive="#0040ff"
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Aircraft Door Opening ────────────────────────────────────────────────────
function AircraftDoorOpening() {
  // Door frame around the opening at the far end of jetway
  const DOOR_W = 1.2
  const DOOR_H = 2.0
  const frameColor = '#8a8d92'
  const frameMat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.7, roughness: 0.3 }),
    []
  )

  return (
    <group position={[0, 0, HALF_L - 0.1]}>
      {/* Warm light spilling through the doorway */}
      <pointLight
        position={[0, 0.3, 0.5]}
        color="#FFF8E0"
        intensity={8}
        distance={12}
      />
      {/* Softer fill */}
      <pointLight
        position={[0, 0, 2]}
        color="#FFD090"
        intensity={3}
        distance={8}
      />

      {/* Door frame — top bar */}
      <mesh position={[0, DOOR_H / 2 + 0.12, 0]}>
        <boxGeometry args={[DOOR_W + 0.28, 0.2, 0.25]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Door frame — left side */}
      <mesh position={[-DOOR_W / 2 - 0.1, 0, 0]}>
        <boxGeometry args={[0.2, DOOR_H + 0.28, 0.25]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Door frame — right side */}
      <mesh position={[DOOR_W / 2 + 0.1, 0, 0]}>
        <boxGeometry args={[0.2, DOOR_H + 0.28, 0.25]} />
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* Door panel (open ~90 deg, flush with frame wall) */}
      <group position={[-DOOR_W / 2, 0, 0]}>
        <mesh position={[0, 0, -0.6]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.2, DOOR_H, 0.08]} />
          <meshStandardMaterial color="#b0b4bb" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>

      {/* Glowing doorway fill plane (warm amber) */}
      <mesh position={[0, 0, 0.18]}>
        <planeGeometry args={[DOOR_W, DOOR_H]} />
        <meshStandardMaterial
          color="#FFD090"
          emissive="#FFB040"
          emissiveIntensity={1.5}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* Cabin glimpse — seat tops visible */}
      <CabinGlimpse />
    </group>
  )
}

// ─── Cabin Glimpse ────────────────────────────────────────────────────────────
function CabinGlimpse() {
  const seatRows = useMemo(() => {
    const rows = []
    for (let r = 0; r < 3; r++) {
      rows.push(r)
    }
    return rows
  }, [])

  return (
    <group position={[0, -0.5, 1.2]}>
      {/* Cabin warm floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 1]}>
        <planeGeometry args={[4, 5]} />
        <meshStandardMaterial
          color="#7a5020"
          emissive="#7a4010"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Seat headrests in 3 rows, 3 across (aisle + 2+2 simplified) */}
      {seatRows.map((r) =>
        [-0.7, 0, 0.7].map((x, s) => (
          <mesh key={`${r}-${s}`} position={[x, 0.25, r * 0.9 + 0.3]}>
            <boxGeometry args={[0.28, 0.18, 0.12]} />
            <meshStandardMaterial
              color="#224a7a"
              roughness={0.85}
            />
          </mesh>
        ))
      )}

      {/* Overhead bin glow line */}
      <mesh position={[0, 0.72, 0.8]}>
        <boxGeometry args={[1.6, 0.05, 0.1]} />
        <meshStandardMaterial
          color="#fffde0"
          emissive="#fffab0"
          emissiveIntensity={2.5}
        />
      </mesh>
    </group>
  )
}

// ─── Pulsing Progress Indicator on floor ─────────────────────────────────────
function ProgressFloorGlow({ progress = 0 }) {
  const matRef = useRef()

  useFrame(({ clock }) => {
    if (matRef.current) {
      const pulse = 0.6 + Math.sin(clock.getElapsedTime() * 2.5) * 0.4
      matRef.current.emissiveIntensity = pulse * (0.3 + progress * 0.7)
    }
  })

  const zPos = -HALF_L + progress * JETWAY_L

  return (
    <mesh position={[0, -JETWAY_H / 2 + 0.015, zPos]}>
      <planeGeometry args={[JETWAY_W - 0.1, 0.5]} />
      <meshStandardMaterial
        ref={matRef}
        color="#2060ff"
        emissive="#2060ff"
        emissiveIntensity={0.8}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export default function Scene03_Boarding({ progress = 0 }) {
  return (
    <group>
      {/* Lighting */}
      <ambientLight color="#0a0f18" intensity={0.3} />

      {/* Main doorway point light */}
      <pointLight
        position={[0, 1, HALF_L]}
        color="#FFF8E0"
        intensity={8}
        distance={12}
      />

      {/* Jetway corridor geometry */}
      <JetwayTunnel />

      {/* Ceiling spotlights */}
      <CeilingSpotlights />

      {/* Floor edge guide lights */}
      <FloorGuideStrips />

      {/* Aircraft door opening at far end */}
      <AircraftDoorOpening />

      {/* Animated progress floor glow */}
      <ProgressFloorGlow progress={progress} />
    </group>
  )
}
