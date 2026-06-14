import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_VH = 1100;
const SCENE_BOUNDARIES = [
  { start: 0,    end: 100  },   // 0: Dream
  { start: 100,  end: 200  },   // 1: Mentor
  { start: 200,  end: 350  },   // 2: Training
  { start: 350,  end: 450  },   // 3: Simulator
  { start: 450,  end: 600  },   // 4: Aircraft
  { start: 600,  end: 850  },   // 5: Cockpit  ← hero interactive
  { start: 850,  end: 1000 },   // 6: Success
  { start: 1000, end: 1100 },   // 7: Destination
];

/**
 * GSAP ScrollTrigger-driven scroll progress hook.
 * Returns normalized progress 0–1 across all scenes,
 * plus current scene index (0–7) and in-scene progress (0–1).
 */
export function useGSAPScroll() {
  const [state, setState] = useState({
    total: 0,       // 0–1 across entire journey
    sceneIndex: 0,  // 0–7
    scene: 0,       // 0–1 within current scene
    raw: 0,         // raw scrollY px
  })

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return

      const total = Math.min(scrollY / maxScroll, 1)
      const vh = total * TOTAL_VH

      let sceneIndex = 0
      let scene = 0
      
      for (let i = 0; i < SCENE_BOUNDARIES.length; i++) {
        const b = SCENE_BOUNDARIES[i]
        if (vh >= b.start && vh <= b.end) {
          sceneIndex = i
          scene = (vh - b.start) / (b.end - b.start)
          break
        } else if (vh > b.end) {
          sceneIndex = i
          scene = 1
        }
      }

      setState({ total, sceneIndex, scene, raw: scrollY })
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return state
}

/**
 * Custom cursor hook — smooth lagged cursor position
 */
export function useCursor() {
  const actual = useRef({ x: -200, y: -200 })
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [hovering, setHovering] = useState(false)
  const rafRef = useRef()

  useEffect(() => {
    const onMove = (e) => {
      actual.current = { x: e.clientX, y: e.clientY }
    }
    const onOver = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setHovering(true)
    }
    const onOut = () => setHovering(false)

    let prev = { x: -200, y: -200 }
    const loop = () => {
      prev = {
        x: prev.x + (actual.current.x - prev.x) * 0.12,
        y: prev.y + (actual.current.y - prev.y) * 0.12,
      }
      setPos({ ...prev })
      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { pos, hovering }
}

/**
 * Loader hook — resolves after delay
 */
export function useLoader(ms = 3000) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDone(true), ms)
    return () => clearTimeout(t)
  }, [ms])
  return done
}

