import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Livery Colors ────────────────────────────────────────────────────────────
const COL_FUSE   = '#E8EBF0'
const COL_NAVY   = '#00274C'
const COL_RED    = '#DB241E'
const COL_APRON  = '#2a2d30'
const COL_JETWAY = '#666666'

// ─── Fuselage ────────────────────────────────────────────────────────────────
function Fuselage() {
  return (
    <group>
      {/* Main barrel */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[2.5, 22, 16, 32]} />
        <meshStandardMaterial color={COL_FUSE} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Nose cone */}
      <mesh position={[13, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[2.5, 4, 24]} />
        <meshStandardMaterial color={COL_FUSE} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Navy cheatline strip */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[2.52, 2.52, 26, 48, 1, true, 3.8, 1.65]} />
        <meshStandardMaterial color={COL_NAVY} metalness={0.6} roughness={0.3} side={THREE.FrontSide} />
      </mesh>

      {/* Red stripe */}
      <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[2.53, 2.53, 26, 48, 1, true, 3.85, 0.55]} />
        <meshStandardMaterial color={COL_RED} metalness={0.5} roughness={0.3} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

// ─── Wings ────────────────────────────────────────────────────────────────────
function Wings() {
  return (
    <group>
      {/* Left wing */}
      <mesh position={[-12, -0.1, -2]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[22, 0.4, 6]} />
        <meshStandardMaterial color={COL_FUSE} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Right wing */}
      <mesh position={[12, -0.1, -2]} rotation={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[22, 0.4, 6]} />
        <meshStandardMaterial color={COL_FUSE} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Left winglet */}
      <mesh
        position={[-23.2, 1.1, -2]}
        rotation={[0, 0, -0.26]}
        castShadow
      >
        <boxGeometry args={[0.3, 1.8, 0.8]} />
        <meshStandardMaterial color={COL_NAVY} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Right winglet */}
      <mesh
        position={[23.2, 1.1, -2]}
        rotation={[0, 0, 0.26]}
        castShadow
      >
        <boxGeometry args={[0.3, 1.8, 0.8]} />
        <meshStandardMaterial color={COL_NAVY} metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  )
}

// ─── Engine Nacelle ───────────────────────────────────────────────────────────
function Engine({ x }) {
  return (
    <group position={[x, -1.8, -2]}>
      {/* Nacelle */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.0, 4, 20]} />
        <meshStandardMaterial color="#bfc4cc" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Intake ring */}
      <mesh position={[0, 0, 2.1]} castShadow>
        <torusGeometry args={[1.2, 0.12, 12, 28]} />
        <meshStandardMaterial color="#8a9098" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Spinner */}
      <mesh position={[0, 0, 2.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.45, 0.9, 16]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Pylon */}
      <mesh position={[x > 0 ? -1.2 : 1.2, 1.0, 0]} castShadow>
        <boxGeometry args={[2.0, 0.3, 2.8]} />
        <meshStandardMaterial color="#c8ccd4" metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Tail ─────────────────────────────────────────────────────────────────────
function TailAssembly() {
  return (
    <group>
      {/* Vertical stabilizer */}
      <mesh position={[0, 4.5, -11]} castShadow>
        <boxGeometry args={[0.35, 5, 3.5]} />
        <meshStandardMaterial color={COL_NAVY} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Left horizontal stab */}
      <mesh position={[-4, 0.5, -10]} castShadow>
        <boxGeometry args={[7, 0.3, 2.5]} />
        <meshStandardMaterial color={COL_FUSE} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Right horizontal stab */}
      <mesh position={[4, 0.5, -10]} castShadow>
        <boxGeometry args={[7, 0.3, 2.5]} />
        <meshStandardMaterial color={COL_FUSE} metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Windows ──────────────────────────────────────────────────────────────────
