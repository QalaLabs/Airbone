'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'framer-motion'
import { getLocalBusinessSchema, getEducationalOrgSchema } from '@/utils/seo'
import { GlowCard } from '@/components/ui/spotlight-card'
import PremiumFooter from '@/components/PremiumFooter'

// Premium FX components — pure UI, no backend dependencies
import {
  RouteProgress,
  CockpitHUD,
  AmbientRadial,
  HeroLayers,
  StatReveal,
  AirlineMarquee,
  JourneyMap,
  SuccessMosaic,
  Magnetic,
} from '@/components/AirborneFX'

// Lazy-load the heavy 3D cockpit only when requested
const Home3DSection = dynamic(() => import('@/components/Home3DSection'), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', inset: 0, background: '#000810', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.3em', color: '#FFFFFF', textTransform: 'uppercase' }}>
          Air<span style={{ color: '#DB241E' }}>borne</span>
        </div>
        <div style={{ width: '120px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem auto 0', overflow: 'hidden' }}>
          <div style={{ height: '1px', background: '#DB241E', animation: 'barAnim 2.4s cubic-bezier(0.16,1,0.3,1) forwards' }} />
        </div>
      </div>
    </div>
  )
})

/* ─────────────────────────────────────
   FLOATING NAV — Light glassmorphism pill
───────────────────────────────────── */
function FloatingNav({ onBook }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Courses', href: '/courses' },
    { label: 'Journey', href: '#dream' },
    { label: 'Mentor', href: '#founder' },
    { label: 'Stories', href: '#stories' },
    { label: 'About', href: '/about' },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}
      >
        <motion.nav
          animate={{
            marginTop: scrolled ? 12 : 20,
            maxWidth: scrolled ? '960px' : '1240px',
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-nav"
          style={{
            pointerEvents: 'auto', borderRadius: '999px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
            paddingLeft: '1.25rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem',
            width: '92vw',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo-primary.webp" alt="Airborne Aviation Academy" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-only-flex" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500,
                  color: 'rgba(0,39,76,0.8)', textDecoration: 'none', borderRadius: '999px',
                  transition: 'background 0.2s, color 0.2s',
                  fontFamily: 'var(--font-h)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,39,76,0.05)'; e.currentTarget.style.color = 'var(--navy)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(0,39,76,0.8)' }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onBook}
            className="desktop-only-inline-flex"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              borderRadius: '999px', background: 'var(--navy)', color: '#fff',
              fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'var(--font-h)',
              paddingLeft: '1rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem',
              border: 'none', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
          >
            Reserve Free Demo
            <span style={{ display: 'inline-flex', height: '1.5rem', width: '1.5rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </span>
          </button>

          {/* Hamburger Trigger */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </motion.nav>
      </motion.header>

      {/* Full-screen Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,8,22,0.99)', backdropFilter: 'blur(30px)',
              display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
              overflow: 'hidden',
            }}
          >
            {/* Watermark arc background */}
            <div style={{ position: 'absolute', right: '-15%', bottom: '15%', opacity: 0.03, color: '#fff', pointerEvents: 'none', zIndex: 1 }} aria-hidden="true">
              <svg width="360" height="360" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="20" cy="20" r="19" />
                <path d="M8 32 Q18 20 30 10" />
              </svg>
            </div>

            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo-white.webp" alt="Airborne Aviation Academy" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                  width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Menu Links with Stagger animation */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem', position: 'relative', zIndex: 10 }}
            >
              {[
                { label: 'Courses', sub: 'Ground school & ratings', href: '/courses', prefix: '01' },
                { label: 'Journey', sub: 'From classroom to cockpit', href: '#dream', prefix: '02' },
                { label: 'Mentor', sub: 'Capt. Navrang Singh', href: '#founder', prefix: '03' },
                { label: 'Stories', sub: 'Our success roster', href: '#stories', prefix: '04' },
                { label: 'About', sub: 'Dwarka Centre details', href: '/about', prefix: '05' },
              ].map((l) => (
                <motion.div
                  key={l.href}
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none',
                      padding: '0.625rem 0', cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.1em' }}>
                      {l.prefix}
                    </span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.625rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        {l.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', fontFamily: 'var(--font-b)' }}>
                        {l.sub}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Drawer CTA at bottom */}
            <div style={{ marginTop: 'auto', paddingBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 10 }}>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  onBook()
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  borderRadius: '999px', background: 'var(--red)', color: '#fff',
                  fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-h)',
                  height: '3.25rem', border: 'none', cursor: 'pointer',
                }}
              >
                Reserve Free Demo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                Ramphal Chowk, Dwarka, New Delhi · <a href="tel:+919953777320" style={{ color: 'inherit', textDecoration: 'underline' }}>+91 9953 777 320</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────
   HERO — Editorial full-screen, parallax
───────────────────────────────────── */
function RevealLine({ children, delay = 0 }) {
  return (
    <span style={{ display: 'block', overflow: 'hidden' }}>
      <motion.span
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'inline-block' }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function HeroChapter({ onBook, on3D }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])

  return (
    <section id="top" ref={ref} style={{ position: 'relative', height: '100svh', minHeight: '640px', width: '100%', overflow: 'hidden', background: 'var(--navy-deep)' }}>
      <motion.div style={{ y: yBg, scale, position: 'absolute', inset: 0 }}>
        <Image
          src="/footage/hero-cockpit.jpg"
          alt="Sunrise from a commercial cockpit above the clouds"
          fill
          priority
          fetchPriority="high"
          style={{ objectFit: 'cover' }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,8,22,0.5) 0%, rgba(0,8,22,0.4) 40%, rgba(0,8,22,0.98) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,8,22,0.6), transparent, transparent)' }} />
        <HeroLayers />
      </motion.div>

      <motion.div
        className="hero-content-container"
        style={{ y: textY, opacity: fade, position: 'relative', zIndex: 10, margin: '0 auto', display: 'flex', height: '100%', maxWidth: '1280px', flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2rem' }}
        >
          <span style={{ height: '1px', width: '2.5rem', background: 'var(--red)' }} />
          Dwarka, Delhi · Est. 2009
        </motion.div>

        <h1 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.92, fontSize: 'clamp(2.2rem,8.5vw,7.5rem)', color: '#fff', maxWidth: '14ch', textShadow: '0 4px 24px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)' }}>
          <RevealLine delay={0.2}>From classroom</RevealLine>
          <RevealLine delay={0.4}>
            to <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>cockpit.</span>
          </RevealLine>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="hero-footer-wrapper"
          style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', maxWidth: '1100px' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', fontSize: '0.9375rem', lineHeight: 1.7, fontFamily: 'var(--font-b)' }}>
            India's most disciplined DGCA ground school for CPL & ATPL. Mentor-led training under
            Capt. Navrang Singh — clearing exams, building careers, restarting dreams.
          </p>

          <div className="hero-btn-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Magnetic>
              <button
                onClick={onBook}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  borderRadius: '999px', background: 'var(--red)', color: '#fff',
                  paddingLeft: '1.5rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-h)',
                  border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >
                Reserve your seat
                <span style={{ display: 'inline-flex', height: '2rem', width: '2rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#ffffff', color: 'var(--red)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </span>
              </button>
            </Magnetic>
            <button
              onClick={on3D}
              className="desktop-only-inline-flex"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                borderRadius: '999px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-h)',
                border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ✦ Enter 3D Cockpit
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '1.5rem', left: '50%', translateX: '-50%', zIndex: 10, color: 'rgba(255,255,255,0.6)', fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <span>Scroll</span>
        <span style={{ height: '2rem', width: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)' }} />
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────
   BOARDING STRIP — Animated stats below hero
───────────────────────────────────── */
function BoardingStrip() {
  const stats = [
    { value: 15, suffix: '+', label: 'Years mentoring pilots' },
    { value: 5, suffix: '/5', label: 'DGCA papers cleared in 3 months' },
    { value: 2500, suffix: '+', label: 'Students sent to the cockpit' },
    { value: 100, suffix: '%', label: 'Mentor-led batches' },
  ]
  return (
    <section style={{ position: 'relative', marginTop: '-3.5rem', zIndex: 20, padding: '0 clamp(1.5rem,5vw,4rem)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="glass-nav boarding-strip-grid"
        style={{
          margin: '0 auto', maxWidth: '1100px', borderRadius: '1.75rem',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        {stats.map((s, idx) => (
          <div key={idx} className="boarding-strip-stat">
            <StatReveal
              value={s.value}
              label={s.label}
              prefix={s.prefix || ''}
              suffix={s.suffix || ''}
            />
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────
   CHAPTER SHELL — Reusable editorial section
───────────────────────────────────── */
function ChapterShell({ id, num, kicker, title, body, image, alt, reverse = false, dark = false, imageAccent }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  const bg = dark ? 'var(--navy-deep)' : 'var(--paper)'
  const textColor = dark ? '#fff' : 'var(--navy)'
  const bodyColor = dark ? 'rgba(255,255,255,0.7)' : 'rgba(33,33,33,0.7)'
  const numColor = dark ? 'var(--gold)' : 'var(--red)'
  const kickerColor = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,39,76,0.6)'
  const lineColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,39,76,0.3)'

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section
      id={id}
      ref={ref}
      style={{ position: 'relative', padding: 'clamp(3.5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: bg, color: textColor }}
    >
      <div className="responsive-grid-chapters" style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Image side */}
        <motion.div
          className="chapter-img-side"
          style={{ y: isMobile ? 0 : y, position: 'relative', aspectRatio: '4/5', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: 'var(--shadow-float)', order: reverse ? 2 : 1 }}
        >
          <motion.div style={{ scale: imgScale, position: 'absolute', inset: 0 }}>
            <Image
              style={{ objectFit: 'cover' }}
              src={image}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          {imageAccent}
        </motion.div>

        {/* Text side */}
        <div className="chapter-text-side" style={{ order: reverse ? 1 : 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
          >
            <span className="chapter-num" style={{ color: numColor }}>{num}</span>
            <span style={{ height: '1px', width: '2.5rem', background: lineColor }} />
            <span className="chapter-num" style={{ color: kickerColor }}>{kicker}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="display-xl"
            style={{ fontSize: 'clamp(2rem,5vw,4rem)', color: textColor }}
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            style={{ marginTop: '1.5rem', maxWidth: '28rem', fontSize: '0.9375rem', lineHeight: 1.7, color: bodyColor, fontFamily: 'var(--font-b)' }}
          >
            {body}
          </motion.p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   INDIVIDUAL CHAPTER SECTIONS
───────────────────────────────────── */
function DreamChapter() {
  return (
    <ChapterShell
      id="dream"
      num="Chapter 01"
      kicker="Dream"
      title={<>The sky was never the limit. <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--red)' }}>It was the invitation.</span></>}
      body="Every pilot we've sent into an Air India or IndiGo uniform began with one quiet decision — that this dream deserves serious work. Not a brochure. Not a promise. A system."
      image="/footage/clouds-above.jpg"
      alt="Layered clouds at golden hour seen from above"
      imageAccent={
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', color: 'rgba(255,255,255,0.9)' }}>
          <div>
            <div style={{ fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7 }}>Altitude</div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.875rem', fontWeight: 700 }}>36,000 ft</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7 }}>Heading</div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.875rem', fontWeight: 700 }}>090°</div>
          </div>
        </div>
      }
    />
  )
}

function LearnChapter() {
  return (
    <ChapterShell
      id="learn"
      num="Chapter 02"
      kicker="Learn"
      title={<>Concepts that <span style={{ color: 'var(--gold)' }}>stick at 40,000 ft.</span></>}
      body="Capt. Navrang Singh strips DGCA syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RTR — taught the way you'll actually use them in the cockpit."
      image="/footage/classroom.jpg"
      alt="DGCA ground class at Airborne Aviation"
      reverse
    />
  )
}

function TrainChapter() {
  return (
    <ChapterShell
      id="train"
      num="Chapter 03"
      kicker="Train"
      title={<>Procedures, repeated. <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Until they're instinct.</span></>}
      body="In-house Airbus A320 simulator. CASS / COMPASS / ADAPT pre-screening. GD & PI mocks run by line captains. The moment you sit in front of an airline panel, nothing should feel new."
      image="/footage/simulator-training.jpg"
      alt="Pilot trainees in Airbus A320 flight simulator"
      dark
      imageAccent={
        <div
          className="glass-dark"
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '999px', padding: '0.375rem 0.75rem', fontSize: '0.625rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#fff' }}
        >
          <span className="animate-pulse" style={{ height: '6px', width: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
          Live · A320 SIM
        </div>
      }
    />
  )
}

function FlyChapter() {
  return (
    <ChapterShell
      id="fly"
      num="Chapter 04"
      kicker="Fly"
      title={<>Then the runway <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--red)' }}>lets go.</span></>}
      body="CPL flying training across partner schools. PPL pathways. ATPL ground for the next type rating. From your first solo to the four stripes on your shoulder — one continuous mentorship."
      image="/footage/aircraft-ascending.jpg"
      alt="Commercial jet ascending through high-altitude clouds"
      reverse
    />
  )
}

function HiredChapter() {
  return (
    <ChapterShell
      id="hired"
      num="Chapter 05"
      kicker="Get hired"
      title={<>Four stripes. <span style={{ color: 'var(--gold)' }}>One uniform.</span></>}
      body="Ruzal Dhral — IndiGo Cadet. Capt. Nipun Singh — Air India, restarted at 36. Capt. Himanish Sagwal — Emirates. The success club isn't a marketing slide. It's a roster."
      image="/campus/simulator_real.jpg"
      alt="Airborne Aviation A320 Simulator — Airline preparation"
      dark
      imageAccent={
        <div
          className="glass-dark"
          style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', borderRadius: '1rem', padding: '0.75rem 1rem', color: '#fff' }}
        >
          <div style={{ fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7 }}>Class of 2024</div>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 700, marginTop: '0.125rem' }}>IndiGo · Air India · Emirates</div>
        </div>
      }
    />
  )
}

/* ─────────────────────────────────────
   FOUNDER — Dark navy, stat grid
───────────────────────────────────── */
function FounderSection() {
  return (
    <section id="founder" style={{ position: 'relative', padding: 'clamp(3.5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--navy-deep)', color: '#fff', overflow: 'hidden' }}>
      {/* Ambient background glow */}
      <div
        className="animate-drift"
        aria-hidden
        style={{
          position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 20% 30%, var(--red) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--gold) 0%, transparent 35%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="responsive-grid-founder" style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Left: Text content */}
        <div>
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>The Mentor</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', color: '#fff' }}>
            Capt. Navrang <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Singh.</span>
          </h2>
          <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem', fontFamily: 'var(--font-b)' }}>
            Fifteen years in the classroom. Thousands of hours simplifying the hardest DGCA papers into the language pilots actually need. No gimmicks. No empty promises. Just the cleanest path from your first concept to your four stripes.
          </p>

          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.1)', maxWidth: '28rem', width: '100%' }}>
            {[
              ['15+', 'Years teaching'],
              ['2,500+', 'Students mentored'],
              ['5/5', 'Papers, first attempt'],
              ['36', 'Oldest restart, Air India'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--navy-deep)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{k}</div>
                <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-glow)' }}
        >
          <img
            src="/team/navrang_portrait.jpg"
            alt="Capt. Navrang Singh — Chief Instructor, Airborne Aviation Academy"
            style={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--navy-deep) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
            <div style={{ fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>Chief Instructor</div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Capt. Navrang Singh</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   COURSES — 3-col tilt grid
───────────────────────────────────── */
// Static fallback — renders when API returns 0 results (courses not yet in DB)
const STATIC_COURSES = [
  { name: 'CPL Ground School',    price: '₹2,70,000',       tag: 'Ground School',  lede: 'Complete DGCA CPL exam prep. All subjects. Mentor-led batches of 25.', desc: 'Complete DGCA CPL exam prep. All subjects. Mentor-led batches of 25.', duration: '12–18 months', eligibility: 'Class 12 PM',    href: '/courses/cpl-ground-classes' },
  { name: 'ATPL Ground School',   price: '₹1,50,000',       tag: 'Ground School',  lede: 'Airline Transport Pilot License exam prep covering all DGCA subjects.', desc: 'ATPL exam prep — all DGCA subjects covered, viva included.', duration: '4–6 months',  eligibility: 'Valid CPL',        href: '/courses/atpl' },
  { name: 'Cadet Preparation',    price: '₹50,000',         tag: 'Cadet Selection',lede: 'IndiGo, Air India & Akasa cadet pilot selection program preparation.', desc: 'Aptitude tests, GD/PI, SIM prep for airline cadet programs.', duration: '2–3 months',  eligibility: 'CPL in progress',  href: '/courses/cadet-preparation' },
  { name: 'A320 Simulator',       price: '₹10,000/hr',      tag: 'Simulator',      lede: 'In-house Airbus A320 simulator for type rating familiarisation and airline SIM prep.', desc: 'Type rating fam, cadet SIM prep, emergency procedures.', duration: 'Per session', eligibility: 'CPL holders',      href: '/courses/a320-simulator' },
  { name: 'CAS Compass & ADAPT',  price: '₹30,000',         tag: 'Aptitude Test',  lede: 'Structured preparation for CAS Compass and ADAPT pilot aptitude test batteries.', desc: 'Numerical, spatial, psychomotor, multi-tasking, personality.', duration: '4–6 weeks',  eligibility: 'Any stage',        href: '/courses/cas-compass-adapt' },
  { name: 'Airline Preparation',  price: '₹1,00,000',       tag: 'GD / PI',        lede: 'GD, PI, personal development and mock interviews led by Rajeet Khalsa.', desc: 'GD, PI, mock interviews, communication, resume prep.', duration: '6–8 weeks',  eligibility: 'CPL holders',      href: '/courses/airline-preparation' },
  { name: 'Flying Training Guide',price: 'Free Counselling', tag: 'Guidance',       lede: 'India vs abroad comparison, DGCA conversion guide, and personalised roadmap.', desc: 'India vs abroad, DGCA conversion, which path suits you.', duration: 'Self-paced', eligibility: 'All students',     href: '/courses/flying-training-india-abroad' },
  { name: 'Cabin Crew',           price: 'On Request',       tag: 'Hospitality',    lede: 'Cabin crew and hospitality training for aviation service careers.', desc: 'Cabin crew and hospitality training for aviation careers.', duration: '3 months',   eligibility: '18+ years',        href: '/courses/cabin-crew' },
]

function mapCourseToCard(c) {
  const meta = c.metadata ?? {}
  const fmt = (fee) => fee
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(fee)
    : null
  return {
    name: c.title,
    price: meta.priceLabel ?? fmt(c.fee) ?? 'Contact us',
    tag: meta.tag ?? c.category ?? 'Program',
    lede: c.subtitle ?? c.description?.slice(0, 120) ?? '',
    desc: c.description?.slice(0, 90) ?? c.subtitle ?? '',
    duration: meta.duration ?? '',
    eligibility: meta.eligibility ?? '',
    seats: meta.seats ?? '',
    href: `/courses/${c.slug}`,
  }
}

function CoursesSection() {
  const [courses, setCourses] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0)
  const mobileCarouselRef = useRef(null)

  useEffect(() => {
    fetch('/api/public-proxy/courses?limit=9')
      .then((r) => r.json())
      .then((d) => {
        const fetched = (d.data ?? []).map(mapCourseToCard)
        setCourses(fetched.length > 0 ? fetched : STATIC_COURSES)
        setLoaded(true)
      })
      .catch(() => { setCourses(STATIC_COURSES); setLoaded(true) })
  }, [])

  const count = courses.length
  const headline = count > 0
    ? <>{count} program{count !== 1 ? 's' : ''}. <span style={{ fontStyle: 'italic', fontWeight: 300 }}>One cockpit.</span></>
    : <>Our programs. <span style={{ fontStyle: 'italic', fontWeight: 300 }}>One cockpit.</span></>

  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return
    const el = mobileCarouselRef.current
    const cardWidth = el.clientWidth * 0.80 + 16 // 80vw card + 1rem gap
    const idx = Math.round(el.scrollLeft / cardWidth)
    setMobileActiveIdx(Math.min(courses.length - 1, Math.max(0, idx)))
  }

  const scrollToMobileCard = (idx) => {
    if (!mobileCarouselRef.current) return
    const el = mobileCarouselRef.current
    const cardWidth = el.clientWidth * 0.80 + 16
    el.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
  }

  return (
    <section id="courses" style={{ position: 'relative', padding: 'clamp(3.5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--paper)' }}>

      {/* Mobile Carousel Styles (scoped by media query) */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Desktop: show grid, hide mobile carousel */
        .courses-desktop-grid {
          display: grid !important;
        }
        .courses-mobile-carousel-layout {
          display: none !important;
        }

        @media (max-width: 767px) {
          .courses-desktop-grid {
            display: none !important;
          }
          .courses-mobile-carousel-layout {
            display: block !important;
          }

          .courses-mobile-wrapper {
            position: relative;
            margin: 0 -1.5rem;
          }

          /* Right-edge peek gradient */
          .courses-mobile-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 36px;
            background: linear-gradient(to left, var(--paper) 0%, transparent 100%);
            pointer-events: none;
            z-index: 10;
          }

          .courses-mobile-scroll {
            display: flex;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-x;
            overscroll-behavior-x: contain;
            scroll-behavior: smooth;
            gap: 1rem;
            padding: 1rem 10vw 1.5rem;
            margin-bottom: 0.5rem;
          }

          .courses-mobile-scroll::-webkit-scrollbar {
            display: none;
          }

          /* Premium mobile card */
          .course-mobile-card {
            flex: 0 0 80vw;
            scroll-snap-align: center;
            background: #fff;
            border: 1px solid rgba(0, 39, 76, 0.08);
            border-radius: 14px;
            padding: 1.5rem 1.25rem 1.25rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 39, 76, 0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            transition: transform 0.25s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            min-height: 200px;
          }

          /* Gold top accent line */
          .course-mobile-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent 5%, var(--gold) 50%, transparent 95%);
            opacity: 0.5;
          }

          .course-mobile-card:active {
            transform: scale(0.97);
            border-color: var(--gold);
            box-shadow: 0 4px 16px rgba(216, 160, 39, 0.12);
          }

          /* Category badge */
          .course-mobile-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-family: var(--font-h);
            font-size: 0.575rem;
            font-weight: 800;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--red);
            background: rgba(219, 36, 30, 0.06);
            border: 1px solid rgba(219, 36, 30, 0.12);
            border-radius: 999px;
            padding: 0.3rem 0.7rem;
            margin-bottom: 0.85rem;
            width: fit-content;
          }

          .course-mobile-name {
            font-family: var(--font-h);
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--navy);
            text-transform: uppercase;
            letter-spacing: -0.01em;
            line-height: 1.2;
            margin-bottom: 0.5rem;
          }

          .course-mobile-desc {
            font-family: var(--font-b);
            font-size: 0.78rem;
            color: rgba(33, 33, 33, 0.55);
            line-height: 1.55;
            margin-bottom: 0.85rem;
          }

          /* Info pills row */
          .course-mobile-pills {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 0.85rem;
          }

          .course-mobile-pill {
            font-family: var(--font-h);
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--navy);
            background: rgba(0, 39, 76, 0.04);
            border: 1px solid rgba(0, 39, 76, 0.08);
            border-radius: 6px;
            padding: 0.3rem 0.55rem;
          }

          /* CTA */
          .course-mobile-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-family: var(--font-h);
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--gold);
            text-decoration: none;
            padding-top: 0.65rem;
            border-top: 1px solid rgba(0, 39, 76, 0.06);
            width: 100%;
            transition: color 0.2s ease;
          }

          .course-mobile-cta svg {
            transition: transform 0.25s ease;
          }

          .course-mobile-cta:active svg {
            transform: translateX(4px);
          }

          /* Swipe hint */
          .courses-swipe-hint {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            font-family: var(--font-h);
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--red);
            opacity: 0.6;
            animation: courseSwipeHint 2.5s infinite ease-in-out;
            margin-bottom: 1rem;
          }

          @keyframes courseSwipeHint {
            0%, 100% { transform: translateX(0); opacity: 0.4; }
            50% { transform: translateX(6px); opacity: 0.8; }
          }
        }
      ` }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="courses-header-grid">
          <div>
            <div className="chapter-num" style={{ color: 'var(--red)', marginBottom: '1rem' }}>The Manifest</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', color: 'var(--navy)' }}>
              {headline}
            </h2>
          </div>
          <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem', alignSelf: 'flex-end', fontFamily: 'var(--font-b)' }}>
            Every program is mentor-led, seat-capped, and built around a real airline finish line. Pick the chapter where your journey begins.
          </p>
        </div>

        {!loaded && (
          <div className="responsive-grid-courses" style={{ background: 'rgba(0,39,76,0.1)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(0,39,76,0.1)', minHeight: '600px' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ padding: 'clamp(1.5rem,3vw,2rem)', minHeight: '280px', background: '#fff', opacity: 0.5, animation: 'pulse 2s infinite ease-in-out', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ width: '40%', height: '1.2rem', background: 'rgba(0,39,76,0.1)', borderRadius: '4px', marginBottom: '1rem' }} />
                  <div style={{ width: '90%', height: '2rem', background: 'rgba(0,39,76,0.15)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                  <div style={{ width: '70%', height: '1rem', background: 'rgba(0,39,76,0.1)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '60px', height: '22px', background: 'rgba(0,39,76,0.08)', borderRadius: '4px' }} />
                  <div style={{ width: '60px', height: '22px', background: 'rgba(0,39,76,0.08)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {loaded && fetchError && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,39,76,0.04)', borderRadius: '1.5rem', border: '1px solid rgba(0,39,76,0.1)' }}>
            <p style={{ color: 'rgba(0,39,76,0.5)', fontSize: '0.9375rem' }}>
              Could not load courses right now. <a href="/courses" style={{ color: 'var(--red)' }}>View full catalog →</a>
            </p>
          </div>
        )}

        {loaded && !fetchError && courses.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,39,76,0.04)', borderRadius: '1.5rem', border: '1px solid rgba(0,39,76,0.1)' }}>
            <p style={{ color: 'rgba(0,39,76,0.5)', fontSize: '0.9375rem' }}>
              Course catalog is being updated. <a href="/contact" style={{ color: 'var(--red)' }}>Contact us</a> for current offerings.
            </p>
          </div>
        )}

        {loaded && !fetchError && courses.length > 0 && (
          <>
            {/* 1. Desktop Grid — UNCHANGED */}
            <div className="courses-desktop-grid responsive-grid-courses" style={{ background: 'rgba(0,39,76,0.1)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(0,39,76,0.1)' }}>
              {courses.map((c, i) => (
                <CourseCard key={c.href} c={c} index={i} />
              ))}
            </div>

            {/* 2. Mobile Carousel */}
            <div className="courses-mobile-carousel-layout">
              {/* Swipe Hint */}
              <div className="courses-swipe-hint">
                <span>Swipe to explore programs</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>

              {/* Carousel Track */}
              <div className="courses-mobile-wrapper">
                <div
                  className="courses-mobile-scroll"
                  ref={mobileCarouselRef}
                  onScroll={handleMobileScroll}
                >
                  {courses.map((c, idx) => (
                    <a
                      key={c.href}
                      href={c.href}
                      className="course-mobile-card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {/* Category Badge */}
                      <div>
                        <div className="course-mobile-badge">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /></svg>
                          {c.tag}
                        </div>

                        {/* Course Name */}
                        <h3 className="course-mobile-name">{c.name}</h3>

                        {/* Short Description */}
                        <p className="course-mobile-desc">{c.desc || c.lede}</p>

                        {/* Duration / Eligibility Pills */}
                        <div className="course-mobile-pills">
                          {c.duration && (
                            <span className="course-mobile-pill">{c.duration}</span>
                          )}
                          {c.eligibility && (
                            <span className="course-mobile-pill">{c.eligibility}</span>
                          )}
                          {!c.duration && !c.eligibility && c.seats && (
                            <span className="course-mobile-pill">{c.seats}</span>
                          )}
                          {!c.duration && !c.eligibility && !c.seats && (
                            <span className="course-mobile-pill">{c.tag}</span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="course-mobile-cta">
                        <span>Explore Program</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Progress Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '0.5rem' }}>
                {courses.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToMobileCard(idx)}
                    style={{
                      width: mobileActiveIdx === idx ? '18px' : '6px',
                      height: '6px',
                      borderRadius: '999px',
                      background: mobileActiveIdx === idx ? 'var(--red)' : 'rgba(0, 39, 76, 0.15)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    aria-label={`Go to program ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function CourseCard({ c, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sy = useSpring(ry, { stiffness: 200, damping: 20 })
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={(e) => {
        if (isMobile) return
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6)
      }}
      onMouseLeave={() => { if (isMobile) return; rx.set(0); ry.set(0); setHovered(false) }}
      onMouseEnter={() => { if (isMobile) return; setHovered(true) }}
      style={{
        rotateX: sx, rotateY: sy, transformPerspective: 1000,
        background: hovered ? 'var(--navy)' : '#fff',
        color: hovered ? '#fff' : 'inherit',
        padding: 'clamp(1.5rem,3vw,2rem)',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        cursor: 'pointer', transition: 'background 0.5s, color 0.5s',
      }}
      onClick={() => window.location.href = c.href}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <span style={{ fontSize: '0.625rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: hovered ? 'var(--gold)' : 'var(--red)', transition: 'color 0.5s' }}>
          {c.tag}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hovered ? '#fff' : 'rgba(0,39,76,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s, transform 0.5s', transform: hovered ? 'rotate(45deg)' : 'none' }}>
          <path d="M7 17L17 7M17 7H7M17 7v10"/>
        </svg>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: hovered ? '#fff' : 'var(--navy)' }}>{c.name}</h3>
        <p style={{ marginTop: '0.5rem', fontSize: '0.84375rem', lineHeight: 1.6, color: hovered ? 'rgba(255,255,255,0.7)' : 'rgba(33,33,33,0.6)', fontFamily: 'var(--font-b)', transition: 'color 0.5s' }}>
          {c.lede}
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(0,39,76,0.1)'}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', transition: 'border-color 0.5s' }}>
        <div>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Investment</div>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.125rem', fontWeight: 700, marginTop: '0.125rem' }}>{c.price}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Seats</div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginTop: '0.125rem' }}>{c.seats}</div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────
   THE SUCCESS CLUB — Premium Achievement Wall
───────────────────────────────────── */
const SUCCESS_STUDENTS = [
  { name: 'Anusha Jain', image: '/success/Anusha%20Jain.jpeg' },
  { name: 'Capt Abdul Salam Khan', image: '/success/Capt%20Abdul%20Salam%20khan.jpeg' },
  { name: 'Mohd Yunus Bin Wahaj', image: '/success/Mohd%20Yunus%20Bin%20Wahaj.jpeg' },
  { name: 'Mohit Bhargava', image: '/success/Mohit%20Bhargava.jpeg' },
  { name: 'Samarth', image: '/success/Samarth.jpeg' },
]

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)

  if (SUCCESS_STUDENTS.length < 3) {
    return null
  }

  const handleScroll = () => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const scrollLeft = container.scrollLeft
    const width = container.clientWidth * 0.8
    if (width > 0) {
      const index = Math.round(scrollLeft / width)
      setActiveIndex(index)
    }
  }

  const scrollTo = (index) => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const width = container.clientWidth * 0.8
    container.scrollTo({
      left: index * width,
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }

  return (
    <section id="stories" style={{ position: 'relative', padding: 'clamp(3.5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--paper)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
          <div>
            <div className="chapter-num" style={{ color: 'var(--red)', marginBottom: '1rem' }}>The Success Club</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2rem,4.5vw,4rem)', color: 'var(--navy)', maxWidth: '30rem' }}>
              Real names. Real cockpits. <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Real scores.</span>
            </h2>
          </div>
        </div>

        <div className="success-club-container">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="success-club-carousel"
          >
            {SUCCESS_STUDENTS.map((s, i) => (
              <motion.figure
                key={`${s.name}-${i}`}
                className="success-club-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                style={{
                  position: 'relative', borderRadius: '1.5rem', border: '1px solid rgba(0,39,76,0.08)',
                  background: '#fff', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  margin: 0,
                  boxShadow: '0 10px 30px rgba(0,39,76,0.06)',
                  transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-float)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,39,76,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '120%', overflow: 'hidden', background: 'var(--navy)' }}>
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    style={{
                      position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'cover',
                      objectPosition: 'top center',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,39,76,0.2) 0%, transparent 40%)', pointerEvents: 'none' }} />
                </div>
                <figcaption style={{ padding: '1.5rem 1.25rem', background: '#fff', borderTop: '3px solid var(--gold)', display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1, justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: 'clamp(1.05rem, 1.1vw, 1.25rem)', color: 'var(--navy)', lineHeight: 1.2 }}>{s.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)' }} />
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--red)', fontWeight: 700 }}>Airborne Alumnus</span>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          <div className="carousel-dots">
            {SUCCESS_STUDENTS.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                className={`carousel-dot ${activeIndex === i ? 'active' : ''}`}
                onClick={() => scrollTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   HOMEPAGE FAQ
───────────────────────────────────── */
const HOME_FAQS = [
  { q: 'What is the eligibility to join CPL ground school at Airborne?', a: 'Class 12 with Physics and Mathematics (minimum 50% in PM). You must also hold or be eligible for a DGCA Class 1 Medical. Age 17+ at time of first solo flight. No prior aviation experience required.' },
  { q: 'How long is the CPL ground school program?', a: "Airborne's CPL ground school runs 3–6 months for the full DGCA subject battery. Complete CPL with flying takes 12–18 months. Batches are capped at 25 students. Weekend and weekday batches available from our Dwarka, Delhi campus." },
  { q: 'What is the fee for CPL ground school?', a: 'CPL ground school at Airborne is ₹2,70,000. This covers all DGCA subjects, study materials, and viva preparation. Flying training (done at an FTO of your choice) is a separate cost — speak to our admissions team for current FTO tie-up rates.' },
  { q: 'Is Airborne Aviation Academy DGCA approved?', a: 'Yes. Airborne Aviation Academy is a DGCA-approved ground training organisation. Our curriculum is aligned with the DGCA CPL and ATPL examination syllabus. Capt. Navrang Singh has been the principal mentor since founding in 2009.' },
  { q: 'Can I do CPL and ATPL ground school together?', a: 'Yes, and Airborne recommends it. The CPL and ATPL syllabi overlap significantly in Air Navigation, Meteorology, and Technical subjects. Completing both together improves exam efficiency and reduces total preparation time.' },
  { q: 'What airlines have Airborne graduates joined?', a: 'Airborne graduates have joined IndiGo, Air India, Akasa Air, SpiceJet, Air Asia India, Alliance Air, and regional operators. Over 2,500 pilots have trained at Airborne since 2009.' },
]

function HomepageFAQ() {
  const [open, setOpen] = useState(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ padding: '6rem var(--margin)', background: '#000810', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '1rem' }}>
            QUESTIONS & ANSWERS
          </span>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.1', margin: 0 }}>
            Frequently Asked <span style={{ color: '#D8A027' }}>Questions</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          {HOME_FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < HOME_FAQS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', background: open === i ? 'rgba(216,160,39,0.04)' : 'transparent', border: 'none', cursor: 'pointer', padding: '1.4rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', textAlign: 'left', transition: 'background 0.2s' }}
              >
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 700, color: open === i ? '#D8A027' : '#FFFFFF', lineHeight: '1.4', flex: 1 }}>{faq.q}</span>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 900, color: '#D8A027', flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.25s', display: 'inline-block' }}>+</span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ margin: 0, padding: '0 1.75rem 1.4rem 1.75rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.75' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: HOME_FAQS.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a }
              }))
            })
          }}
        />
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────
   FINAL CTA — Preserves existing /api/lead integration
