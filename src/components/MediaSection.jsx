'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const MEDIA_CARDS = [
  {
    id: 'a320-simulator',
    src: '/images/media/a320-simulator.webp',
    alt: 'Airborne Aviation A320 flight simulator',
    title: 'A320 Simulator',
    desc: 'Experience professional cockpit training in our advanced A320 simulator.'
  },
  {
    id: 'classroom',
    src: '/images/media/classroom.webp',
    alt: 'Students attending classroom training at Airborne Aviation',
    title: 'Interactive Classroom Training',
    desc: 'Learn aviation concepts through expert-led, interactive classroom sessions.'
  },
  {
    id: 'library',
    src: '/images/media/library.webp',
    alt: 'Students studying in the Airborne Aviation library',
    title: 'Aviation Library',
    desc: 'A dedicated learning space for focused study, research, and preparation.'
  },
  {
    id: 'flight-training',
    src: '/footage/cpl-flying-training-cockpit.jpg',
    alt: 'Cockpit flight training at Airborne Aviation',
    title: 'Hands-on Flight Training',
    desc: 'Practical cockpit training and aircraft familiarisation led by experienced instructors.'
  },
  {
    id: 'campus',
    src: '/campus/campus_facility.jpg',
    alt: 'Airborne Aviation campus and training facility',
    title: 'Training Campus',
    desc: 'Modern training infrastructure built around the real demands of an aviation career.'
  },
  {
    id: 'instructors',
    src: '/campus/instructor_teaching.jpg',
    alt: 'Airborne Aviation instructor teaching a class',
    title: 'Expert Faculty',
    desc: 'Learn directly from airline veterans and DGCA-qualified instructors in every core subject.'
  }
]

export default function MediaSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section
      id="media-gallery"
      style={{
        position: 'relative',
        padding: 'clamp(4rem, 8vw, 10rem) clamp(1.5rem, 5vw, 4rem)',
        background: '#ffffff', // white/light background matching the page flow
        overflow: 'hidden'
      }}
    >
      {/* Subtle top border/divider to separate from route map section */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(0, 39, 76, 0.06)',
        }}
      />

      <div ref={ref} className="container-fluid" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '3.5rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}
          >
            <span
              style={{
                height: '1px',
                width: '2rem',
                background: 'var(--red)'
              }}
            />
            <span className="chapter-num" style={{ color: 'var(--red)', textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.25em', fontWeight: 700 }}>
              Inside Airborne
            </span>
          </div>

          <h2
            className="display-xl"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 4rem)',
              color: 'var(--navy)',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              fontWeight: 900,
              margin: '0 0 1rem 0'
            }}
          >
            MEDIA
          </h2>

          <p
            style={{
              color: 'rgba(33, 33, 33, 0.6)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              maxWidth: '36rem',
              fontFamily: 'var(--font-b)',
              margin: 0
            }}
          >
            Explore our training environment, facilities, and hands-on aviation learning experience.
          </p>
        </motion.div>

        {/* Media cards grid */}
        <div className="media-grid-3col">
          {MEDIA_CARDS.map((card, idx) => (
            <MediaCard key={card.id} card={card} index={idx} parentInView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

function MediaCard({ card, index, parentInView }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={parentInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: '2px', // matching ProgramCard's 1px
        border: '1px solid rgba(0, 39, 76, 0.08)',
        boxShadow: hovered
          ? '0 16px 32px rgba(0, 39, 76, 0.08)'
          : '0 2px 8px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        transition: 'box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Image Container with fixed aspect ratio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10.5',
          overflow: 'hidden'
        }}
      >
        <Image
          src={card.src}
          alt={card.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hovered ? 'scale(1.04)' : 'scale(1)'
          }}
        />
      </div>

      {/* Card Content underneath the image */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
            fontWeight: 800,
            color: 'var(--navy)',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            marginTop: 0
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-b)',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            color: 'rgba(33, 33, 33, 0.55)',
            margin: 0
          }}
        >
          {card.desc}
        </p>
      </div>
    </motion.div>
  )
}
