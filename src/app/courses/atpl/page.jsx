import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'ATPL Ground School Delhi | Airline Exam Prep | Airborne',
  description: 'Prepare for ATPL exams & oral viva checkouts at Airborne Aviation, Dwarka Delhi. Expert-led 3-month ATPL ground school. ₹1,50,000. 15 seats available. Enrol now.',
  alternates: { canonical: '/courses/atpl' },
  openGraph: {
    title: 'ATPL Ground School Delhi | Airline Exam Prep | Airborne',
    description: 'Prepare for ATPL exams & oral viva checkouts at Airborne Aviation, Dwarka Delhi. Expert-led 3-month ATPL ground school. ₹1,50,000. 15 seats available. Enrol now.',
    url: 'https://www.airborneaviation.in/courses/atpl',
  },
  twitter: {
    title: 'ATPL Ground School Delhi | Airline Exam Prep | Airborne',
    description: 'Prepare for ATPL exams & oral viva checkouts at Airborne Aviation, Dwarka Delhi. Expert-led 3-month ATPL ground school. ₹1,50,000. 15 seats available. Enrol now.',
  },
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
  url: 'https://www.airborneaviation.in/courses/atpl',
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
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">ATPL Ground School</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/campus/a320_sim.jpg" alt="ATPL Ground School at Airborne Aviation Academy, Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        {/* Layout Grid */}
        <div className="course-details-layout">

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 4–6 Months · ₹1,50,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                ATPL Ground School in Delhi — Airline Transport Pilot License Exam Prep
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75', maxWidth: '100%' }}>
                Airborne Aviation Academy offers ATPL (Airline Transport Pilot License) ground school classes in Dwarka, Delhi. Our ATPL program prepares commercial pilots for the DGCA ATPL written examinations — the final certification step before command eligibility on scheduled airline operations.
              </p>
            </div>

            {/* What is ATPL */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is the ATPL License in India?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                The Airline Transport Pilot License (ATPL) is the highest level of pilot certification issued by DGCA India. It allows pilots to act as Pilot-in-Command (PIC) on scheduled commercial airline operations. Pilots must hold a valid CPL, log minimum 1,500 hours of flight time, and pass DGCA ATPL written examinations to qualify.
              </p>
            </div>

            {/* Subjects */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                ATPL Ground School Subjects at Airborne
              </h2>
              <div className="course-subject-grid">
                {SUBJECTS.map((s, i) => (
                  <div key={i} className="course-subject-card">
                    <div className="course-subject-card-title">{s.name}</div>
                    <div className="course-subject-card-detail">{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CPL vs ATPL */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                ATPL vs CPL — Key Differences
              </h2>
              <div className="course-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="course-table" style={{ minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>CPL</th>
                      <th>ATPL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.param}</td>
                        <td>{row.cpl}</td>
                        <td style={{ color: "var(--gold)", fontWeight: 600 }}>{row.atpl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Who Should Enrol */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Who Should Enrol?
              </h2>
              <ul className="course-list">
                {[
                  'CPL holders targeting airline command (PIC) positions',
                  'Pilots approaching 1,500 hours who want exam-ready preparation',
                  'Co-pilots upgrading to command on scheduled carriers',
                  'Students wanting to complete ATPL theory alongside CPL training',
                ].map((item, i) => (
                  <li key={i} className="course-list-item">{item}</li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
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
                <span className="course-sidebar-label">Duration</span>
                <div className="course-sidebar-value">⏱️ 4–6 Months</div>
                <span className="course-sidebar-label">Course Fee</span>
                <div className="course-sidebar-price">₹1,50,000</div>
                <span className="course-sidebar-note">All subjects including viva preparation</span>
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