───────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['15%', '-15%'])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // ✅ PRESERVED: existing /api/lead backend integration
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    const name = form.elements['cta-name'].value
    const phone = form.elements['cta-phone'].value
    const email = form.elements['cta-email'].value
    const pincode = form.elements['cta-pincode'].value
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, pincode, course: 'DGCA CPL Ground School', source: 'Homepage Final CTA' })
      })
    } catch (_) { }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section id="cta" ref={ref} style={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', background: 'var(--navy-deep)', color: '#fff' }}>
      <motion.div style={{ y: bgY, position: 'absolute', inset: 0, opacity: 0.7 }}>
        <img src="/footage/clouds-above.jpg" alt="" style={{ height: '100%', width: '100%', objectFit: 'cover' }} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--navy-deep) 0%, rgba(0,8,22,0.35) 25%, transparent 60%, var(--navy-deep) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 50%, rgba(255, 215, 0, 0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
      </motion.div>

      <div className="cta-content-wrapper" style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', padding: 'clamp(5rem,10vw,12rem) clamp(1.25rem,5vw,4rem)' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>Final boarding</div>

          <h2 className="display-xl" style={{ fontSize: 'clamp(2.25rem,7.5vw,6.5rem)', lineHeight: 1.08, letterSpacing: '-0.02em', color: '#fff', maxWidth: '14ch' }}>
            Your <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>cockpit</span> is waiting.
          </h2>

          <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.85)', maxWidth: '38rem', fontSize: 'clamp(0.9375rem,1.5vw,1.05rem)', lineHeight: 1.7, fontFamily: 'var(--font-b)' }}>
            Visit our Dwarka center, sit in on a class, meet Capt. Navrang. No pressure.
            Just an honest look at the system that's been sending pilots into airline cockpits for fifteen years.
          </p>

          {/* ✅ PRESERVED: form posts to /api/lead */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '1.25rem', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '0.8rem' }}>Application Received</div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginBottom: '0.6rem' }}>We'll contact you within 24 hours.</div>
              <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Capt. Navrang Singh's team · Dwarka, New Delhi</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <a href="tel:+919953777320" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>📞 Call Us</a>
                <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>💬 WhatsApp</a>
                <a href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', background: 'var(--red)', color: '#fff', textDecoration: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-h)', fontWeight: 700 }}>Explore Courses →</a>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="cta-form"
            >
              <input
                id="cta-name"
                type="text"
                placeholder="Full name"
                required
              />
              <input
                id="cta-phone"
                type="tel"
                placeholder="Mobile number"
                required
              />
              <input
                id="cta-email"
                type="email"
                placeholder="Email address"
                required
              />
              <input
                id="cta-pincode"
                type="text"
                placeholder="PIN code / Zip code"
                required
              />
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >
                {loading ? 'Sending…' : <>Reserve seat <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></>}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>
            Or call us directly ·{' '}
            <a href="tel:+919953777320" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
            >+91 9953 777 320</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   FOOTER — Full columns + mega wordmark
