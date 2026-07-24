import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

// ─── Deep space + atmosphere sky dome ────────────────────────────────────────
function CTASkyDome() {
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
            float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

            // Zenith: deep navy  #000820
            // Horizon: dark navy #00274C (brand)
            vec3 zenith  = vec3(0.0,   0.031, 0.125);
            vec3 horizon = vec3(0.0,   0.153, 0.298);
            vec3 atm     = vec3(0.2,   0.50,  0.95);   // atmosphere limb blue

            vec3 sky = mix(horizon, zenith, pow(t, 0.6));

            // Thin atmospheric glow band right above horizon
            float atmBand = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.15, 0.38, t));
            sky = mix(sky, atm * 0.55, atmBand * 0.7);

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
      <sphereGeometry args={[500, 32, 32]} />
    </mesh>
  )
}

// ─── Procedural Earth sphere with noise land/ocean/city-lights ───────────────
function EarthGlobe() {
  const meshRef = useRef()

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(6380, 80, 48)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vPosition = position;
          vNormal   = normalize(normalMatrix * normal);
          vUv       = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3  vPosition;
        varying vec3  vNormal;
        varying vec2  vUv;

        // ── Noise helpers ──────────────────────────────────
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i),             hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }
        float fbm(vec2 p) {
          float v = 0.0; float a = 0.5;
          for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
          return v;
        }

        void main() {
          // ── Land / ocean mask ────────────────────────────
          float landMask = fbm(vUv * 6.0);
          float isLand   = smoothstep(0.46, 0.52, landMask);
          float isCoast  = smoothstep(0.43, 0.46, landMask) * (1.0 - isLand);

          vec3 oceanColor = vec3(0.039, 0.094, 0.188);   // #0a1830
          vec3 landColor  = vec3(0.059, 0.125, 0.063);   // #0f2010
          vec3 coastColor = vec3(0.102, 0.094, 0.031);   // #1a1808

          vec3 surface = mix(oceanColor, landColor,  isLand);
          surface      = mix(surface,   coastColor,  isCoast);

          // ── Night side city lights ───────────────────────
          // Determine lit vs night based on normal vs sun direction
          vec3 sunDir    = normalize(vec3(1.0, 0.02, -2.0));
          float sunDot   = dot(normalize(vNormal), sunDir);
          float nightSide = smoothstep(0.1, -0.3, sunDot);

          float cityNoise = noise(vUv * 60.0) * noise(vUv * 28.0) * noise(vUv * 14.0);
          float cityLights = step(0.62, cityNoise) * isLand * nightSide;
          surface += vec3(1.0, 0.88, 0.55) * cityLights * 1.4;

          // ── Cloud cover patches ──────────────────────────
          float cloudF = fbm(vUv * 4.5 + uTime * 0.00008);
          float cloudMask = smoothstep(0.48, 0.58, cloudF);
          surface = mix(surface, vec3(0.82, 0.84, 0.88), cloudMask * 0.65);

          // ── Atmosphere limb glow ─────────────────────────
          float fresnel = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
          vec3  limbAtm = vec3(0.28, 0.60, 1.0);
          surface = mix(surface, limbAtm, pow(fresnel, 4.5) * 0.55);

          // ── Sunlit side brightness ───────────────────────
          float diffuse  = max(sunDot, 0.0);
          vec3  daylight = surface * (0.18 + diffuse * 0.82);

          gl_FragColor = vec4(daylight, 1.0);
        }
      `,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.003
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -6430, 0]}
    />
  )
}

// ─── Atmosphere haze shell (additive, slightly larger than Earth) ─────────────
function AtmosphereShell() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            // Edge-only atmosphere ring
            float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            float intensity = pow(rim, 3.5) * 0.85;
            vec3 atmColor = vec3(0.35, 0.65, 1.0);
            gl_FragColor = vec4(atmColor * intensity, intensity * 0.7);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    []
  )

  return (
    <mesh material={material} position={[0, -6430, 0]}>
      <sphereGeometry args={[6420, 64, 40]} />
    </mesh>
  )
}

// ─── Procedural aircraft with banking + nav lights ────────────────────────────
function BankingAircraft() {
  const aircraftRef = useRef()
  const leftNavRef  = useRef()
  const rightNavRef = useRef()
  const strobeRef   = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Very gentle bank variation (±1°) on top of fixed 8° bank
    if (aircraftRef.current) {
      aircraftRef.current.rotation.z = -0.14 + Math.sin(t * 0.3) * 0.008 // 8° base
      aircraftRef.current.rotation.x = Math.sin(t * 0.22) * 0.005
      aircraftRef.current.position.y = Math.sin(t * 0.18) * 0.4
    }

    // Nav lights blinking
    // Left red: always on
    // Right green: always on
    // Strobe white: blinks every 1.2s
    if (strobeRef.current) {
      const strobe = Math.sin(t * (Math.PI / 0.6)) > 0.85 ? 8 : 0.1
      strobeRef.current.intensity = strobe
    }
  })

  return (
    <group ref={aircraftRef} position={[0, 0, -80]} scale={[2, 2, 2]} rotation={[0, Math.PI, -0.14]}>
      {/* ── Fuselage ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[1.8, 18, 12, 24]} />
        <meshStandardMaterial color="#E8EBF0" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.8, 3.5, 24]} />
        <meshStandardMaterial color="#E8EBF0" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── Wings ── */}
      <mesh position={[-10, -0.5, -1]} rotation={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[18, 0.32, 4.5]} />
        <meshStandardMaterial color="#D8DBDF" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[10, -0.5, -1]} rotation={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[18, 0.32, 4.5]} />
        <meshStandardMaterial color="#D8DBDF" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Winglets */}
      <mesh position={[-19.2, 0.55, -1.2]} rotation={[0, -0.15, 0.52]}>
        <boxGeometry args={[0.28, 1.6, 1.2]} />
        <meshStandardMaterial color="#CDD0D5" metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[19.2, 0.55, -1.2]} rotation={[0, 0.15, -0.52]}>
        <boxGeometry args={[0.28, 1.6, 1.2]} />
        <meshStandardMaterial color="#CDD0D5" metalness={0.8} roughness={0.22} />
      </mesh>

      {/* ── Engines ── */}
      {[[-7.5, -1.4, -0.6], [7.5, -1.4, -0.6]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.95, 0.78, 3.8, 20]} />
            <meshStandardMaterial color="#787880" metalness={0.9} roughness={0.18} />
          </mesh>
          <mesh position={[0, 1.95, 0]}>
            <cylinderGeometry args={[0.92, 0.92, 0.18, 20]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Engine glow */}
          <pointLight position={[0, -2, 0]} intensity={4} color="#FF8030" distance={10} />
        </group>
      ))}

      {/* ── Tail ── */}
      <mesh position={[0, 2.8, -9.8]}>
        <boxGeometry args={[0.35, 5, 3.8]} />
        <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-4.5, 0.5, -9.5]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[7.5, 0.3, 2.6]} />
        <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[4.5, 0.5, -9.5]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[7.5, 0.3, 2.6]} />
        <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Livery stripe ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.45, -2]}>
        <torusGeometry args={[1.86, 0.14, 8, 40, Math.PI * 2]} />
        <meshStandardMaterial color="#DB241E" emissive="#DB241E" emissiveIntensity={0.6} />
      </mesh>

      {/* ── Navigation lights ── */}
      {/* Left wing tip — red */}
      <mesh ref={leftNavRef} position={[-19.5, -0.5, -1]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#FF2020" emissive="#FF2020" emissiveIntensity={5} />
      </mesh>
      <pointLight ref={leftNavRef} position={[-19.5, -0.5, -1]} intensity={3} color="#FF2020" distance={12} />

      {/* Right wing tip — green */}
      <mesh ref={rightNavRef} position={[19.5, -0.5, -1]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#00EE00" emissive="#00EE00" emissiveIntensity={5} />
      </mesh>
      <pointLight ref={rightNavRef} position={[19.5, -0.5, -1]} intensity={3} color="#00EE00" distance={12} />

      {/* Tail strobe white */}
      <mesh position={[0, 0.5, -10.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={6} />
      </mesh>
      <pointLight ref={strobeRef} position={[0, 0.5, -10.2]} intensity={8} color="#FFFFFF" distance={20} />
    </group>
  )
}

// ─── Lens flare: manual emissive planes at sun position ──────────────────────
function LensFlare() {
  const flareGroup = useRef()

  // Sun is at world position [1000, 200, -2000] (far away)
  // We put flare sprites in screen-facing directions near that vector
  const flares = useMemo(
    () => [
      { pos: [82, 16, -165],  size: 4.5, opacity: 0.55, color: '#FFE880' },
      { pos: [70, 13, -141],  size: 2.2, opacity: 0.40, color: '#FFCC40' },
      { pos: [55, 10, -110],  size: 1.2, opacity: 0.30, color: '#FFFFFF' },
      { pos: [40, 8,  -80],   size: 3.0, opacity: 0.18, color: '#FFB020' },
      { pos: [100, 20, -200], size: 8.0, opacity: 0.22, color: '#FFE040' },
    ],
    []
  )

  useFrame((state) => {
    if (!flareGroup.current) return
    // Pulse very slowly
    const t = state.clock.elapsedTime
    flareGroup.current.children.forEach((child, i) => {
      if (child.material) {
        child.material.opacity = flares[i].opacity * (0.85 + Math.sin(t * 1.2 + i) * 0.15)
      }
    })
  })

  return (
    <group ref={flareGroup}>
      {flares.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <planeGeometry args={[f.size, f.size]} />
          <meshBasicMaterial
            color={f.color}
            transparent
            opacity={f.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Bright central spot at sun */}
      <mesh position={[100, 20, -200]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─── Scene09_CTA ──────────────────────────────────────────────────────────────
export default function Scene09_CTA() {
  return (
    <>
      {/* Stars — deep space above */}
      <Stars radius={300} depth={60} count={3000} factor={4} saturation={0.25} fade speed={0.4} />

      {/* Sky dome: deep navy → horizon navy */}
      <CTASkyDome />

      {/* Earth surface with noise shader */}
      <EarthGlobe />

      {/* Atmosphere limb glow shell */}
      <AtmosphereShell />

      {/* Banking aircraft */}
      <BankingAircraft />

      {/* Lens flare planes at sun position */}
      <LensFlare />

      {/* ── Lighting ── */}
      {/* Primary sun — very bright, far directional */}
      <directionalLight
        position={[1000, 200, -2000]}
        intensity={10}
        color="#FFE880"
        castShadow={false}
      />

      {/* Deep space ambient — very dim, keeps shadows readable */}
      <ambientLight intensity={0.08} color="#203060" />

      {/* Subtle blue fill from Earth reflection below */}
      <hemisphereLight
        skyColor="#000820"
        groundColor="#0a2868"
        intensity={0.35}
      />
    </>
  )
}
