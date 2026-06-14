import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// ─── Sunrise / morning sky (slightly lighter than Scene01) ───────────────────
function MorningSky() {
  const meshRef = useRef()

  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime:        { value: 0 },
        uSunPosition: { value: new THREE.Vector3(0.15, 0.22, -1) },
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
        uniform vec3  uSunPosition;
        varying vec3  vPosition;

        void main() {
          vec3 dir = normalize(vPosition);
          float sunHeight = uSunPosition.y;

          // Morning sky — slightly warmer/lighter than pre-dawn
          vec3 horizonColor = mix(
            vec3(1.0, 0.55, 0.18),   // warm orange horizon
            vec3(0.95, 0.75, 0.35),  // golden
            clamp(sunHeight * 4.0, 0.0, 1.0)
          );
          vec3 zenithColor = mix(
            vec3(0.08, 0.12, 0.28),  // deep blue
            vec3(0.18, 0.38, 0.72),  // morning blue
            clamp(sunHeight * 2.5, 0.0, 1.0)
          );

          float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 skyColor = mix(horizonColor, zenithColor, pow(t, 0.55));

          // Sun disk
          float sunDist = distance(normalize(dir), normalize(uSunPosition));
          float sunDisk = smoothstep(0.055, 0.015, sunDist);
          float sunGlow = smoothstep(0.45, 0.0, sunDist) * 0.5;

          skyColor += vec3(1.0, 0.95, 0.75) * sunDisk * 4.0;
          skyColor += vec3(1.0, 0.65, 0.25) * sunGlow;

          // Horizon scatter
          float horizon = 1.0 - abs(dir.y);
          skyColor = mix(skyColor, horizonColor * 1.4, pow(horizon, 7.0) * 0.45);

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
    <mesh ref={meshRef} material={skyMaterial}>
      <sphereGeometry args={[900, 32, 32]} />
    </mesh>
  )
}

// ─── Runway surface + markings ───────────────────────────────────────────────
function TakeoffRunway() {
  return (
    <group>
      {/* Tarmac surrounds */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -100]} receiveShadow>
        <planeGeometry args={[300, 800]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>

      {/* Runway surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -100]} receiveShadow>
        <planeGeometry args={[42, 800]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.92} />
      </mesh>

      {/* Edge lines */}
      <mesh position={[-4.6, 0.01, -100]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 800]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      <mesh position={[4.6, 0.01, -100]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 800]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>

      {/* Center line dashes */}
      {Array.from({ length: 80 }, (_, i) => (
        <mesh key={i} position={[0, 0.015, 20 - i * 11]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 5.5]} />
          <meshStandardMaterial color="#CCCCCC" roughness={0.5} />
        </mesh>
      ))}

      {/* Threshold bars */}
      {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 0.015, 18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 9]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      ))}

      {/* Touchdown zone marks */}
      {[-1.8, 1.8].map((x, s) =>
        [-30, -50, -70].map((z, i) => (
          <mesh key={`tdz${s}${i}`} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.35, 4.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
        ))
      )}

      {/* Tire marks (rotation zone) */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`tire${i}`} position={[x, 0.013, -80]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 18]} />
          <meshStandardMaterial color="#050505" roughness={1} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* Grass borders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[90, -0.03, -100]}>
        <planeGeometry args={[140, 800]} />
        <meshStandardMaterial color="#192a12" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, -0.03, -100]}>
        <planeGeometry args={[140, 800]} />
        <meshStandardMaterial color="#192a12" roughness={1} />
      </mesh>
    </group>
  )
}

