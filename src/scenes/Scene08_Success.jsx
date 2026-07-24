import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

// ─── Reused above-clouds sky (same golden-hour look as Scene07) ───────────────
function SuccessSky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vPosition;

          void main() {
            vec3 dir = normalize(vPosition);
            float t   = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

            vec3 horizon = vec3(1.0, 0.502, 0.188);   // #FF8030
            vec3 zenith  = vec3(0.039, 0.125, 0.314); // #0a2050
            vec3 pink    = vec3(0.95, 0.35, 0.15);

            vec3 sky = mix(horizon, zenith, pow(t, 0.55));
            sky = mix(sky, pink, smoothstep(0.35, 0.12, t) * 0.35);

            // Sun disk
            vec3 sunDir  = normalize(vec3(0.28, 0.08, -0.96));
            float sd     = distance(dir, sunDir);
            sky += vec3(1.0, 0.95, 0.75) * smoothstep(0.06, 0.01, sd) * 4.5;
            sky += vec3(1.0, 0.70, 0.22) * smoothstep(0.55, 0.0,  sd) * 0.45;

            // horizon haze
            sky = mix(sky, horizon * 1.4, pow(1.0 - abs(dir.y), 10.0) * 0.3);

            gl_FragColor = vec4(sky, 1.0);
          }
        `,
        side: THREE.BackSide,
      }),
    []
  )

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh material={material}>
      <sphereGeometry args={[900, 32, 32]} />
    </mesh>
  )
}

// ─── Distant aircraft silhouette ──────────────────────────────────────────────
function DistantSilhouette() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    // gentle lazy drift
    ref.current.position.x = Math.sin(t * 0.07) * 12
    ref.current.position.y = -8 + Math.sin(t * 0.11) * 3
  })

  return (
    <group ref={ref} position={[0, -8, -320]} scale={[2.2, 2.2, 2.2]}>
      {/* Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.35, 5, 8, 16]} />
        <meshStandardMaterial color="#B8BBC4" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Wings */}
      <mesh position={[-4.5, 0, -0.6]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[8.5, 0.22, 2.2]} />
        <meshStandardMaterial color="#B0B3BC" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[4.5, 0, -0.6]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[8.5, 0.22, 2.2]} />
        <meshStandardMaterial color="#B0B3BC" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 0.9, -2.8]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 1.8, 1.4]} />
        <meshStandardMaterial color="#B0B3BC" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Nav lights — subtle at distance */}
      <pointLight position={[-4.6, 0, 0]} intensity={2} color="#FF2020" distance={14} />
      <pointLight position={[4.6, 0, 0]}  intensity={2} color="#00EE00" distance={14} />
      <pointLight position={[0, 0.2, -3.2]} intensity={1} color="#FFFFFF"  distance={10} />
    </group>
  )
}

// ─── Wispy edge cloud streaks ─────────────────────────────────────────────────
function EdgeWisps() {
  const wisps = useMemo(() => {
    const rng = (s) => {
      const x = Math.sin(s * 7321 + 13) * 57823
      return x - Math.floor(x)
    }
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      // cluster at left/right edges and near-bottom
      x: (rng(i) > 0.5 ? 1 : -1) * (40 + rng(i * 3) * 60),
      y: -5 + rng(i * 7) * 12,
      z: -20 - rng(i * 11) * 80,
      sx: 25 + rng(i * 5) * 40,
      sy: 1.5 + rng(i * 9) * 3,
      sz: 8 + rng(i * 13) * 15,
      opacity: 0.15 + rng(i * 17) * 0.2,
    }))
  }, [])

  return (
    <group>
      {wisps.map((w) => (
        <mesh
          key={w.id}
          position={[w.x, w.y, w.z]}
          scale={[w.sx, w.sy, w.sz]}
        >
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={w.opacity}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Compact wing reference (bottom-left, same metallic style) ────────────────
function WingReference() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.003
    ref.current.position.y = -4.5 + Math.sin(t * 0.4) * 0.04
  })

  return (
    <group ref={ref} position={[-10, -4.5, 4]}>
      {/* Wing slab */}
      <mesh>
        <boxGeometry args={[13, 0.3, 3.5]} />
        <meshStandardMaterial color="#D8DBE0" metalness={0.82} roughness={0.18} />
      </mesh>
      {/* Winglet */}
      <mesh position={[-6.8, 0.5, -0.25]} rotation={[0, -0.15, 0.48]}>
        <boxGeometry args={[0.25, 1.4, 1.1]} />
        <meshStandardMaterial color="#CDD0D5" metalness={0.8} roughness={0.22} />
      </mesh>
      {/* Nav light */}
      <mesh position={[-6.7, 0.18, 0]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color="#FF1818" emissive="#FF1818" emissiveIntensity={4} />
      </mesh>
    </group>
  )
}

// ─── Slowly rotating camera rig ───────────────────────────────────────────────
function SlowCameraRotation() {
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Very gentle yaw + slight pitch — feels like the plane is in gentle cruise
    camera.rotation.y = Math.sin(t * 0.002) * 0.012
    camera.rotation.x = Math.sin(t * 0.0015) * 0.006 - 0.03
  })

  return null
}

// ─── Scene08_Success ──────────────────────────────────────────────────────────
export default function Scene08_Success() {
  return (
    <>
      {/* Subtle camera idle drift */}
      <SlowCameraRotation />

      {/* Sky */}
      <SuccessSky />

      {/* Distant aircraft silhouette */}
      <DistantSilhouette />

      {/* Subtle cloud wisps at scene edges */}
      <EdgeWisps />

      {/* Wing reference bottom left */}
      <WingReference />

      {/* ── Lighting ── */}
      {/* Golden directional sun */}
      <directionalLight
        position={[200, 60, -400]}
        intensity={5}
        color="#FFE060"
        castShadow={false}
      />

      {/* Warm ambient bounce */}
      <ambientLight intensity={0.45} color="#FFD070" />

      {/* Sky hemisphere */}
      <hemisphereLight
        skyColor="#FFE8A0"
        groundColor="#2a1808"
        intensity={0.6}
      />
    </>
  )
}
