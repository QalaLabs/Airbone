import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// ─── Seat Unit (seat cushion + seatback + headrest) ────────────────────────
function SeatUnit({ position }) {
  return (
    <group position={position}>
      {/* Seat cushion */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.5]} />
        <meshStandardMaterial color="#00274C" roughness={0.8} />
      </mesh>
      {/* Seat base/legs */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[0.44, 0.58, 0.1]} />
        <meshStandardMaterial color="#222830" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Seatback */}
      <mesh position={[0, 0.47, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.82, 0.08]} />
        <meshStandardMaterial color="#00274C" roughness={0.8} />
      </mesh>
      {/* Headrest cover (white antimacassar) */}
      <mesh position={[0, 0.9, -0.215]}>
        <boxGeometry args={[0.48, 0.18, 0.015]} />
        <meshStandardMaterial color="#F8F8F5" roughness={0.9} />
      </mesh>
      {/* Armrest */}
      <mesh position={[0.27, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.44]} />
        <meshStandardMaterial color="#1a2030" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ─── One row of 6 seats (3+3) ───────────────────────────────────────────────
function SeatRow({ z }) {
  const leftXs = [-1.1, -1.7, -2.3]
  const rightXs = [1.1, 1.7, 2.3]
  const seatY = -1.55

  return (
    <group>
      {leftXs.map((x, i) => (
        <SeatUnit key={`l${i}`} position={[x, seatY, z]} />
      ))}
      {rightXs.map((x, i) => (
        <SeatUnit key={`r${i}`} position={[x, seatY, z]} />
      ))}
    </group>
  )
}

// ─── Overhead bin pair ────────────────────────────────────────────────────────
function OverheadBinPair({ z }) {
  return (
    <group>
      {/* Left bin */}
      <mesh position={[-1.8, 1.4, z]}>
        <boxGeometry args={[2.4, 0.8, 1.9]} />
        <meshStandardMaterial color="#E0DCD6" roughness={0.7} />
      </mesh>
      {/* Left bin latch */}
      <mesh position={[-1.8, 1.04, z + 0.96]}>
        <boxGeometry args={[0.35, 0.07, 0.04]} />
        <meshStandardMaterial color="#CC1111" emissive="#991111" emissiveIntensity={0.6} roughness={0.5} />
      </mesh>
      {/* Right bin */}
      <mesh position={[1.8, 1.4, z]}>
        <boxGeometry args={[2.4, 0.8, 1.9]} />
        <meshStandardMaterial color="#E0DCD6" roughness={0.7} />
      </mesh>
      {/* Right bin latch */}
      <mesh position={[1.8, 1.04, z + 0.96]}>
        <boxGeometry args={[0.35, 0.07, 0.04]} />
        <meshStandardMaterial color="#CC1111" emissive="#991111" emissiveIntensity={0.6} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── PSU panel (Passenger Service Unit) ────────────────────────────────────
function PSUPanel({ z }) {
  return (
    <mesh position={[0, 1.9, z]}>
      <boxGeometry args={[4.8, 0.2, 0.8]} />
      <meshStandardMaterial color="#DEDAD4" roughness={0.6} metalness={0.1} />
    </mesh>
  )
}

// ─── Window pair (left + right wall) ────────────────────────────────────────
function WindowPair({ z }) {
  return (
    <group>
      {/* Left window */}
      <mesh position={[-2.79, 0.6, z]}>
        <boxGeometry args={[0.05, 0.45, 0.6]} />
        <meshStandardMaterial
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={2}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Left window light shaft */}
      <pointLight
        position={[-2.4, 0.6, z]}
        color="#B0D8FF"
        intensity={0.8}
        distance={3}
        decay={2}
      />
      {/* Right window */}
      <mesh position={[2.79, 0.6, z]}>
        <boxGeometry args={[0.05, 0.45, 0.6]} />
        <meshStandardMaterial
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={2}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Right window light shaft */}
      <pointLight
        position={[2.4, 0.6, z]}
        color="#B0D8FF"
        intensity={0.8}
        distance={3}
        decay={2}
      />
    </group>
  )
}

