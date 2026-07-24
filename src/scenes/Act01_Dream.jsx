import { useRef, useMemo } from 'react'
import { seededUnit } from '@/utils/seeded-random'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[480, 32, 16]} />
      <meshBasicMaterial color="#010812" side={THREE.BackSide} fog={false} />
    </mesh>
  )
}

function Starfield() {
  const ref = useRef()
  const count = 2800

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
      const theta = seededUnit(i * 100 + 0) * Math.PI * 2
      const phi = seededUnit(i * 100 + 1) * Math.PI * 0.48
      const r = 200 + seededUnit(i * 100 + 2) * 250
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 3
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
          }
    return { positions }
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.0008
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#b8ccff"
        size={0.32}
        sizeAttenuation
        transparent
        opacity={0.92}
        fog={false}
      />
    </points>
  )
}

function Ground() {
  return (
    <group>
      {/* Asphalt runway surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -500]}>
        <planeGeometry args={[46, 1000]} />
        <meshStandardMaterial color="#141618" roughness={0.98} metalness={0.02} />
      </mesh>
      {/* Surrounding terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -200]}>
        <planeGeometry args={[1200, 800]} />
        <meshStandardMaterial color="#090b09" roughness={1} />
      </mesh>
    </group>
  )
}

function RunwayEdgeLights() {
  const count = 38
  const spacing = 25
  const halfW = 21

  const items = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      const z = -(i * spacing) - 8
      const fade = Math.max(0.25, 1 - i / count)
      arr.push({ z, x: -halfW, fade }, { z, x: halfW, fade })
    }
    return arr
  }, [])

  return (
    <group>
      {items.map((l, i) => (
        <mesh key={i} position={[l.x, 0.07, l.z]}>
          <sphereGeometry args={[0.16, 6, 6]} />
          <meshStandardMaterial
            emissive="#ffffff"
            emissiveIntensity={3.5 * l.fade}
            color="#eeeeee"
          />
        </mesh>
      ))}
    </group>
  )
}

function CenterlineLights() {
  const count = 32
  const spacing = 25

  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const z = -(i * spacing) - 8
        const fade = Math.max(0.2, 1 - i / count)
        return (
          <mesh key={i} position={[0, 0.06, z]}>
            <boxGeometry args={[0.12, 0.04, 1.4]} />
            <meshStandardMaterial
              emissive="#ffe090"
              emissiveIntensity={2.5 * fade}
              color="#ffecaa"
            />
          </mesh>
        )
      })}
    </group>
  )
}

function TaxiwayLights() {
  const xPositions = [-34, -44, 34, 44]
  const count = 18

  return (
    <group>
      {xPositions.flatMap((x, xi) =>
        Array.from({ length: count }, (_, i) => (
          <mesh key={`${xi}-${i}`} position={[x, 0.06, -(i * 30) - 10]}>
            <sphereGeometry args={[0.1, 5, 5]} />
            <meshStandardMaterial emissive="#3366ff" emissiveIntensity={3.5} color="#2255ee" />
          </mesh>
        ))
      )}
    </group>
  )
}

function ThresholdBar() {
  // White threshold lights across runway start
  return (
    <group position={[0, 0.08, -5]}>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[(i - 4.5) * 4, 0, 0]}>
          <boxGeometry args={[1.2, 0.06, 0.4]} />
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={4} color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

function ApproachLightBar() {
  // Simplified ALSF approach light structure in far distance
  const bars = [
    { z: -900, count: 5, color: '#ffffff', spacing: 8 },
    { z: -850, count: 5, color: '#ffffff', spacing: 8 },
    { z: -800, count: 3, color: '#ff3300', spacing: 6 },
    { z: -760, count: 3, color: '#ff3300', spacing: 6 },
  ]

  return (
    <group>
      {bars.map((bar, bi) =>
        Array.from({ length: bar.count }, (_, i) => (
          <mesh key={`${bi}-${i}`} position={[(i - (bar.count - 1) / 2) * bar.spacing, 0.08, bar.z]}>
            <sphereGeometry args={[0.22, 6, 6]} />
            <meshStandardMaterial emissive={bar.color} emissiveIntensity={5} color={bar.color} />
          </mesh>
        ))
      )}
    </group>
  )
}

function AirportInfrastructure() {
  return (
    <group>
      {/* Control tower — right side */}
      <group position={[130, 0, -180]}>
        <mesh position={[0, 13, 0]}>
          <cylinderGeometry args={[1.2, 2, 26, 10]} />
          <meshStandardMaterial color="#090c0e" roughness={1} />
        </mesh>
        {/* Cab */}
        <mesh position={[0, 27, 0]}>
          <cylinderGeometry args={[2.8, 1.2, 5, 10]} />
          <meshStandardMaterial color="#0c1015" roughness={0.9} />
        </mesh>
        {/* Window glow band */}
        <mesh position={[0, 27, 0]}>
          <cylinderGeometry args={[2.85, 2.85, 4, 10]} />
          <meshBasicMaterial color="#ffd060" transparent opacity={0.12} fog={false} />
        </mesh>
        {/* Rotating beacon */}
        <mesh position={[0, 30.5, 0]}>
          <sphereGeometry args={[0.28, 6, 6]} />
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={6} color="#ffffff" />
        </mesh>
      </group>

      {/* Terminal building — left */}
      <mesh position={[-200, 9, -260]}>
        <boxGeometry args={[90, 18, 45]} />
        <meshStandardMaterial color="#07090b" roughness={1} />
      </mesh>
      {/* Terminal window strip */}
      <mesh position={[-200, 7, -238]}>
        <boxGeometry args={[88, 6, 0.5]} />
        <meshBasicMaterial color="#ffcc55" transparent opacity={0.07} />
      </mesh>

      {/* Hangar — right */}
      <mesh position={[220, 9, -220]}>
        <boxGeometry args={[70, 18, 55]} />
        <meshStandardMaterial color="#060709" roughness={1} />
      </mesh>

      {/* Parked aircraft silhouette far right */}
      <group position={[90, 0, -150]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
          <cylinderGeometry args={[1.4, 1.2, 28, 10]} />
          <meshStandardMaterial color="#0a0c0e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[36, 0.4, 5]} />
          <meshStandardMaterial color="#090b0d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 7, 11]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.5, 7, 4]} />
          <meshStandardMaterial color="#090b0d" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function HorizonGlow() {
  return (
    <group>
      {/* Deep blue sky gradient near horizon */}
      <mesh position={[0, 25, -460]}>
        <planeGeometry args={[1400, 100]} />
        <meshBasicMaterial color="#0a1e3c" transparent opacity={0.55} depthWrite={false} fog={false} />
      </mesh>
      {/* City light glow on horizon (sodium vapor warmth) */}
      <mesh position={[0, 5, -400]}>
        <planeGeometry args={[800, 24]} />
        <meshBasicMaterial color="#ff8822" transparent opacity={0.06} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

function DepartingAircraft({ progress }) {
  const y = 12 + progress * 30
  const z = -320 - progress * 80
  const pitch = 0.18 + progress * 0.08

  return (
    <group position={[18, y, z]} rotation={[pitch, -0.08, 0]}>
      {/* Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 11, 8]} />
        <meshStandardMaterial color="#141820" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, -0.15, 0.5]}>
        <boxGeometry args={[16, 0.15, 2.5]} />
        <meshStandardMaterial color="#101418" roughness={0.8} />
      </mesh>
      {/* Engines */}
      {[-3.5, 3.5].map((x, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[x, -0.5, 0.5]}>
          <cylinderGeometry args={[0.35, 0.3, 2.2, 8]} />
          <meshStandardMaterial color="#101418" roughness={0.8} />
        </mesh>
      ))}
      {/* Tail fin */}
      <mesh position={[0, 1.2, 4.8]}>
        <boxGeometry args={[0.15, 2.5, 1.8]} />
        <meshStandardMaterial color="#101418" roughness={0.8} />
      </mesh>
      {/* Nav lights */}
      <mesh position={[8.2, -0.15, 0.5]}>
        <sphereGeometry args={[0.08, 5, 5]} />
        <meshStandardMaterial emissive="#00ff55" emissiveIntensity={10} color="#00ff55" />
      </mesh>
      <mesh position={[-8.2, -0.15, 0.5]}>
        <sphereGeometry args={[0.08, 5, 5]} />
        <meshStandardMaterial emissive="#ff2200" emissiveIntensity={10} color="#ff2200" />
      </mesh>
      {/* Anti-collision strobe */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.1, 5, 5]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={8} color="#ffffff" />
      </mesh>
    </group>
  )
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.06} color="#0a1428" />
      <hemisphereLight skyColor="#0d2040" groundColor="#04080c" intensity={0.25} />
      {/* Moonlight — cold, high, directional */}
      <directionalLight position={[80, 200, -60]} intensity={0.18} color="#8ab0e8" />
      {/* Runway sodium lamps — warm pools */}
      <pointLight position={[0, 4, -30]} intensity={3} color="#ff9922" distance={90} decay={2} />
      <pointLight position={[0, 4, -120]} intensity={2.5} color="#ffaa33" distance={130} decay={2} />
      <pointLight position={[0, 4, -240]} intensity={2} color="#ffaa44" distance={160} decay={2} />
      {/* Tower */}
      <pointLight position={[130, 30, -180]} intensity={4} color="#ffd060" distance={80} decay={2} />
    </>
  )
}

export default function Act01_Dream({ progress = 0 }) {
  return (
    <group>
      <SkyDome />
      <SceneLighting />
      <Starfield />
      <HorizonGlow />
      <Ground />
      <RunwayEdgeLights />
      <CenterlineLights />
      <TaxiwayLights />
      <ThresholdBar />
      <ApproachLightBar />
      <AirportInfrastructure />
      <DepartingAircraft progress={progress} />
    </group>
  )
}
