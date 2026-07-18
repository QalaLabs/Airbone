'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Jobs Portal', path: '/jobs' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' }
  ]

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header className="nav scrolled site-header">
        <Link href="/" className="nav-logo" aria-label="Airborne Aviation Academy home">
          <img src="/logo-primary.webp" alt="Airborne Aviation Academy" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        </Link>


        {/* Desktop nav links */}
        <ul className="nav-links desktop-only" role="list">
          {links.slice(0, 4).map(link => (
            <li key={link.name}>
              <Link 
                href={link.path} 
                className="nav-link" 
                style={{ 
                  color: pathname === link.path ? '#FFFFFF' : 'rgba(255,255,255,0.7)', 
                  borderBottom: pathname === link.path ? '1px solid #DB241E' : 'none' 
                }}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Phone Callout */}
        <a href="tel:+919953777320" className="desktop-only" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', opacity: 0.9 }}>
          <span>📞</span> +91 9953 777 320
        </a>

        {/* Desktop CTA */}
        <Link href="/contact" className="nav-cta desktop-only" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Enrol Now
        </Link>

        {/* Hamburger Trigger */}
        <button
          className="header-hamburger-btn mobile-only-flex"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      </header>

      {/* Full-screen Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-header-drawer"
          >
            {/* Watermark arc background */}
            <div className="drawer-watermark" aria-hidden="true">
              <svg width="360" height="360" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="20" cy="20" r="19" />
                <path d="M8 32 Q18 20 30 10" />
              </svg>
            </div>

            {/* Drawer Header */}
            <div className="drawer-header">
              {/* Logo */}
              <div className="nav-logo">
                <img src="/logo-white.webp" alt="Airborne Aviation Academy" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="drawer-close-btn"
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
              className="drawer-links-container"
            >
              {links.map((l, idx) => (
                <motion.div
                  key={l.path}
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                >
                  <Link
                    href={l.path}
                    className="drawer-link-item"
                  >
                    <span className="drawer-link-num">
                      {`0${idx + 1}`}
                    </span>
                    <div>
                      <div className="drawer-link-label">
                        {l.name}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Drawer CTA at bottom */}
            <div className="drawer-footer">
              <Link
                href="/contact"
                className="drawer-cta-btn"
              >
                Reserve Free Demo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </Link>

              <div className="drawer-address" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Ramphal Chowk, Dwarka, New Delhi</div>
                <a href="tel:+919953777320" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', minWidth: '220px', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', textDecoration: 'none', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
                  📞 +91 9953 777 320
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