function Windows() {
  const windows = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const z = -9 + i * 0.95
      return z
    })
  }, [])

  return (
    <group>
      {/* Left side windows */}
      {windows.map((z, i) => (
        <mesh key={`L${i}`} position={[-2.51, 0.8, z]}>
          <boxGeometry args={[0.08, 0.3, 0.22]} />
          <meshStandardMaterial
            color="#aad4ff"
            emissive="#6ab0f0"
            emissiveIntensity={0.9}
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Right side windows */}
      {windows.map((z, i) => (
        <mesh key={`R${i}`} position={[2.51, 0.8, z]}>
          <boxGeometry args={[0.08, 0.3, 0.22]} />
          <meshStandardMaterial
            color="#aad4ff"
            emissive="#6ab0f0"
            emissiveIntensity={0.9}
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Door ─────────────────────────────────────────────────────────────────────
function Door({ doorOpen = 0 }) {
  const doorRef = useRef()

  useEffect(() => {
    if (doorRef.current) {
      doorRef.current.rotation.y = -doorOpen * Math.PI / 2
    }
  }, [doorOpen])

  return (
    // Pivot at door hinge edge (left side at Z=+6)
    <group position={[-2.55, 0, 6]}>
      <group ref={doorRef} position={[0, 0, 0]}>
        <mesh position={[-0.05, 0.2, -0.75]}>
          <boxGeometry args={[0.1, 2.2, 1.5]} />
          <meshStandardMaterial color="#c8ccd4" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Jetway ───────────────────────────────────────────────────────────────────
function Jetway() {
  return (
    <group position={[4.5, 0, 5]}>
      <mesh castShadow>
        <boxGeometry args={[3, 4, 12]} />
        <meshStandardMaterial color={COL_JETWAY} metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ─── Apron Ground ─────────────────────────────────────────────────────────────
function Apron() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color={COL_APRON} roughness={0.9} metalness={0.05} />
    </mesh>
  )
}

// ─── Apron Pole Light ─────────────────────────────────────────────────────────
function PoleLight({ position }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 8, 8]} />
        <meshStandardMaterial color="#555" roughness={0.6} />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0, 8.3, 0]}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshStandardMaterial color="#fffde0" emissive="#fff4a0" emissiveIntensity={3} />
      </mesh>
      {/* Light */}
      <pointLight position={[0, 8.3, 0]} color="#fff4a0" intensity={2.5} distance={35} castShadow />
    </group>
  )
}

// ─── Landing Gear (simplified) ────────────────────────────────────────────────
function LandingGear() {
  return (
    <group>
      {/* Nose gear strut */}
      <mesh position={[9.5, -3.7, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2.5, 10]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Nose wheel */}
      <mesh position={[9.5, -4.9, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.55, 0.25, 10, 20]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Left main gear */}
      <mesh position={[-1, -3.7, -1.5]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 2.5, 10]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-1, -4.9, -1.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.65, 0.28, 10, 20]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Right main gear */}
      <mesh position={[1, -3.7, -1.5]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 2.5, 10]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1, -4.9, -1.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.65, 0.28, 10, 20]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export default function Scene02_Approach({ doorOpen = 0 }) {
  const poleLightPositions = [
    [-30, -2.5,  25],
    [ 30, -2.5,  25],
    [-30, -2.5, -10],
    [ 30, -2.5, -10],
    [-30, -2.5, -40],
    [ 30, -2.5, -40],
  ]

  return (
    <group>
      {/* Lighting */}
      <directionalLight
        position={[30, 50, 10]}
        intensity={3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <ambientLight color="#101828" intensity={0.5} />

      {/* Apron */}
      <Apron />

      {/* Aircraft — fuselage centre at Y=0 (sitting at Y=-2.5 ground with gear) */}
      <group position={[0, 0, 0]}>
        <Fuselage />
        <Wings />
        <Engine x={-8} />
        <Engine x={ 8} />
        <TailAssembly />
        <Windows />
        <Door doorOpen={doorOpen} />
        <LandingGear />
      </group>

      {/* Jetway */}
      <Jetway />

      {/* Pole lights */}
      {poleLightPositions.map((pos, i) => (
        <PoleLight key={i} position={pos} />
      ))}
    </group>
  )
}
