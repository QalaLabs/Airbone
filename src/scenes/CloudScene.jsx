import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// Volumetric cloud system for above-clouds scene
export function VolumetricClouds({ count = 40, spread = 800 }) {
  const groupRef = useRef()
  
  const clouds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * spread,
      y: (Math.random() - 0.5) * 60,
      z: (Math.random() - 0.5) * spread,
      sx: 20 + Math.random() * 60,
      sy: 8 + Math.random() * 20,
      sz: 20 + Math.random() * 50,
      opacity: 0.6 + Math.random() * 0.35,
      speed: 0.5 + Math.random() * 1.5,
    }))
  }, [count, spread])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const cloud = clouds[i]
        if (cloud) {
          child.position.x += 0.008 * cloud.speed
          if (child.position.x > spread / 2) {
            child.position.x = -spread / 2
          }
        }
      })
    }
  })
  
  return (
    <group ref={groupRef}>
      {clouds.map((c) => (
        <mesh key={c.id} position={[c.x, c.y, c.z]} scale={[c.sx, c.sy, c.sz]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={c.opacity * 0.5}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// Procedural Earth curvature seen from above
export function EarthSurface({ progress = 0 }) {
  const meshRef = useRef()
  
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(6400, 64, 32)
    return geo
  }, [])
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
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
        uniform float uProgress;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1,0)), f.x),
            mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
            f.y
          );
        }
        
        void main() {
          // Base ocean color
          vec3 oceanColor = vec3(0.03, 0.12, 0.25);
          vec3 landColor = vec3(0.08, 0.18, 0.08);
          vec3 coastColor = vec3(0.25, 0.22, 0.15);
          
          // Land/water noise
          float n = noise(vUv * 8.0) * 0.5 + noise(vUv * 16.0) * 0.25 + noise(vUv * 32.0) * 0.125;
          float isLand = step(0.55, n);
          
          vec3 surfaceColor = mix(oceanColor, landColor, isLand);
          surfaceColor = mix(surfaceColor, coastColor, smoothstep(0.52, 0.55, n) * 0.5);
          
          // City lights at night side
          float nightSide = smoothstep(0.3, 0.7, vUv.x);
          float cityLights = noise(vUv * 40.0) * noise(vUv * 20.0);
          cityLights = step(0.7, cityLights) * isLand;
          surfaceColor += vec3(1.0, 0.85, 0.5) * cityLights * nightSide * 0.8;
          
          // Cloud cover overlay
          float clouds = noise(vUv * 6.0 + uTime * 0.001);
          clouds = smoothstep(0.5, 0.7, clouds);
          surfaceColor = mix(surfaceColor, vec3(0.85, 0.88, 0.9), clouds * 0.6);
          
          // Atmosphere edge glow
          float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
          vec3 atmColor = vec3(0.3, 0.6, 1.0);
          surfaceColor = mix(surfaceColor, atmColor, pow(1.0 - edge, 5.0) * 0.3);
          
          gl_FragColor = vec4(surfaceColor, 1.0);
        }
      `,
    })
  }, [])
  
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uProgress.value = progress
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, -6500, 0]} />
  )
}

// Golden sunrise sky for above-clouds
export function AboveCloudsSky() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vPosition;
        
        void main() {
          vec3 dir = normalize(vPosition);
          
          // Golden hour sky
          vec3 zenith = vec3(0.05, 0.15, 0.4);
          vec3 horizon = vec3(0.85, 0.55, 0.1);
          vec3 sunsetPink = vec3(0.9, 0.35, 0.2);
          
          float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 skyColor = mix(horizon, zenith, pow(t, 0.5));
          
          // Sun position
          vec3 sunDir = normalize(vec3(0.3, 0.1, -0.95));
          float sunDist = distance(dir, sunDir);
          float sun = smoothstep(0.05, 0.01, sunDist);
          float corona = smoothstep(0.5, 0.0, sunDist) * 0.5;
          
          skyColor += vec3(1.0, 0.95, 0.8) * sun * 4.0;
          skyColor += vec3(1.0, 0.7, 0.2) * corona;
          
          // Subtle haze
          float haze = 1.0 - abs(dir.y);
          skyColor = mix(skyColor, horizon * 1.5, pow(haze, 12.0) * 0.4);
          
          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide,
    })
  }, [])
  
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })
  
  return (
    <mesh material={material}>
      <sphereGeometry args={[800, 32, 32]} />
    </mesh>
  )
}

// Aircraft seen from behind during takeoff
export function TakeoffAircraft({ speed = 0, liftoff = 0 }) {
  const ref = useRef()
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      // Vibration during takeoff roll
      if (speed > 0.3 && liftoff < 0.8) {
        ref.current.rotation.z = Math.sin(t * 20) * 0.003 * speed
        ref.current.rotation.x = Math.sin(t * 15) * 0.002 * speed
      }
      // Rotate nose up at rotation
      if (liftoff > 0.5) {
        ref.current.rotation.x = -liftoff * 0.15
      }
    }
  })
  
  return (
    <group ref={ref} position={[0, liftoff * 8, 0]}>
      {/* Fuselage */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[1.8, 18, 12, 24]} />
        <meshStandardMaterial color="#E8EBF0" metalness={0.85} roughness={0.15} />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-10, 0, -1]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[18, 0.3, 4.5]} />
        <meshStandardMaterial color="#D8DBDF" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[10, 0, -1]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[18, 0.3, 4.5]} />
        <meshStandardMaterial color="#D8DBDF" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Engines */}
      {[[-7, -1.2, -0.5], [7, -1.2, -0.5]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.75, 3.5, 20]} />
            <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Engine glow */}
          <pointLight
            position={[0, 0, 2]}
            intensity={speed * 10}
            color="#FF8820"
            distance={8}
          />
          {/* Exhaust cone */}
          <mesh position={[0, 0, -1.9]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.5, 0.8, 12]} />
            <meshStandardMaterial
              color="#FF6600"
              emissive="#FF4400"
              emissiveIntensity={speed * 3}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
      
      {/* Tail */}
      <mesh position={[0, 2.5, -9.5]}>
        <boxGeometry args={[0.35, 4, 3.5]} />
        <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-4, 0.5, -9]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[7, 0.3, 2.5]} />
        <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[4, 0.5, -9]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[7, 0.3, 2.5]} />
        <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Livery */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, -1]}>
        <torusGeometry args={[1.85, 0.15, 8, 40, Math.PI * 2]} />
        <meshStandardMaterial color="#DB241E" emissive="#DB241E" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Landing gear */}
      {liftoff < 0.7 && (
        <group>
          <mesh position={[-2, -1.8 + liftoff * 1.8, 2]} rotation={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.15, 0.15, 1.6, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[2, -1.8 + liftoff * 1.8, 2]} rotation={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.15, 0.15, 1.6, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -1.8 + liftoff * 1.8, -3]}>
            <cylinderGeometry args={[0.12, 0.12, 1.4, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}
