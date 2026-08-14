'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import JsonLd from '@/components/JsonLd'
import { buildHomeGraph } from '@/lib/schema'
import JourneyFlightPath from '@/components/JourneyFlightPath'
import { GlowCard } from '@/components/ui/spotlight-card'
import PremiumFooter from '@/components/PremiumFooter'
import GlobalRouteMap from '@/components/GlobalRouteMap'
import ProgramGrid from '@/components/ProgramGrid'
import MediaSection from '@/components/MediaSection'
import useFormValidation from '@/hooks/useFormValidation'
import { validateName, validatePhone, validateEmailRequired, validatePincode } from '@/utils/validation'
import FormField from '@/components/FormField'
import SubmitButton from '@/components/SubmitButton'

// Premium FX components — pure UI, no backend dependencies
import {
  RouteProgress,
  CockpitHUD,
  AmbientRadial,
  HeroLayers,
  StatReveal,
  AirlineMarquee,
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
   FLOATING NAV - Light glassmorphism pill
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
            maxWidth: scrolled ? '1280px' : '1560px',
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
          <div className="desktop-only-flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
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
              alignItems: 'center', gap: '0.375rem',
              borderRadius: '999px', background: 'var(--navy)', color: '#fff',
              fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'var(--font-h)',
              paddingLeft: '1rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem',
              border: 'none', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
          >
            Enrol Now
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
              background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(30px)',
              display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem',
              overflow: 'hidden',
            }}
          >
            {/* Watermark arc background */}
            <div style={{ position: 'absolute', right: '-15%', bottom: '15%', opacity: 0.03, color: 'var(--navy)', pointerEvents: 'none', zIndex: 1 }} aria-hidden="true">
              <svg width="360" height="360" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="20" cy="20" r="19" />
                <path d="M8 32 Q18 20 30 10" />
              </svg>
            </div>

            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo-primary.webp" alt="Airborne Aviation Academy" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  border: 'none', color: 'var(--navy)', cursor: 'pointer',
                  width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(0,39,76,0.05)',
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
                { label: 'Mentor', sub: 'Capt. Navrang Singh', href: '#founder', prefix: '02' },
                { label: 'Stories', sub: 'Our success roster', href: '#stories', prefix: '03' },
                { label: 'About', sub: 'Dwarka Centre details', href: '/about', prefix: '04' },
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
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.625rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        {l.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(0,39,76,0.5)', marginTop: '0.25rem', fontFamily: 'var(--font-b)' }}>
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
                Enrol Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(0,39,76,0.5)', marginTop: '0.5rem' }}>
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
   HERO - Editorial full-screen, parallax
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

function HeroChapter({ onBook }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.03])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  return (
    <section
      id="top"
      ref={ref}
      className="hero-section"
      style={{ position: 'relative', height: '100svh', minHeight: '640px', width: '100%', overflow: 'hidden', background: 'var(--navy-deep)' }}
    >
      <motion.div className="hero-parallax-bg" style={{ y: yBg, scale, position: 'absolute', inset: 0, willChange: 'transform' }}>
        <Image
          src="/footage/hero-cockpit.jpg"
          alt="Sunrise from a commercial cockpit above the clouds - Airborne Aviation Academy"
          fill
          priority
          fetchPriority="high"
          quality={82}
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
          sizes="100vw"
        />
        {/* Readability stack: base wash + left rail + bottom fade */}
        <div className="hero-overlay-base" aria-hidden />
        <div className="hero-overlay-rail" aria-hidden />
        <div className="hero-overlay-bottom" aria-hidden />
        <HeroLayers />
      </motion.div>

      <motion.div
        className="hero-content-container container-fluid"
        style={{ y: textY, opacity: fade, position: 'relative', zIndex: 10, display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="hero-eyebrow"
        >
          <span className="hero-eyebrow-rule" aria-hidden />
          <span>Airborne Aviation · Dwarka, Delhi · Est. 2009</span>
        </motion.div>

        <h1 className="hero-headline">
          <RevealLine delay={0.2}>From Classroom</RevealLine>
          <RevealLine delay={0.4}>
            To <span className="hero-headline-accent">Cockpit</span>
          </RevealLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="hero-tagline"
        >
          Ab India Bharega Udaan
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.75 }}
          className="hero-footer-wrapper"
        >
          <p className="hero-support">
            India&apos;s most disciplined DGCA ground school for CPL &amp; ATPL. Mentor-led training under
            Capt. Navrang Singh - clearing exams, building careers, restarting dreams.
          </p>

          <div className="hero-btn-container">
            <Magnetic>
              <button
                type="button"
                onClick={onBook}
                className="reserve-seat-btn"
                aria-label="Enrol now at Airborne Aviation"
              >
                Enrol Now
                <span className="reserve-seat-arrow" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </span>
              </button>
            </Magnetic>
            <a href="/courses" className="hero-secondary-cta">
              Explore Courses
            </a>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-cue"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <span>Scroll</span>
        <span className="hero-scroll-line" />
      </motion.div>

      <CockpitHUD />
    </section>
  )
}

