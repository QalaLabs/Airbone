'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'framer-motion'
import { getLocalBusinessSchema, getEducationalOrgSchema } from '@/utils/seo'

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
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ position: 'relative', display: 'inline-flex', height: '2.25rem', width: '2.25rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--navy)', color: '#fff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ transform: 'rotate(-45deg)', transition: 'transform 0.3s' }} aria-hidden>
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </span>
          <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.9375rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--navy)' }}>
            AIRB<span style={{ color: 'var(--red)' }}>O</span>RNE
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
          Book a class
          <span style={{ display: 'inline-flex', height: '1.5rem', width: '1.5rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </span>
        </button>
      </motion.nav>
    </motion.header>
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
        <img
          src="/footage/hero-cockpit.jpg"
          alt="Sunrise from a commercial cockpit above the clouds"
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          width={1920}
          height={1280}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,8,22,0.4) 0%, rgba(0,8,22,0.2) 40%, rgba(0,8,22,0.95) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,8,22,0.6), transparent, transparent)' }} />
        <HeroLayers />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: fade, position: 'relative', zIndex: 10, margin: '0 auto', display: 'flex', height: '100%', maxWidth: '1280px', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(1.5rem,5vw,4rem) clamp(4rem,8vw,7rem)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2rem' }}
        >
          <span style={{ height: '1px', width: '2.5rem', background: 'var(--red)' }} />
          Dwarka, Delhi · Est. 2010
        </motion.div>

        <h1 style={{ fontFamily: 'var(--font-h)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.92, fontSize: 'clamp(2.6rem,8.5vw,7.5rem)', color: '#fff', maxWidth: '14ch' }}>
          <RevealLine delay={0.2}>From classroom</RevealLine>
          <RevealLine delay={0.4}>
            to <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>cockpit.</span>
          </RevealLine>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', maxWidth: '1100px' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', fontSize: '0.9375rem', lineHeight: 1.7, fontFamily: 'var(--font-b)' }}>
            India's most disciplined DGCA ground school. Mentor-led training under
            Capt. Navrang Singh — clearing 5 papers, building careers, restarting dreams.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                <span style={{ display: 'inline-flex', height: '2rem', width: '2rem', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </span>
              </button>
            </Magnetic>
            <button
              onClick={on3D}
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
    { value: 2700, prefix: '₹', suffix: '+', label: 'Students sent to the cockpit' },
    { value: 100, suffix: '%', label: 'Mentor-led batches' },
  ]
  return (
    <section style={{ position: 'relative', marginTop: '-3.5rem', zIndex: 20, padding: '0 clamp(1.5rem,5vw,4rem)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="glass-nav"
        style={{
          margin: '0 auto', maxWidth: '1100px', borderRadius: '1.75rem',
          boxShadow: 'var(--shadow-float)',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        }}
      >
        {stats.map((s, idx) => (
          <StatReveal
            key={idx}
            value={s.value}
            label={s.label}
            prefix={s.prefix || ''}
            suffix={s.suffix || ''}
            style={{
              padding: 'clamp(1.5rem,3vw,2rem)',
              borderRight: idx % 2 === 0 ? '1px solid rgba(0,39,76,0.1)' : 'none',
              borderBottom: idx < 2 ? '1px solid rgba(0,39,76,0.1)' : 'none',
            }}
          />
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

  return (
    <section
      id={id}
      ref={ref}
      style={{ position: 'relative', padding: 'clamp(6rem,10vw,10rem) clamp(1.5rem,5vw,4rem)', background: bg, color: textColor }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2.5rem,5vw,6rem)', alignItems: 'center' }}>

        {/* Image side */}
        <motion.div
          style={{ y, position: 'relative', aspectRatio: '4/5', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: 'var(--shadow-float)', order: reverse ? 2 : 1 }}
        >
          <motion.img
            style={{ scale: imgScale, position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'cover' }}
            src={image}
            alt={alt}
            loading="lazy"
            width={1600}
            height={2000}
          />
          {imageAccent}
        </motion.div>

        {/* Text side */}
        <div style={{ order: reverse ? 1 : 2 }}>
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
      body="Capt. Navrang Singh strips DGCA syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RT&C — taught the way you'll actually use them in the cockpit."
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
      image="/footage/pilot-portrait.jpg"
      alt="Commercial airline captain in uniform"
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
    <section id="founder" style={{ position: 'relative', padding: 'clamp(7rem,10vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--navy-deep)', color: '#fff', overflow: 'hidden' }}>
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

      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(3rem,6vw,7rem)', alignItems: 'center' }}>
        {/* Left: Text content */}
        <div>
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>The Mentor</div>
          <h2 className="display-xl" style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', color: '#fff' }}>
            Capt. Navrang <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Singh.</span>
          </h2>
          <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem', fontFamily: 'var(--font-b)' }}>
            Fifteen years in the classroom. Thousands of hours simplifying the hardest DGCA papers into the language pilots actually need. No gimmicks. No empty promises. Just the cleanest path from your first concept to your four stripes.
          </p>

          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.1)', maxWidth: '28rem' }}>
            {[
              ['15+', 'Years teaching'],
              ['1000+', 'Students mentored'],
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
            src="/footage/pilot-portrait.jpg"
            alt="Capt. Navrang Singh — Chief Instructor, Airborne Aviation Academy"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
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
const COURSES = [
  { name: 'CPL Ground Classes',      price: '₹2,70,000',    tag: 'Flagship',   lede: 'Full DGCA paper coverage with weekly evaluations.',                    seats: 'Max 25 / batch',   href: '/courses/cpl-ground-classes' },
  { name: 'Cadet Pilot Program',     price: '₹50,000',      tag: 'Cadet',      lede: 'Airline cadet aptitude, screening and interview prep.',               seats: 'Rolling intake',   href: '/courses/cadet-pilot-program' },
  { name: 'GD & PI Mastery',         price: '₹30,000',      tag: 'Interview',  lede: 'Mock panels run by serving line captains.',                           seats: '8 / cohort',       href: '/courses/gd-pi-mastery' },
  { name: 'CASS · COMPASS · ADAPT',  price: '₹30,000',      tag: 'Screening',  lede: 'Pre-screening battery practice on real test patterns.',               seats: 'Live + on-demand', href: '/courses/screening-prep' },
  { name: 'Airline Preparation',     price: '₹1,00,000',    tag: 'Career',     lede: 'End-to-end placement readiness for type-rating slots.',               seats: 'By assessment',    href: '/courses/airline-preparation' },
  { name: 'Airbus A320 SIM',         price: '₹10,000 / hr', tag: 'Simulator',  lede: 'In-house full-procedure simulator sessions.',                         seats: 'Bookable',         href: '/courses/a320-simulator' },
  { name: 'CPL Flying Training',     price: '₹50L+ path',   tag: 'Flying',     lede: 'Logged-hours pathway with partner flight schools.',                   seats: 'Counselling first', href: '/courses/cpl-flying' },
  { name: 'Private Pilot Licence',   price: '₹25,00,000',   tag: 'PPL',        lede: 'Recreational and stepping-stone pilot certification.',                seats: 'Year-round',       href: '/courses/ppl' },
  { name: 'ATPL Ground Classes',     price: '₹1,50,000',    tag: 'ATPL',       lede: 'Captain-track ground school with viva support.',                      seats: 'Quarterly',        href: '/courses/atpl-ground' },
]

function CoursesSection() {
  return (
    <section id="courses" style={{ position: 'relative', padding: 'clamp(7rem,10vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--paper)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '2rem', marginBottom: '4rem', alignItems: 'flex-end' }}>
          <div>
            <div className="chapter-num" style={{ color: 'var(--red)', marginBottom: '1rem' }}>The Manifest</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', color: 'var(--navy)' }}>
              Nine programs. <span style={{ fontStyle: 'italic', fontWeight: 300 }}>One cockpit.</span>
            </h2>
          </div>
          <p style={{ color: 'rgba(33,33,33,0.7)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '28rem', alignSelf: 'flex-end', fontFamily: 'var(--font-b)' }}>
            Every program is mentor-led, seat-capped, and built around a real airline finish line. Pick the chapter where your journey begins.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,39,76,0.1)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(0,39,76,0.1)' }}>
          {COURSES.map((c, i) => (
            <CourseCard key={c.name} c={c} index={i} />
          ))}
        </div>
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6)
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); setHovered(false) }}
      onMouseEnter={() => setHovered(true)}
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
   TESTIMONIALS — White cards, gold quotes
───────────────────────────────────── */
const STORIES = [
  {
    name: 'Ruzal Dhral',
    role: 'IndiGo · Cadet Pilot',
    quote: 'Cleared all five DGCA papers in three months — first attempt. The system here is the difference.',
  },
  {
    name: 'Capt. Nipun Singh',
    role: 'Air India',
    quote: 'Restarted my pilot journey at 36. Capt. Navrang treated the dream as seriously as I did.',
  },
  {
    name: 'Capt. Himanish Sagwal',
    role: 'Emirates',
    quote: 'Honest counselling, disciplined classes. Everything you wish an aviation academy actually was.',
  },
]

function TestimonialsSection() {
  return (
    <section id="stories" style={{ position: 'relative', padding: 'clamp(7rem,10vw,10rem) clamp(1.5rem,5vw,4rem)', background: 'var(--paper)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
          <div>
            <div className="chapter-num" style={{ color: 'var(--red)', marginBottom: '1rem' }}>The Success Club</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(2rem,4.5vw,4rem)', color: 'var(--navy)', maxWidth: '30rem' }}>
              Real names. Real cockpits. <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Real scores.</span>
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {STORIES.map((s, i) => (
            <motion.figure
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              style={{
                position: 'relative', borderRadius: '1.5rem', border: '1px solid rgba(0,39,76,0.1)',
                background: '#fff', padding: '2rem',
                display: 'flex', flexDirection: 'column', gap: '2rem',
                margin: 0,
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-float)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '3.75rem', lineHeight: 1, color: 'var(--gold)', marginBottom: '-1rem' }}>"</div>
              <blockquote style={{ fontSize: '1rem', lineHeight: 1.65, color: 'rgba(33,33,33,0.85)', fontFamily: 'var(--font-h)', fontWeight: 500, margin: 0 }}>
                {s.quote}
              </blockquote>
              <figcaption style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,39,76,0.1)' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--navy)' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--red)', marginTop: '0.25rem' }}>{s.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   FINAL CTA — Preserves existing /api/lead integration
───────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const bgY = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])
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
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, course: 'DGCA CPL Ground School', source: 'Homepage Final CTA' })
      })
    } catch (_) { }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section id="cta" ref={ref} style={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', background: 'var(--navy-deep)', color: '#fff' }}>
      <motion.div style={{ y: bgY, position: 'absolute', inset: 0, opacity: 0.4 }}>
        <img src="/footage/clouds-above.jpg" alt="" style={{ height: '100%', width: '100%', objectFit: 'cover' }} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,8,22,0.7) 0%, rgba(0,8,22,0.4) 50%, var(--navy-deep) 100%)' }} />
      </motion.div>

      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', padding: 'clamp(8rem,12vw,12rem) clamp(1.5rem,5vw,4rem)' }}>
        <motion.div style={{ y, opacity }}>
          <div className="chapter-num" style={{ color: 'var(--gold)', marginBottom: '2rem' }}>Final boarding</div>

          <h2 className="display-xl" style={{ fontSize: 'clamp(2.5rem,8vw,7rem)', color: '#fff', maxWidth: '14ch' }}>
            Your <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>cockpit</span> is waiting.
          </h2>

          <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '36rem', fontSize: '0.9375rem', lineHeight: 1.7, fontFamily: 'var(--font-b)' }}>
            Visit our Dwarka center, sit in on a class, meet Capt. Navrang. No pressure.
            Just an honest look at the system that's been sending pilots into airline cockpits for fifteen years.
          </p>

          {/* ✅ PRESERVED: form posts to /api/lead */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem' }}
            >
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '0.8rem' }}>Application Received</div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginBottom: '0.6rem' }}>We'll contact you within 24 hours.</div>
              <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Capt. Navrang Singh's team · Dwarka, New Delhi</p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-dark"
              style={{ marginTop: '3rem', maxWidth: '720px', borderRadius: '1rem', padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
            >
              <input
                id="cta-name"
                type="text"
                placeholder="Full name"
                required
                style={{ flex: '1 1 180px', background: 'transparent', border: 'none', outline: 'none', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#fff', fontFamily: 'var(--font-b) ' }}
              />
              <input
                id="cta-phone"
                type="tel"
                placeholder="Mobile number"
                required
                style={{ flex: '1 1 180px', background: 'transparent', border: 'none', outline: 'none', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#fff', fontFamily: 'var(--font-b)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
              />
              <input
                id="cta-email"
                type="email"
                placeholder="Email address"
                required
                style={{ flex: '1 1 180px', background: 'transparent', border: 'none', outline: 'none', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#fff', fontFamily: 'var(--font-b)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  borderRadius: '0.75rem', background: 'var(--red)', color: '#fff',
                  padding: '0.875rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-h)',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
              >
                {loading ? 'Sending…' : <>Reserve seat <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg></>}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
            Or call us directly ·{' '}
            <a href="tel:+919953777320" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >+91 9953-777-320</a>
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
      { label: 'CPL Ground', href: '/courses/cpl-ground-classes' },
      { label: 'Cadet Pilot', href: '/courses/cadet-pilot-program' },
      { label: 'ATPL Ground', href: '/courses/atpl-ground' },
      { label: 'A320 SIM', href: '/courses/a320-simulator' },
      { label: 'All Courses', href: '/courses' },
    ]},
    { title: 'Academy', links: [
      { label: 'About Us', href: '/about' },
      { label: 'Capt. Navrang', href: '/about#mentor' },
      { label: 'Dwarka Centre', href: '/contact' },
      { label: 'Jobs Portal', href: '/jobs' },
      { label: 'Resources', href: '/resources' },
    ]},
    { title: 'Connect', links: [
      { label: 'Contact', href: '/contact' },
      { label: 'WhatsApp', href: 'https://wa.me/919953777320' },
      { label: '+91 9953-777-320', href: 'tel:+919953777320' },
    ]},
  ]

  return (
    <footer style={{ position: 'relative', background: 'var(--navy-deep)', color: '#fff', paddingTop: '6rem', paddingBottom: '2.5rem', paddingLeft: 'clamp(1.5rem,5vw,4rem)', paddingRight: 'clamp(1.5rem,5vw,4rem)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '3rem', paddingBottom: '5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h3 className="display-xl" style={{ fontSize: 'clamp(2rem,5vw,4rem)', color: '#fff' }}>
              Built for the <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>serious</span> aspirant.
            </h3>
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '28rem', fontFamily: 'var(--font-b)' }}>
              Airborne Aviation Academy — Ramphal Chowk, Sector 7, Dwarka, New Delhi.<br />
              Open Monday through Saturday, 9 AM to 7 PM.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
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
        <div style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-h)', fontWeight: 900, letterSpacing: '-0.05em', fontSize: 'clamp(4rem,18vw,16rem)', lineHeight: 1, color: 'rgba(255,255,255,0.95)' }}>
            AIRB<span style={{ color: 'var(--red)' }}>O</span>RNE
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          <div>© {new Date().getFullYear()} Airborne Aviation Academy. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>Privacy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>Terms</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>DGCA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────
   WHATSAPP FLOAT — Green pill
───────────────────────────────────── */
function WhatsAppFloat() {
  return (
    <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 40, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <a
        href="https://wa.me/919953777320"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          borderRadius: '999px', background: '#25D366', color: '#fff',
          padding: '0.75rem 1rem', boxShadow: 'var(--shadow-float)',
          textDecoration: 'none', fontFamily: 'var(--font-h)', fontSize: '0.8125rem', fontWeight: 500,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(37,211,102,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-float)' }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span>Chat on WhatsApp</span>
      </a>
    </div>
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
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, course: 'DGCA CPL Ground School', source: 'Homepage Modal' })
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
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,8,22,0.9)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '3rem', maxWidth: '460px', width: '100%', position: 'relative' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '1rem' }}>Confirmed</div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', marginBottom: '0.8rem' }}>Demo Seat Reserved</div>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Our admissions team will reach out within 24 hours to confirm your demo class schedule with Capt. Navrang Singh.</p>
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

        {/* Founder */}
        <FounderSection />

        {/* Pilot wall mosaic */}
        <SuccessMosaic image="/footage/pilot-portrait.jpg" />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Final CTA with /api/lead */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <SiteFooter />

      {/* Floating WhatsApp */}
      <WhatsAppFloat />

      {/* Booking modal with /api/lead — preserved */}
      <BookingModal open={bookingOpen} onClose={closeBooking} />
    </>
  )
}
