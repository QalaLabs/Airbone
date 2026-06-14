import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Act06_Success — Above the Clouds, Golden Light
// Alumni flying. The graduate looks down at the world they now command.
// ---------------------------------------------------------------------------

/* ── fBm sky + cloud ShaderMaterial ─────────────────────────────────────── */
const skyVert = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`
const skyFrag = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  varying vec3 vWorldPos;

  // ── Hash + noise helpers for fBm clouds ──────────────────────────────
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p  = p * 2.1 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Normalised Y in sphere (−1 bottom, +1 top)
    float y = normalize(vWorldPos).y;

    // Gradient colours
    vec3 zenith   = vec3(0.0,  0.063, 0.188);  // #001030
    vec3 midSky   = vec3(0.063, 0.376, 0.753); // #1060C0
    vec3 horizon  = vec3(1.0,  0.910, 0.627);  // #FFE8A0

    // Two-step gradient: zenith→midSky, midSky→horizon
    vec3 skyColor;
    if (y > 0.0) {
      skyColor = mix(midSky, zenith, smoothstep(0.0, 1.0, y));
    } else {
      skyColor = mix(horizon, midSky, smoothstep(-0.15, 0.25, y));
    }

    // fBm cloud layer — confined to a thin altitude band
    float altBand = smoothstep(0.05, 0.25, y) * smoothstep(0.55, 0.35, y);
    vec2 cloudUV  = vec2(
      atan(vWorldPos.x, vWorldPos.z) / (2.0 * 3.14159) + uTime * 0.005,
      y * 3.5
    );
    float cloud = fbm(cloudUV * 4.0);
    cloud = smoothstep(0.48, 0.72, cloud);
    cloud *= altBand * 0.85;

    vec3 cloudColor = vec3(1.0, 0.97, 0.93);
    skyColor = mix(skyColor, cloudColor, cloud);

    // Sun bloom at low elevation
    float sunBloom = pow(max(0.0, 1.0 - smoothstep(0.0, 0.3, y)), 3.0) * 0.4;
    skyColor += vec3(1.0, 0.82, 0.4) * sunBloom;

    gl_FragColor = vec4(skyColor, 1.0);
  }
`

/* ── A single cloud puff (billboard plane) ───────────────────────────────── */
function CloudPuff({ position, size, opacity, speed, index }) {
  const ref = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.z += delta * speed
    // Wrap cloud when it passes the camera
    if (ref.current.position.z > 20) {
      ref.current.position.z -= 230
    }
    // Billboard — always face camera on Y axis
    ref.current.rotation.y = 0
  })

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color="#f0f4ff"
        transparent
        opacity={opacity}
        depthWrite={false}
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ── Cloud layer data ────────────────────────────────────────────────────── */
function useCloudData(count = 24) {
  return useMemo(() => {
    const rng = (min, max) => min + Math.random() * (max - min)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        rng(-60, 60),              // X — wide spread
        rng(-2, 2),                // Y — thin altitude band
        rng(-200, -20),            // Z — distant to near
      ],
      size:    [rng(8, 15), rng(3, 5)],
      opacity: rng(0.6, 0.9),
      speed:   rng(0.8, 2.0),     // base forward drift speed
    }))
  }, [count])
}

/* ── Main scene ─────────────────────────────────────────────────────────── */
export default function Act06_Success({ progress = 0 }) {
  const skyRef      = useRef()
  const skyMatRef   = useRef()
  const groupRef    = useRef()
  const clouds      = useCloudData(24)

  const skyUniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uProgress: { value: 0 },
  }), [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()

    // Update sky uniforms
    if (skyMatRef.current) {
      skyMatRef.current.uniforms.uTime.value     = t
      skyMatRef.current.uniforms.uProgress.value = progress
    }

    // Slowly tilt the whole world group as altitude increases
    if (groupRef.current) {
      groupRef.current.rotation.x = -progress * 0.12
    }
  })

  return (
    <group ref={groupRef}>
      {/* ── Lighting ─────────────────────────────────────────────────── */}
      {/* Sky-tinted ambient */}
      <ambientLight color="#1040A0" intensity={0.4} />

      {/* Main sun directional light */}
      <directionalLight
        position={[80, 40, -300]}
        color="#FFE8A0"
        intensity={2.5}
        castShadow={false}
      />

      {/* Sun point light — drives lens flare feel */}
      <pointLight
        position={[80, 40, -300]}
        color="#FFD070"
        intensity={200}
        distance={0}
        decay={2}
      />

      {/* ── Sky sphere ───────────────────────────────────────────────── */}
      <mesh ref={skyRef} scale={[600, 600, 600]}>
        <sphereGeometry args={[1, 64, 32]} />
        <shaderMaterial
          ref={skyMatRef}
          vertexShader={skyVert}
          fragmentShader={skyFrag}
          uniforms={skyUniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Sun body ─────────────────────────────────────────────────── */}
      <mesh position={[80, 40, -300]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshStandardMaterial
          color="#FFD070"
          emissive="#FFD070"
          emissiveIntensity={3}
          roughness={0}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* ── Sun outer glow halo ───────────────────────────────────────── */}
      <mesh position={[80, 40, -300]}>
        <sphereGeometry args={[40, 32, 32]} />
        <meshBasicMaterial
          color="#FF9030"
          transparent
          opacity={0.15}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Second, larger glow layer ─────────────────────────────────── */}
      <mesh position={[80, 40, -300]}>
        <sphereGeometry args={[70, 32, 32]} />
        <meshBasicMaterial
          color="#FFD060"
          transparent
          opacity={0.05}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Cloud puffs ── */}
      {clouds.map((c) => (
        <CloudPuff
          key={c.id}
          position={c.position}
          size={c.size}
          opacity={c.opacity}
          speed={c.speed * (1 + progress * 3)}
          index={c.id}
        />
      ))}

      {/* ── Ascending Airliner ── */}
      <AscendingAirliner progress={progress} />
    </group>
  )
}

/* ── Ascending airliner silhouette ── */
function AscendingAirliner({ progress = 0 }) {
  const ref = useRef()
  const tex = useTexture('/photos/act6_success_hero.png')

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    // Smooth progress ease
    const easeP = Math.pow(progress, 0.75)

    // Ascend path: starts lower left and flies up-right towards the sun
    ref.current.position.x = -16 + easeP * 30
    ref.current.position.y = -1 + easeP * 7.5
    ref.current.position.z = -48 - easeP * 28

    // Gentle aerodynamic float/wobble
    ref.current.position.y += Math.sin(t * 11) * 0.03
  })

  return (
    <group ref={ref} rotation={[0.16, -0.28, 0.08]}>
      {/* Premium Visual Panel instead of low-poly cylinders */}
      <mesh castShadow>
        <planeGeometry args={[14, 8.5]} />
        <meshStandardMaterial map={tex} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Outer gold border frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[14.15, 8.65]} />
        <meshBasicMaterial color="#D8A027" />
      </mesh>
    </group>
  )
}