/* ─────────────────────────────────────
   BOARDING STRIP - Animated stats below hero
───────────────────────────────────── */
function BoardingStrip() {
  const stats = [
    { value: 15, suffix: '+', label: 'Years mentoring pilots' },
    { value: 5, suffix: '/5', label: 'DGCA papers cleared in 3 months' },
    { value: 2500, suffix: '+', label: 'Students sent to the cockpit' },
    { value: 100, suffix: '%', label: 'Mentor-led batches' },
  ]
  return (
    <section className="boarding-strip-wrap" style={{ position: 'relative', zIndex: 20, padding: '0 clamp(1.5rem,5vw,4rem)' }}>
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
   FOUNDER - Dark navy, stat grid
───────────────────────────────────── */
function FounderSection() {
  return (
    <section id="founder" style={{ position: 'relative', padding: 'clamp(3.5rem,8vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--paper)', color: 'var(--ink)', overflow: 'hidden' }}>
      {/* Ambient background glow */}
      <div
        className="animate-drift"
        aria-hidden
        style={{
          position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 20% 30%, var(--red) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--gold) 0%, transparent 35%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="responsive-grid-founder container-xl" style={{ position: 'relative' }}>
        {/* Left: Text content */}
        <div>
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>The Mentor</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', color: 'var(--navy)' }}>
            Capt. Navrang <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Singh.</span>
          </h2>
          <p style={{ marginTop: '1.5rem', color: 'rgba(33,33,33,0.75)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem', fontFamily: 'var(--font-b)' }}>
            Capt. Navrang Singh strips DGCA syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RTR - taught the way you'll actually use them in the cockpit.
          </p>

          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(0,39,76,0.08)', maxWidth: '28rem', width: '100%' }}>
            {[
              ['15+', 'Years teaching'],
              ['2,500+', 'Students mentored'],
              ['5/5', 'Papers, first attempt'],
              ['36', 'Oldest restart, Air India'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#ffffff', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.875rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.04em' }}>{k}</div>
                <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(33,33,33,0.5)', marginTop: '0.25rem' }}>{v}</div>
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
            alt="Capt. Navrang Singh - Chief Instructor, Airborne Aviation Academy"
            style={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,39,76,0.85) 0%, transparent 60%)' }} />
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
   THE SUCCESS CLUB - live testimonials from API only
───────────────────────────────────── */
function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [students, setStudents] = useState([])
  const carouselRef = useRef(null)

  useEffect(() => {
    fetch('/api/public-proxy/testimonials?limit=6')
      .then(r => { if (!r.ok) throw new Error('fail'); return r.json() })
      .then(d => {
        if (d.data && Array.isArray(d.data) && d.data.length > 0) {
          setStudents(d.data.map((t) => ({
            name: t.authorName || 'Airborne Alumnus',
            image: t.metadata?.image || '',
          })))
        }
      })
      .catch(() => {
        // Keep empty — do not seed curated roster as live API data
      })
  }, [])

  if (students.length < 3) {
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
      <div className="container-xl">
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
            {students.map((s, i) => (
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
            {students.map((_, i) => (
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
  { q: 'What is the eligibility to join CPL ground school at Airborne?', a: 'Class 12 with Physics and Mathematics. You must also hold or be eligible for a DGCA Class 2 Medical. Age 17+ at time of first solo flight. No prior aviation experience required.' },
  { q: 'How long is the CPL ground school program?', a: "Airborne's CPL ground school runs 3–6 months for the full DGCA subject battery. Complete CPL with flying takes 12–18 months. Batches are capped at 25 students. Weekend and weekday batches available from our Dwarka, Delhi campus." },
  { q: 'What is the fee for CPL ground school?', a: 'CPL ground school at Airborne is ₹2,70,000. This covers all DGCA subjects, study materials, and viva preparation. Flying training (done at an FTO of your choice) is a separate cost - speak to our admissions team for current FTO tie-up rates.' },
  { q: 'Where is Airborne Aviation Academy located?', a: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi 110075. Contact: +91 9953 777 320.' },
  { q: 'What are the office hours?', a: 'Monday to Saturday, 9:30 AM – 6:00 PM. Closed on Sundays.' },
  { q: 'Can I do CPL and ATPL ground school together?', a: 'Yes, and Airborne recommends it. The CPL and ATPL syllabi overlap significantly in Air Navigation, Meteorology, and Technical subjects. Completing both together improves exam efficiency and reduces total preparation time.' },
  { q: 'What airlines have Airborne graduates joined?', a: 'Airborne graduates have joined IndiGo, Air India, Akasa Air, SpiceJet, Air Asia India, Alliance Air, and regional operators. The academy has been training aspiring pilots in Dwarka since 2009.' },
]

const homePageGraph = buildHomeGraph(HOME_FAQS)

function HomepageFAQ() {
  const [open, setOpen] = useState(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ padding: '6rem var(--margin)', background: '#ffffff', borderTop: '1px solid rgba(0,39,76,0.08)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="container-md"
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '1rem' }}>
            QUESTIONS & ANSWERS
          </span>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.1', color: 'var(--navy)', margin: 0 }}>
            Frequently Asked <span style={{ color: '#D8A027' }}>Questions</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          {HOME_FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < HOME_FAQS.length - 1 ? '1px solid rgba(0,39,76,0.08)' : 'none' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', background: open === i ? 'rgba(216,160,39,0.04)' : 'transparent', border: 'none', cursor: 'pointer', padding: '1.4rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', textAlign: 'left', transition: 'background 0.2s' }}
              >
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 700, color: open === i ? '#D8A027' : 'var(--navy)', lineHeight: '1.4', flex: 1 }}>{faq.q}</span>
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
                    <p style={{ margin: 0, padding: '0 1.75rem 1.4rem 1.75rem', fontSize: '0.875rem', color: 'rgba(33,33,33,0.7)', lineHeight: '1.75' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────
   FINAL CTA - Preserves existing /api/lead integration
───────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['15%', '-15%'])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { values, errors, touched, handleChange, handleBlur, validate } = useFormValidation(
    { name: '', phone: '', email: '', pincode: '' },
    { name: validateName, phone: validatePhone, email: validateEmailRequired, pincode: validatePincode }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    const urlParams = new URLSearchParams(window.location.search)
    const utm_source = urlParams.get('utm_source') || undefined
    const utm_medium = urlParams.get('utm_medium') || undefined
    const utm_campaign = urlParams.get('utm_campaign') || undefined
    const utm_term = urlParams.get('utm_term') || undefined
    const utm_content = urlParams.get('utm_content') || undefined
    const referrer = document.referrer || undefined
    const landing_page = window.location.href || undefined
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, course: 'DGCA CPL Ground School', source: 'Homepage Final CTA', utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page })
      })
      if (!res.ok) throw new Error('Lead submit failed')
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again or call +91 99537 77320.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="cta" ref={ref} style={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', background: 'var(--paper)', color: 'var(--ink)' }}>
      <motion.div style={{ y: bgY, position: 'absolute', inset: 0, opacity: 0.25 }}>
        <img src="/footage/clouds-above.jpg" alt="" style={{ height: '100%', width: '100%', objectFit: 'cover' }} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--paper) 0%, rgba(249,250,251,0.5) 25%, transparent 60%, var(--paper) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
      </motion.div>

      <div className="cta-content-wrapper container-xl" style={{ position: 'relative', padding: 'clamp(5rem,10vw,12rem) clamp(1.25rem,5vw,4rem)' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>Final boarding</div>

          <h2 className="display-xl" style={{ fontSize: 'clamp(2.25rem,7.5vw,6.5rem)', lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--navy)', maxWidth: '14ch' }}>
            Your <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>cockpit</span> is waiting.
          </h2>

          <p style={{ marginTop: '1.5rem', color: 'rgba(33,33,33,0.75)', maxWidth: '38rem', fontSize: 'clamp(0.9375rem,1.5vw,1.05rem)', lineHeight: 1.7, fontFamily: 'var(--font-b)' }}>
            Visit our Dwarka center, sit in on a class, meet Capt. Navrang. No pressure.
            Just an honest look at the system that's been sending pilots into airline cockpits for fifteen years.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', border: '1px solid rgba(0,39,76,0.08)', borderRadius: '1.25rem', background: '#ffffff', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '0.8rem' }}>Application Received</div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '0.6rem' }}>We'll contact you within 24 hours.</div>
              <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.9rem', color: 'rgba(33,33,33,0.65)', marginBottom: '2rem' }}>Capt. Navrang Singh's team · Dwarka, New Delhi</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <a href="tel:+919953777320" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', border: '1px solid rgba(0,39,76,0.15)', color: 'var(--navy)', textDecoration: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>📞 Call Us</a>
                <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>💬 WhatsApp</a>
                <a href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.6rem', background: 'var(--red)', color: '#fff', textDecoration: 'none', fontSize: '0.9375rem', fontFamily: 'var(--font-h)', fontWeight: 700 }}>Explore Courses →</a>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="cta-form"
              noValidate
            >
              <FormField
                id="cta-name"
                type="text"
                placeholder="Full name"
                value={values.name}
                onChange={(v) => handleChange('name', v)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : null}
                required
              />
              <FormField
                id="cta-phone"
                type="tel"
                placeholder="Mobile number"
                value={values.phone}
                onChange={(v) => handleChange('phone', v)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : null}
                required
                maxLength={10}
              />
              <FormField
                id="cta-email"
                type="email"
                placeholder="Email address"
                value={values.email}
                onChange={(v) => handleChange('email', v)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : null}
                required
              />
              <FormField
                id="cta-pincode"
                type="text"
                placeholder="PIN code / Zip code"
                value={values.pincode}
                onChange={(v) => handleChange('pincode', v)}
                onBlur={() => handleBlur('pincode')}
                error={touched.pincode ? errors.pincode : null}
                required
                maxLength={6}
              />
              <SubmitButton
                type="submit"
                loading={loading}
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  borderRadius: '0.6rem', background: 'var(--red)', color: '#fff',
                  padding: '0.875rem 2rem', fontSize: '0.95rem', fontWeight: 700,
                  fontFamily: 'var(--font-h)', letterSpacing: '0.02em',
                  border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                  whiteSpace: 'nowrap', height: '3.25rem',
                  boxShadow: '0 8px 20px rgba(219, 39, 39, 0.4)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >
                <>Reserve seat <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></>
              </SubmitButton>
            </form>
          )}
          {submitError && (
            <p role="alert" style={{ marginTop: '1rem', color: '#fecaca', fontSize: '0.875rem', fontFamily: 'var(--font-b)' }}>
              {submitError}
            </p>
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
   BOOKING MODAL - Preserved intact, connects to /api/lead
───────────────────────────────────── */
function BookingModal({ open, onClose }) {
  const [status, setStatus] = useState('idle')

  const { values, errors, touched, handleChange, handleBlur, validate, setValues } = useFormValidation(
    { name: '', phone: '', email: '', pincode: '' },
    { name: validateName, phone: validatePhone, email: validateEmailRequired, pincode: validatePincode }
  )

  const handleClose = useCallback(() => {
    setStatus('idle')
    setValues({ name: '', phone: '', email: '', pincode: '' })
    onClose()
  }, [onClose, setValues])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')
    const urlParams = new URLSearchParams(window.location.search)
    const utm_source = urlParams.get('utm_source') || undefined
    const utm_medium = urlParams.get('utm_medium') || undefined
    const utm_campaign = urlParams.get('utm_campaign') || undefined
    const utm_term = urlParams.get('utm_term') || undefined
    const utm_content = urlParams.get('utm_content') || undefined
    const referrer = document.referrer || undefined
    const landing_page = window.location.href || undefined
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, course: 'DGCA CPL Ground School', source: 'Homepage Modal', utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page })
      })
      if (!res.ok) throw new Error('Lead submit failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [handleClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
          className="booking-modal-overlay"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="booking-modal-card"
          >
            <button onClick={handleClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(0,39,76,0.3)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '1rem' }}>Confirmed</div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '0.8rem' }}>Demo Seat Reserved</div>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.85rem', color: 'rgba(33,33,33,0.7)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Our admissions team will reach out within 24 hours to confirm your demo class schedule with Capt. Navrang Singh.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  <a href="tel:+919953777320" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.2)', color: 'var(--navy)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>📞 Call Us</a>
                  <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>💬 WhatsApp</a>
                  <a href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', background: 'var(--red)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>Explore Courses →</a>
                </div>
              </div>
            ) : status === 'error' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '1rem' }}>Failed</div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: '0.8rem' }}>Could not reserve seat</div>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.85rem', color: 'rgba(33,33,33,0.7)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Please try again, or call / WhatsApp admissions directly.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  <button type="button" onClick={() => setStatus('idle')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.2)', color: 'var(--navy)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>Try again</button>
                  <a href="tel:+919953777320" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.2)', color: 'var(--navy)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>Call Us</a>
                  <a href="https://wa.me/919953777320" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-h)' }}>WhatsApp</a>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <span style={{ width: '20px', height: '1px', background: 'var(--red)', display: 'block' }} />
                  <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.24em', color: 'var(--red)', textTransform: 'uppercase' }}>Free Demo Class</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', lineHeight: 1.05, marginBottom: '0.8rem' }}>
                  Reserve Your<br />Demo Seat.
                </h3>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.82rem', color: 'rgba(33,33,33,0.6)', lineHeight: 1.65, marginBottom: '2rem' }}>
                  A 90-minute introduction with Capt. Navrang Singh. Free, no commitment.
                </p>
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,39,76,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <FormField
                    id="m-name"
                    type="text"
                    placeholder="Full Name"
                    value={values.name}
                    onChange={(v) => handleChange('name', v)}
                    onBlur={() => handleBlur('name')}
                    error={touched.name ? errors.name : null}
                    required
                  />
                  <FormField
                    id="m-phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={values.phone}
                    onChange={(v) => handleChange('phone', v)}
                    onBlur={() => handleBlur('phone')}
                    error={touched.phone ? errors.phone : null}
                    required
                    maxLength={10}
                  />
                  <FormField
                    id="m-email"
                    type="email"
                    placeholder="Email Address"
                    value={values.email}
                    onChange={(v) => handleChange('email', v)}
                    onBlur={() => handleBlur('email')}
                    error={touched.email ? errors.email : null}
                    required
                  />
                  <FormField
                    id="m-pincode"
                    type="text"
                    placeholder="PIN Code / Zip Code"
                    value={values.pincode}
                    onChange={(v) => handleChange('pincode', v)}
                    onBlur={() => handleBlur('pincode')}
                    error={touched.pincode ? errors.pincode : null}
                    required
                    maxLength={6}
                  />
                  <SubmitButton
                    type="submit"
                    loading={status === 'loading'}
                    disabled={status === 'loading'}
                    style={{
                      fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      background: 'var(--red)', color: '#fff',
                      border: 'none', padding: '1.2rem 1.4rem',
                    }}
                  >
                    Reserve Seat →
                  </SubmitButton>
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
   PREMIUM CURSOR - Preserved intact
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
   AIRBORNE ADVANTAGE - 17 items grid