// ─── Galley at rear ─────────────────────────────────────────────────────────
function RearGalley() {
  return (
    <group position={[0, -0.5, 12]}>
      {/* Galley counter left */}
      <mesh position={[-1.5, 0.3, 0]}>
        <boxGeometry args={[1.2, 1.4, 1.8]} />
        <meshStandardMaterial color="#C8C4BE" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Galley counter right */}
      <mesh position={[1.5, 0.3, 0]}>
        <boxGeometry args={[1.2, 1.4, 1.8]} />
        <meshStandardMaterial color="#C8C4BE" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Cart stowage */}
      <mesh position={[-1.5, -0.5, 0.5]}>
        <boxGeometry args={[0.55, 0.9, 0.7]} />
        <meshStandardMaterial color="#A0A0A0" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[1.5, -0.5, 0.5]}>
        <boxGeometry args={[0.55, 0.9, 0.7]} />
        <meshStandardMaterial color="#A0A0A0" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Rear bulkhead */}
      <mesh position={[0, 0.5, 1.1]}>
        <boxGeometry args={[5.6, 4.2, 0.12]} />
        <meshStandardMaterial color="#DEDAD4" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Main Scene ─────────────────────────────────────────────────────────────
export default function Scene04_Cabin({ progress = 0 }) {
  const cameraGroupRef = useRef()

  // Row positions: Z from -11 to +9 step 2 (10 rows)
  const rowPositions = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => -11 + i * 2), [])

  // Window positions: 24 windows, 12 per side, distributed along cabin length
  const windowPositions = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => -10.5 + i * 1.9), [])

  useFrame((state) => {
    if (cameraGroupRef.current) {
      // Camera walks from Z=+10 (rear) toward Z=-10 (front) as progress goes 0→1
      // Keep camera at pilot-eye-like height of 0.5 inside the cabin
      const walkZ = 10 - progress * 20
      cameraGroupRef.current.position.set(0, 0.5, walkZ)
      // Gentle sway
      const t = state.clock.elapsedTime
      cameraGroupRef.current.rotation.y = Math.sin(t * 0.25) * 0.015
    }
  })

  return (
    <group>
      {/* ── Lighting ── */}
      <ambientLight color="#FFF8F0" intensity={0.6} />
      <pointLight position={[0, 2, -8]} color="#FFF5E8" intensity={1.5} distance={8} decay={2} />
      <pointLight position={[0, 2, 0]}  color="#FFF5E8" intensity={1.5} distance={8} decay={2} />
      <pointLight position={[0, 2, 8]}  color="#FFF5E8" intensity={1.5} distance={8} decay={2} />

      {/* ── Camera anchor (animated) ── */}
      <group ref={cameraGroupRef} />

      {/* ── Cabin shell (cylinder inner surface) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 28, 40, 1, true]} />
        <meshStandardMaterial
          color="#F0ECE5"
          roughness={0.85}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
        <planeGeometry args={[5, 28]} />
        <meshStandardMaterial color="#6B5B4E" roughness={0.95} />
      </mesh>

      {/* ── Floor center runner strip ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 0]}>
        <planeGeometry args={[0.6, 28]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* ── Ceiling panel ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.1, 0]}>
        <planeGeometry args={[5.2, 28]} />
        <meshStandardMaterial color="#E8E4DE" roughness={0.7} />
      </mesh>

      {/* ── LED lighting strip ── */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[0.08, 0.04, 28]} />
        <meshStandardMaterial
          color="#FFF8F0"
          emissive="#FFF8F0"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* ── PSU panels every 2 units ── */}
      {rowPositions.map((z) => (
        <PSUPanel key={`psu${z}`} z={z} />
      ))}

      {/* ── Reading lights (small emissive sphere per row) ── */}
      {rowPositions.map((z) => (
        <group key={`rl${z}`}>
          <mesh position={[-0.8, 1.88, z]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial
              color="#FFF5D6"
              emissive="#FFF5D6"
              emissiveIntensity={4}
            />
          </mesh>
          <mesh position={[0.8, 1.88, z]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial
              color="#FFF5D6"
              emissive="#FFF5D6"
              emissiveIntensity={4}
            />
          </mesh>
        </group>
      ))}

      {/* ── Seat rows ── */}
      {rowPositions.map((z) => (
        <SeatRow key={`row${z}`} z={z} />
      ))}

      {/* ── Overhead bins (paired, every 2 units) ── */}
      {rowPositions.map((z) => (
        <OverheadBinPair key={`bin${z}`} z={z} />
      ))}

      {/* ── Windows (12 pairs = 24 total) ── */}
      {windowPositions.map((z) => (
        <WindowPair key={`win${z}`} z={z} />
      ))}

      {/* ── Rear galley ── */}
      <RearGalley />

      {/* ── Forward bulkhead (cockpit door) ── */}
      <mesh position={[0, 0, -13.95]}>
        <boxGeometry args={[5.6, 5.5, 0.12]} />
        <meshStandardMaterial color="#DEDAD4" roughness={0.8} />
      </mesh>
      {/* Cockpit door */}
      <mesh position={[0.2, -0.2, -13.93]}>
        <boxGeometry args={[0.9, 1.9, 0.06]} />
        <meshStandardMaterial color="#C8C4BE" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}
