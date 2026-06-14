import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#000f1e', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '4rem var(--margin) 2.5rem var(--margin)', color: 'rgba(255,255,255,0.7)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <div className="nav-logo" style={{ marginBottom: '1.25rem' }}>
            <div className="nav-logo-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '18px', height: '18px', fill: '#DB241E' }}>
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div>
              <div className="nav-logo-name" style={{ color: '#FFFFFF' }}>Air<span className="o" style={{ color: '#DB241E' }}>b</span>orne</div>
              <div className="nav-logo-sub">Aviation Academy</div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', maxWidth: '260px' }}>
            India's premier DGCA ground preparation institute. Building conceptual clarity, discipline, and pilot competencies for 15+ years.
          </p>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D8A027', marginBottom: '1.25rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <li><Link href="/about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>About Airborne</Link></li>
            <li><Link href="/courses" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Course Portfolio</Link></li>
            <li><Link href="/jobs" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pilot Jobs Portal</Link></li>
            <li><Link href="/resources" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Gated E-Books</Link></li>
            <li><Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Admissions Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D8A027', marginBottom: '1.25rem' }}>Core Programs</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <li><Link href="/courses/cpl-ground-classes" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>DGCA CPL Ground School</Link></li>
            <li><Link href="/courses/cadet-pilot-program" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Cadet Pilot Program</Link></li>
            <li><Link href="/courses/airbus-a320-sim-training" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Airbus A320 SIM Hours</Link></li>
            <li><Link href="/courses/atpl-ground-classes" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>ATPL Ground School</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D8A027', marginBottom: '1.25rem' }}>Dwarka Center</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
            📍 Ramphal Chowk Road, Sector 7 Dwarka,<br />New Delhi, Delhi 110075
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
            📞 +91 9953-777-320
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            ✉️ admissions@airborneaviation.in
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
        <div>© 2026 Airborne Aviation Academy. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>DGCA Ground Standards Compliant</span>
          <span>100% Code & Codebase Ownership</span>
        </div>
      </div>
    </footer>
  )
}