───────────────────────────────────── */
function SiteFooter() {
  const cols = [
    { title: 'Programs', links: [
      { label: 'CPL Ground', href: '/courses/commercial-pilot-license-cpl' },
      { label: 'Cadet Pilot', href: '/courses/cadet-preparation' },
      { label: 'ATPL Ground', href: '/courses/atpl' },
      { label: 'A320 SIM', href: '/courses/a320-simulator' },
      { label: 'Cabin Crew', href: '/courses/cabin-crew' },
      { label: 'All Courses', href: '/courses' },
    ]},
    { title: 'Academy', links: [
      { label: 'About Us', href: '/about' },
      { label: 'Capt. Navrang', href: '/about#mentor' },
      { label: 'Dwarka Centre', href: '/contact' },
      { label: 'Jobs Portal', href: '/jobs' },
      { label: 'Resources', href: '/resources' },
      { label: 'How to Become a Pilot After Class 12', href: '/blog/how-to-become-pilot-india' },
    ]},
    { title: 'Connect', links: [
      { label: 'Contact', href: '/contact' },
      { label: 'WhatsApp', href: 'https://wa.me/919953777320' },
      { label: '+91 9953 777 320', href: 'tel:+919953777320' },
    ]},
  ]

  return (
    <footer style={{ position: 'relative', background: 'var(--navy-deep)', color: '#fff', paddingTop: '6rem', paddingBottom: '2.5rem', paddingLeft: 'clamp(1.5rem,5vw,4rem)', paddingRight: 'clamp(1.5rem,5vw,4rem)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Top grid */}
        <div className="responsive-grid-footer" style={{ paddingBottom: '5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h3 className="display-xl" style={{ fontSize: 'clamp(2rem,5vw,4rem)', color: '#fff' }}>
              Built for the <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>serious</span> aspirant.
            </h3>
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '28rem', fontFamily: 'var(--font-b)' }}>
              Airborne Aviation Academy — E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi – 110075.<br />
            Timings: Monday to Saturday, 9:30 AM – 6:00 PM (Closed on Sundays)
            </p>
          </div>

          <div className="responsive-grid-footer-links">
            {cols.map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.25rem' }}>{col.title}</div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Mega wordmark */}
        <div className="pf-wordmark-section" aria-hidden="true">
          <div className="pf-wordmark-wrap">
            <img src="/logo-white.webp" alt="Airborne Aviation Academy" />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          <div>© {new Date().getFullYear()} Airborne Aviation Academy. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>Privacy</a>
            <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>Terms</a>
            <a href="/dgca-compliance" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>DGCA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────
   BOOKING MODAL — Preserved intact, connects to /api/lead
───────────────────────────────────── */
function BookingModal({ open, onClose }) {
  const [status, setStatus] = useState('idle')

  // ✅ PRESERVED: /api/lead backend integration
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    const name = e.target.elements['m-name'].value
    const phone = e.target.elements['m-phone'].value
    const email = e.target.elements['m-email'].value
    const pincode = e.target.elements['m-pincode'].value
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, pincode, course: 'DGCA CPL Ground School', source: 'Homepage Modal' })
      })
    } catch (_) { }
    setStatus('success')
  }

  useEffect(() => {
    if (!open) setStatus('idle')
  }, [open])

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="booking-modal-overlay"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="booking-modal-card"
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '1rem' }}>Confirmed</div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', marginBottom: '0.8rem' }}>Demo Seat Reserved</div>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Our admissions team will reach out within 24 hours to confirm your demo class schedule with Capt. Navrang Singh.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  <a href="tel:+919953777320" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>📞 Call Us</a>
                  <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>💬 WhatsApp</a>
                  <a href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', background: 'var(--red)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>Explore Courses →</a>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <span style={{ width: '20px', height: '1px', background: 'var(--red)', display: 'block' }} />
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', color: 'var(--red)', textTransform: 'uppercase' }}>Free Demo Class</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1.05, marginBottom: '0.8rem' }}>
                  Reserve Your<br />Demo Seat.
                </h3>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: '2rem' }}>
                  A 90-minute introduction with Capt. Navrang Singh. Free, no commitment.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  {[
                    { id: 'm-name', type: 'text', placeholder: 'Full Name' },
                    { id: 'm-phone', type: 'tel', placeholder: 'Phone Number' },
                    { id: 'm-email', type: 'email', placeholder: 'Email Address' },
                    { id: 'm-pincode', type: 'text', placeholder: 'PIN Code / Zip Code' },
                  ].map(f => (
                    <input key={f.id} id={f.id} type={f.type} placeholder={f.placeholder} required style={{
                      background: '#000810', border: 'none', outline: 'none',
                      padding: '1.2rem 1.4rem', fontFamily: 'var(--font-b)',
                      fontSize: '0.88rem', color: '#fff', width: '100%',
                    }} />
                  ))}
                  <button type="submit" disabled={status === 'loading'} style={{
                    fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    background: 'var(--red)', color: '#fff',
                    border: 'none', padding: '1.2rem 1.4rem',
                    cursor: 'pointer',
                  }}>
                    {status === 'loading' ? 'Sending…' : 'Reserve Seat →'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────
   PREMIUM CURSOR — Preserved intact
───────────────────────────────────── */
function PremiumCursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch || window.innerWidth <= 1024) return

    let px = 0, py = 0, rx = 0, ry = 0, raf

    const move = (e) => { px = e.clientX; py = e.clientY }
    const loop = () => {
      rx += (px - rx) * 0.12
      ry += (py - ry) * 0.12
      if (dot.current) { dot.current.style.left = `${px}px`; dot.current.style.top = `${py}px` }
      if (ring.current) { ring.current.style.left = `${rx}px`; ring.current.style.top = `${ry}px` }
      raf = requestAnimationFrame(loop)
    }

    const over = () => { dot.current?.classList.add('hover'); ring.current?.classList.add('hover') }
    const out = () => { dot.current?.classList.remove('hover'); ring.current?.classList.remove('hover') }

    window.addEventListener('mousemove', move, { passive: true })
    const els = document.querySelectorAll('a, button, input')
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
      <div ref={dot} className="cursor" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}

