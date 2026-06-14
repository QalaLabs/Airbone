/**
 * AIRBORNE AVIATION — MasterScene V6
 *
 * The 3D canvas orchestrator. Mounts/unmounts act scenes based on
 * scroll position. Controls cinematic camera via Catmull-Rom spline.
 * Post-processing: Bloom + vignette only (no DOF for perf).
 */

import { useRef, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// Act scenes — v6 clean versions
import Act01_Dream     from './v6/Act01_Dream.jsx'
import Act02_Mentor    from './v6/Act02_Mentor.jsx'
import Act03_Aircraft  from './v6/Act03_Aircraft.jsx'
import Act04_Simulator from './v6/Act04_Simulator.jsx'
import Act05_Cockpit   from './v6/Act05_Cockpit.jsx'
import Act06_Success   from './v6/Act06_Success.jsx'

// Camera keyframes — one per act boundary
// [actIndex, cameraX, cameraY, cameraZ, lookAtX, lookAtY, lookAtZ, fov]
const KEYFRAMES = [
  // Act 0: Dream — low, runway ahead
  [0, 0, 1.2, 18, 0, 1.2, -100, 65],
  // Act 1: Mentor — slightly elevated, looking at whiteboard
  [1, -1, 2.5, 8, 0, 1.8, -3, 55],
  // Act 2: Aircraft — majestic diagonal perspective of A320 in hangar
  [2, -12, 6, 26, 0, 3.5, 0, 56],
  // Act 3: Simulator — approaching the machine
  [3, 0, 1.8, 9, 0, 1.0, -5, 52],
  // Act 4: Cockpit — pilot eye level
  [4, 0, 1.6, 4, 0, 1.4, -5, 58],
  // Act 5: Success — elevated, sky view
  [5, 0, 8, 15, 0, 4, -50, 60],
  // Act 6: Final (same as success, panned)
  [6, 0, 5, 10, 0, 3, -40, 55],
]

function lerp(a, b, t) { return a + (b - a) * t }

function CinematicCamera({ actIndex, actProgress }) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 1.2, 18))
  const currentLook = useRef(new THREE.Vector3(0, 1.2, -100))
  const currentFov = useRef(65)

  useFrame((_, delta) => {
    const kf = KEYFRAMES[actIndex]
    const kfNext = KEYFRAMES[Math.min(actIndex + 1, KEYFRAMES.length - 1)]

    const t = actProgress
    const tp = Math.pow(t, 0.6) // ease-in curve for cinematic feel

    const targetPos = new THREE.Vector3(
      lerp(kf[1], kfNext[1], tp),
      lerp(kf[2], kfNext[2], tp),
      lerp(kf[3], kfNext[3], tp),
    )
    const targetLook = new THREE.Vector3(
      lerp(kf[4], kfNext[4], tp),
      lerp(kf[5], kfNext[5], tp),
      lerp(kf[6], kfNext[6], tp),
    )
    const targetFov = lerp(kf[7], kfNext[7], tp)

    // Breathing: subtle sin wave offset
    const breath = Math.sin(Date.now() * 0.0006) * 0.06
    targetPos.y += breath

    // Smooth damp
    const s = 1 - Math.pow(0.012, delta)
    currentPos.current.lerp(targetPos, s)
    currentLook.current.lerp(targetLook, s)
    currentFov.current += (targetFov - currentFov.current) * s

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLook.current)
    camera.fov = currentFov.current
    camera.updateProjectionMatrix()
  })

  return null
}

export default function MasterScene({ actIndex = 0, actProgress = 0 }) {
  // Only render scenes near current act (±1) for perf
  const show = (id) => Math.abs(id - actIndex) <= 1

  return (
    <>
      <CinematicCamera actIndex={actIndex} actProgress={actProgress} />

      <Suspense fallback={null}>
        {show(0) && <Act01_Dream    progress={actIndex === 0 ? actProgress : actIndex > 0 ? 1 : 0} />}
        {show(1) && <Act02_Mentor   progress={actIndex === 1 ? actProgress : actIndex > 1 ? 1 : 0} />}
        {show(2) && <Act03_Aircraft progress={actIndex === 2 ? actProgress : actIndex > 2 ? 1 : 0} />}
        {show(3) && <Act04_Simulator progress={actIndex === 3 ? actProgress : actIndex > 3 ? 1 : 0} />}
        {show(4) && <Act05_Cockpit  progress={actIndex === 4 ? actProgress : actIndex > 4 ? 1 : 0} />}
        {show(5) && <Act06_Success  progress={actIndex === 5 ? actProgress : actIndex > 5 ? 1 : 0} />}
        {show(6) && <Act06_Success  progress={1} />}
      </Suspense>

      {/* Post-processing: minimal, cinematic */}
      <EffectComposer>
        <Bloom
          intensity={actIndex === 4 ? 0.45 : 0.25}
          luminanceThreshold={0.65}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </>
  )
}
