'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`nav scrolled`} style={{ position: 'sticky', top: 0, background: 'rgba(0, 15, 30, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)' }}>
      <Link href="/" className="nav-logo" aria-label="Airborne Aviation Academy home">
        <div className="nav-logo-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '18px', height: '18px', fill: '#DB241E' }}>
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
        <div>
          <div className="nav-logo-name">Air<span className="o" style={{ color: '#DB241E' }}>b</span>orne</div>
          <div className="nav-logo-sub">Aviation Academy</div>
        </div>
      </Link>

      <ul className="nav-links" role="list" style={{ display: 'flex' }}>
        {[
          { name: 'About', path: '/about' },
          { name: 'Courses', path: '/courses' },
          { name: 'Jobs Portal', path: '/jobs' },
          { name: 'Resources', path: '/resources' }
        ].map(link => (
          <li key={link.name}>
            <Link 
              href={link.path} 
              className="nav-link" 
              style={{ color: pathname === link.path ? '#FFFFFF' : 'rgba(255,255,255,0.7)', borderBottom: pathname === link.path ? '1px solid #DB241E' : 'none' }}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/contact" className="nav-cta" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        📅 Book Demo
      </Link>
    </header>
  )
}