/* ─────────────────────────────────────
   AIRBORNE ADVANTAGE — 17 items grid
───────────────────────────────────── */
function AirborneAdvantage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)

  // 17 original items for Desktop
  const desktopItems = [
    { title: 'Premium Goodies', desc: 'Bag, Keychain, Notebook, Pen, and T-Shirt provided to every student.' },
    { title: 'Own Your Material', desc: 'Keep all study materials and resources provided during the course.' },
    { title: 'Elite Infrastructure', desc: '5,000 sq ft state-of-the-art facility at Ramphal Chowk (as of 2024).' },
    { title: 'Dedicated RTR Lab', desc: 'Simulated RT communication environment for hands-on wireless practice.' },
    { title: 'Student Library', desc: 'Quiet study spaces open to students even after class hours.' },
    { title: 'On-Campus Cafeteria', desc: 'Convenient dining and lounge area for student break sessions.' },
    { title: 'Gender-Specific Washrooms', desc: 'Clean, private facilities for all students.' },
    { title: 'GD/PI Masterclasses', desc: 'Led by Rajeet Khalsa, retired Air India AGM & Trainer (37+ years exp).' },
    { title: '1-on-1 Doubt Solving', desc: 'Individual doubt-solving sessions directly with Chief Instructor Capt. Navrang.' },
    { title: 'Founder-Led Classes', desc: 'All core ground school classes taught directly by Capt. Navrang.' },
    { title: 'Personalized Pacing', desc: 'Ground school training speed adjusted to match your speed of learning.' },
    { title: 'Hostel Assistance', desc: 'Support in choosing comfortable student accommodation near the academy.' },
    { title: 'CPL Test Series', desc: 'Full mock exam battery to ensure first-attempt success in DGCA.' },
    { title: 'Lifelong Guidance', desc: 'Career support extending past CPL to type rating and airline applications.' },
    { title: 'In-House Class 2 Medical', desc: 'On-site Class 2 medical facility for pre-screening and advisory.' },
    { title: 'Smart Attendance', desc: 'Real-time check-in/out attendance notifications sent to parents.' },
    { title: 'Performance Reports', desc: 'Weekly progress and mock exam reports delivered directly to parents.' },
  ]

  // 8 premium categories for Mobile
  const mobileCategories = [
    {
      title: 'Student Kit & Goodies',
      desc: 'Academy flight bag, keychain, customized notebook, pen, and Airborne T-shirt provided to every student.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      title: 'Study Material & Library',
      desc: 'Retain your own comprehensive reference books/materials, plus access to quiet student library spaces after hours.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      title: 'RTR Lab & Infrastructure',
      desc: '5,000 sq ft Ramphal Chowk facility with simulated RT communications lab, campus cafeteria, and clean private washrooms.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
          <circle cx="12" cy="12" r="2" />
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
          <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
        </svg>
      )
    },
    {
      title: 'Medical Support',
      desc: 'In-house Class 2 medical pre-screening and consulting desk to guide your fitness and DGCA medical requirements.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      title: 'Personal Mentorship',
      desc: 'Core ground school classes taught directly by Capt. Navrang, with 1-on-1 doubt solving and personalized pacing.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      title: 'Career Guidance',
      desc: 'Lifelong guidance from CPL to type rating, plus interview preparation masterclasses by a retired Air India AGM.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    },
    {
      title: 'Parent Tracking',
      desc: 'Real-time attendance notifications (check-in/out) and weekly mock exam reports delivered directly to parents.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      title: 'Hostel Assistance',
      desc: 'Support in choosing safe, premium, and comfortable hostel or PG accommodation close to the academy.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    }
  ]

  const handleScroll = () => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth
    
    // Card is 76vw + 12px gap
    const cardWidth = containerWidth * 0.76 + 12
    const index = Math.round(scrollLeft / cardWidth)
    setActiveIndex(Math.min(mobileCategories.length - 1, Math.max(0, index)))
  }

  const scrollToCard = (index) => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const containerWidth = container.clientWidth
    const cardWidth = containerWidth * 0.76 + 12
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    })
  }

  return (
    <section id="advantage" style={{ position: 'relative', padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)', background: 'var(--navy-deep)', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      
      {/* Styles local block targeting desktop vs mobile views */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Default Styles: Desktop Grid is visible, mobile layout hidden */
        .advantage-desktop-grid {
          display: grid !important;
        }
        .advantage-mobile-layout {
          display: none !important;
        }

        /* Mobile Viewport Customization (< 768px) */
        @media (max-width: 767px) {
          .advantage-desktop-grid {
            display: none !important;
          }
          .advantage-mobile-layout {
            display: block !important;
          }

          /* Swipe Container and Wrapper */
          .advantage-carousel-wrapper {
            position: relative;
            margin: 0 -1.5rem; /* touch edges of screen */
          }

          /* Right edge gradient overlay to hint at more scrollable cards */
          .advantage-carousel-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 40px;
            background: linear-gradient(to left, var(--navy-deep) 0%, transparent 100%);
            pointer-events: none;
            z-index: 10;
          }

          .advantage-carousel {
            display: flex;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-x;
            overscroll-behavior-x: contain;
            scroll-behavior: smooth;
            gap: 0.75rem;
            padding: 1.5rem 0 2rem 1.5rem; /* left padding only — right bleeds to show next card */
            margin-bottom: 0.5rem;
          }

          .advantage-carousel::-webkit-scrollbar {
            display: none;
          }

          /* Premium glassmorphic card design */
          .advantage-card-mobile {
            flex: 0 0 76vw; /* 76vw — leaves ~20% of next card visible on right */
            scroll-snap-align: start;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
            border: 1px solid rgba(216, 160, 39, 0.12); /* Subtle gold highlights */
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 16px;
            padding: 2.25rem 1.75rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            transition: border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }

          /* Gold top gradient hairline border */
          .advantage-card-mobile::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
            opacity: 0.6;
          }

          .advantage-card-mobile:active {
            border-color: var(--gold);
            transform: scale(0.98);
          }

          /* Circular gold icon frame */
          .advantage-icon-frame {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(216, 160, 39, 0.15) 0%, rgba(216, 160, 39, 0.02) 100%);
            border: 1px solid rgba(216, 160, 39, 0.25);
            color: var(--gold);
            margin-bottom: 1.25rem;
            box-shadow: 0 4px 12px rgba(216, 160, 39, 0.08);
          }

          .advantage-mobile-title {
            font-family: var(--font-h);
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.6rem;
          }

          .advantage-mobile-desc {
            font-family: var(--font-b);
            font-size: 0.8125rem;
            color: rgba(255, 255, 255, 0.5);
            line-height: 1.6;
          }

          /* Bouncing swipe hint */
          .swipe-hint-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.7rem;
            color: var(--gold);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 700;
            opacity: 0.7;
            animation: pulseHint 2s infinite ease-in-out;
            margin-bottom: 1.25rem;
          }

          @keyframes pulseHint {
            0%, 100% { transform: translateX(0); opacity: 0.5; }
            50% { transform: translateX(5px); opacity: 0.9; }
          }
        }
      ` }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem', fontWeight: 700 }}>Exclusive Benefits</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: '#fff', textTransform: 'uppercase' }}>
            The Airborne <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Advantage.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '36rem', margin: '1.5rem auto 0', fontFamily: 'var(--font-b)' }}>
            What you get when you train at India's premier ground preparation academy. Every facility is built to support your launch.
          </p>
        </div>

        {/* 1. Desktop Layout (17 Items Grid with GlowCard) */}
        <div className="advantage-desktop-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {desktopItems.map((item, i) => (
            <GlowCard 
              key={i} 
              customSize={true}
              glowColor="gold"
              className="h-full"
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                <span style={{ fontSize: '1.25rem', color: 'var(--gold)' }}>✓</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'var(--font-b)' }}>{item.desc}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* 2. Mobile Layout (8 Premium Cards Swipe Carousel) */}
        <div className="advantage-mobile-layout">
          {/* Animated Swipe Hint */}
          <div className="swipe-hint-container">
            <span>Swipe to explore benefits</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          {/* Carousel Viewport */}
          <div className="advantage-carousel-wrapper">
            <div 
              className="advantage-carousel" 
              ref={carouselRef}
              onScroll={handleScroll}
            >
              {mobileCategories.map((item, idx) => (
                <div key={idx} className="advantage-card-mobile">
                  <div className="advantage-icon-frame">
                    {item.icon}
                  </div>
                  <h3 className="advantage-mobile-title">{item.title}</h3>
                  <p className="advantage-mobile-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators (Dots) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
            {mobileCategories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                style={{
                  width: activeIndex === idx ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: activeIndex === idx ? 'var(--gold)' : 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   PILOT CAREER OUTLOOK — Salary & Perks
───────────────────────────────────── */
function PilotCareerOutlook() {
  const stages = [
    { stage: 'Year 1–2', role: 'Junior First Officer (JFO)', salary: '₹1.5L – ₹2.5L', type: 'A320 / B737' },
    { stage: 'Year 3–5', role: 'First Officer', salary: '₹3L – ₹5L', type: 'A320 / B737' },
    { stage: 'Year 6–10', role: 'Senior First Officer', salary: '₹5L – ₹7L', type: 'A320 / B737' },
    { stage: 'Year 10+', role: 'Captain / Commander', salary: '₹8L – ₹15L', type: 'Wide-body / Narrow-body' },
  ]

  const opportunities = [
    { icon: '✈', title: 'Scheduled Airlines',    desc: 'IndiGo, Air India, Akasa Air, SpiceJet' },
    { icon: '📦', title: 'Cargo Operations',      desc: 'Blue Dart and international freight' },
    { icon: '🏢', title: 'Corporate Aviation',    desc: 'Private jets and VIP transport wings' },
    { icon: '👨‍✈️', title: 'Flight Instruction', desc: 'FTO trainer roles in India and abroad' },
    { icon: '🌍', title: 'International Pathways',desc: 'Middle East, Southeast Asia, Europe' },
  ]

  const perks = [
    'Free or heavily discounted travel for self and family',
    'Premium health insurance',
    'International exposure and layover allowances',
    'High social recognition',
    'Structured career progression',
    'Accommodation on outstation postings'
  ]

  return (
    <section id="outlook" style={{ position: 'relative', padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)', background: 'var(--paper)', color: 'var(--navy)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Intro */}
        <div style={{ marginBottom: '5rem', display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '1rem', fontWeight: 700 }}>Industry Outlook</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: 'var(--navy)', textTransform: 'uppercase', lineHeight: 1.1 }}>
              Why NOW is the Best Time to <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--red)' }}>Become a Pilot.</span>
            </h2>
          </div>
          <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '1rem', lineHeight: 1.8, fontFamily: 'var(--font-b)', margin: 0 }}>
            Indian aviation is at an inflection point. IndiGo, Air India, Akasa Air, and new entrants are collectively placing orders for 1,500+ aircraft over the next decade. Boeing's Pilot Outlook estimates India will need 8,000+ new pilots by 2040. Starting CPL training today means you are ready to fly exactly when the industry needs pilots most.
          </p>
        </div>

        {/* Details Grid */}
        <div className="responsive-grid-chapters" style={{ gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.3fr 1fr', gap: '4rem', alignItems: 'start' }}>
          
          {/* Left Column: Salaries Table */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ height: '3px', width: '20px', background: 'var(--red)', flexShrink: 0, marginTop: '0.65rem' }} />
              <span>Pilot Salary &amp; Lifestyle in India 2026</span>
            </h3>

            <style dangerouslySetInnerHTML={{ __html: `
              .salary-desktop-wrapper { display: block; border: 1px solid rgba(0,39,76,0.1); border-radius: 12px; overflow: hidden; }
              .salary-mobile-cards { display: none; }
              .opportunities-grid { display: flex; flex-direction: column; gap: 1rem; }

              @media (max-width: 767px) {
                .salary-desktop-wrapper { display: none !important; }

                /* Horizontal scroll-snap carousel */
                .salary-mobile-cards {
                  display: flex !important;
                  flex-direction: row;
                  overflow-x: auto;
                  overflow-y: hidden;
                  scroll-snap-type: x mandatory;
                  -webkit-overflow-scrolling: touch;
                  touch-action: pan-x;
                  overscroll-behavior-x: contain;
                  gap: 0.75rem;
                  padding: 0.25rem 0 1rem 0;
                }
                .salary-mobile-cards::-webkit-scrollbar { display: none; }

                .salary-mobile-card-item {
                  flex: 0 0 76vw;
                  scroll-snap-align: start;
                }

                /* 2-column grid for opportunities */
                .opportunities-grid {
                  display: grid !important;
                  grid-template-columns: repeat(2, calc(50vw - 1.8rem));
                  gap: 0.65rem;
                }
              }
            ` }} />
            
            {/* Desktop Table View */}
            <div className="salary-desktop-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', fontSize: '0.875rem', fontFamily: 'var(--font-b)' }}>
                <thead>
                  <tr style={{ background: 'var(--navy)', color: '#fff', fontFamily: 'var(--font-h)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    <th style={{ padding: '1.25rem 1.5rem' }}>Career Stage</th>
                    <th style={{ padding: '1.25rem 1.5rem' }}>Role</th>
                    <th style={{ padding: '1.25rem 1.5rem' }}>Monthly Salary</th>
                    <th style={{ padding: '1.25rem 1.5rem' }}>Aircraft Type</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((s, idx) => (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: '1px solid rgba(0,39,76,0.06)',
                        background: idx % 2 === 0 ? 'rgba(0,39,76,0.02)' : '#fff',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(216,160,39,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(0,39,76,0.02)' : '#fff'}
                    >
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--navy)' }}>{s.stage}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'rgba(33,33,33,0.8)' }}>{s.role}</td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--red)' }}>{s.salary}</td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'rgba(33,33,33,0.5)', fontSize: '0.8rem' }}>{s.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View — horizontal scroll-snap */}
            <div className="salary-mobile-cards">
              {stages.map((s, idx) => (
                <div key={idx} className="salary-mobile-card-item" style={{ background: '#fff', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(0,39,76,0.04)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>{s.stage}</span>
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--red)' }}>{s.salary}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-h)', color: 'var(--navy)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{s.role}</div>
                  <div style={{ fontFamily: 'var(--font-b)', color: 'rgba(33,33,33,0.6)', fontSize: '0.85rem' }}>Aircraft: <span style={{ fontWeight: 600 }}>{s.type}</span></div>
                </div>
              ))}
            </div>

            <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'rgba(33,33,33,0.4)', fontFamily: 'var(--font-b)', lineHeight: 1.6 }}>
              *Standard Indian airline industry averages. Actual compensation varies by operator, route hours, and type rating allowances.
            </p>
          </div>

          {/* Right Column: Opportunities & Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Opportunities */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ height: '2px', width: '15px', background: 'var(--gold)' }} />
                Job Opportunities
              </h3>
              <div className="opportunities-grid">
                {opportunities.map((o, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid rgba(0,39,76,0.06)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{o.icon}</span>
                    <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>{o.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(33,33,33,0.55)', margin: 0, fontFamily: 'var(--font-b)', lineHeight: 1.4 }}>{o.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ height: '2px', width: '15px', background: 'var(--gold)' }} />
                Key Pilot Perks
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {perks.map((p, idx) => (
                  <li key={idx} style={{ fontSize: '0.875rem', color: 'rgba(33,33,33,0.7)', lineHeight: 1.6, fontFamily: 'var(--font-b)' }}>{p}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   ROOT PAGE — All sections orchestrated
───────────────────────────────────── */
export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [is3dMode, setIs3dMode] = useState(false)
  const businessSchema = getLocalBusinessSchema()
  const orgSchema = getEducationalOrgSchema()

  const openBooking = useCallback(() => setBookingOpen(true), [])
  const closeBooking = useCallback(() => setBookingOpen(false), [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === '3d') setIs3dMode(true)
  }, [])

  // 3D mode preserved intact
  if (is3dMode) {
    return (
      <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', background: '#000810' }}>
        <Home3DSection />
        <button
          onClick={() => { setIs3dMode(false); window.history.replaceState({}, '', '/') }}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 99999,
            background: 'rgba(0,8,22,0.92)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-h)', fontSize: '0.58rem',
            fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '0.8rem 1.4rem', borderRadius: '999px', cursor: 'pointer',
          }}
        >
          ✕ Exit Simulator
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Structured data — preserved */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* Global FX layers */}
      <RouteProgress />
      <CockpitHUD />
      <AmbientRadial />
      <PremiumCursor />

      {/* Navigation */}
      <FloatingNav onBook={openBooking} />

      {/* Page sections */}
      <main>
        {/* Hero */}
        <HeroChapter onBook={openBooking} on3D={() => setIs3dMode(true)} />

        {/* Stats strip */}
        <BoardingStrip />

        {/* Airline partner marquee */}
        <AirlineMarquee />

        {/* Chapter journey */}
        <DreamChapter />
        <LearnChapter />
        <TrainChapter />
        <FlyChapter />
        <HiredChapter />

        {/* Journey route map */}
        <JourneyMap />

        {/* Courses grid */}
        <CoursesSection />

        <AirborneAdvantage />
        <PilotCareerOutlook />

        {/* Founder */}
        <FounderSection />

        {/* Pilot wall mosaic */}
        <SuccessMosaic image="/footage/pilot-portrait.jpg" />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Homepage FAQ with JSON-LD */}
        <HomepageFAQ />

        {/* Final CTA with /api/lead */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <PremiumFooter onBookDemo={openBooking} />

      {/* Booking modal with /api/lead — preserved */}
      <BookingModal open={bookingOpen} onClose={closeBooking} />
    </>
  )
}
