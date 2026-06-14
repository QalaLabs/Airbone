import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// ─── Sky dome: transitions from cloud-grey interior → golden sunrise ───────────
function AboveCloudsSkyDome({ progress = 0 }) {
  const matRef = useRef()

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uProgress;
          uniform float uTime;
          varying vec3 vPosition;

          void main() {
            vec3 dir = normalize(vPosition);
            float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

            // === BELOW-CLOUDS state (progress < 0.5) ===
            // Dark grey cloud interior
            vec3 cloudGrey    = vec3(0.25, 0.25, 0.25);   // #404040
            vec3 cloudMidGrey = vec3(0.18, 0.18, 0.20);

            vec3 insideSky = mix(cloudMidGrey, cloudGrey, t);

            // === ABOVE-CLOUDS state (progress > 0.5) ===
            // Horizon: warm orange-gold #FF8030, zenith: deep navy #0a2050
            vec3 sunriseHorizon = vec3(1.0, 0.502, 0.188);
            vec3 sunriseZenith  = vec3(0.039, 0.125, 0.314);
            vec3 sunrisePink    = vec3(0.95, 0.35, 0.15);

            vec3 aboveSky = mix(sunriseHorizon, sunriseZenith, pow(t, 0.55));
            // extra pink band
            aboveSky = mix(aboveSky, sunrisePink, smoothstep(0.35, 0.15, t) * 0.4);

            // Sun disk — low angle, golden
            vec3 sunDir = normalize(vec3(0.28, 0.08, -0.96));
            float sunDist = distance(dir, sunDir);
            float sunDisk    = smoothstep(0.06, 0.01, sunDist);
            float sunCorona  = smoothstep(0.55, 0.0,  sunDist) * 0.5;
            float sunGlow    = smoothstep(0.9,  0.0,  sunDist) * 0.15;

            aboveSky += vec3(1.0, 0.95, 0.75) * sunDisk  * 5.0;
            aboveSky += vec3(1.0, 0.72, 0.22) * sunCorona;
            aboveSky += vec3(1.0, 0.55, 0.10) * sunGlow;

            // horizon haze
            float haze = 1.0 - abs(dir.y);
            aboveSky = mix(aboveSky, sunriseHorizon * 1.5, pow(haze, 10.0) * 0.35);

            // Blend inside→outside by progress
            float blend = smoothstep(0.35, 0.65, uProgress);
            vec3 skyColor = mix(insideSky, aboveSky, blend);

            gl_FragColor = vec4(skyColor, 1.0);
          }
        `,
        side: THREE.BackSide,
      }),
    []
  )

  useFrame((state) => {
    material.uniforms.uProgress.value = progress
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh material={material}>
      <sphereGeometry args={[900, 32, 32]} />
    </mesh>
  )
}

// ─── Cloud lower deck — 60 flat billboard slabs ───────────────────────────────
function CloudDeck({ progress = 0 }) {
  const groupRef = useRef()

  // Cloud slab instances — seeded deterministically
  const slabs = useMemo(() => {
    const rng = (seed) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280
      return x - Math.floor(x)
    }
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (rng(i * 3 + 0) - 0.5) * 800,
      y: rng(i * 3 + 1) * 15,       // 0–15
      z: (rng(i * 3 + 2) - 0.5) * 800,
      sx: 70 + rng(i * 7) * 70,     // wide
      sy: 3.5 + rng(i * 11) * 2.5,  // very flat
      sz: 50 + rng(i * 13) * 60,
      rot: rng(i * 5) * Math.PI * 2,
      opacity: 0.5 + rng(i * 17) * 0.35,
    }))
  }, [])

  // Cloud puff ellipsoids — 40 pieces
  const puffs = useMemo(() => {
    const rng = (seed) => {
      const x = Math.sin(seed * 8231 + 52811) * 233280
      return x - Math.floor(x)
    }
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (rng(i * 4 + 0) - 0.5) * 780,
      y: rng(i * 4 + 1) * 20,
      z: (rng(i * 4 + 2) - 0.5) * 780,
      sx: 12 + rng(i * 6) * 22,
      sy: 5 + rng(i * 9) * 10,
      sz: 14 + rng(i * 11) * 20,
      opacity: 0.55 + rng(i * 13) * 0.30,
    }))
  }, [])

  // Gentle drift
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.04) * 3
  })

  // Fade the entire deck out as we rise above it
  const deckOpacity = Math.max(0, 1 - (progress - 0.5) * 4)

  return (
    <group ref={groupRef}>
      {/* Flat slab deck */}
      {slabs.map((s) => (
        <mesh
          key={`slab-${s.id}`}
          position={[s.x, s.y, s.z]}
          rotation={[0, s.rot, 0]}
          scale={[s.sx, s.sy, s.sz]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={s.opacity * deckOpacity}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Puff clouds */}
      {puffs.map((p) => (
        <mesh
          key={`puff-${p.id}`}
          position={[p.x, p.y, p.z]}
          scale={[p.sx, p.sy, p.sz]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={p.opacity * deckOpacity * 0.75}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Wing (first-person reference — camera POV) ───────────────────────────────
function AircraftWing() {
  const wingGroup = useRef()

  // Subtle aerodynamic flex
  useFrame((state) => {
    if (!wingGroup.current) return
    const t = state.clock.elapsedTime
    wingGroup.current.rotation.z = Math.sin(t * 0.8) * 0.004 + Math.sin(t * 2.1) * 0.002
    wingGroup.current.position.y = -1 + Math.sin(t * 0.6) * 0.06
  })

  return (
    <group ref={wingGroup} position={[-9, -1, 5]}>
      {/* Main wing panel */}
      <mesh>
        <boxGeometry args={[14, 0.35, 4]} />
        <meshStandardMaterial
          color="#D8DBE0"
          metalness={0.82}
          roughness={0.18}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Winglet at tip (sweeps up) */}
      <mesh position={[-7.2, 0.55, -0.3]} rotation={[0, -0.18, 0.52]}>
        <boxGeometry args={[0.28, 1.6, 1.2]} />
        <meshStandardMaterial color="#D0D3D8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Engine nacelle body */}
      <group position={[-3, -1.1, 0.2]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.74, 3.8, 24]} />
          <meshStandardMaterial color="#787880" metalness={0.9} roughness={0.18} />
        </mesh>
        {/* Fan face ring */}
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.18, 24]} />
          <meshStandardMaterial color="#282828" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Exhaust rear ring */}
        <mesh position={[0, -1.95, 0]}>
          <cylinderGeometry args={[0.62, 0.55, 0.14, 20]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Engine pylon */}
        <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.55, 1.8, 0.6]} />
          <meshStandardMaterial color="#C8CBD0" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Warm exhaust glow */}
        <pointLight position={[0, -2.2, 0]} intensity={2.5} color="#FF9040" distance={6} />
      </group>

      {/* Wing skin panel seam lines */}
      {[-2, 0, 2].map((z, i) => (
        <mesh key={i} position={[0, 0.18, z]}>
          <boxGeometry args={[14, 0.015, 0.04]} />
          <meshStandardMaterial color="#B8BBC0" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Nav light — left wingtip red */}
      <mesh position={[-7.2, 0.2, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#FF2020" emissive="#FF2020" emissiveIntensity={4} />
      </mesh>
      <pointLight position={[-7.2, 0.2, 0]} intensity={1.5} color="#FF2020" distance={5} />
    </group>
  )
}

// ─── Engine contrails — two soft tubes ────────────────────────────────────────
function Contrails({ progress = 0 }) {
  const opacity = Math.max(0, progress - 0.3) * 1.4 // fade in above clouds

  return (
    <group>
      {/* Left engine contrail */}
      <mesh position={[-12, -2.1, -40]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 1.2, 80, 12, 1, true]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={opacity * 0.45}
          roughness={1}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Right engine contrail (mirrored — off-camera to the right for realism) */}
      <mesh position={[-6, -2.1, -40]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 1.0, 80, 12, 1, true]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={opacity * 0.4}
          roughness={1}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

// ─── Scene07_AboveClouds ──────────────────────────────────────────────────────
export default function Scene07_AboveClouds({ progress = 0 }) {
  return (
    <>
      {/* Sky dome — colour-shifts by progress */}
      <AboveCloudsSkyDome progress={progress} />

      {/* Cloud deck system */}
      <CloudDeck progress={progress} />

      {/* Wing — locked to camera POV, left edge */}
      <AircraftWing />

      {/* Contrails behind engines */}
      <Contrails progress={progress} />

      {/* ── Lighting ── */}
      {/* Main sun — low-angle golden directional */}
      <directionalLight
        position={[200, 60, -400]}
        intensity={6}
        color="#FFE060"
        castShadow={false}
      />

      {/* Warm ambient — golden hour bounce */}
      <ambientLight intensity={0.5} color="#FFD080" />

      {/* Subtle fill from above for cloud tops */}
      <hemisphereLight
        skyColor="#FFE8A0"
        groundColor="#302818"
        intensity={0.7}
      />

      {/* Volumetric light shaft inside cloud (progress < 0.5) */}
      {progress < 0.6 && (
        <pointLight
          position={[0, 30, -20]}
          intensity={(1 - progress * 2) * 2}
          color="#C0D0FF"
          distance={120}
        />
      )}
    </>
  )
}