// ─── Runway edge lights ───────────────────────────────────────────────────────
function RunwayEdgeLights() {
  const lights = useMemo(() => {
    const arr = []
    for (let i = 0; i < 45; i++) {
      arr.push({ x: 4.9,  z: 15 - i * 10 })
      arr.push({ x: -4.9, z: 15 - i * 10 })
    }
    return arr
  }, [])

  return (
    <group>
      {lights.map((l, i) => (
        <mesh key={i} position={[l.x, 0.06, l.z]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFE0"
            emissiveIntensity={4}
          />
        </mesh>
      ))}
      {/* PAPI lights (red/white) at rotation point */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`papi${i}`} position={[8 + i * 0.4, 0.12, -60]}>
          <boxGeometry args={[0.15, 0.1, 0.12]} />
          <meshStandardMaterial
            color={i < 2 ? '#FF2222' : '#FFFFFF'}
            emissive={i < 2 ? '#FF0000' : '#FFFFFF'}
            emissiveIntensity={5}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Approach lighting system (ahead of aircraft) ─────────────────────────────
function ApproachLights() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[0, 0.08, 25 + i * 18]}>
          {/* Cross-bar */}
          {[-1.5, -0.75, 0, 0.75, 1.5].map((x, j) => (
            <mesh key={j} position={[x, 0, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={5}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ─── A320 aircraft (external, takeoff view from behind) ───────────────────────
function TakeoffAircraft({ speed = 0, liftoff = 0 }) {
  const gearVisible = liftoff < 0.8

  return (
    <group>
      {/* ── Fuselage ── */}
      <mesh castShadow>
        <capsuleGeometry args={[2.8, 22, 16, 32]} />
        <meshStandardMaterial
          color="#E8EBF0"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0, 13]} castShadow>
        <coneGeometry args={[2.8, 4, 32]} />
        <meshStandardMaterial color="#E8EBF0" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* ── Wings ── */}
      <group position={[0, -0.5, -2]}>
        {/* Left wing */}
        <mesh castShadow position={[-12, 0, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[20, 0.38, 6]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Right wing */}
        <mesh castShadow position={[12, 0, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[20, 0.38, 6]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Winglets */}
        <mesh position={[-22.2, 1.1, 0.4]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.28, 2.2, 1.6]} />
          <meshStandardMaterial color="#D8DADF" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[22.2, 1.1, 0.4]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.28, 2.2, 1.6]} />
          <meshStandardMaterial color="#D8DADF" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* ── Engine LEFT ── */}
        <group position={[-8, -1.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.2, 1.0, 4.5, 28]} />
            <meshStandardMaterial color="#888890" metalness={0.88} roughness={0.2} />
          </mesh>
          {/* Intake ring */}
          <mesh position={[0, 0, 2.3]}>
            <cylinderGeometry args={[1.22, 1.22, 0.18, 28]} />
            <meshStandardMaterial color="#333338" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Exhaust glow cone */}
          <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.55, 2.5, 16, 1, true]} />
            <meshStandardMaterial
              color="#FF6600"
              emissive="#FF4400"
              emissiveIntensity={speed * 4}
              transparent
              opacity={Math.min(speed * 0.85, 0.85)}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Engine exhaust point light */}
          <pointLight
            position={[0, 0, -3.5]}
            color="#FF8820"
            intensity={speed * 8}
            distance={8}
            decay={2}
          />
        </group>

        {/* ── Engine RIGHT ── */}
        <group position={[8, -1.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.2, 1.0, 4.5, 28]} />
            <meshStandardMaterial color="#888890" metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 2.3]}>
            <cylinderGeometry args={[1.22, 1.22, 0.18, 28]} />
            <meshStandardMaterial color="#333338" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.55, 2.5, 16, 1, true]} />
            <meshStandardMaterial
              color="#FF6600"
              emissive="#FF4400"
              emissiveIntensity={speed * 4}
              transparent
              opacity={Math.min(speed * 0.85, 0.85)}
              side={THREE.BackSide}
            />
          </mesh>
          <pointLight
            position={[0, 0, -3.5]}
            color="#FF8820"
            intensity={speed * 8}
            distance={8}
            decay={2}
          />
        </group>
      </group>

      {/* ── Tail ── */}
      <group position={[0, 0, -11]}>
        {/* Vertical stab */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[0.42, 5.5, 4.2]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Horizontal stabs */}
        <mesh position={[-5.2, 0.5, 0]} castShadow>
          <boxGeometry args={[8.5, 0.32, 3.2]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[5.2, 0.5, 0]} castShadow>
          <boxGeometry args={[8.5, 0.32, 3.2]} />
          <meshStandardMaterial color="#DDDFE4" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* ── Airborne livery stripe ── */}
      <mesh position={[2.85, 0, -2]}>
        <boxGeometry args={[0.04, 0.38, 24]} />
        <meshStandardMaterial color="#DB241E" emissive="#DB241E" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-2.85, 0, -2]}>
        <boxGeometry args={[0.04, 0.38, 24]} />
        <meshStandardMaterial color="#DB241E" emissive="#DB241E" emissiveIntensity={0.4} />
      </mesh>

      {/* ── Landing gear (hidden after liftoff) ── */}
      {gearVisible && (
        <group>
          {/* Nose gear */}
          <mesh position={[0, -3.1, 8]}>
            <cylinderGeometry args={[0.18, 0.18, 2.2, 10]} />
            <meshStandardMaterial color="#444448" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -4.25, 8]}>
            <cylinderGeometry args={[0.42, 0.42, 0.22, 14]} />
            <meshStandardMaterial color="#222224" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Main gear left */}
          <group position={[-3.2, -3.1, -2]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 2.4, 10]} />
              <meshStandardMaterial color="#444448" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -1.3, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.25, 14]} />
              <meshStandardMaterial color="#222224" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
          {/* Main gear right */}
          <group position={[3.2, -3.1, -2]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 2.4, 10]} />
              <meshStandardMaterial color="#444448" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -1.3, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.25, 14]} />
              <meshStandardMaterial color="#222224" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        </group>
      )}

      {/* ── Wingtip vortex particles (visible at high speed) ── */}
      {speed > 0.5 && (
        <group>
          {Array.from({ length: 8 }, (_, i) => {
            const t = i / 8
            const spread = (1 - t) * 0.5
            const fade = speed * (1 - t * 0.7)
            return (
              <group key={i}>
                {/* Left vortex */}
                <mesh position={[-22.5, -0.5 - t * 1.2, -3 - i * 2.2]}>
                  <sphereGeometry args={[0.15 + t * 0.35, 6, 6]} />
                  <meshStandardMaterial
                    color="#E8F4FF"
                    emissive="#C0D8FF"
                    emissiveIntensity={fade}
                    transparent
                    opacity={fade * 0.55}
                  />
                </mesh>
                {/* Right vortex */}
                <mesh position={[22.5, -0.5 - t * 1.2, -3 - i * 2.2]}>
                  <sphereGeometry args={[0.15 + t * 0.35, 6, 6]} />
                  <meshStandardMaterial
                    color="#E8F4FF"
                    emissive="#C0D8FF"
                    emissiveIntensity={fade}
                    transparent
                    opacity={fade * 0.55}
                  />
                </mesh>
              </group>
            )
          })}
        </group>
      )}

      {/* ── Nav lights ── */}
      <pointLight position={[-22.5, 0, -1]} color="#FF0000" intensity={2} distance={6} decay={2} />
      <pointLight position={[22.5, 0, -1]}  color="#00FF00" intensity={2} distance={6} decay={2} />
      <pointLight position={[0, 4.5, -11]}  color="#FFFFFF" intensity={1.5} distance={8} decay={2} />

      {/* ── Strobe (white flash) ── */}
      <pointLight position={[0, -3, 0]} color="#FFFFFF" intensity={speed > 0.05 ? 1.5 : 0} distance={12} decay={2} />
    </group>
  )
}

