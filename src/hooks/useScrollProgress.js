import { useEffect, useRef, useState } from 'react'

/**
 * Hook that tracks scroll progress through the cinematic journey
 * Returns normalized progress (0-1) per scene
 */
export function useScrollProgress({ totalScenes = 7, heightPerScene = 1 } = {}) {
  const [progress, setProgress] = useState({
    total: 0,
    scene: 0,
    sceneIndex: 0,
    raw: 0,
  })
  
  useEffect(() => {
    const totalHeight = totalScenes * heightPerScene * window.innerHeight
    
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      if (maxScroll <= 0) return
      
      const total = Math.min(scrollY / maxScroll, 1)
      const sceneIndex = Math.min(Math.floor(total * totalScenes), totalScenes - 1)
      const sceneProgress = (total * totalScenes) - sceneIndex
      
      setProgress({
        total,
        scene: Math.min(Math.max(sceneProgress, 0), 1),
        sceneIndex,
        raw: scrollY,
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initialize
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [totalScenes, heightPerScene])
  
  return progress
}

/**
 * Hook for custom cursor tracking
 */
export function useCursor() {
  const cursorRef = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    const onMove = (e) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
    }
    
    let raf
    const animate = () => {
      setPos(prev => ({
        x: prev.x + (cursorRef.current.x - prev.x) * 0.15,
        y: prev.y + (cursorRef.current.y - prev.y) * 0.15,
      }))
      raf = requestAnimationFrame(animate)
    }
    
    const onEnter = (e) => {
      if (e.target.matches('a, button, .hoverable')) setIsHovering(true)
    }
    const onLeave = () => setIsHovering(false)
    
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)
    raf = requestAnimationFrame(animate)
    
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])
  
  return { pos, isHovering }
}

/**
 * Hook for loading state management
 */
export function useLoader(delay = 3000) {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  return loaded
}

/**
 * Hook that returns a counter that counts up when element is in view
 */
export function useCountUp(target, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!trigger) return
    
    let start = 0
    const increment = target / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [target, duration, trigger])
  
  return count
}
