import { useEffect, useRef } from 'react'

const SCENES = [
  'Dream',
  'Approach',
  'Boarding',
  'Cabin',
  'Cockpit',
  'Takeoff',
  'Above Clouds',
  'Success Stories',
  'Destination',
]

export default function Navigation({ sceneIndex, progress, onDemo }) {
  const navRef = useRef()
  const barRef = useRef()

  // Scrolled state
  useEffect(() => {
    if (navRef.current) {
      navRef.current.classList.toggle('scrolled', window.scrollY > 80)
    }
  }, [sceneIndex])

  useEffect(() => {
    const handler = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 80)
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Progress bar
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${progress})`
    }
  }, [progress])

  const scrollToScene = (idx) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: (idx / SCENES.length) * max, behavior: 'smooth' })
  }

  return (
    <>
      {/* Progress bar */}
      <div ref={barRef} className="scroll-progress-bar" />

      {/* Nav */}
      <nav ref={navRef} className="nav" role="navigation" aria-label="Main navigation">
        {/* Brand logo per Brand Book 2026 */}
        <a href="#dream" className="nav-logo" aria-label="Airborne Aviation Academy home">
          {/* SVG logo: wordmark + aircraft + contrail + focal O */}
          <svg className="nav-logo-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="19" fill="#00274C" />
            {/* Aircraft silhouette ascending at steep angle */}
            <g transform="translate(10,22) rotate(-35)">
              {/* Fuselage */}
              <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#DB241E" />
              {/* Wings */}
              <rect x="-6" y="-1" width="12" height="1.5" rx="0.5" fill="#DB241E" />
              {/* Tail */}
              <rect x="-0.75" y="4" width="1.5" height="4" rx="0.5" fill="#DB241E" />
              <rect x="-3" y="5.5" width="6" height="1" rx="0.5" fill="#DB241E" />
            </g>
            {/* Contrail sweeping arc */}
            <path d="M8 32 Q18 20 30 10" stroke="#DB241E" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          </svg>
          <div>
            <div className="nav-logo-text">
              AIRB<span className="focal-o">O</span>RNE
            </div>
            <div className="nav-logo-sub">Aviation Academy</div>
          </div>
        </a>

        {/* Links */}
        <ul className="nav-links" role="list">
          {['Programs', 'Fleet', 'About', 'Alumni'].map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="nav-link"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Phone — per brand book, always shown */}
        <span className="nav-phone" aria-label="Call us">+91 9953-777-320</span>

        {/* CTA */}
        <button className="nav-cta" onClick={onDemo} aria-label="Book a free demo class">
          Book Free Demo
        </button>
      </nav>

      {/* Scene dots — right side */}
      <nav className="scene-nav" aria-label="Scene navigation">
        {SCENES.map((name, i) => (
          <button
            key={name}
            className={`scene-nav-dot ${i === sceneIndex ? 'active' : ''}`}
            onClick={() => scrollToScene(i)}
            aria-label={`Go to ${name}`}
            title={name}
          />
        ))}
      </nav>

      {/* Bottom-left scene label */}
      <div className="scene-label-fixed" aria-live="polite">
        <span className="scene-label-number">
          {String(sceneIndex + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
        </span>
        <span className="scene-label-name">{SCENES[sceneIndex]}</span>
      </div>
    </>
  )
}
