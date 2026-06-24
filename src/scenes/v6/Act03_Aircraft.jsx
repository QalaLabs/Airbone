import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/* ── AIRCRAFT BILLBOARD — Replaces low-poly primitive shapes ── */
function Aircraft({ progress = 0 }) {
  const ref = useRef()
  const tex = useTexture('/footage/aircraft-ascending.jpg')

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    
    // Smooth hover float
    ref.current.position.y = 3.5 + Math.sin(t * 0.4) * 0.08
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.003
  })

  return (
    <group ref={ref} position={[0, 3.5, 0]}>
      {/* High-quality aircraft illustration panel */}
      <mesh castShadow>
        <planeGeometry args={[14, 8.4]} />
        <meshStandardMaterial map={tex} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Outer gold border frame */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[14.2, 8.6]} />
        <meshBasicMaterial color="#D8A027" />
      </mesh>
    </group>
  )
}

/* ── HANGAR FLOOR — polished concrete with faint reflection ── */
function HangarFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#080a0d"
        roughness={0.25}
        metalness={0.5}
      />
    </mesh>
  )
}


/* ── HANGAR DUST ── */
function HangarDust() {
  const ref = useRef()
  const count = 600

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 80
      arr[i * 3 + 1] = Math.random() * 28
      arr[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    return arr
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.005
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.1) * 0.2
    }
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#506690" size={0.06} sizeAttenuation transparent opacity={0.35} depthWrite={false} />
    </points>
  )
}

/* ── DRAMATIC LIGHTING ── */
function RevealLighting() {
  return (
    <>
      <ambientLight intensity={0.02} color="#050810" />

      {/* KEY LIGHT — Upper left cool industrial */}
      <spotLight
        position={[-35, 28, -10]}
        target-position={[0, 3, 0]}
        intensity={90}
        color="#a5c4f5"
        angle={0.45}
        penumbra={0.65}
        castShadow
      />

      {/* RIM LIGHT — Behind, blue-white edge definition */}
      <spotLight
        position={[0, 18, 42]}
        target-position={[0, 3, 0]}
        intensity={60}
        color="#5084cc"
        angle={0.55}
        penumbra={0.7}
        castShadow
      />

      {/* FILL LIGHT — soft warm from right */}
      <spotLight
        position={[40, 12, -5]}
        target-position={[0, 3, 0]}
        intensity={25}
        color="#f0d490"
        angle={0.6}
        penumbra={0.8}
        castShadow
      />

      {/* Under light bounce */}
      <pointLight position={[0, 0.5, 0]} intensity={3} color="#152438" distance={40} decay={2} />
    </>
  )
}

export default function Act03_Aircraft({ progress = 0 }) {
  return (
    <group>
      <RevealLighting />
      <HangarFloor />
      <HangarDust />
      <Aircraft progress={progress} />
    </group>
  )
}
