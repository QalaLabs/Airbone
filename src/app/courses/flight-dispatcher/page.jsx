import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Flight Dispatcher Course Delhi — DGCA | Airborne Aviation',
  description: 'Become a licensed Flight Dispatcher at Airborne Aviation Academy, Dwarka Delhi. DGCA-aligned curriculum. 10+2 eligible. 3–6 months. Fees ₹1–2L. Enquire now.',
  alternates: { canonical: '/courses/flight-dispatcher' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Flight Dispatcher', path: '/courses/flight-dispatcher' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Flight Dispatcher Course',
  description: 'DGCA-aligned Flight Dispatcher training at Airborne Aviation Academy, Dwarka Delhi. Co-authorise flights, manage flight planning, and support airline operations.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', priceCurrency: 'INR', description: '₹1–2 lakh. Contact for current pricing.' },
  coursePrerequisites: '10+2 (any stream)',
  courseMode: 'onsite',
  duration: 'P6M',
  url: 'https://airborneaviation.in/courses/flight-dispatcher',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is a DGCA license required to work as a Flight Dispatcher in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. DGCA India issues a Flight Dispatcher License (FDL) to candidates who complete the required training and pass DGCA examinations. Airlines require a valid FDL for operational dispatch roles.' }
    },
    {
      '@type': 'Question',
      name: 'How long does the Flight Dispatcher course take?',
      acceptedAnswer: { '@type': 'Answer', text: '3–6 months depending on batch schedule and study pace. The course covers meteorology, navigation, air regulations, aircraft performance, and dispatch procedures.' }
    },
    {
      '@type': 'Question',
      name: 'Can I become a Flight Dispatcher without a pilot license?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Flight Dispatcher training is open to 10+2 graduates of any stream. No flying license is required. The dispatcher works from the airline operations centre, not the cockpit.' }
    },
    {
      '@type': 'Question',
      name: 'What is the salary of a Flight Dispatcher in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Entry-level Flight Dispatchers earn ₹25,000–₹45,000/month at Indian airlines. Senior dispatchers with 5+ years experience and multi-type endorsements earn ₹60,000–₹1,20,000/month.' }
    }
  ]
}

const CURRICULUM = [
  { subject: 'Aviation Meteorology', detail: 'Weather analysis, METAR/TAF interpretation, turbulence, icing, dispatch weather minima' },
  { subject: 'Air Navigation', detail: 'Route planning, fuel calculations, alternate selection, ETOPS, PNR/PSR' },
  { subject: 'Air Regulations', detail: 'DGCA regulations, ICAO annexes, operational approvals, slot coordination' },
  { subject: 'Aircraft Performance', detail: 'Takeoff/landing performance charts, weight and balance, payload-range calculations' },
  { subject: 'Flight Planning', detail: 'OFP preparation, fuel policy, minimum fuel calculations, fuel tankering' },
  { subject: 'Dispatch Procedures', detail: 'Operational release, NOTAM briefing, ATC slot management, delay management' },
]

const CAREER_OPTIONS = [
  { role: 'Flight Dispatcher', employer: 'IndiGo, Air India, Akasa Air, SpiceJet' },
  { role: 'Flight Operations Officer', employer: 'Airline Operations Centres' },
  { role: 'Load Controller', employer: 'Ground Handling Companies' },
  { role: 'Operations Coordinator', employer: 'Charter and Cargo Airlines' },
  { role: 'Airline Operations Manager', employer: 'Airlines & Aviation Companies (senior level)' },
]

export default function FlightDispatcherPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>Flight Dispatcher</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap">
          <img src="/footage/classroom.jpg" alt="Flight Dispatcher course at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · 3–6 Months · ₹1–2 Lakh
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Flight Dispatcher Course — Aviation Operations Training, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                Flight Dispatchers co-authorise every commercial flight alongside the captain — a critical, licenced operations role at every airline. Airborne Aviation Academy's Flight Dispatcher course prepares candidates for the DGCA Flight Dispatcher License (FDL) examination, covering flight planning, meteorology, air regulations, and aircraft performance.
              </p>
            </div>

            {/* What FD Does */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                What Does a Flight Dispatcher Do?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: '0 0 1.25rem 0' }}>
                A licensed Flight Dispatcher (also called a Flight Operations Officer or Airline Dispatcher) co-signs every flight plan along with the aircraft captain. They are responsible for route planning, fuel calculations, alternate aerodrome selection, weather briefing, NOTAM review, and ATC slot coordination — all before the aircraft moves.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {['Co-signs every flight plan', 'Monitors weather en-route', 'Coordinates fuel load', 'Reviews all NOTAMs', 'Manages ATC slots', 'Supports in-flight decisions'].map((item, i) => (
                  <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#D8A027', fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Flight Dispatcher Eligibility
              </h2>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  '10+2 from any stream (no Physics/Maths requirement)',
                  'Minimum age: 18 years',
                  'Basic English communication ability',
                  'No prior aviation experience required — course starts from fundamentals',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Flight Dispatcher Training Curriculum
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {CURRICULUM.map((s, i) => (
                  <div key={i} style={{ background: '#00162e', borderLeft: '3px solid #DB241E', padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>{s.subject}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Career as a Flight Dispatcher
              </h2>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)' }}>
                  <thead>
                    <tr style={{ background: '#00162e', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Typical Employer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAREER_OPTIONS.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.25rem', color: '#FFFFFF', fontWeight: 600 }}>{row.role}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.65)' }}>{row.employer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Is a DGCA license required to work as a Flight Dispatcher in India?', a: 'Yes. DGCA India issues a Flight Dispatcher License (FDL) to candidates who complete the required training and pass DGCA examinations. Airlines require a valid FDL for operational dispatch roles.' },
                  { q: 'How long does the Flight Dispatcher course take?', a: '3–6 months depending on batch schedule and study pace. The course covers meteorology, navigation, air regulations, aircraft performance, and dispatch procedures.' },
                  { q: 'Can I become a Flight Dispatcher without a pilot license?', a: 'Yes. Flight Dispatcher training is open to 10+2 graduates of any stream. No flying license is required. The dispatcher works from the airline operations centre, not the cockpit.' },
                  { q: 'What is the salary of a Flight Dispatcher in India?', a: 'Entry-level Flight Dispatchers earn ₹25,000–₹45,000/month at Indian airlines. Senior dispatchers with 5+ years experience and multi-type endorsements earn ₹60,000–₹1,20,000/month.' },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>{faq.q}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Course Fee</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹1–2L</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>DGCA exam prep included</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>⏱️ 3–6 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Min Eligibility</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>10+2 Any Stream</div>
              </div>
              <LeadForm courseName="Flight Dispatcher" source="Course Detail: flight-dispatcher" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Flight Dispatcher course at Airborne Aviation Academy, Dwarka. Please share batch details and fee."
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Refine your personal interview and technical presentation for airline hiring panels' },
          ]}
          relatedCourses={[
            { label: 'Cabin Crew Training', href: '/courses/cabin-crew-training' },
            { label: 'Aviation English ICAO L4', href: '/courses/aviation-english-icao' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
