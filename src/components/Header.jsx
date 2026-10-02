'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { normalizeNavItems, isExternalHref } from '@/lib/cms/safeContent'

const DEFAULT_LINKS = [
  { id: 'about', name: 'About', path: '/about', newTab: false, children: [] },
  { id: 'courses', name: 'Courses', path: '/courses', newTab: false, children: [] },
  { id: 'jobs', name: 'Jobs Portal', path: '/jobs', newTab: false, children: [] },
  { id: 'resources', name: 'Resources', path: '/resources', newTab: false, children: [] },
  { id: 'contact', name: 'Contact', path: '/contact', newTab: false, children: [] },
]
// The built-in menu shows four links on desktop (Contact is the CTA); a CMS menu shows every visible item.
const DEFAULT_DESKTOP_COUNT = 4

/** Internal links use next/link; external or new-tab links are plain anchors with a safe rel. */
function NavAnchor({ link, className, style, children, onClick, testId }) {
  const rel = link.newTab || isExternalHref(link.path) ? 'noopener noreferrer' : undefined
  const common = { className, style, onClick, 'data-testid': testId, ...(link.newTab ? { target: '_blank' } : {}), ...(rel ? { rel } : {}) }
  if (isExternalHref(link.path) || link.newTab) {
    return (
      <a href={link.path} {...common}>
        {children}
      </a>
    )
  }
  return (
    <Link href={link.path} {...common}>
      {children}
    </Link>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [hoverSubmenu, setHoverSubmenu] = useState(null)
  const [prevPathname, setPrevPathname] = useState(pathname)
  const [links, setLinks] = useState(DEFAULT_LINKS)
  const [fromCms, setFromCms] = useState(false)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
    setOpenSubmenu(null)
    setHoverSubmenu(null)
  }

  useEffect(() => {
    fetch('/api/public-proxy/settings')
      .then(res => res.json())
      .then(payload => {
        const headerMenu = payload?.data?.navMenus?.find?.(m => m.location === 'header')
        const mapped = normalizeNavItems(headerMenu?.items)
        if (mapped.length > 0) {
          setLinks(mapped)
          setFromCms(true)
        }
      })
      .catch(err => console.error('Failed to load header navigation settings:', err))
  }, [])

  useEffect(() => {
    if (!openSubmenu && !hoverSubmenu) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpenSubmenu(null)
      setHoverSubmenu(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSubmenu, hoverSubmenu])

  const desktopLinks = fromCms ? links : links.slice(0, DEFAULT_DESKTOP_COUNT)

  return (
    <>
      <header className="nav scrolled site-header glass-nav">
        <Link href="/" className="nav-logo" aria-label="Airborne Aviation Academy home">
          <img src="/logo-primary.webp" alt="Airborne Aviation Academy" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        </Link>


        {/* Desktop nav links */}
        <ul className="nav-links desktop-only" role="list" data-testid="header-nav">
          {desktopLinks.map(link => {
            const active = pathname === link.path || link.children.some(c => c.path === pathname)
            const linkStyle = {
              color: active ? 'var(--navy)' : 'rgba(0,39,76,0.7)',
              borderBottom: active ? '1px solid #DB241E' : 'none',
            }
            if (link.children.length === 0) {
              return (
                <li key={link.id}>
                  <NavAnchor link={link} className="nav-link" style={linkStyle} testId="header-nav-link">
                    {link.name}
                  </NavAnchor>
                </li>
              )
            }
            const submenuId = `header-sub-${link.id}`
            // Hover and click/keyboard state are separate so a click on the toggle never undoes the hover-open.
            const isOpen = openSubmenu === link.id || hoverSubmenu === link.id
            return (
              <li
                key={link.id}
                className="nav-has-sub"
                onMouseEnter={() => setHoverSubmenu(link.id)}
                onMouseLeave={() => setHoverSubmenu(null)}
              >
                <NavAnchor link={link} className="nav-link" style={linkStyle} testId="header-nav-link">
                  {link.name}
                </NavAnchor>
                <button
                  type="button"
                  className="nav-sub-toggle"
                  aria-expanded={isOpen}
                  aria-controls={submenuId}
                  aria-label={`${link.name} submenu`}
                  onClick={() => setOpenSubmenu(openSubmenu === link.id ? null : link.id)}
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <ul id={submenuId} className="nav-submenu" role="list" hidden={!isOpen} data-testid="header-submenu">
                  {link.children.map(child => (
                    <li key={child.id}>
                      <NavAnchor link={child} className="nav-submenu-link" testId="header-submenu-link" onClick={() => { setOpenSubmenu(null); setHoverSubmenu(null) }}>
                        {child.name}
                      </NavAnchor>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>

        {/* Desktop CTA */}
        <Link href="/contact" className="nav-cta desktop-only" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Book Demo
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
                <img src="/logo-primary.webp" alt="Airborne Aviation Academy" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
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
            <motion.nav
              aria-label="Mobile navigation"
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
                  key={l.id}
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
                  }}
                >
                  <NavAnchor link={l} className="drawer-link-item" onClick={() => setMobileOpen(false)}>
                    <span className="drawer-link-num">
                      {`0${idx + 1}`}
                    </span>
                    <div>
                      <div className="drawer-link-label">
                        {l.name}
                      </div>
                    </div>
                  </NavAnchor>
                  {l.children.length > 0 && (
                    <ul className="drawer-sublinks" role="list" aria-label={`${l.name} links`}>
                      {l.children.map(child => (
                        <li key={child.id}>
                          <NavAnchor link={child} className="drawer-sublink-item" onClick={() => setMobileOpen(false)}>
                            {child.name}
                          </NavAnchor>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </motion.nav>

            {/* Drawer CTA at bottom */}
            <div className="drawer-footer">
              <Link
                href="/contact"
                className="drawer-cta-btn"
              >
                Enrol Now
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
