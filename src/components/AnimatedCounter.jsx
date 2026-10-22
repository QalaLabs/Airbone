'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Formats a number or string into a display string with commas and prefixes/suffixes.
 * e.g., (2500, '', '+') -> '2,500+'
 * e.g., (100, '', '%') -> '100%'
 */
export function formatCounterValue(value, prefix = '', suffix = '', decimals = 0) {
  if (value === undefined || value === null) return `${prefix}0${suffix}`
  
  if (typeof value === 'string') {
    // If string already contains formatting or suffixes (e.g. '2,500+', '100%')
    if (/[+,%]/.test(value) || isNaN(Number(value.replace(/,/g, '')))) {
      return value
    }
    const num = Number(value.replace(/,/g, ''))
    return `${prefix}${num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  }

  if (typeof value === 'number') {
    return `${prefix}${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  }

  return `${prefix}${value}${suffix}`
}

/**
 * AnimatedCounter
 * 
 * In SSR HTML, renders the final static numbers (e.g. 2,500+, 100%) inside DOM nodes
 * instead of 0+ / 0% so search engine crawlers index accurate metrics.
 * 
 * On the client, a smooth easeOut cubic animation runs once scrolled into view.
 */
export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  className = '',
  style = {},
  as: Tag = 'span',
  'aria-label': ariaLabel,
  ...rest
}) {
  const ref = useRef(null)
  
  // Parse numeric target from value
  const numValue = typeof value === 'number'
    ? value
    : Number(String(value || '').replace(/[^\d.]/g, '')) || 0

  // SSR INITIAL STATE: Must render the final static number for crawlers!
  const finalStaticDisplay = formatCounterValue(value, prefix, suffix, decimals)
  const [display, setDisplay] = useState(finalStaticDisplay)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Only animate on the client after hydration
    if (typeof window === 'undefined' || hasAnimated) return

    const element = ref.current
    if (!element) return

    // IntersectionObserver to trigger animation when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          observer.disconnect()
          setHasAnimated(true)

          const startTime = performance.now()
          const startNum = 0
          const targetNum = numValue

          const tick = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic: 1 - (1 - t)^3
            const ease = 1 - Math.pow(1 - progress, 3)
            const current = startNum + (targetNum - startNum) * ease

            const formattedNum = decimals > 0
              ? current.toFixed(decimals)
              : Math.round(current).toLocaleString('en-IN')

            setDisplay(`${prefix}${formattedNum}${suffix}`)

            if (progress < 1) {
              requestAnimationFrame(tick)
            } else {
              setDisplay(finalStaticDisplay)
            }
          }

          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [numValue, duration, decimals, prefix, suffix, finalStaticDisplay, hasAnimated])

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
      aria-label={ariaLabel || finalStaticDisplay}
      {...rest}
    >
      {display}
    </Tag>
  )
}
