'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const STATIONS = [
  {
    id: 'admissions',
    step: '01',
    tag: 'FIRST LANDING',
    title: 'Admissions & Career Counselling Lounge',
    location: 'E-549, 2nd Floor, Ramphal Chowk, Dwarka',
    description:
      'Begin your journey at our central welcome lounge. Aspiring pilots and parents receive personalized one-on-one career roadmaps, Class 1 & 2 medical advisory, batch scheduling, and transparent CPL financial guidance from our senior academic counsellors.',
    highlights: [
      'One-on-one DGCA CPL career roadmap',
      'Class 1 & 2 aviation medical advisory',
      'Transparent course and flying budget guidance',
      'Batches strictly capped at 25 students',
    ],
    metric: 'Personalized Guidance',
    metricLabel: 'Admissions & Advisory',
    primaryImage: '/campus/reception.jpg',
    secondaryImage: '/campus/office_modern.jpg',
    altPrimary: 'Airborne Aviation Academy admissions reception and counselling lounge in Dwarka',
    altSecondary: 'Modern administrative and counselling office at Airborne Aviation Academy',
  },
  {
    id: 'classrooms',
    step: '02',
    tag: 'THEORY GROUND BAYS',
    title: 'High-Tech Smart Theory Classrooms',
    location: 'Academic Wing · Sector 7 Dwarka',
    description:
      'Airborne classrooms are designed for active, concept-driven learning. Equipped with 4K interactive digital smartboards, acoustic treatment, and ergonomic flight-desk seating, each bay is dedicated to mastering Air Navigation, Meteorology, Air Regulations, and Technical subjects.',
    highlights: [
      'Interactive 4K digital smartboards for chart plotting',
      'Live METAR, TAF, and synoptic chart decoding',
      'Strict 25-student cap ensuring high faculty interaction',
      'Concept-first instruction led by Capt. Navrang Singh',
    ],
    metric: 'Max 25 Cadets',
    metricLabel: 'Strict Batch Limit',
    primaryImage: '/campus/classroom_full.jpg',
    secondaryImage: '/campus/classroom_navrang.jpg',
    altPrimary: 'Main smart classroom with interactive 4K screen at Airborne Aviation Academy',
    altSecondary: 'Capt. Navrang Singh conducting an interactive aviation class',
  },
  {
    id: 'simulator',
    step: '03',
    tag: 'FLIGHT DECK HARDWARE',
    title: 'In-House Airbus A320 FTD Simulator Bay',
    location: 'Flight Simulator Wing · Dwarka Facility',
    description:
      'The crown jewel of our Dwarka training campus. Our in-house Airbus A320 Fixed Base Flight Training Device (FTD) lets cadets sit inside a true-to-scale glass cockpit. Practice Standard Operating Procedures (SOPs), FMGS programming, ECAM drills, and multi-crew coordination long before airline type rating.',
    highlights: [
      'Dual sidestick and throttle quadrant controls',
      'High-fidelity PFD, ND, and ECAM instrumentation',
      'Standard Airline Operating Procedures (SOPs) drills',
      'Cadet assessment screening and interview prep',
    ],
    metric: 'Airbus A320 FTD',
    metricLabel: 'Level 5 In-House Trainer',
    primaryImage: '/campus/a320_sim.jpg',
    secondaryImage: '/images/media/a320-simulator.webp',
    altPrimary: 'Airbus A320 fixed base flight simulator training room at Airborne Aviation',
    altSecondary: 'Cadet practicing cockpit procedures on the A320 simulator',
  },
  {
    id: 'library',
    step: '04',
    tag: 'DEEP STUDY ZONE',
    title: 'Aviation Library & Question-Bank Drill Zone',
    location: 'Study & Research Pods · Dwarka',
    description:
      'A quiet, focused environment dedicated to intensive exam preparation. The library hosts archived DGCA past exam papers (maintained since 2009), Oxford Aviation training manuals, Jeppesen route charts, and quiet study desks for daily timed mock examinations.',
    highlights: [
      'DGCA question bank archives maintained since 2009',
      'Official Jeppesen airway manuals and navigation charts',
      'Daily timed mock tests under simulated exam pressure',
      'Quiet individual study pods with faculty doubt clearing',
    ],
    metric: 'Since 2009',
    metricLabel: 'DGCA Question Archives',
    primaryImage: '/images/media/library.webp',
    secondaryImage: '/campus/campus_facility.jpg',
    altPrimary: 'Airborne Aviation dedicated aviation library and study facility',
    altSecondary: 'Modern study environment and amenities at Airborne Aviation',
  },
  {
    id: 'mentorship',
    step: '05',
    tag: 'COCKPIT MENTORSHIP',
    title: 'Faculty Mentorship & Pre-Flight Briefing Bay',
    location: 'Mentorship & Alumni Wing · Dwarka',
    description:
      'Where theory meets airline standards. Senior instructors and active airline captains conduct pre-flight briefings, debriefings, and group discussions (GD/PI). Surrounded by the alumni flight wall, cadets build the professional mindset and discipline required in modern airline cockpits.',
    highlights: [
      'Direct guidance from active airline captains',
      'Airline-style pre-flight briefing and debriefing sessions',
      'Structured Group Discussion (GD) & Personal Interview staging',
      'Alumni flight wall showcasing graduates across major airlines',
    ],
    metric: 'Active Captains',
    metricLabel: 'Airline Veteran Faculty',
    primaryImage: '/photos/classroom_mentor.jpg',
    secondaryImage: '/campus/campus_training.jpg',
    altPrimary: 'Faculty mentorship and group discussion session at Airborne Aviation',
    altSecondary: 'Student interaction and collaboration bay at Dwarka campus',
  },
]