───────────────────────────────────── */
function AirborneAdvantage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef(null)
  const autoPlayTimerRef = useRef(null)
  const resumeTimeoutRef = useRef(null)

  // 4 Themed Categories (PDF Section 5.8 Specification)
  const categorizedBenefits = [
    {
      category: 'LEARN',
      subheadline: "World-class instruction by India's most experienced CPL ground school instructor.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      benefits: [
        { title: 'Founder-Led Instruction', desc: 'All 5 DGCA papers taught directly by Capt. Navrang - no junior staff on core subjects.' },
        { title: 'Personalized Pacing', desc: 'Classes paced to your speed, not the average student.' },
        { title: '1-on-1 Mentorship', desc: 'Individual doubt-solving sessions with Capt. Navrang until the concept is clear.' },
        { title: 'CPL Test Series', desc: 'Full DGCA mock exam series - first-attempt preparation only.' },
        { title: 'Life-Long Career Guidance', desc: 'Support beyond CPL - type rating, airline applications.' },
      ]
    },
    {
      category: 'PREPARE',
      subheadline: 'Every resource you need to go from theory to cockpit.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
      benefits: [
        { title: 'Airbus A320 Simulator', desc: 'In-house Airbus A320 FTD Level 5 simulator for cockpit familiarization.' },
        { title: 'Dedicated RTR Lab', desc: 'Dedicated RTR Lab - simulated RT communication environment.' },
        { title: 'Airline Interview Prep', desc: 'GD & PI masterclass by Rajeet Khalsa, retired Air India AGM (37+ years).' },
        { title: 'Psychomotor Prep', desc: 'CASS / COMPASS / ADAPT psychomotor test preparation.' },
      ]
    },
    {
      category: 'YOUR CAMPUS',
      subheadline: '5,000 sq ft purpose-built aviation training centre, Dwarka.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      benefits: [
        { title: 'Student Library', desc: 'Student library - open after class hours.' },
        { title: 'Campus Cafeteria', desc: 'On-campus cafeteria and lounge area.' },
        { title: 'Class 2 Medical Desk', desc: 'In-house Class II medical facility at the centre.' },
        { title: 'Hostel Support', desc: 'Hostel assistance for outstation students.' },
        { title: 'Goodies for Every Student', desc: 'Bag, keychain, notebook, pen, and T-shirt for every student.' },
        { title: 'Own the Study Material', desc: 'All course material provided and kept by students.' },
        { title: 'Gender-Specific Washrooms', desc: 'Separate washroom facilities for all students.' },
      ]
    },
    {
      category: 'FOR PARENTS',
      subheadline: 'You invested in this. You deserve to stay informed.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      benefits: [
        { title: 'Smart Attendance', desc: 'Attendance notifications to parents when ward checks in/out of the institute.' },
        { title: 'Performance Reports', desc: 'Weekly mock exam and progress reports delivered to parents.' },
        { title: 'Education Loan Support', desc: 'Dedicated loan support via banking partners (SBI, Axis & HDFC).' },
        { title: 'Parent Counselling Call', desc: 'Pre-enrolment parent counselling call with admissions team.' },
      ]
    }
  ]

  const scrollToCard = useCallback((index) => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const containerWidth = container.clientWidth
    const cardWidth = containerWidth
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    })
  }, [])

  const stopAutoplay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
  }, [])

  const startAutoplay = useCallback(() => {
    stopAutoplay()
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return
    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % categorizedBenefits.length
        scrollToCard(nextIndex)
        return nextIndex
      })
    }, 3500)
  }, [stopAutoplay, scrollToCard, categorizedBenefits.length])

  useEffect(() => {
    if (!isPaused) {
      startAutoplay()
    } else {
      stopAutoplay()
    }
    return () => stopAutoplay()
  }, [isPaused, startAutoplay, stopAutoplay])

  useEffect(() => {
    return () => {
      stopAutoplay()
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [stopAutoplay])

  const handleScroll = () => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth
    const cardWidth = containerWidth
    const index = Math.round(scrollLeft / Math.max(cardWidth, 1))
    setActiveIndex(Math.min(categorizedBenefits.length - 1, Math.max(0, index)))
  }

  return (
    <section id="advantage" style={{ position: 'relative', padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)', background: 'var(--paper)', color: 'var(--ink)', borderTop: '1px solid rgba(0,39,76,0.08)', overflow: 'hidden' }}>
      
      {/* Styles local block targeting desktop vs mobile views */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Default Styles: Desktop Grid is visible, mobile layout hidden */
        /* Advantage Section Desktop 4-Column Layout */
        .advantage-desktop-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 1.5rem;
          align-items: stretch;
        }

        @media (max-width: 1024px) and (min-width: 768px) {
          .advantage-desktop-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem;
          }
        }

        /* Shared Card Outer Wrapper Override */
        .advantage-card-wrapper {
          padding: 1.625rem 1.375rem !important; /* Top/Bottom: 26px, Left/Right: 22px */
          gap: 0 !important;
          background: #ffffff !important;
          border: 1px solid rgba(0, 39, 76, 0.08) !important;
          border-radius: 14px !important;
          box-shadow: 0 4px 20px rgba(0, 39, 76, 0.04) !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          touch-action: pan-y !important;
        }

        .advantage-card-inner {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
        }

        /* Header Row */
        .advantage-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.875rem;
          height: 40px;
          box-sizing: border-box;
        }

        .advantage-icon-frame {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(216, 160, 39, 0.15) 0%, rgba(216, 160, 39, 0.02) 100%);
          border: 1px solid rgba(216, 160, 39, 0.25);
          color: var(--gold);
          box-shadow: 0 4px 12px rgba(216, 160, 39, 0.08);
          margin-bottom: 0;
        }

        .advantage-card-title {
          font-family: var(--font-h);
          font-size: 1.0625rem;
          font-weight: 800;
          color: var(--gold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.2;
          white-space: nowrap;
        }

        /* Intro Text Block */
        .advantage-card-subheadline {
          font-family: var(--font-b);
          font-size: 0.8125rem;
          color: rgba(33, 33, 33, 0.7);
          line-height: 1.5;
          margin-top: 0;
          margin-bottom: 1.25rem;
          min-height: 2.625rem;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .advantage-card-subheadline {
            height: 2.625rem;
          }
        }

        /* Divider Line */
        .advantage-card-divider {
          width: 100%;
          height: 1px;
          background-color: rgba(0, 39, 76, 0.08);
          margin-bottom: 1.25rem;
          flex-shrink: 0;
        }

        /* Benefit List & Item Structure */
        .advantage-card-benefits {
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
          flex: 1;
        }

        .advantage-benefit-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .advantage-benefit-icon-col {
          width: 20px;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .advantage-benefit-icon {
          font-size: 1.05rem;
          color: var(--gold);
          margin-top: 1px;
          line-height: 1;
        }

        .advantage-benefit-content-col {
          flex: 1;
          min-width: 0;
        }

        .advantage-benefit-title {
          font-family: var(--font-h);
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--navy);
          text-transform: uppercase;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
        }

        .advantage-benefit-desc {
          font-family: var(--font-b);
          font-size: 0.8125rem;
          color: rgba(33, 33, 33, 0.65);
          line-height: 1.5;
          margin: 0;
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
            background: linear-gradient(to left, var(--paper) 0%, transparent 100%);
            pointer-events: none;
            z-index: 10;
          }

          .advantage-carousel {
            display: flex;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-x pan-y;
            overscroll-behavior-x: contain;
            scroll-behavior: smooth;
            gap: 0;
            padding: 1.5rem 0 2rem;
            margin-bottom: 0.5rem;
          }

          .advantage-carousel::-webkit-scrollbar {
            display: none;
          }

          /* One full screen per swipe */
          .advantage-card-mobile {
            flex: 0 0 100%;
            scroll-snap-align: start;
            background: #ffffff;
            border: 1px solid rgba(0, 39, 76, 0.08);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 16px;
            padding: 2.25rem 1.75rem;
            box-shadow: 0 10px 30px rgba(0, 39, 76, 0.04);
            transition: border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
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
            color: var(--navy);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.6rem;
          }

          .advantage-mobile-desc {
            font-family: var(--font-b);
            font-size: 0.8125rem;
            color: rgba(33, 33, 33, 0.7);
            line-height: 1.6;
          }

          /* Bouncing swipe hint */
          .swipe-hint-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.7rem;
            color: var(--red);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 700;
            opacity: 0.8;
            animation: pulseHint 2s infinite ease-in-out;
            margin-bottom: 1.25rem;
          }

          @keyframes pulseHint {
            0%, 100% { transform: translateX(0); opacity: 0.6; }
            50% { transform: translateX(5px); opacity: 1; }
          }
        }
      ` }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem', fontWeight: 700 }}>Exclusive Benefits</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: 'var(--navy)', textTransform: 'uppercase' }}>
            The Airborne <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Advantage.</span>
          </h2>
          <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '36rem', margin: '1.5rem auto 0', fontFamily: 'var(--font-b)' }}>
            What you get when you train at India's premier ground preparation academy. Every facility is built to support your launch.
          </p>
        </div>

        {/* 1. Desktop Layout (4 Themed Category Cards Grid) */}
        <div className="advantage-desktop-grid">
          {categorizedBenefits.map((cat, i) => (
            <GlowCard 
              key={i} 
              customSize={true}
              glowColor="gold"
              className="advantage-card-wrapper h-full"
              style={{
                '--backdrop': '#ffffff',
                '--backup-border': 'rgba(0,39,76,0.08)',
                color: 'var(--navy)'
              }}
            >
              <div className="advantage-card-inner">
                <div className="advantage-card-header">
                  <div className="advantage-icon-frame">
                    {cat.icon}
                  </div>
                  <h3 className="advantage-card-title">
                    {cat.category}
                  </h3>
                </div>
                <p className="advantage-card-subheadline">
                  {cat.subheadline}
                </p>

                <div className="advantage-card-divider" />

                <div className="advantage-card-benefits">
                  {cat.benefits.map((b, j) => (
                    <div key={j} className="advantage-benefit-item">
                      <div className="advantage-benefit-icon-col">
                        <span className="advantage-benefit-icon">✓</span>
                      </div>
                      <div className="advantage-benefit-content-col">
                        <h4 className="advantage-benefit-title">
                          {b.title}
                        </h4>
                        <p className="advantage-benefit-desc">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* 2. Mobile Layout (4 Category Cards Swipe Carousel) */}
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
              onTouchStart={() => {
                setIsPaused(true)
                if (resumeTimeoutRef.current) {
                  clearTimeout(resumeTimeoutRef.current)
                }
              }}
              onTouchEnd={() => {
                if (resumeTimeoutRef.current) {
                  clearTimeout(resumeTimeoutRef.current)
                }
                resumeTimeoutRef.current = setTimeout(() => {
                  setIsPaused(false)
                }, 3500)
              }}
              onMouseEnter={() => {
                setIsPaused(true)
                if (resumeTimeoutRef.current) {
                  clearTimeout(resumeTimeoutRef.current)
                }
              }}
              onMouseLeave={() => {
                if (resumeTimeoutRef.current) {
                  clearTimeout(resumeTimeoutRef.current)
                }
                resumeTimeoutRef.current = setTimeout(() => {
                  setIsPaused(false)
                }, 3500)
              }}
            >
              {categorizedBenefits.map((cat, idx) => (
                <div key={idx} className="advantage-card-mobile">
                  <div className="advantage-icon-frame">
                    {cat.icon}
                  </div>
                  <h3 className="advantage-mobile-title" style={{ color: 'var(--gold)' }}>{cat.category}</h3>
                  <p className="advantage-mobile-desc" style={{ color: 'rgba(33,33,33,0.7)', marginBottom: '1.25rem', fontSize: '0.8125rem', minHeight: '2.5rem' }}>{cat.subheadline}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', borderTop: '1px solid rgba(0,39,76,0.08)', paddingTop: '1rem', flex: 1 }}>
                    {cat.benefits.map((b, j) => (
                      <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--gold)', flexShrink: 0 }}>✓</span>
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{b.title}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'rgba(33,33,33,0.65)', lineHeight: 1.4, fontFamily: 'var(--font-b)' }}>{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators (Dots) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
            {categorizedBenefits.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  scrollToCard(idx)
                  setActiveIndex(idx)
                  setIsPaused(true)
                  if (resumeTimeoutRef.current) {
                    clearTimeout(resumeTimeoutRef.current)
                  }
                  resumeTimeoutRef.current = setTimeout(() => {
                    setIsPaused(false)
                  }, 3500)
                }}
                style={{
                  width: activeIndex === idx ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: activeIndex === idx ? 'var(--navy)' : 'rgba(0,39,76,0.2)',
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
   PILOT CAREER OUTLOOK - Salary & Perks
───────────────────────────────────── */
function PilotCareerOutlook() {
  const stages = [
    { stage: 'Year 1–2', role: 'Junior First Officer (JFO)', salary: '₹1.5L – ₹2.5L', type: 'A320 / B737' },
    { stage: 'Year 3–5', role: 'First Officer', salary: '₹3L – ₹5L', type: 'A320 / B737' },
    { stage: 'Year 6–10', role: 'Senior First Officer', salary: '₹5L – ₹7L', type: 'A320 / B737' },
    { stage: 'Year 10+', role: 'Captain / Commander', salary: '₹8L – ₹15L', type: 'Wide-body / Narrow-body' },
  ]

  const opportunities = [
    { img: '/photos/scheduled-airlines.webp', title: 'Scheduled Airlines', desc: 'Opportunities with leading airlines including IndiGo, Air India, Akasa Air, SpiceJet and more.', bg: '#eef7ff' },
    { img: '/photos/cargo-operations.webp', title: 'Cargo Operations', desc: 'Build your career in cargo operations with Blue Dart and international freight companies.', bg: '#fff5eb' },
    { img: '/photos/corporate-aviation.webp', title: 'Corporate Aviation', desc: 'Work with private jets and VIP transport wings providing premium aviation services.', bg: '#f0f4f8' },
    { img: '/photos/flight-instruction.webp', title: 'Flight Instruction', desc: 'Become an FTO trainer and shape the future of aviation in India and abroad.', bg: '#f0f9eb' },
    { img: '/photos/international-pathways.webp', title: 'International Pathways', desc: 'Explore global career opportunities across Middle East, Southeast Asia, and Europe.', bg: '#f5f0ff' },
  ]

  const perks = [
    {
      img: '/photos/pilot-travel-benefit.webp',
      title: 'Free or heavily discounted travel for self and family',
      desc: 'Enjoy free or discounted air travel benefits for you and your family.',
      bg: '#eef7ff'
    },
    {
      img: '/photos/pilot-health-insurance.webp',
      title: 'Premium health insurance',
      desc: 'Comprehensive health coverage designed to support pilots and their families.',
      bg: '#f0f9eb'
    },
    {
      img: '/photos/pilot-international-exposure.webp',
      title: 'International exposure and layover allowances',
      desc: 'Explore the world with international layovers and attractive allowances.',
      bg: '#f5f0ff'
    },
    {
      img: '/photos/pilot-social-recognition.webp',
      title: 'High social recognition',
      desc: 'Pilots enjoy respect, prestige, and high social standing in society.',
      bg: '#fff5eb'
    },
    {
      img: '/photos/pilot-career-growth.webp',
      title: 'Structured career progression',
      desc: 'Clear career path with growth opportunities and higher responsibilities.',
      bg: '#eef7ff'
    },
    {
      img: '/photos/pilot-accommodation.webp',
      title: 'Accommodation on outstation postings',
      desc: 'Comfortable stay and accommodation provided during outstation duties.',
      bg: '#fff5eb'
    }
  ]

  return (
    <section id="outlook" style={{ position: 'relative', padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)', background: 'var(--paper)', color: 'var(--navy)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Intro */}
        <div style={{ marginBottom: '5rem', display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '1rem', fontWeight: 700 }}>Industry Outlook</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: 'var(--navy)', textTransform: 'uppercase', lineHeight: 1.1 }}>
              Why NOW Is the Best Time to <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--red)' }}>Become a Pilot in India</span>
            </h2>
          </div>
          <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '1rem', lineHeight: 1.8, fontFamily: 'var(--font-b)', margin: 0 }}>
            Indian aviation is at an inflection point. IndiGo, Air India, Akasa Air, and new entrants are collectively placing orders for 1,500+ aircraft over the next decade. Boeing's Pilot Outlook estimates India will need 8,000+ new pilots by 2040. Starting CPL training today means you are ready to fly exactly when the industry needs pilots most.
          </p>
        </div>

        <PilotSupplyGraph />

        {/* Salaries Table */}
        <div style={{ marginBottom: '5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ height: '3px', width: '20px', background: 'var(--red)', flexShrink: 0, marginTop: '0.65rem' }} />
            <span>Pilot Salary &amp; Lifestyle in India 2026</span>
          </h3>

          <style dangerouslySetInnerHTML={{ __html: `
            .salary-desktop-wrapper { display: block; border: 1px solid rgba(0,39,76,0.1); border-radius: 12px; overflow: hidden; }
            .salary-mobile-cards { display: none; }
            
            .job-opportunities-cards-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 1.25rem;
              margin-top: 2rem;
            }
            .perks-cards-grid {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              gap: 1.15rem;
              margin-top: 2rem;
            }
            .job-opportunity-card, .perk-card {
              background: #ffffff;
              border: 1px solid rgba(0, 39, 76, 0.08);
              border-radius: 16px;
              padding: 2.25rem 1.25rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              height: 100%;
              box-sizing: border-box;
            }
            .job-opportunity-card:hover, .perk-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 12px 30px rgba(0, 39, 76, 0.08);
            }
            .job-card-image-wrapper {
              width: 110px;
              height: 110px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.5rem;
            }
            .perk-card-image-wrapper {
              width: 110px;
              height: 110px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.5rem;
              background: transparent;
            }
            .job-card-image, .perk-card-image {
              width: 80%;
              height: 80%;
              object-fit: contain;
            }
            .job-card-title, .perk-card-title {
              font-family: var(--font-h);
              font-size: 0.82rem;
              font-weight: 800;
              color: var(--navy);
              text-transform: uppercase;
              letter-spacing: 0.06em;
              margin-bottom: 0.75rem;
              margin-top: 0;
              line-height: 1.35;
              min-height: 3.3rem;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .job-card-divider, .perk-card-divider {
              width: 24px;
              height: 2px;
              background: var(--red);
              margin-bottom: 1.25rem;
            }
            .job-card-desc, .perk-card-desc {
              font-size: 0.76rem;
              color: rgba(33, 33, 33, 0.65);
              margin: 0;
              font-family: var(--font-b);
              line-height: 1.55;
            }

            @media (max-width: 1300px) {
              .perks-cards-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 1.25rem;
              }
            }

            @media (max-width: 1024px) {
              .job-opportunities-cards-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
              }
            }

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

              .job-opportunities-cards-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.85rem;
              }
              .perks-cards-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.85rem;
              }
            }
            
            @media (max-width: 480px) {
              .job-opportunities-cards-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
              }
              .perks-cards-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
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

        {/* Redesigned Key Pilot Perks Section */}
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(0,39,76,0.08)', paddingTop: '4rem' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ height: '3px', width: '20px', background: 'var(--gold)', display: 'inline-block' }} />
            Key Pilot Perks
          </h3>

          <div className="perks-cards-grid">
            {perks.map((p, idx) => (
              <div key={idx} className="perk-card">
                <div className="perk-card-image-wrapper">
                  <img src={p.img} alt={p.title} className="perk-card-image" />
                </div>
                <h4 className="perk-card-title">{p.title}</h4>
                <div className="perk-card-divider" />
                <p className="perk-card-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Redesigned Job Opportunities Section */}
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(0,39,76,0.08)', paddingTop: '4rem' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ height: '3px', width: '20px', background: 'var(--gold)', display: 'inline-block' }} />
            Job Opportunities
          </h3>
          <p style={{ color: 'rgba(33,33,33,0.65)', fontSize: '0.92rem', lineHeight: 1.6, fontFamily: 'var(--font-b)', marginBottom: '3rem', marginTop: 0, maxWidth: '800px' }}>
            Explore diverse career paths in the aviation industry. From airlines to cargo, corporate aviation to training – your future takes flight here.
          </p>

          <div className="job-opportunities-cards-grid">
            {opportunities.map((o, idx) => (
              <div key={idx} className="job-opportunity-card">
                <div className="job-card-image-wrapper" style={{ background: o.bg }}>
                  <img src={o.img} alt={o.title} className="job-card-image" />
                </div>
                <h4 className="job-card-title">{o.title}</h4>
                <div className="job-card-divider" />
                <p className="job-card-desc">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   CAMPUS & OFFICE GALLERY SECTION
───────────────────────────────────── */
function CampusGallerySection() {
  const [activeTab, setActiveTab] = useState('ambience')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const ambienceImages = [
    { src: '/campus/reception.jpg', title: 'Admissions Desk & Reception' },
    { src: '/campus/classroom_full.jpg', title: 'Main Classroom (Smart Screen)' },
    { src: '/campus/classroom_navrang.jpg', title: 'Interactive Learning Bay' },
    { src: '/campus/office_modern.jpg', title: 'Counselling Office & Lobby' },
  ]

  const trainingImages = [
    { src: '/campus/office.jpg', title: 'Academy Entrance, Ramphal Chowk' },
    { src: '/campus/campus_training.jpg', title: 'Student Interaction Wing' },
    { src: '/campus/campus_facility.jpg', title: 'Modern Center Amenities' },
  ]

  const showcaseImages = [
    { src: '/campus/campus_wide.jpg', title: 'Academy Building (Outside View)' },
    { src: '/campus/a320_sim.jpg', title: 'A320 Simulator Training Room' },
    { src: '/photos/classroom_mentor.jpg', title: 'Airborne Student Group Photo' },
  ]

  const currentImages = activeTab === 'ambience' 
    ? ambienceImages 
    : activeTab === 'training' 
      ? trainingImages 
      : showcaseImages

  return (
    <section id="gallery" style={{ position: 'relative', padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)', background: '#ffffff', color: 'var(--navy)', borderTop: '1px solid rgba(0,39,76,0.08)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '1rem', fontWeight: 700 }}>Ambience Tour</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: 'var(--navy)', textTransform: 'uppercase' }}>
            Dwarka Center <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Gallery.</span>
          </h2>
          <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '36rem', margin: '1rem auto 0', fontFamily: 'var(--font-b)' }}>
            Step inside our 5,000 sq ft state-of-the-art training campus at Ramphal Chowk. Purpose-built infrastructure for modern aviators.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button
            onClick={() => setActiveTab('ambience')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: activeTab === 'ambience' ? 'var(--navy)' : 'rgba(0,39,76,0.04)',
              color: activeTab === 'ambience' ? '#ffffff' : 'var(--navy)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Office Ambience
          </button>
          <button
            onClick={() => setActiveTab('training')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: activeTab === 'training' ? 'var(--navy)' : 'rgba(0,39,76,0.04)',
              color: activeTab === 'training' ? '#ffffff' : 'var(--navy)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Training Highlights
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: activeTab === 'showcase' ? 'var(--navy)' : 'rgba(0,39,76,0.04)',
              color: activeTab === 'showcase' ? '#ffffff' : 'var(--navy)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Center Showcase
          </button>
        </div>

        {/* Images Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1.5rem'
        }}>
          {currentImages.map((img, i) => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', aspectRatio: '16/10', boxShadow: '0 8px 30px rgba(0,39,76,0.06)' }}>
              <img
                src={img.src}
                alt={img.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,8,22,0.8) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {img.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   TRIPLE LINE GRAPH (PILOT SUPPLY IN INDIA)
───────────────────────────────────── */
function PilotSupplyGraph() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0, 39, 76, 0.08)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,39,76,0.04)',
      marginTop: '3rem',
      marginBottom: '4rem',
      fontFamily: 'var(--font-b)'
    }}>
      <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
        <span>Indian Airline Pilot Supply & Airborne Share (2015-2025)</span>
      </h4>
      <p style={{ fontSize: '0.82rem', color: 'rgba(33,33,33,0.65)', lineHeight: 1.6, marginBottom: '2rem' }}>
        Historical expansion of active commercial pilots in Indian airlines compared to Airborne graduates. Airborne Aviation supplies approximately 10% of new pilot placements (1,500 active pilots).
      </p>

      {/* SVG graph container */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox="0 0 800 360" style={{ width: '100%', minWidth: '600px', display: 'block' }}>
          {/* Grid lines */}
          <line x1="80" y1="50" x2="740" y2="50" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="80" y1="110" x2="740" y2="110" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="80" y1="170" x2="740" y2="170" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="80" y1="230" x2="740" y2="230" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="80" y1="290" x2="740" y2="290" stroke="#f1f5f9" strokeWidth="1" />

          {/* Axes */}
          <line x1="80" y1="290" x2="740" y2="290" stroke="rgba(0,39,76,0.15)" strokeWidth="2" />
          <line x1="80" y1="50" x2="80" y2="290" stroke="rgba(0,39,76,0.15)" strokeWidth="2" />

          {/* Axis Labels */}
          <text x="70" y="55" fill="rgba(0,39,76,0.5)" fontSize="10" textAnchor="end" fontWeight="500">15,000</text>
          <text x="70" y="115" fill="rgba(0,39,76,0.5)" fontSize="10" textAnchor="end" fontWeight="500">11,250</text>
          <text x="70" y="175" fill="rgba(0,39,76,0.5)" fontSize="10" textAnchor="end" fontWeight="500">7,500</text>
          <text x="70" y="235" fill="rgba(0,39,76,0.5)" fontSize="10" textAnchor="end" fontWeight="500">3,750</text>
          <text x="70" y="295" fill="rgba(0,39,76,0.5)" fontSize="10" textAnchor="end" fontWeight="500">0</text>

          <text x="80" y="315" fill="rgba(0,39,76,0.6)" fontSize="11" textAnchor="middle" fontWeight="600">2015</text>
          <text x="212" y="315" fill="rgba(0,39,76,0.6)" fontSize="11" textAnchor="middle" fontWeight="600">2017</text>
          <text x="344" y="315" fill="rgba(0,39,76,0.6)" fontSize="11" textAnchor="middle" fontWeight="600">2019</text>
          <text x="476" y="315" fill="rgba(0,39,76,0.6)" fontSize="11" textAnchor="middle" fontWeight="600">2021</text>
          <text x="608" y="315" fill="rgba(0,39,76,0.6)" fontSize="11" textAnchor="middle" fontWeight="600">2023</text>
          <text x="740" y="315" fill="rgba(0,39,76,0.6)" fontSize="11" textAnchor="middle" fontWeight="600">2025</text>

          {/* Line 1: Total Airline Pilots in India (Red) */}
          <path d="M 80 230 Q 212 214 344 182 T 608 134 T 740 110" fill="none" stroke="var(--red)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="230" r="4" fill="var(--red)" />
          <circle cx="212" cy="214" r="4" fill="var(--red)" />
          <circle cx="344" cy="182" r="4" fill="var(--red)" />
          <circle cx="476" cy="174" r="4" fill="var(--red)" />
          <circle cx="608" cy="134" r="4" fill="var(--red)" />
          <circle cx="740" cy="110" r="4" fill="var(--red)" />

          {/* Line 2: Airborne Aviation Alumni (Navy) */}
          <path d="M 80 284 Q 212 281 344 277 T 608 270 T 740 266" fill="none" stroke="var(--navy)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="284" r="4" fill="var(--navy)" />
          <circle cx="212" cy="281" r="4" fill="var(--navy)" />
          <circle cx="344" cy="277" r="4" fill="var(--navy)" />
          <circle cx="476" cy="274" r="4" fill="var(--navy)" />
          <circle cx="608" cy="270" r="4" fill="var(--navy)" />
          <circle cx="740" cy="266" r="4" fill="var(--navy)" />

          {/* Line 3: Airborne Supply Contribution Share (Gold) */}
          <path d="M 80 260 Q 212 245 344 230 T 608 210 T 740 200" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
          <circle cx="80" cy="260" r="4" fill="var(--gold)" />
          <circle cx="212" cy="245" r="4" fill="var(--gold)" />
          <circle cx="344" cy="230" r="4" fill="var(--gold)" />
          <circle cx="476" cy="215" r="4" fill="var(--gold)" />
          <circle cx="608" cy="210" r="4" fill="var(--gold)" />
          <circle cx="740" cy="200" r="4" fill="var(--gold)" />

          <text x="740" y="95" fill="var(--red)" fontSize="11" fontWeight="700" textAnchor="middle">15,000</text>
          <text x="740" y="252" fill="var(--navy)" fontSize="11" fontWeight="700" textAnchor="middle">1,500</text>
          <text x="740" y="185" fill="var(--gold)" fontSize="11" fontWeight="700" textAnchor="middle">10%</text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '3px', background: 'var(--red)' }} />
          <span style={{ color: 'var(--red)' }}>Active Airline Pilots (India)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '3px', background: 'var(--navy)' }} />
          <span style={{ color: 'var(--navy)' }}>Airborne Aviation Alumni (1500 Pilots)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '20px', height: '3px', background: 'var(--gold)', borderTop: '2px dashed var(--gold)' }} />
          <span style={{ color: 'var(--gold)' }}>Airborne Supply Share (10%)</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────
   ROOT PAGE - All sections orchestrated
───────────────────────────────────── */
export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  
  useEffect(() => {
    document.body.classList.add('is-homepage')
    return () => {
      document.body.classList.remove('is-homepage')
    }
  }, [])
  const [is3dMode, setIs3dMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('mode') === '3d'
  })
  const openBooking = useCallback(() => setBookingOpen(true), [])
  const closeBooking = useCallback(() => setBookingOpen(false), [])

  // 3D mode preserved intact
  if (is3dMode) {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000810' }}>
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
      <JsonLd data={homePageGraph} />

      {/* Global FX layers */}
      <RouteProgress />
      <AmbientRadial />
      <PremiumCursor />

      {/* Navigation */}
      <FloatingNav onBook={openBooking} />

      {/* Page sections */}
      <main>
        {/* Hero */}
        <HeroChapter onBook={openBooking} />

        {/* Stats strip */}
        <BoardingStrip />

        {/* Airline partner marquee */}
        <div className="desktop-only-block">
          <AirlineMarquee />
        </div>

        {/* Cinematic flight-path journey — 8 chapters, scroll-driven aircraft */}
        <JourneyFlightPath onBook={openBooking} />

        {/* Global route map — Redesigned */}
        <GlobalRouteMap />

        {/* Media Gallery Section */}
        <MediaSection />

        {/* Program grid — Redesigned 4×2 */}
        <ProgramGrid />

        <AirborneAdvantage />
        <CampusGallerySection />
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
