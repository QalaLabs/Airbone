import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'DGCA Ground School Delhi | CPL & ATPL Classes | Airborne',
  description: 'Pass your DGCA CPL & ATPL exams with Airborne\'s expert-led ground school in Dwarka, Delhi. All subjects. Taught by airline pilots. Enrol now.',
  alternates: { canonical: '/courses/ground-school' },
  openGraph: {
    title: 'DGCA Ground School Delhi | CPL & ATPL Classes | Airborne',
    description: 'Pass your DGCA CPL & ATPL exams with Airborne\'s expert-led ground school in Dwarka, Delhi. All subjects. Taught by airline pilots. Enrol now.',
    url: 'https://www.airborneaviation.in/courses/ground-school',
  },
  twitter: {
    title: 'DGCA Ground School Delhi | CPL & ATPL Classes | Airborne',
    description: 'Pass your DGCA CPL & ATPL exams with Airborne\'s expert-led ground school in Dwarka, Delhi. All subjects. Taught by airline pilots. Enrol now.',
  },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'DGCA Ground School', path: '/courses/ground-school' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'DGCA Ground School',
  description: 'DGCA-approved ground school in Dwarka, Delhi. All CPL & ATPL subjects by Capt. Navrang Singh — 2,500+ trained since 2009.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', price: '270000', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  courseMode: 'onsite',
  duration: 'P3M',
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'onsite',
    startDate: '2026-07-01',
    maximumAttendeeCapacity: 25,
    instructor: { '@type': 'Person', name: 'Capt. Navrang Singh', jobTitle: 'Founder & Chief Ground Instructor' }
  },
  url: 'https://www.airborneaviation.in/courses/ground-school',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does DGCA Ground School take?',
      acceptedAnswer: { '@type': 'Answer', text: 'Approximately 3 months for all 5 DGCA CPL papers. Batches are capped at 25 students. Weekend and weekday batches available.' }
    },
    {
      '@type': 'Question',
      name: 'Is Capt. Navrang Singh in every class?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every core class is taught directly by Capt. Navrang Singh. No junior staff or subcontracted instructors handle any paper.' }
    },
    {
      '@type': 'Question',
      name: 'What is the DGCA Ground School fee at Airborne?',
      acceptedAnswer: { '@type': 'Answer', text: '₹2,70,000 covering all 5 DGCA theoretical papers. All study material provided and kept by students. No hidden charges.' }
    },
    {
      '@type': 'Question',
      name: 'Can I join DGCA Ground School without a CPL in progress?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Students pursuing any aviation path — CPL, ATPL, or general DGCA exam preparation — can join ground school. Minimum eligibility is Class 12 with Physics and Mathematics.' }
    }
  ]
}

const SUBJECTS = [
  { name: 'Air Navigation', code: '010', detail: 'Spherical trig, dead reckoning, radio navigation, GPS, RNAV' },
  { name: 'Aviation Meteorology', code: '050', detail: 'Atmosphere, weather systems, METAR/TAF, forecasting' },
  { name: 'Air Regulations', code: '010', detail: 'DGCA CAR, ICAO Annex 2, rules of the air, licensing regulations' },
  { name: 'Technical General', code: '021', detail: 'Aerodynamics, aircraft systems, piston/turbine engines' },
  { name: 'Technical Specific', code: '022', detail: 'Specific aircraft type systems (Cessna 172 for CPL students)' },
  { name: 'RTR', code: 'RTR(A)', detail: 'RT procedures, phraseology, emergency calls, ICAO phonetic alphabet' },
]

const ADVANTAGES = [
  { icon: '👨‍✈️', title: 'Founder Teaches Every Class', body: 'Capt. Navrang Singh personally leads training from Day 1 to CPL issue — no delegated instructors.' },
  { icon: '🏫', title: 'Dedicated RTR Lab', body: 'Simulated RT communication environment for phraseology practice before the actual test.' },
  { icon: '📚', title: 'Library Access', body: 'Students can study even after class hours in our on-campus library.' },
  { icon: '📊', title: 'Weekly Parent Reports', body: 'Mock exam scores and progress compiled and sent to parents every Friday.' },
  { icon: '🩺', title: 'In-House Class 2 Medical', body: 'Class 2 medical facility available at the Ramphal Chowk centre.' },
  { icon: '🎒', title: 'Goodies for Every Student', body: 'Bag, keychain, notebook, pen, T-shirt — and all study material is yours to keep.' },
]

