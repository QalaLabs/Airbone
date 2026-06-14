import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── AIRCRAFT GEOMETRY — A320-class silhouette ── */
function Aircraft() {
  const groupRef = useRef()

  // Very subtle breathing/floating
  useFrame((s) => {
    if (!groupRef.current) return
    const t = s.clock.elapsedTime
    groupRef.current.position.y = 3.5 + Math.sin(t * 0.4) * 0.08
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.004
  })

  const hull = { color: '#0d1118', roughness: 0.55, metalness: 0.45 }
  const dark = { color: '#090c10', roughness: 0.7, metalness: 0.2 }
  const glass = { color: '#1a2840', roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 }

  return (
    <group ref={groupRef} position={[0, 3.5, 0]}>

      {/* ── FUSELAGE ── */}
      {/* Main tube */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.85, 1.85, 36, 18]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      {/* Nose taper front */}
      <mesh position={[0, 0, -19.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.85, 5.5, 18]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      {/* Tail taper */}
      <mesh position={[0, 0.4, 19.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.85, 4.5, 18]} />
        <meshStandardMaterial {...hull} />
      </mesh>

      {/* Cockpit window area — subtle darker section */}
      <mesh position={[0, 0.9, -20.5]}>
        <boxGeometry args={[2.2, 1.1, 2]} />
        <meshStandardMaterial {...glass} />
      </mesh>

      {/* ── WINGS — swept back ── */}
      {/* Main wing planform */}
      <mesh position={[0, -0.6, 2.5]} rotation={[0, -0.08, 0.04]}>
        <boxGeometry args={[52, 0.35, 7]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      {/* Wing leading edge sweep fillet */}
      <mesh position={[0, -0.5, -0.5]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[44, 0.25, 3]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* Winglets */}
      <mesh position={[26.5, 0.6, 4.5]} rotation={[0, 0, 0.42]}>
        <boxGeometry args={[0.3, 2.4, 1.8]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      <mesh position={[-26.5, 0.6, 4.5]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.3, 2.4, 1.8]} />
        <meshStandardMaterial {...hull} />
      </mesh>

      {/* ── ENGINES — CFM LEAP nacelles ── */}
      {[10.5, -10.5].map((x, i) => (
        <group key={i} position={[x, -2.2, 1.5]}>
          {/* Nacelle body */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.25, 1.1, 6.5, 14]} />
            <meshStandardMaterial {...hull} />
          </mesh>
          {/* Intake ring */}
          <mesh position={[0, 0, -3.4]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.25, 0.18, 8, 18]} />
            <meshStandardMaterial color="#141820" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Engine glow — subtle thermal */}
          <mesh position={[0, 0, 3.6]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 1.0, 12]} />
            <meshBasicMaterial color="#ff6622" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 0, 4]} intensity={1.5} color="#ff6622" distance={8} decay={2} />
          {/* Pylon */}
          <mesh position={[0, 1.4, -0.5]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.7, 2.8, 3.5]} />
            <meshStandardMaterial {...dark} />
          </mesh>
        </group>
      ))}

      {/* ── VERTICAL STABILIZER ── */}
      <mesh position={[0, 5.2, 16.5]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[0.45, 8.5, 6]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      {/* Rudder — slight contrast */}
      <mesh position={[0, 5.2, 19.5]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[0.42, 8, 1.5]} />
        <meshStandardMaterial color="#0f1420" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ── HORIZONTAL STABILIZERS ── */}
      <mesh position={[0, 1.2, 17.5]}>
        <boxGeometry args={[18, 0.3, 4.5]} />
        <meshStandardMaterial {...hull} />
      </mesh>
      {/* Elevator */}
      <mesh position={[0, 1.2, 19.8]}>
        <boxGeometry args={[16, 0.25, 1.2]} />
        <meshStandardMaterial color="#0f1420" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ── LANDING GEAR (retracted bump) ── */}
      {[8, -8, 0].map((x, i) => (
        <mesh key={i} position={[x, -2.0, i === 2 ? -14 : 3]}>
          <boxGeometry args={[1.4, 0.4, 1.8]} />
          <meshStandardMaterial {...dark} />
        </mesh>
      ))}

      {/* ── LIVERY ACCENT — red stripe along fuselage ── */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.87, 1.87, 20, 18, 1, true, 0, Math.PI * 2]} />
        <meshStandardMaterial
          color="#DB241E"
          emissive="#DB241E"
          emissiveIntensity={0.4}
          transparent
          opacity={0.35}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── NAVIGATION LIGHTS ── */}
      <mesh position={[26.8, -0.6, 4.5]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial emissive="#00ff55" emissiveIntensity={12} color="#00ff55" />
      </mesh>
      <pointLight position={[26.8, -0.6, 4.5]} intensity={2} color="#00ff55" distance={6} decay={2} />

      <mesh position={[-26.8, -0.6, 4.5]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial emissive="#ff2200" emissiveIntensity={12} color="#ff2200" />
      </mesh>
      <pointLight position={[-26.8, -0.6, 4.5]} intensity={2} color="#ff2200" distance={6} decay={2} />

      {/* Tail white nav */}
      <mesh position={[0, 1.2, 21]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={8} color="#ffffff" />
      </mesh>
    </group>
  )
}

/* ── HANGAR FLOOR — polished concrete with faint reflection ── */
function HangarFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#0a0c0f"
        roughness={0.35}
        metalness={0.15}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

/* ── HANGAR STRUCTURE — vague depth shapes ── */
function HangarStructure() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 20, -60]}>
        <boxGeometry args={[160, 40, 2]} />
        <meshStandardMaterial color="#080a0c" roughness={1} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-80, 20, 0]}>
        <boxGeometry args={[2, 40, 120]} />
        <meshStandardMaterial color="#070909" roughness={1} />
      </mesh>
      <mesh position={[80, 20, 0]}>
        <boxGeometry args={[2, 40, 120]} />
        <meshStandardMaterial color="#070909" roughness={1} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 30, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[160, 120]} />
        <meshStandardMaterial color="#060809" roughness={1} />
      </mesh>
      {/* Ceiling beam strips — for structure detail */}
      {[-30, 0, 30].map((z, i) => (
        <mesh key={i} position={[0, 29, z]}>
          <boxGeometry args={[160, 0.6, 0.8]} />
          <meshStandardMaterial color="#0a0d10" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ── GROUND SERVICE EQUIPMENT — parked shapes for scale ── */
function GroundEquipment() {
  return (
    <group>
      {/* GPU cart — left */}
      <mesh position={[-18, 0.8, 5]}>
        <boxGeometry args={[3.5, 1.6, 2.2]} />
        <meshStandardMaterial color="#0c1018" roughness={0.9} />
      </mesh>
      {/* Jetway stub — right */}
      <mesh position={[20, 2.5, -8]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[2, 5, 12]} />
        <meshStandardMaterial color="#0b0e12" roughness={0.9} />
      </mesh>
      {/* Tool cart */}
      <mesh position={[-25, 0.6, -8]}>
        <boxGeometry args={[2, 1.2, 1.4]} />
        <meshStandardMaterial color="#0d1015" roughness={0.9} />
      </mesh>
    </group>
  )
}

/* ── ATMOSPHERIC PARTICLES (dust/haze in hangar) ── */
function HangarDust() {
  const ref = useRef()
  const count = 800

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 80
      arr[i * 3 + 1] = Math.random() * 28
      arr[i * 3 + 2] = (Math.random() - 0.5) * 100
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
      ref.current.rotation.y = s.clock.elapsedTime * 0.004
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.12) * 0.3
    }
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#3a4560" size={0.08} sizeAttenuation transparent opacity={0.45} />
    </points>
  )
}

