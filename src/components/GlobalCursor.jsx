'use client'

/**
 * GlobalCursor — Site-wide custom cursor
 *
 * Renders the red dot + ring cursor on desktop (pointer: fine, width > 1024px).
 * Falls back to the native cursor automatically on touch/tablet via CSS.
 *
 * Mount this ONCE in the root layout so every page benefits.
 * The homepage's PremiumCursor renders a duplicate set — CSS z-index ensures
 * the one rendered last wins; both are harmless and hidden by media query on mobile.
 */

import { useEffect, useRef } from 'react'

export default function GlobalCursor() {
  const dot  = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    // Only activate on true pointer devices (non-touch, ≥1025px)
    const isTouch  = window.matchMedia('(pointer: coarse)').matches
    const isMobile = window.innerWidth <= 1024
    if (isTouch || isMobile) return

    let px = 0, py = 0, rx = 0, ry = 0, raf

    const move = (e) => { px = e.clientX; py = e.clientY }
    const loop = () => {
      rx += (px - rx) * 0.12
      ry += (py - ry) * 0.12
      if (dot.current)  { dot.current.style.left  = `${px}px`; dot.current.style.top  = `${py}px` }
      if (ring.current) { ring.current.style.left = `${rx}px`; ring.current.style.top = `${ry}px` }
      raf = requestAnimationFrame(loop)
    }

    const over = () => { dot.current?.classList.add('hover');    ring.current?.classList.add('hover')    }
    const out  = () => { dot.current?.classList.remove('hover'); ring.current?.classList.remove('hover') }

    window.addEventListener('mousemove', move, { passive: true })
    const els = document.querySelectorAll('a, button, input, [data-cursor]')
    els.forEach(el => { el.addEventListener('mouseenter', over); el.addEventListener('mouseleave', out) })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
      els.forEach(el => { el.removeEventListener('mouseenter', over); el.removeEventListener('mouseleave', out) })
    }
  }, [])

  return (
    <>
      <div ref={dot}  className="cursor"      aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
