import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// Procedural aircraft exterior (for boarding scene)
export function AircraftExterior({ doorOpen = 0 }) {
  const doorRef = useRef()
  
  useFrame(() => {
    if (doorRef.current) {
      doorRef.current.rotation.y = -doorOpen * Math.PI / 2
    }
  })
  
  return (
    <group>
      {/* Main fuselage */}
      <mesh castShadow>
        <capsuleGeometry args={[2.8, 22, 16, 32]} />
        <meshStandardMaterial
          color="#E8EBF0"
          metalness={0.85}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Nose cone */}
      <mesh position={[0, 0, 13]} castShadow>
        <coneGeometry args={[2.8, 4, 32]} />
        <meshStandardMaterial color="#E8EBF0" metalness={0.85} roughness={0.15} />
      </mesh>
      
      {/* Main wings */}
      <group position={[0, -0.5, -2]}>
        {/* Left wing */}
        <mesh castShadow position={[-12, 0, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[20, 0.4, 6]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Right wing */}
        <mesh castShadow position={[12, 0, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[20, 0.4, 6]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Engines - left */}
        <mesh position={[-8, -1.5, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.0, 4, 24]} />
          <meshStandardMaterial color="#888890" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Engine fan */}
        <mesh position={[-8, -1.5, 2.1]}>
          <cylinderGeometry args={[1.15, 1.15, 0.2, 24]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Engines - right */}
        <mesh position={[8, -1.5, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.0, 4, 24]} />
          <meshStandardMaterial color="#888890" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[8, -1.5, 2.1]}>
          <cylinderGeometry args={[1.15, 1.15, 0.2, 24]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      {/* Tail section */}
      <group position={[0, 0, -11]}>
        {/* Vertical stabilizer */}
        <mesh position={[0, 3, 0]} castShadow>
          <boxGeometry args={[0.4, 5, 4]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Horizontal stabilizers */}
        <mesh position={[-5, 0.5, 0]} castShadow>
          <boxGeometry args={[8, 0.35, 3]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[5, 0.5, 0]} castShadow>
          <boxGeometry args={[8, 0.35, 3]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Windows strip */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[2.82, 0.8, -7 + i * 1.4]}>
          <boxGeometry args={[0.05, 0.55, 0.75]} />
          <meshStandardMaterial
            color="#87CEEB"
            emissive="#99AACC"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`r${i}`} position={[-2.82, 0.8, -7 + i * 1.4]}>
          <boxGeometry args={[0.05, 0.55, 0.75]} />
          <meshStandardMaterial
            color="#87CEEB"
            emissive="#99AACC"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Airborne Aviation livery stripe */}
      <mesh position={[2.85, 0, -2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.4, 24]} />
        <meshStandardMaterial color="#DB241E" emissive="#DB241E" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-2.85, 0, -2]}>
        <boxGeometry args={[0.04, 0.4, 24]} />
        <meshStandardMaterial color="#DB241E" emissive="#DB241E" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Door frame */}
      <mesh position={[2.85, 0.5, 5]}>
        <boxGeometry args={[0.05, 2.4, 1.2]} />
        <meshStandardMaterial color="#CCCCCC" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Aircraft door (opens outward) */}
      <group ref={doorRef} position={[2.85, 0.5, 5.6]}>
        <mesh>
          <boxGeometry args={[0.08, 2.2, 1.1]} />
          <meshStandardMaterial color="#E0E0E5" metalness={0.8} roughness={0.15} />
        </mesh>
      </group>
      
      {/* Landing gear (retracted position) */}
      <mesh position={[0, -2.8, 1]}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 12]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Interior cabin environment
