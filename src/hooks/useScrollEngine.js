/**
 * AIRBORNE AVIATION ACADEMY — V6 Scroll Engine
 *
 * Philosophy: One scroll position drives everything.
 * No GSAP ScrollTrigger complexity. Pure window.scrollY → progress (0–1).
 *
 * Total scroll height: 700vh (7 acts × 100vh each)
 * Each act owns 1/7 of total scroll range.
 */

import { useState, useEffect } from 'react'

export const ACTS = [
  { id: 0, name: 'Dream',     label: '01 · The Dream' },
  { id: 1, name: 'Mentor',    label: '02 · The Mentor' },
  { id: 2, name: 'Aircraft',  label: '03 · The Aircraft' },
  { id: 3, name: 'Simulator', label: '04 · Simulator' },
  { id: 4, name: 'Cockpit',   label: '05 · The Cockpit' },
  { id: 5, name: 'Success',   label: '06 · Alumni' },
  { id: 6, name: 'Takeoff',   label: '07 · Takeoff' },
]

export const TOTAL_ACTS = ACTS.length
export const SCROLL_PER_ACT = 100 // vh per act
export const TOTAL_VH = TOTAL_ACTS * SCROLL_PER_ACT // 700vh

export function useScrollEngine() {
  const [state, setState] = useState({
    total: 0,       // 0–1 across entire page
    actIndex: 0,    // 0–6 which act
    actProgress: 0, // 0–1 within current act
  })

  useEffect(() => {
    let raf
    let lastY = -1

    const update = () => {
      const y = window.scrollY
      if (y === lastY) { raf = requestAnimationFrame(update); return }
      lastY = y

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const total = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0

      // Which act we're in
      const scrollVH = (y / window.innerHeight) * 100
      const rawAct = scrollVH / SCROLL_PER_ACT
      const actIndex = Math.min(Math.floor(rawAct), TOTAL_ACTS - 1)
      const actProgress = Math.min(rawAct - actIndex, 1)

      setState({ total, actIndex, actProgress })
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return state
}

export function useCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return pos
}
