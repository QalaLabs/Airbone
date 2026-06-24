import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'ATPL Ground School India All Subjects | Airborne Aviation',
  description: 'ATPL ground school in Delhi by Airborne Aviation Academy. Complete airline transport pilot license exam prep — all subjects, DGCA-aligned. Enrol now.',
  alternates: { canonical: '/courses/atpl' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'ATPL Ground School', path: '/courses/atpl' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'ATPL Ground School',
  description: 'Complete ATPL ground school covering all DGCA airline transport pilot license examination subjects.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  coursePrerequisites: 'Valid DGCA CPL',
  educationalCredentialAwarded: 'ATPL Certificate of Completion',
  url: 'https://airborneaviation.academy/courses/atpl',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I do ATPL ground school alongside CPL training?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Many students complete ATPL theory during their CPL ground school phase. The syllabi overlap significantly — doing both together improves exam efficiency and saves time.' }
    },
    {
      '@type': 'Question',
      name: 'Is ATPL mandatory to fly as a co-pilot in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. A CPL allows you to fly as co-pilot (SIC) on commercial aircraft. ATPL is required only when upgrading to Pilot-in-Command (PIC/Captain) on scheduled airline operations.' }
    },
    {
      '@type': 'Question',
      name: 'How long does ATPL ground school take?',
      acceptedAnswer: { '@type': 'Answer', text: "Airborne's ATPL ground school runs 4–6 months depending on batch schedule and student pace. Weekend and weekday batches available." }
    }
  ]
}

const SUBJECTS = [
  { name: 'Air Navigation', detail: 'Advanced long-range, high-altitude procedures' },
  { name: 'Air Regulations', detail: 'ATPL-level DGCA rules and ICAO annexures' },
  { name: 'Aviation Meteorology', detail: 'Advanced synoptic and en-route weather' },
  { name: 'Technical General', detail: 'Airframe, Engines, Avionics, Systems' },
  { name: 'Technical Specific', detail: 'Type-specific systems (A320/B737 focus)' },
  { name: 'RTR', detail: 'Radio Telephony Restricted (if not already held)' },
]

const COMPARISON = [
  { param: 'Issued by', cpl: 'DGCA India', atpl: 'DGCA India' },
  { param: 'Minimum flight hours', cpl: '200 hours', atpl: '1,500 hours' },
  { param: 'Role eligibility', cpl: 'Co-pilot (SIC)', atpl: 'Pilot-in-Command (PIC)' },
  { param: 'Career outcome', cpl: 'First Officer', atpl: 'Captain / Commander' },
]

export default function ATPLPage() {
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
          <span style={{ color: '#D8A027' }}>ATPL Ground School</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap">
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="ATPL Ground School at Airborne Aviation Academy, Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · 4–6 Months · ₹1,50,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                ATPL Ground School in Delhi — Airline Transport Pilot License Exam Prep
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '100%' }}>
                Airborne Aviation Academy offers ATPL (Airline Transport Pilot License) ground school classes in Dwarka, Delhi. Our ATPL program prepares commercial pilots for the DGCA ATPL written examinations — the final certification step before command eligibility on scheduled airline operations.
              </p>
            </div>

            {/* What is ATPL */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                What Is the ATPL License in India?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                The Airline Transport Pilot License (ATPL) is the highest level of pilot certification issued by DGCA India. It allows pilots to act as Pilot-in-Command (PIC) on scheduled commercial airline operations. Pilots must hold a valid CPL, log minimum 1,500 hours of flight time, and pass DGCA ATPL written examinations to qualify.
              </p>
            </div>

            {/* Subjects */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                ATPL Ground School Subjects at Airborne
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {SUBJECTS.map((s, i) => (
                  <div key={i} style={{ background: '#00162e', borderLeft: '3px solid #DB241E', padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CPL vs ATPL */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                ATPL vs CPL — Key Differences
              </h2>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)' }}>
                  <thead>
                    <tr style={{ background: '#00162e', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Parameter</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>CPL</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#D8A027' }}>ATPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{row.param}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.7)' }}>{row.cpl}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#D8A027', fontWeight: 600 }}>{row.atpl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Who Should Enrol */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Who Should Enrol?
              </h2>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'CPL holders targeting airline command (PIC) positions',
                  'Pilots approaching 1,500 hours who want exam-ready preparation',
                  'Co-pilots upgrading to command on scheduled carriers',
                  'Students wanting to complete ATPL theory alongside CPL training',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  {
                    q: 'Can I do ATPL ground school alongside CPL training?',
                    a: 'Yes. Many students complete ATPL theory during their CPL ground school phase. The syllabi overlap significantly — doing both together improves exam efficiency and saves time.',
                  },
                  {
                    q: 'Is ATPL mandatory to fly as a co-pilot in India?',
                    a: 'No. A CPL allows you to fly as co-pilot (SIC) on commercial aircraft. ATPL is required only when upgrading to Pilot-in-Command (PIC/Captain) on scheduled airline operations.',
                  },
                  {
                    q: 'How long does ATPL ground school take?',
                    a: "Airborne's ATPL ground school runs 4–6 months depending on batch schedule and student pace. Weekend and weekday batches available.",
                  },
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
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem' }}>⏱️ 4–6 Months</div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Course Fee</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹1,50,000</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>All subjects including viva preparation</span>
              </div>
              <LeadForm courseName="ATPL Ground School" source="Course Detail: atpl" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the ATPL Ground School at Airborne Aviation Academy, Dwarka. Please share batch details and fee."
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'GD/PI and mock interview coaching to land your first officer seat' },
            { label: 'Airbus A320 Simulator', href: '/courses/a320-simulator', note: 'Type rating familiarisation and cadet SIM prep' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'Instrument Rating', href: '/courses/instrument-rating' },
            { label: 'Cadet Preparation', href: '/courses/cadet-preparation' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
