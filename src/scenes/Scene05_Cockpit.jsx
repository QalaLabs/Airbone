import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  createPFDTexture,
  createNDTexture,
  createECAMTexture,
  createFCUTexture,
} from '../utils/InstrumentTextures'

// ─── Overhead panel switch indicators ────────────────────────────────────────
function OverheadSwitches() {
  const switches = useMemo(() => {
    const cols = [
      '#00FF44', // green
      '#FFA500', // amber
      '#FFFFFF', // white
      '#00E5FF', // cyan
      '#FF3333', // red
    ]
    return Array.from({ length: 30 }, (_, i) => ({
      x: -1.25 + (i % 10) * 0.28,
      z: 0.55 - Math.floor(i / 10) * 0.48,
      color: cols[i % cols.length],
    }))
  }, [])

  return (
    <group>
      {switches.map((sw, i) => (
        <mesh
          key={i}
          position={[sw.x, 1.672, sw.z]}
          rotation={[-0.4, 0, 0]}
        >
          <boxGeometry args={[0.07, 0.04, 0.09]} />
          <meshStandardMaterial
            color={sw.color}
            emissive={sw.color}
            emissiveIntensity={2.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Throttle lever (cylinder body + sphere grip) ────────────────────────────
function ThrottleLever({ position }) {
  return (
    <group position={position}>
      {/* Lever shaft */}
      <mesh rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Grip knob */}
      <mesh position={[0, 0.26, -0.09]}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ─── Sidestick ────────────────────────────────────────────────────────────────
function Sidestick({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <boxGeometry args={[0.14, 0.06, 0.18]} />
        <meshStandardMaterial color="#111118" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Stick */}
      <mesh position={[0, 0.16, 0]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.32, 10]} />
        <meshStandardMaterial color="#222230" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Top button */}
      <mesh position={[0, 0.31, -0.04]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#FF2222" emissive="#CC0000" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

// ─── Pilot seat ───────────────────────────────────────────────────────────────
function PilotSeat({ position }) {
  return (
    <group position={position}>
      {/* Seat base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.65, 0.1, 0.65]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.75} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.6, -0.28]}>
        <boxGeometry args={[0.65, 1.1, 0.1]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.75} />
      </mesh>
      {/* Headrest */}
      <mesh position={[0, 1.2, -0.26]}>
        <boxGeometry args={[0.58, 0.22, 0.12]} />
        <meshStandardMaterial color="#0d0d18" roughness={0.8} />
      </mesh>
      {/* Armrest left */}
      <mesh position={[-0.36, 0.2, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.5]} />
        <meshStandardMaterial color="#111118" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Armrest right */}
      <mesh position={[0.36, 0.2, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.5]} />
        <meshStandardMaterial color="#111118" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Radio management panel on center pedestal ──────────────────────────────
function RadioPanel({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.58, 0.18, 0.35]} />
      <meshStandardMaterial color="#0d0d18" roughness={0.6} metalness={0.4} />
    </mesh>
  )
}

// ─── Main cockpit scene ───────────────────────────────────────────────────────
export default function Scene05_Cockpit({ progress = 0 }) {
  const meshRef = useRef()

  // Build instrument textures once
  const pfdTexture  = useMemo(() => createPFDTexture(), [])
  const ndTexture   = useMemo(() => createNDTexture(), [])
  const ecamTexture = useMemo(() => createECAMTexture(), [])
  const fcuTexture  = useMemo(() => createFCUTexture(768, 128), [])

  // Subtle instrument flicker
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      meshRef.current.rotation.y = Math.sin(t * 0.08) * 0.003
    }
  })

  return (
    <group ref={meshRef}>
      {/* ── Lighting ── */}
      {/* Instrument glow — center */}
      <pointLight position={[0, 0.5, 2.2]}   color="#001840" intensity={3} distance={3} decay={2} />
      {/* Captain side glow */}
      <pointLight position={[-1, 0.5, 2.0]}  color="#001840" intensity={2} distance={2} decay={2} />
      {/* FO side glow */}
      <pointLight position={[1, 0.5, 2.0]}   color="#001840" intensity={2} distance={2} decay={2} />
      {/* Cockpit ambient */}
      <ambientLight color="#050f20" intensity={0.3} />
      {/* Weak fill from above */}
      <pointLight position={[0, 1.8, 1.0]} color="#0a1830" intensity={0.8} distance={4} decay={2} />

      {/* ── Cockpit shell (half-cylinder, back side) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 5.5, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.85} side={THREE.BackSide} />
      </mesh>

      {/* ── Cockpit floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
        <planeGeometry args={[5.2, 6]} />
        <meshStandardMaterial color="#080810" roughness={0.9} />
      </mesh>

      {/* ── Side wall panels ── */}
      <mesh position={[-2.55, 0, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.5, 4]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.8} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[2.55, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5.5, 4]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.8} side={THREE.FrontSide} />
      </mesh>

      {/* ── Main instrument panel ── */}
      <mesh position={[0, -0.4, 2.3]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[3.8, 1.9, 0.15]} />
        <meshStandardMaterial color="#111118" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* ── Glareshield ── */}
      <mesh position={[0, 0.45, 2.0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[3.6, 0.18, 0.5]} />
        <meshStandardMaterial color="#0a0a14" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════
           SCREENS – each uses a plane in front of the instrument panel
           rotation [0.25, 0, 0] mirrors the panel tilt
          ════════════════════════════════════════════════════════════ */}

      {/* Captain PFD */}
      <mesh position={[-0.95, -0.2, 2.22]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[1.0, 0.9]} />
        <meshStandardMaterial
          map={pfdTexture}
          emissiveMap={pfdTexture}
          emissive="#ffffff"
          emissiveIntensity={1.5}
          roughness={0.05}
          metalness={0.0}
          toneMapped={false}
        />
      </mesh>

      {/* FO PFD */}
      <mesh position={[0.95, -0.2, 2.22]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[1.0, 0.9]} />
        <meshStandardMaterial
          map={pfdTexture}
          emissiveMap={pfdTexture}
          emissive="#ffffff"
          emissiveIntensity={1.5}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* Captain ND */}
      <mesh position={[-0.95, -0.95, 2.18]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[1.0, 0.9]} />
        <meshStandardMaterial
          map={ndTexture}
          emissiveMap={ndTexture}
          emissive="#ffffff"
          emissiveIntensity={1.5}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* FO ND */}
      <mesh position={[0.95, -0.95, 2.18]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[1.0, 0.9]} />
        <meshStandardMaterial
          map={ndTexture}
          emissiveMap={ndTexture}
          emissive="#ffffff"
          emissiveIntensity={1.5}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* ECAM Upper (Engine/Warning display) */}
      <mesh position={[0, -0.35, 2.22]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[0.75, 0.65]} />
        <meshStandardMaterial
          map={ecamTexture}
          emissiveMap={ecamTexture}
          emissive="#ffffff"
          emissiveIntensity={1.5}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* ECAM Lower (Systems display, dark/standby) */}
      <mesh position={[0, -0.95, 2.18]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[0.75, 0.65]} />
        <meshStandardMaterial
          color="#001020"
          emissive="#002030"
          emissiveIntensity={1.5}
          roughness={0.1}
        />
      </mesh>

      {/* FCU (Flight Control Unit) panel on glareshield */}
      <mesh position={[0, 0.6, 2.35]} rotation={[0.1, 0, 0]}>
        <planeGeometry args={[2.0, 0.35]} />
        <meshStandardMaterial
          map={fcuTexture}
          emissiveMap={fcuTexture}
          emissive="#ffffff"
          emissiveIntensity={1.2}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* ── Overhead panel ── */}
      <mesh position={[0, 1.6, 1.5]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[2.8, 0.15, 1.6]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.7} metalness={0.2} />
      </mesh>
      <OverheadSwitches />

      {/* ── Center pedestal ── */}
      <mesh position={[0, -1.3, 1.6]}>
        <boxGeometry args={[0.7, 0.9, 1.8]} />
        <meshStandardMaterial color="#0d0d15" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Thrust lever guard */}
      <mesh position={[0, -0.78, 1.5]}>
        <boxGeometry args={[0.38, 0.06, 0.55]} />
        <meshStandardMaterial color="#1a1a28" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Throttle levers */}
      <ThrottleLever position={[-0.12, -0.8, 1.5]} />
      <ThrottleLever position={[0.12, -0.8, 1.5]} />

      {/* Radio management panels */}
      <RadioPanel position={[0, -1.0, 1.6]} />
      <RadioPanel position={[0, -1.22, 2.1]} />

      {/* ── Seats ── */}
      <PilotSeat position={[-0.85, -1.5, 0.8]} />
      <PilotSeat position={[0.85, -1.5, 0.8]} />

      {/* ── Sidesticks (Airbus) ── */}
      <Sidestick position={[-1.68, -1.42, 1.9]} />
      <Sidestick position={[1.68, -1.42, 1.9]} />

      {/* ── Rudder pedals ── */}
      {[-0.5, 0.5].map((x, i) => (
        <group key={i} position={[x * 1.35, -1.72, 2.5]}>
          {/* Left pedal */}
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.14, 0.04, 0.28]} />
            <meshStandardMaterial color="#181820" metalness={0.6} roughness={0.5} />
          </mesh>
          {/* Right pedal */}
          <mesh position={[0.12, 0, -0.14]}>
            <boxGeometry args={[0.14, 0.04, 0.28]} />
            <meshStandardMaterial color="#181820" metalness={0.6} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Windshield frame ── */}
      {/* Top bar */}
      <mesh position={[0, 0.85, 2.7]}>
        <boxGeometry args={[3.0, 0.14, 0.12]} />
        <meshStandardMaterial color="#090910" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[0, 0.1, 2.7]}>
        <boxGeometry args={[3.0, 0.14, 0.12]} />
        <meshStandardMaterial color="#090910" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Center divider */}
      <mesh position={[0, 0.5, 2.7]}>
        <boxGeometry args={[0.1, 0.9, 0.12]} />
        <meshStandardMaterial color="#090910" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Left pillar */}
      <mesh position={[-1.48, 0.5, 2.68]}>
        <boxGeometry args={[0.12, 0.9, 0.14]} />
        <meshStandardMaterial color="#090910" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[1.48, 0.5, 2.68]}>
        <boxGeometry args={[0.12, 0.9, 0.14]} />
        <meshStandardMaterial color="#090910" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* ── Windshield glass ── */}
      <mesh position={[0, 0.5, 2.75]}>
        <planeGeometry args={[2.8, 1.4]} />
        <meshStandardMaterial
          color="#001030"
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Side windows ── */}
      <mesh position={[-2.48, 0.5, 2.3]} rotation={[0, Math.PI / 3, 0]}>
        <planeGeometry args={[0.7, 0.85]} />
        <meshStandardMaterial
          color="#001030"
          transparent
          opacity={0.35}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[2.48, 0.5, 2.3]} rotation={[0, -Math.PI / 3, 0]}>
        <planeGeometry args={[0.7, 0.85]} />
        <meshStandardMaterial
          color="#001030"
          transparent
          opacity={0.35}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
