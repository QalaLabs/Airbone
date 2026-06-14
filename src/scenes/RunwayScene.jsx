import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// Procedural runway geometry
function Runway() {
  return (
    <group>
      {/* Main runway surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 800]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Center line markings */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh key={i} position={[0, 0.01, -i * 12 + 360]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      ))}
      
      {/* Edge lines left */}
      <mesh position={[-4.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 800]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Edge lines right */}
      <mesh position={[4.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 800]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Threshold markings */}
      {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 0.01, 380]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      ))}
      
      {/* Surrounding tarmac */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[300, 800]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>
      
      {/* Grass areas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[80, -0.02, 0]}>
        <planeGeometry args={[120, 800]} />
        <meshStandardMaterial color="#1a2e14" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-80, -0.02, 0]}>
        <planeGeometry args={[120, 800]} />
        <meshStandardMaterial color="#1a2e14" roughness={1} />
      </mesh>
    </group>
  )
}

// Runway edge lights
function RunwayLights() {
  const lights = useMemo(() => {
    const arr = []
    for (let i = 0; i < 40; i++) {
      arr.push({ pos: [4.8, 0.1, -i * 18 + 350], side: 'right' })
      arr.push({ pos: [-4.8, 0.1, -i * 18 + 350], side: 'left' })
    }
    return arr
  }, [])
  
  return (
    <group>
      {lights.map((l, i) => (
        <mesh key={i} position={l.pos}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial
            color={l.side === 'right' ? '#FFFFFF' : '#FFFFFF'}
            emissive={l.side === 'right' ? '#FFFFFF' : '#4444FF'}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
      {/* Threshold lights - red */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={`t${i}`} position={[x, 0.1, 395]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={4} />
        </mesh>
      ))}
    </group>
  )
}

// Atmospheric fog plane
function AtmosphericGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -200]}>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial
        color="#0a1520"
        roughness={1}
        fog={true}
      />
    </mesh>
  )
}

// Distant aircraft silhouette approaching
function DistantAircraft({ progress = 0 }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.position.x = Math.sin(t * 0.3) * 30
      ref.current.position.y = 80 + Math.sin(t * 0.5) * 5
    }
  })
  
  return (
    <group ref={ref} position={[20, 80, -600]} scale={[3, 3, 3]}>
      {/* Fuselage */}
      <mesh>
        <capsuleGeometry args={[0.3, 4, 8, 16]} />
        <meshStandardMaterial color="#C8C8D0" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Wings */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.1, 4, 4, 8]} />
        <meshStandardMaterial color="#C8C8D0" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Tail */}
      <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0.4, -1.8]}>
        <capsuleGeometry args={[0.05, 1.2, 4, 8]} />
        <meshStandardMaterial color="#C8C8D0" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Nav lights */}
      <pointLight color="#FF0000" intensity={5} distance={10} position={[-2.2, 0, 0]} />
      <pointLight color="#00FF00" intensity={5} distance={10} position={[2.2, 0, 0]} />
      <pointLight color="#FFFFFF" intensity={3} distance={8} position={[0, 0, -2.5]} />
    </group>
  )
}

// Sunrise sky dome
function SunriseSky() {
  const meshRef = useRef()
  
  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunPosition: { value: new THREE.Vector3(0, 0.15, -1) },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunPosition;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vec3 dir = normalize(vPosition);
          float sunHeight = uSunPosition.y;
          
          // Sky gradient
          vec3 horizonColor = mix(
            vec3(0.9, 0.4, 0.1),   // dawn orange
            vec3(0.85, 0.6, 0.2),  // warm gold
            clamp(sunHeight * 5.0, 0.0, 1.0)
          );
          vec3 zenithColor = mix(
            vec3(0.05, 0.08, 0.18), // deep navy
            vec3(0.1, 0.25, 0.55),  // blue sky
            clamp(sunHeight * 3.0, 0.0, 1.0)
          );
          
          float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 skyColor = mix(horizonColor, zenithColor, pow(t, 0.6));
          
          // Sun disk
          float sunDist = distance(normalize(dir), normalize(uSunPosition));
          float sunDisk = smoothstep(0.06, 0.02, sunDist);
          float sunGlow = smoothstep(0.4, 0.0, sunDist) * 0.4;
          
          vec3 sunColor = vec3(1.0, 0.92, 0.7);
          skyColor += sunColor * sunDisk * 3.0;
          skyColor += vec3(1.0, 0.6, 0.2) * sunGlow;
          
          // Atmosphere scatter near horizon
          float horizon = 1.0 - abs(dir.y);
          skyColor = mix(skyColor, horizonColor * 1.3, pow(horizon, 8.0) * 0.5);
          
          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide,
    })
  }, [])
  
  useFrame((state) => {
    skyMaterial.uniforms.uTime.value = state.clock.elapsedTime
  })
  
  return (
    <mesh ref={meshRef} material={skyMaterial} scale={[1, 1, 1]}>
      <sphereGeometry args={[800, 32, 32]} />
    </mesh>
  )
}

// Cloud layer
function CloudLayer({ y = 60, count = 15, scale = 1, opacity = 0.9 }) {
  const clouds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      z: (Math.random() - 0.5) * 600 - 200,
      scaleX: (1 + Math.random() * 3) * scale,
      scaleY: (0.4 + Math.random() * 0.6) * scale,
      scaleZ: (1 + Math.random() * 2) * scale,
      rot: Math.random() * Math.PI * 2,
    }))
  }, [count, scale])
  
  return (
    <group position={[0, y, 0]}>
      {clouds.map((c) => (
        <mesh key={c.id} position={[c.x, 0, c.z]} rotation={[0, c.rot, 0]}>
          <sphereGeometry args={[8, 8, 6]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={opacity * 0.7}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

export { Runway, RunwayLights, AtmosphericGround, DistantAircraft, SunriseSky, CloudLayer }