export default function GroundSchoolPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">DGCA Ground School</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom.jpg" alt="DGCA Ground School at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3 Months · ₹2,70,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                DGCA Ground School Classes in Dwarka, Delhi — CPL & ATPL
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Airborne Aviation Academy offers DGCA-approved ground school classes in Dwarka, New Delhi. All DGCA subjects covered by Capt. Navrang Singh — who has personally trained 2,500+ aviation aspirants since 2009.
              </p>
            </div>

            {/* Subjects Table */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Subjects Covered
              </h2>
              <div style={{ border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '8px', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)', minWidth: '480px' }}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>DGCA Code</th>
                      <th>What You Learn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBJECTS.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontWeight: 600 }}>{row.name}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontWeight: 700, fontFamily: 'var(--font-h)', fontSize: '0.78rem', letterSpacing: '0.08em' }}>{row.code}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.65)' }}>{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructor */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Your Instructor — Capt. Navrang Singh
              </h2>
              <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '2rem', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.8', margin: 0 }}>
                  Capt. Navrang Singh is the co-founder of Airborne Aviation Academy and has been teaching DGCA ground school personally since 2009. With 15+ years of flight instruction experience, he strips DGCA syllabi down to first principles — Air Regulations, Technical General, Navigation, Meteorology, RTR — taught the way you will actually use them in the cockpit.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {['15+ Years Teaching', '2,500+ Students', '100% First-Attempt Pass Rate', 'Personal Classes — No Substitutes'].map((stat, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--navy)', background: 'rgba(216,160,39,0.08)', border: '1px solid rgba(216,160,39,0.2)', padding: '0.35rem 0.85rem', borderRadius: '2px' }}>{stat}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* The Airborne Advantage */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                The Airborne Advantage
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {ADVANTAGES.map((c, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderLeft: '3px solid #DB241E', padding: '1.25rem' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.35rem', fontFamily: 'var(--font-h)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.55)', lineHeight: '1.5' }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'How long does DGCA Ground School take?', a: 'Approximately 3 months for all 5 DGCA CPL papers. Batches are capped at 25 students. Weekend and weekday batches available.' },
                  { q: 'Is Capt. Navrang Singh in every class?', a: 'Yes. Every core class is taught directly by Capt. Navrang Singh. No junior staff or subcontracted instructors handle any paper.' },
                  { q: 'What is the DGCA Ground School fee at Airborne?', a: '₹2,70,000 covering all 5 DGCA theoretical papers. All study material provided and kept by students. No hidden charges.' },
                  { q: 'Can I join without a CPL in progress?', a: 'Yes. Students pursuing any aviation path — CPL, ATPL, or general DGCA exam preparation — can join. Minimum eligibility is Class 12 with Physics and Mathematics.' },
                ].map((faq, i) => (
                  <div key={i} className="course-faq-item">
                    <h3 className="course-faq-q">{faq.q}</h3>
                    <p className="course-faq-a">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="course-sidebar-card">
                <span className="course-sidebar-label">Course Fee</span>
                <div className="course-sidebar-price">₹2,70,000</div>
                <span className="course-sidebar-note">All subjects including viva preparation</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 3 Months</div>
                <span className="course-sidebar-note">July 2026 batch · 25 seats</span>
              </div>
              <LeadForm courseName="DGCA Ground School" source="Course Detail: ground-school" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the DGCA Ground School at Airborne Aviation Academy, Dwarka. Please share current batch details."
          nextCourses={[
            { label: 'Commercial Pilot License (CPL)', href: '/courses/commercial-pilot-license-cpl', note: 'Ground school leads directly to DGCA CPL — complete your pilot journey' },
            { label: 'Instrument Rating', href: '/courses/instrument-rating', note: 'Add IR to your CPL — essential for airline operations' },
            { label: 'ATPL Ground School', href: '/courses/atpl', note: 'Upgrade to Captain with ATPL — built on your CPL foundation' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'Aviation English ICAO L4', href: '/courses/aviation-english-icao' },
            { label: 'Multi-Engine Rating', href: '/courses/multi-engine-rating' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