/* ── DRAMATIC LIGHTING ── */
function RevealLighting() {
  return (
    <>
      {/* Dark ambient — hangar night feel */}
      <ambientLight intensity={0.04} color="#050810" />

      {/* KEY LIGHT — strong from upper left, cool industrial */}
      <spotLight
        position={[-35, 28, -10]}
        target-position={[0, 3, 0]}
        intensity={120}
        color="#b8d0f8"
        angle={0.45}
        penumbra={0.6}
        castShadow={false}
      />

      {/* RIM LIGHT — behind aircraft, blue-white edge definition */}
      <spotLight
        position={[0, 18, 42]}
        target-position={[0, 3, 0]}
        intensity={80}
        color="#6090d8"
        angle={0.55}
        penumbra={0.7}
      />

      {/* FILL LIGHT — soft warm from right */}
      <spotLight
        position={[40, 12, -5]}
        target-position={[0, 3, 0]}
        intensity={30}
        color="#f0d8a0"
        angle={0.6}
        penumbra={0.8}
      />

      {/* UNDER LIGHT — bounce from floor */}
      <pointLight position={[0, 0, 0]} intensity={4} color="#1a2840" distance={50} decay={2} />

      {/* Engine glow contributions handled in aircraft itself */}
    </>
  )
}

export default function Act05_Aircraft({ progress = 0 }) {
  return (
    <group>
      <RevealLighting />
      <HangarFloor />
      <HangarStructure />
      <GroundEquipment />
      <HangarDust />
      <Aircraft />
    </group>
  )
}