export default function CampusWalkthroughSection({ onBookTour }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [activePhoto, setActivePhoto] = useState('primary') // 'primary' | 'secondary'
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)

  const current = STATIONS[activeIdx]

  // Handle station change
  const handleSelectStation = (idx) => {
    setActiveIdx(idx)
    setActivePhoto('primary')
    setProgress(0)
  }

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % STATIONS.length)
    setActivePhoto('primary')
    setProgress(0)
  }

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + STATIONS.length) % STATIONS.length)
    setActivePhoto('primary')
    setProgress(0)
  }

  // Auto-play walkthrough effect
  useEffect(() => {
    if (!isAutoPlaying) {
      // Resetting the progress bar when the viewer stops auto-play is the point
      // of this branch; it is not derived render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const intervalMs = 6000
    const stepMs = 50
    let elapsed = 0

    timerRef.current = setInterval(() => {
      elapsed += stepMs
      const pct = Math.min(100, (elapsed / intervalMs) * 100)
      setProgress(pct)

      if (elapsed >= intervalMs) {
        elapsed = 0
        setProgress(0)
        setActiveIdx((prev) => (prev + 1) % STATIONS.length)
        setActivePhoto('primary')
      }
    }, stepMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isAutoPlaying, activeIdx])

  return (
    <section
      id="campus-walkthrough"
      aria-label="Dwarka Training Campus Walkthrough"
      style={{
        position: 'relative',
        padding: 'clamp(3.5rem, 6vw, 6.5rem) clamp(1.25rem, 4vw, 3.5rem)',
        background: '#ffffff',
        color: 'var(--navy)',
        borderTop: '1px solid rgba(0, 39, 76, 0.08)',
        borderBottom: '1px solid rgba(0, 39, 76, 0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        {/* Header Block matching main website flow */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.9rem',
              background: 'rgba(219, 36, 30, 0.06)',
              borderRadius: '999px',
              border: '1px solid rgba(219, 36, 30, 0.18)',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--red)',
                boxShadow: '0 0 8px rgba(219, 36, 30, 0.8)',
              }}
            />
            <span
              style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--red)',
                fontWeight: 800,
                fontFamily: 'var(--font-h)',
              }}
            >
              Virtual Ambience Tour · 5,000 Sq Ft Dwarka Facility
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
              margin: '0 0 1rem 0',
              lineHeight: 1.1,
            }}
          >
            Dwarka Center{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>
              Walkthrough.
            </span>
          </h2>

          <p
            style={{
              color: 'rgba(33, 33, 33, 0.72)',
              fontSize: 'clamp(0.875rem, 1.1vw, 1rem)',
              lineHeight: 1.7,
              maxWidth: '44rem',
              margin: '0 auto',
              fontFamily: 'var(--font-b)',
            }}
          >
            Step inside our 5,000 sq ft state-of-the-art training campus at Ramphal Chowk, Sector 7, Dwarka.
            Explore the exact classrooms, simulator cockpit, and study bays purpose-built for modern aviators.
          </p>

          {/* Quick Facility Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '1.25rem',
              fontSize: '0.75rem',
              color: 'var(--navy)',
              fontFamily: 'var(--font-h)',
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              📍 Ramphal Chowk, Dwarka
            </span>
            <span style={{ color: 'rgba(0, 39, 76, 0.2)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              💺 In-House Airbus A320 FTD
            </span>
            <span style={{ color: 'rgba(0, 39, 76, 0.2)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              👥 Max 25 Cadets / Batch
            </span>
            <span style={{ color: 'rgba(0, 39, 76, 0.2)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              🚇 &lt; 1 km from Palam &amp; Dwarka Sec 9 Metro
            </span>
          </div>
        </div>

        {/* Station Navigation Strip */}
        <div
          role="tablist"
          aria-label="Walkthrough Stations"
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(0, 39, 76, 0.08)',
          }}
        >
          {STATIONS.map((station, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={station.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectStation(idx)}
                style={{
                  flex: '1 0 auto',
                  minWidth: '190px',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '10px',
                  border: isActive
                    ? '1.5px solid var(--navy)'
                    : '1px solid rgba(0, 39, 76, 0.08)',
                  background: isActive ? 'var(--navy)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--navy)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 8px 24px rgba(0, 39, 76, 0.12)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-h)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: isActive ? 'var(--gold)' : 'var(--red)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    STATION {station.step}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 39, 76, 0.05)',
                      color: isActive ? '#ffffff' : 'rgba(0, 39, 76, 0.65)',
                      fontWeight: 700,
                    }}
                  >
                    {station.tag}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {station.title.split(' ')[0]} {station.title.split(' ')[1]}…
                </div>
              </button>
            )
          })}
        </div>

        {/* Walkthrough Stage */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(0, 39, 76, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 39, 76, 0.07)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
            position: 'relative',
          }}
          className="walkthrough-grid"
        >
          {/* Left Column: Visual Viewport */}
          <div
            style={{
              position: 'relative',
              background: '#040d1a',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              overflow: 'hidden',
            }}
          >
            {/* Active Image with crossfade effect */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <Image
                src={activePhoto === 'primary' ? current.primaryImage : current.secondaryImage}
                alt={activePhoto === 'primary' ? current.altPrimary : current.altSecondary}
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                priority
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(4, 13, 26, 0.92) 0%, rgba(4, 13, 26, 0.35) 45%, rgba(4, 13, 26, 0.15) 100%)',
                }}
              />
            </div>

            {/* Top HUD Indicators */}
            <div
              style={{
                position: 'absolute',
                top: '1.25rem',
                left: '1.25rem',
                right: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(4, 13, 26, 0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                  }}
                />
                Station {current.step} / 05 · {current.tag}
              </div>

              {/* Photo View Switcher */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  background: 'rgba(4, 13, 26, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActivePhoto('primary')}
                  style={{
                    border: 'none',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '5px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-h)',
                    cursor: 'pointer',
                    background: activePhoto === 'primary' ? 'var(--gold)' : 'transparent',
                    color: activePhoto === 'primary' ? '#000000' : 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  View 1
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhoto('secondary')}
                  style={{
                    border: 'none',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '5px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-h)',
                    cursor: 'pointer',
                    background: activePhoto === 'secondary' ? 'var(--gold)' : 'transparent',
                    color: activePhoto === 'secondary' ? '#000000' : 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  View 2
                </button>
              </div>
            </div>

            {/* Bottom Caption on Viewport */}
            <div style={{ position: 'relative', zIndex: 2, padding: '1.75rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--gold)',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.3rem',
                }}
              >
                {current.location}
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-h)',
                  lineHeight: 1.25,
                }}
              >
                {activePhoto === 'primary' ? current.altPrimary : current.altSecondary}
              </div>
            </div>
          </div>

          {/* Right Column: Station Details & Interactive Controls */}
          <div
            style={{
              padding: 'clamp(1.75rem, 3vw, 2.75rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}
          >
            <div>
              {/* Header Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--red)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-h)',
                  }}
                >
                  Station {current.step} · {current.tag}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.4rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    background: 'rgba(0, 39, 76, 0.05)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-h)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: 'var(--navy)',
                    }}
                  >
                    {current.metric}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(0, 39, 76, 0.6)' }}>
                    {current.metricLabel}
                  </span>
                </div>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: 'clamp(1.35rem, 2vw, 1.85rem)',
                  fontWeight: 900,
                  color: 'var(--navy)',
                  lineHeight: 1.2,
                  marginBottom: '1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {current.title}
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-b)',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'rgba(33, 33, 33, 0.75)',
                  marginBottom: '1.5rem',
                }}
              >
                {current.description}
              </p>

              {/* Highlights Checklist */}
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(0, 39, 76, 0.5)',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-h)',
                  }}
                >
                  Key Facility Specifications
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                  {current.highlights.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        fontSize: '0.84rem',
                        color: 'var(--navy)',
                        lineHeight: 1.4,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }}
                      >
                        <circle cx="10" cy="10" r="10" fill="rgba(22, 163, 74, 0.12)" />
                        <path
                          d="M6 10l3 3 5-6"
                          stroke="#16a34a"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions & Controls */}
            <div>
              {/* Progress bar for auto-play */}
              {isAutoPlaying && (
                <div
                  style={{
                    height: '3px',
                    width: '100%',
                    background: 'rgba(0, 39, 76, 0.08)',
                    borderRadius: '2px',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: 'var(--red)',
                      transition: 'width 0.05s linear',
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(0, 39, 76, 0.08)',
                }}
              >
                {/* Stepper Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Campus Station"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 39, 76, 0.12)',
                      background: '#ffffff',
                      color: 'var(--navy)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Campus Station"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 39, 76, 0.12)',
                      background: '#ffffff',
                      color: 'var(--navy)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    style={{
                      padding: '0.55rem 0.9rem',
                      borderRadius: '8px',
                      border: isAutoPlaying
                        ? '1px solid var(--red)'
                        : '1px solid rgba(0, 39, 76, 0.12)',
                      background: isAutoPlaying ? 'rgba(219, 36, 30, 0.08)' : '#ffffff',
                      color: isAutoPlaying ? 'var(--red)' : 'var(--navy)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-h)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isAutoPlaying ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        Pause Tour
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Auto Walkthrough
                      </>
                    )}
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => onBookTour && onBookTour('Dwarka Campus Visit')}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--navy)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 39, 76, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--red)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--navy)'
                  }}
                >
                  <span>Book In-Person Campus Visit</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .walkthrough-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