// ─── Motion blur decals on runway (appear at speed > 0.4) ────────────────────
function RunwayBlur({ speed = 0, aircraftZ = 0 }) {
  if (speed < 0.4) return null

  const blurIntensity = (speed - 0.4) / 0.6
  const positions = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => aircraftZ + 8 + i * 3.5), [aircraftZ])

  return (
    <group>
      {positions.map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[38, 3.0 + i * 0.6]} />
          <meshStandardMaterial
            color="#2a2a2a"
            transparent
            opacity={blurIntensity * 0.12 * (1 - i / 12)}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Heat shimmer at exhaust (simple overlapping transparent planes) ──────────
function HeatHaze({ speed = 0, position }) {
  if (speed < 0.3) return null
  const intensity = (speed - 0.3) / 0.7

  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.6, 3.5, 12, 1, true]} />
      <meshStandardMaterial
        color="#FFD090"
        emissive="#FF6600"
        emissiveIntensity={intensity * 0.5}
        transparent
        opacity={intensity * 0.12}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Main scene ───────────────────────────────────────────────────────────────
export default function Scene06_Takeoff({ progress = 0 }) {
  const aircraftRef = useRef()
  const clockRef    = useRef(0)

  // ── Derived animation values ──
  const speed       = progress
  const liftoff     = Math.min(Math.max((progress - 0.65) * 2.857, 0), 1)
  const aircraftZ   = -progress * 200
  const aircraftY   = liftoff * 40
  const noseUp      = liftoff * 0.18

  useFrame((state, delta) => {
    clockRef.current += delta
    if (aircraftRef.current) {
      aircraftRef.current.position.set(0, aircraftY, aircraftZ)
      aircraftRef.current.rotation.x = -noseUp
      // Slight roll sway
      aircraftRef.current.rotation.z = Math.sin(clockRef.current * 0.4) * 0.008 * speed
    }
  })

  return (
    <group>
      {/* ── Lighting ── */}
      {/* Morning sun */}
      <directionalLight
        position={[60, 30, -150]}
        color="#FFD060"
        intensity={5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={800}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={60}
        shadow-camera-bottom={-20}
      />
      {/* Hemisphere sky/ground */}
      <hemisphereLight
        skyColor="#FF8030"
        groundColor="#0a1520"
        intensity={1}
      />
      {/* Ambient fill */}
      <ambientLight color="#1a0a05" intensity={0.2} />

      {/* ── Sky ── */}
      <MorningSky />

      {/* ── Ground & runway ── */}
      <TakeoffRunway />
      <RunwayEdgeLights />
      <ApproachLights />

      {/* ── Runway motion blur ── */}
      <RunwayBlur speed={speed} aircraftZ={aircraftZ} />

      {/* ── Aircraft group (animates with progress) ── */}
      <group ref={aircraftRef} position={[0, 0, 0]}>
        <TakeoffAircraft speed={speed} liftoff={liftoff} />

        {/* Engine heat haze */}
        <HeatHaze speed={speed} position={[-8, -1.5, -14]} />
        <HeatHaze speed={speed} position={[8, -1.5, -14]} />

        {/* Engine spooling glow (orange fill light under nacelles) */}
        {speed > 0.1 && (
          <>
            <pointLight
              position={[-8, -1.5, -13]}
              color="#FF6010"
              intensity={speed * 5}
              distance={12}
              decay={2}
            />
            <pointLight
              position={[8, -1.5, -13]}
              color="#FF6010"
              intensity={speed * 5}
              distance={12}
              decay={2}
            />
          </>
        )}
      </group>

      {/* ── Fixed camera reference (slight shake at speed) ── */}
      {/* The camera shake is managed externally via progress; 
          we expose a slight turbulence hint via a group nudge */}
      <group position={[0, 4, 28]}>
        {/* Perspective anchor — camera positioned here externally */}
      </group>
    </group>
  )
}
