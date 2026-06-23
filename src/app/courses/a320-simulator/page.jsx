import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'

export const metadata = {
  title: 'Airbus A320 Simulator Training Delhi | Airborne Aviation',
  description: 'A320 simulator at Airborne Aviation Academy, Dwarka. Airline interview prep, type rating familiarisation, cadet selection practice. Book a session today.',
  alternates: { canonical: '/courses/a320-simulator' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'A320 Simulator Training', path: '/courses/a320-simulator' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Airbus A320 Simulator Training',
  description: 'In-house Airbus A320 simulator training at Airborne Aviation Academy, Dwarka. Type rating familiarisation, cadet selection SIM prep, emergency procedures.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  url: 'https://airborneaviation.academy/courses/a320-simulator',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Is the A320 simulator at Airborne DGCA-approved for Type Rating completion?",
      acceptedAnswer: { '@type': 'Answer', text: "The simulator is used for familiarisation and preparation — not as a DGCA-approved Full Flight Simulator (FFS) for Type Rating completion. Type Rating completion requires a Level D FFS at a DGCA-approved Type Rating Organisation (TRO). Airborne's simulator is ideal for pre-type rating preparation and cadet selection readiness." }
    }
  ]
}

const USE_CASES = [
  { use: 'Type Rating Familiarisation', who: 'CPL holders preparing for A320 Type Rating', outcome: 'Cockpit familiarisation before SIM assessment' },
  { use: 'Cadet Selection SIM Prep', who: 'Students applying to IndiGo JFO / airline cadet programs', outcome: 'Perform confidently at airline SIM assessment' },
  { use: 'Instrument Approach Practice', who: 'IR students / pilots', outcome: 'ILS, VOR, NDB approach proficiency' },
  { use: 'Emergency Procedure Training', who: 'CPL students and rated pilots', outcome: 'Engine failures, MAYDAY calls, evacuation procedures' },
  { use: 'Airline Interview SIM Check', who: 'Candidates at final stage of airline selection', outcome: 'Structured SIM debrief and performance feedback' },
]

export default function A320SimulatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>A320 Simulator Training</span>
        </div>

        <div className="course-hero-image-wrap">
          <img src="/footage/simulator-training.jpg" alt="Airbus A320 Simulator Training at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · ₹10,000/hr (in-house SIM)
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Airbus A320 Simulator Training in Dwarka, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                Airborne Aviation Academy added an Airbus A320 simulator to our Ramphal Chowk, Dwarka campus in 2024. The simulator is used for type rating familiarisation, airline cadet selection preparation, instrument approach practice, and emergency procedure training.
              </p>
            </div>

            {/* Use Cases Table */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                What Our A320 Simulator Is Used For
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                {USE_CASES.map((u, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: i < USE_CASES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr', gap: '1rem', alignItems: 'start' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{u.use}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{u.who}</div>
                    <div style={{ fontSize: '0.78rem', color: '#D8A027', lineHeight: '1.5' }}>{u.outcome}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why SIM Matters */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Why Simulator Training Matters for Airline Selection
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                Every major Indian airline now includes a simulator assessment in their pilot selection process. IndiGo's JFO selection uses an FNPT-II. Air India and Akasa use full flight simulators. A candidate who has never sat in an A320 cockpit before assessment day is at a significant disadvantage. Airborne's simulator allows students to experience the cockpit layout, PFD/ND interaction, FMS basics, and standard call-outs before their actual airline assessment.
              </p>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                FAQs — A320 Simulator
              </h2>
              <div>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>Is the A320 simulator at Airborne DGCA-approved for Type Rating completion?</h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', margin: 0 }}>The simulator is used for familiarisation and preparation — not as a DGCA-approved Full Flight Simulator (FFS) for Type Rating completion. Type Rating completion requires a Level D FFS at a DGCA-approved Type Rating Organisation (TRO). Airborne's simulator is ideal for pre-type rating preparation and cadet selection readiness.</p>
              </div>
            </div>

          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Session Rate</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹10,000/hr</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>In-house A320 simulator · Dwarka campus</span>
              </div>
              <LeadForm courseName="Airbus A320 Simulator Training" source="Course Detail: a320-simulator" />
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