export function AircraftInterior() {
  return (
    <group>
      {/* Cabin walls */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 30, 32, 1, true]} />
        <meshStandardMaterial
          color="#F5F0E8"
          roughness={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[5, 30]} />
        <meshStandardMaterial color="#8B7D6B" roughness={0.9} />
      </mesh>
      
      {/* Overhead bins - left */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-2.2, 1.2, -10 + i * 3]}>
          <boxGeometry args={[0.6, 0.9, 2.5]} />
          <meshStandardMaterial color="#E8E4DE" roughness={0.7} />
        </mesh>
      ))}
      
      {/* Overhead bins - right */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[2.2, 1.2, -10 + i * 3]}>
          <boxGeometry args={[0.6, 0.9, 2.5]} />
          <meshStandardMaterial color="#E8E4DE" roughness={0.7} />
        </mesh>
      ))}
      
      {/* Seats - left row */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[-1.2, -1.5, -12 + i * 3]}>
          <mesh>
            <boxGeometry args={[0.55, 0.8, 0.55]} />
            <meshStandardMaterial color="#00274C" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.65, -0.15]}>
            <boxGeometry args={[0.55, 0.9, 0.1]} />
            <meshStandardMaterial color="#00274C" roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* Seats - right row */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[1.2, -1.5, -12 + i * 3]}>
          <mesh>
            <boxGeometry args={[0.55, 0.8, 0.55]} />
            <meshStandardMaterial color="#00274C" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.65, -0.15]}>
            <boxGeometry args={[0.55, 0.9, 0.1]} />
            <meshStandardMaterial color="#00274C" roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* Cabin lighting strip */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.1, 0.05, 30]} />
        <meshStandardMaterial
          color="#FFFAF0"
          emissive="#FFFAF0"
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Overhead reading lights */}
      {Array.from({ length: 10 }).map((_, i) => (
        <pointLight key={i} position={[0, 2, -12 + i * 3]} intensity={0.5} color="#FFF8E8" distance={4} />
      ))}
      
      {/* Windows with light */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i}>
          <mesh position={[-2.65, 0.5, -12 + i * 3]}>
            <boxGeometry args={[0.05, 0.4, 0.55]} />
            <meshStandardMaterial
              color="#87CEEB"
              emissive="#B0D8F0"
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[2.65, 0.5, -12 + i * 3]}>
            <boxGeometry args={[0.05, 0.4, 0.55]} />
            <meshStandardMaterial
              color="#87CEEB"
              emissive="#B0D8F0"
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Cockpit interior 3D
export function CockpitInterior() {
  return (
    <group position={[0, 0, 0]}>
      {/* Cockpit hull */}
      <mesh>
        <cylinderGeometry args={[2.5, 2.5, 4, 20, 1, true, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.8} side={THREE.BackSide} />
      </mesh>
      
      {/* Main instrument panel */}
      <mesh position={[0, -0.3, 2.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[3.5, 1.8, 0.15]} />
        <meshStandardMaterial color="#111115" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* MFD screens - main display area */}
      {[
        [-1.1, -0.2, 2.15],
        [0, -0.2, 2.15],
        [1.1, -0.2, 2.15],
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.85, 0.7, 0.02]} />
          <meshStandardMaterial
            color="#001020"
            emissive={i === 0 ? '#002840' : i === 1 ? '#001830' : '#002820'}
            emissiveIntensity={2}
            roughness={0.1}
          />
        </mesh>
      ))}
      
      {/* Upper panel (overhead) */}
      <mesh position={[0, 1.5, 1.8]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[3, 0.8, 0.12]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Center pedestal */}
      <mesh position={[0, -1.2, 1.6]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.8, 1.4]} />
        <meshStandardMaterial color="#0d0d15" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Throttle levers */}
      {[-0.15, 0.15].map((x, i) => (
        <group key={i} position={[x, -0.6, 1.4]}>
          <mesh>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}
      
      {/* Captain seat */}
      <group position={[-0.9, -1.5, 0.5]}>
        <mesh>
          <boxGeometry args={[0.65, 0.1, 0.65]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, -0.3]}>
          <boxGeometry args={[0.65, 1.0, 0.1]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.7} />
        </mesh>
      </group>
      
      {/* First officer seat */}
      <group position={[0.9, -1.5, 0.5]}>
        <mesh>
          <boxGeometry args={[0.65, 0.1, 0.65]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.55, -0.3]}>
          <boxGeometry args={[0.65, 1.0, 0.1]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.7} />
        </mesh>
      </group>
      
      {/* Windshield frame */}
      <mesh position={[0, 0.8, 2.6]}>
        <boxGeometry args={[3, 0.15, 0.1]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.15, 2.6]}>
        <boxGeometry args={[3, 0.15, 0.1]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Instrument backlighting */}
      <pointLight position={[0, 0.2, 2.1]} intensity={3} color="#001840" distance={3} />
      <pointLight position={[-1.2, -0.2, 2.0]} intensity={2} color="#002850" distance={2} />
      <pointLight position={[1.2, -0.2, 2.0]} intensity={2} color="#002850" distance={2} />
      
      {/* Cockpit ambient */}
      <ambientLight intensity={0.3} color="#101530" />
      
      {/* Panel indicators / buttons (random glowing dots) */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            -1.6 + (i % 8) * 0.45,
            0.4 - Math.floor(i / 8) * 0.3,
            2.14,
          ]}
          rotation={[0.3, 0, 0]}
        >
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color={['#FF3A33', '#00CC44', '#FFAA00', '#4499FF', '#FFFFFF'][i % 5]}
            emissive={['#FF3A33', '#00CC44', '#FFAA00', '#4499FF', '#FFFFFF'][i % 5]}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  )
}
