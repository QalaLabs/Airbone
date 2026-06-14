/**
 * Act01_Dream — Runway at dawn
 * The opening act. Camera at runway level, looking toward the horizon.
 * Vast. Hopeful. The student standing at the edge of everything.
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/* ── Sky shader ── */
const SKY_VERT = `
  varying vec3 vWorldPos;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const SKY_FRAG = `
  uniform float uProgress;
  varying vec3 vWorldPos;

  void main() {
    float y = normalize(vWorldPos).y;

    // Colors
    vec3 zenith   = vec3(0.0, 0.05, 0.16);
    vec3 midNight = vec3(0.02, 0.10, 0.28);
    vec3 horizon  = vec3(1.0, 0.42, 0.21);
    vec3 sunGlow  = vec3(1.0, 0.82, 0.48);

    // Mix based on elevation
    float h = clamp(y, -1.0, 1.0);
    vec3 sky;
    if (h > 0.0) {
      sky = mix(horizon, zenith, pow(h, 0.5));
    } else {
      sky = mix(sunGlow, horizon, pow(-h * 2.0, 0.6));
    }

    // Progress brightens the scene (dawn progresses)
    sky *= 0.4 + uProgress * 0.6;

    gl_FragColor = vec4(sky, 1.0);
  }
`

function SkyDome({ progress }) {
  const matRef = useRef()
  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.uProgress.value = progress
  })
  const uniforms = useMemo(() => ({ uProgress: { value: progress } }), [])
  return (
    <mesh>
      <sphereGeometry args={[800, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ── Dream panel ── */
function DreamPanel() {
  const tex = useTexture('/photos/act1_dream_hero.png')
  return (
    <group position={[0, 2.4, -2]}>
      {/* High-quality dream illustration panel */}
      <mesh castShadow>
        <planeGeometry args={[7, 3.82]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Outer gold border frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[7.15, 3.97]} />
        <meshBasicMaterial color="#D8A027" />
      </mesh>
    </group>
  )
}

/* ── Clouds (billboard planes) ── */
function Clouds() {
  const cloudData = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    x: (Math.random() - 0.5) * 800,
    y: 80 + Math.random() * 80,
    z: -100 - Math.random() * 700,
    sx: 80 + Math.random() * 100,
    sy: 20 + Math.random() * 30,
    opacity: 0.35 + Math.random() * 0.35,
  })), [])

  return (
    <group>
      {cloudData.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <planeGeometry args={[c.sx, c.sy]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent opacity={c.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Main Scene ── */
export default function Act01_Dream({ progress = 0 }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      // Slow forward drift as progress increases
      groupRef.current.position.z = -progress * 18
    }
  })

  return (
    <group ref={groupRef}>
      <SkyDome progress={progress} />
      {/* Asphalt reflection ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -500]}>
        <planeGeometry args={[120, 2000]} />
        <meshStandardMaterial color="#04060b" roughness={0.3} metalness={0.7} />
      </mesh>
      <DreamPanel />
      <Clouds />

      {/* Fog */}
      <fog attach="fog" args={['#0d1a2e', 200, 1400]} />

      {/* Sun warmth glow */}
      <pointLight position={[0, 10, -600]} color="#FF9060" intensity={180} distance={800} />

      {/* Key light — dawn directional */}
      <directionalLight
        position={[80, 60, -400]}
        color="#FF9060"
        intensity={3}
        castShadow
      />

      {/* Ambient — dark pre-dawn */}
      <ambientLight color="#0a1628" intensity={0.6} />

      {/* Hemisphere — sky/ground */}
      <hemisphereLight skyColor="#1a3060" groundColor="#050810" intensity={0.8} />
    </group>
  )
}
