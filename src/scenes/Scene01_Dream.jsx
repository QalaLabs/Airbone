import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Sunrise Sky ShaderMaterial ─────────────────────────────────────────────
function SunriseSky() {
  const matRef = useRef()

  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uSunPos: { value: new THREE.Vector3(0.08, 0.06, -1).normalize() },
    },
    vertexShader: /* glsl */`
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uSunPos;
      uniform float uTime;
      varying vec3 vWorldPos;

      void main() {
        vec3 dir = normalize(vWorldPos);
        float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

        // Sky gradient: deep navy → dawn orange → warm yellow near horizon
        vec3 zenith   = vec3(0.04, 0.06, 0.18);   // deep navy
        vec3 midSky   = vec3(0.30, 0.15, 0.35);   // purple-pink
        vec3 horizon  = vec3(0.95, 0.40, 0.10);   // dawn orange
        vec3 nearSun  = vec3(1.00, 0.80, 0.30);   // warm yellow

        vec3 skyColor = mix(horizon,  zenith,  smoothstep(0.0, 0.6, t));
        skyColor      = mix(skyColor, midSky,  smoothstep(0.05, 0.35, t));

        // Near-horizon warmth
        float horizonGlow = smoothstep(0.18, 0.0, abs(dir.y));
        skyColor = mix(skyColor, nearSun, horizonGlow * 0.7);

        // Sun disk
        float sunAngle   = dot(dir, uSunPos);
        float sunDisk    = smoothstep(0.9992, 0.9998, sunAngle);
        float corona     = smoothstep(0.97, 0.9992, sunAngle) * 0.35;
        float coronaFar  = smoothstep(0.80, 0.97,  sunAngle) * 0.12;

        vec3 sunColor    = vec3(1.0, 0.95, 0.70);
        skyColor = mix(skyColor, vec3(1.0, 0.75, 0.25), coronaFar);
        skyColor = mix(skyColor, sunColor, corona);
        skyColor = mix(skyColor, vec3(1.0, 1.0, 0.9), sunDisk);

        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  }), [])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh>
      <sphereGeometry args={[1800, 64, 32]} />
      <shaderMaterial ref={matRef} attach="material" args={[shader]} depthWrite={false} />
    </mesh>
  )
}

// ─── Runway Surface + Markings ───────────────────────────────────────────────
function Runway() {
  const RUNWAY_W  = 60
  const RUNWAY_L  = 2000
  const DASH_COUNT = 100
  const DASH_H    = 8
  const DASH_W    = 1.2
  const DASH_GAP  = 15

  // Center dashes
  const centerDashes = useMemo(() => {
    const items = []
    for (let i = 0; i < DASH_COUNT; i++) {
      const z = -RUNWAY_L / 2 + i * DASH_GAP + DASH_GAP / 2
      items.push(z)
    }
    return items
  }, [])

  // Edge lights positions
  const edgeLightPositions = useMemo(() => {
    const lights = []
    for (let i = 0; i < 80; i++) {
      const z = -RUNWAY_L / 2 + i * (RUNWAY_L / 79)
      lights.push([-29, 0.15, z])
      lights.push([ 29, 0.15, z])
    }
    return lights
  }, [])

  // Threshold bars at Z=950 (8 bars)
  const thresholdBars = useMemo(() => {
    const bars = []
    const startX = -24
    const barW   = 3.5
    const gap    = 3
    for (let i = 0; i < 8; i++) {
      bars.push(startX + i * (barW + gap))
    }
    return bars
  }, [])

  // Edge light instanced mesh
  const edgeRef = useRef()
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!edgeRef.current) return
    edgeLightPositions.forEach(([x, y, z], idx) => {
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      edgeRef.current.setMatrixAt(idx, dummy.matrix)
    })
    edgeRef.current.instanceMatrix.needsUpdate = true
  }, [edgeLightPositions, dummy])

  // Approach red lights at threshold
  const approachLights = [-24, -12, 0, 12, 24]

  return (
    <group>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[RUNWAY_W, RUNWAY_L]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Center dashes */}
      {centerDashes.map((z, i) => (
        <mesh key={i} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[DASH_W, DASH_H]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}

      {/* Left edge line */}
      <mesh position={[-28, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, RUNWAY_L]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Right edge line */}
      <mesh position={[28, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, RUNWAY_L]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Threshold bars */}
      {thresholdBars.map((x, i) => (
        <mesh key={i} position={[x, 0.01, 950]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.5, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}

      {/* Edge lights instanced */}
      <instancedMesh ref={edgeRef} args={[null, null, edgeLightPositions.length]}>
        <boxGeometry args={[0.25, 0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffe8b0" emissiveIntensity={2.5} />
      </instancedMesh>

      {/* Approach red lights */}
      {approachLights.map((x, i) => (
        <group key={i} position={[x, 0.2, 960]}>
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} />
          </mesh>
          <pointLight color="#ff2200" intensity={1.2} distance={12} />
        </group>
      ))}
    </group>
  )
}

// ─── Cloud Layer ─────────────────────────────────────────────────────────────
function CloudLayer({ y = 80, count = 20, seed = 0 }) {
  const clouds = useMemo(() => {
    const rng = (n) => Math.abs(Math.sin(n * 127.1 + seed * 311.7) * 43758.5453) % 1
    return Array.from({ length: count }, (_, i) => ({
      x:    (rng(i * 3 + 0) - 0.5) * 800,
      z:    (rng(i * 3 + 1) - 0.5) * 800,
      scaleX: 60 + rng(i * 3 + 2) * 80,
      scaleZ: 18 + rng(i * 3 + 3) * 22,
      rot:  rng(i) * Math.PI,
    }))
  }, [count, seed])

  return (
    <group position={[0, y, 0]}>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, 0, c.z]}
          rotation={[0, c.rot, 0]}
        >
          <boxGeometry args={[c.scaleX, 6, c.scaleZ]} />
          <meshStandardMaterial
            color="#e8eef5"
            transparent
            opacity={0.55}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Distant Aircraft ────────────────────────────────────────────────────────
function DistantAircraft() {
  const groupRef  = useRef()
  const redRef    = useRef()
  const greenRef  = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    // gentle drift
    groupRef.current.position.x = -30 + Math.sin(t * 0.18) * 4
    groupRef.current.position.y = 80  + Math.sin(t * 0.11) * 2

    // nav light blink
    const blink = Math.floor(t * 2) % 2 === 0
    if (redRef.current)   redRef.current.intensity   = blink ? 2.5 : 0
    if (greenRef.current) greenRef.current.intensity = blink ? 2.5 : 0
  })

  return (
    <group ref={groupRef} position={[-30, 80, -800]}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.0, 8, 8, 12]} />
        <meshStandardMaterial color="#d8dce4" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Left wing */}
      <mesh position={[-5, 0, 0.5]}>
        <boxGeometry args={[8, 0.18, 2.8]} />
        <meshStandardMaterial color="#d8dce4" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Right wing */}
      <mesh position={[5, 0, 0.5]}>
        <boxGeometry args={[8, 0.18, 2.8]} />
        <meshStandardMaterial color="#d8dce4" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 1.2, -3.8]}>
        <boxGeometry args={[0.18, 2.2, 1.4]} />
        <meshStandardMaterial color="#d8dce4" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Nav lights */}
      <pointLight ref={redRef}   position={[-9, 0, 0]} color="#ff0020" intensity={2.5} distance={18} />
      <pointLight ref={greenRef} position={[ 9, 0, 0]} color="#00ff40" intensity={2.5} distance={18} />
    </group>
  )
}

// ─── Main Scene ──────────────────────────────────────────────────────────────
export default function Scene01_Dream({ progress = 0 }) {
  return (
    <group>
      {/* Sky */}
      <SunriseSky />

      {/* Lighting */}
      <directionalLight
        position={[50, 20, -200]}
        color="#FFD070"
        intensity={3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight color="#203050" intensity={0.4} />
      <hemisphereLight
        skyColor="#FF9050"
        groundColor="#101820"
        intensity={0.8}
      />

      {/* Runway */}
      <Runway />

      {/* Cloud layers */}
      <CloudLayer y={80}  count={22} seed={1} />
      <CloudLayer y={120} count={17} seed={2} />
      <CloudLayer y={160} count={14} seed={3} />

      {/* Distant aircraft */}
      <DistantAircraft />
    </group>
  )
}
