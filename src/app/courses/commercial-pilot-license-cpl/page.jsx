import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MultiStepLeadForm from '@/components/MultiStepLeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'CPL Course Delhi Commercial Pilot License | Airborne Aviation',
  description: 'Clear all 5 DGCA CPL papers on your first attempt. Mentor-led CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
  alternates: { canonical: '/courses/commercial-pilot-license-cpl' },
  openGraph: {
    title: 'CPL Course Delhi Commercial Pilot License | Airborne Aviation',
    description: 'Clear all 5 DGCA CPL papers on your first attempt. Mentor-led CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
    url: 'https://www.airborneaviation.in/courses/commercial-pilot-license-cpl',
  },
  twitter: {
    title: 'CPL Course Delhi Commercial Pilot License | Airborne Aviation',
    description: 'Clear all 5 DGCA CPL papers on your first attempt. Mentor-led CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
  },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'CPL Ground School', path: '/courses/commercial-pilot-license-cpl' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'DGCA CPL Ground School',
  description: 'All 5 DGCA CPL papers: Air Navigation, Meteorology, Air Regulations, Technical General, Technical Specific. Mentor-led by Capt. Navrang Singh. 100% first-attempt pass rate.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', price: '270000', priceCurrency: 'INR', availability: 'https://schema.org/InStock', validFrom: '2026-07-01' },
  courseMode: 'onsite',
  duration: 'P3M',
  educationalLevel: 'Professional Certification',
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'onsite',
    startDate: '2026-07-01',
    maximumAttendeeCapacity: 25,
    location: {
      '@type': 'Place',
      name: 'Airborne Aviation Academy — Dwarka Centre',
      address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075', addressCountry: 'IN' }
    },
    instructor: { '@type': 'Person', name: 'Capt. Navrang Singh', jobTitle: 'Founder & Chief Ground Instructor' }
  },
  teaches: ['Air Navigation', 'Aviation Meteorology', 'Air Regulations', 'Technical General', 'Technical Specific (Airbus A320)'],
  url: 'https://www.airborneaviation.in/courses/commercial-pilot-license-cpl',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What DGCA exams are required for CPL?',
      acceptedAnswer: { '@type': 'Answer', text: 'Six DGCA examinations: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. Each paper requires minimum 70% to pass.' }
    },
    {
      '@type': 'Question',
      name: 'How much does CPL cost in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'CPL training in India costs ₹65–75 lakh at DGCA-approved FTOs, covering 200 flying hours, ground school, DGCA exam fees, and medical. Education loans available via SBI, Bank of Baroda, PNB.' }
    },
    {
      '@type': 'Question',
      name: 'What is the DGCA CPL Ground School fee at Airborne?',
      acceptedAnswer: { '@type': 'Answer', text: 'The tuition fee is ₹2,70,000 covering all 5 DGCA theoretical papers taught directly by Capt. Navrang Singh.' }
    },
    {
      '@type': 'Question',
      name: 'How long does CPL Ground School take?',
      acceptedAnswer: { '@type': 'Answer', text: 'Approximately 3 months. Batches are capped at 25 students. Next batch starts July 2026.' }
    },
    {
      '@type': 'Question',
      name: 'Is CPL ground school taught by Capt. Navrang Singh directly?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every core class is taught directly by Capt. Navrang Singh. No subcontracted instructors.' }
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

const FEE_ROWS = [
  { component: 'DGCA Ground School (all subjects)', amount: '₹2,70,000' },
  { component: 'Flying Training — 200 hours', amount: '₹52–62 lakh' },
  { component: 'DGCA Exam Fees (5 papers)', amount: '₹30,000' },
  { component: 'DGCA Class 1 Medical', amount: '₹10,000–₹25,000' },
  { component: 'Student Pilot License (SPL)', amount: '₹15,000–₹25,000' },
  { component: 'Simulator Sessions', amount: '₹10,000/hr' },
  { component: 'Total (approximate)', amount: '₹55–65 lakh' },
]

const ELIGIBILITY = [
  { req: 'Age', detail: 'Minimum 17 years at enrolment' },
  { req: 'Education', detail: 'Class 12 with Physics and Mathematics, minimum 50%' },
  { req: 'Medical', detail: 'DGCA Class 1 Medical Certificate' },
  { req: 'Language', detail: 'Aviation English — ICAO Level 4 minimum' },
  { req: 'Nationality', detail: 'Indian national or eligible foreign national' },
]

export default function CPLPage() {
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
          <span className="current">CPL Ground School</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/campus/classroom_navrang.jpg" alt="CPL Ground School at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3 Months · ₹2,70,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Commercial Pilot License (CPL) Course in Delhi — DGCA Approved
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75', maxWidth: '100%' }}>
                Airborne Aviation Academy offers a DGCA-approved Commercial Pilot License (CPL) Ground School in Dwarka, Delhi. The CPL Ground School covers all 5 DGCA written examination papers — taught personally by Capt. Navrang Singh, who has maintained a 100% first-attempt pass rate across 2,500+ students since 2009. July 2026 batch now enrolling. 25 seats. ₹2,70,000.
              </p>
            </div>

            {/* Subjects */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                DGCA Ground School — Curriculum Subjects
              </h2>
              <div className="course-subject-grid">
                {SUBJECTS.map((s, i) => (
                  <div key={i} className="course-subject-card">
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-h)', letterSpacing: '0.12em', color: 'var(--red)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 800 }}>{s.code}</div>
                    <div className="course-subject-card-title">{s.name}</div>
                    <div className="course-subject-card-detail">{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                CPL Course Fees — Full Breakdown
              </h2>
              <div className="course-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="course-table" style={{ minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th>Fee Component</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEE_ROWS.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '1rem 1.25rem', color: i === FEE_ROWS.length - 1 ? '#FFFFFF' : 'rgba(0, 39, 76, 0.75)', fontWeight: i === FEE_ROWS.length - 1 ? 700 : 400 }}>{row.component}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontWeight: i === FEE_ROWS.length - 1 ? 900 : 600, fontSize: i === FEE_ROWS.length - 1 ? '1rem' : '0.875rem' }}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.45)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                Education loans available via SBI, Bank of Baroda, and PNB. Contact our admissions team for loan guidance.
              </p>
            </div>

            {/* Eligibility */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                CPL Eligibility Requirements
              </h2>
              <div className="course-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="course-table" style={{ minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th>Requirement</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ELIGIBILITY.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.req}</td>
                        <td>{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Why Airborne */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why Choose Airborne for CPL Ground School?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { icon: '👨‍✈️', title: 'Founder Teaches Every Class', body: 'All five DGCA papers personally taught by Capt. Navrang Singh — no junior staff on core subjects.' },
                  { icon: '📚', title: 'First-Principles Approach', body: 'No question banks. DGCA syllabi taught from fundamentals up.' },
                  { icon: '🏫', title: 'Small Batches — Max 25', body: 'Training paced according to each student\'s learning speed.' },
                  { icon: '🎯', title: '1-on-1 Doubt Sessions', body: 'Individual doubt-solving sessions with Capt. Navrang Singh until concepts are clear.' },
                ].map((c, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', border: '1px solid rgba(0, 39, 76, 0.08)', padding: '1.5rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.55)', lineHeight: '1.5' }}>{c.body}</div>
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
                  { q: 'What DGCA exams are required for CPL?', a: 'Six DGCA examinations: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. Each paper requires minimum 70% to pass.' },
                  { q: 'How much does CPL Ground School cost at Airborne?', a: '₹2,70,000 covering all 5 DGCA theoretical papers taught directly by Capt. Navrang Singh. All subjects included — no separate fees per paper.' },
                  { q: 'How much does the full CPL cost in India?', a: 'CPL training in India costs ₹55–65 lakh at DGCA-approved FTOs, covering 200 flying hours, ground school, DGCA exam fees, and medical. Education loans available via SBI, Bank of Baroda, PNB.' },
                  { q: 'What is the batch size?', a: 'Strictly capped at 25 students per session to maintain high contact ratios and personalised pacing.' },
                  { q: 'How long does CPL Ground School take?', a: 'Approximately 3 months for the complete 5-subject ground school curriculum. Weekend and weekday batches available.' },
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
                <span className="course-sidebar-label">Ground School Fee</span>
                <div className="course-sidebar-price">₹2,70,000</div>
                <span className="course-sidebar-note">All 5 DGCA subjects included</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 3 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Batch Size</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>👥 Max 25 Students</div>
                <span className="course-sidebar-note">July 2026 batch now enrolling</span>
              </div>
              <MultiStepLeadForm
                courseName="CPL Ground School"
                source="Course Detail: commercial-pilot-license-cpl"
                courseCategory="pilot"
                successMessage="Thank you! Your CPL Ground School enquiry has been received. An Airborne admissions counsellor will contact you within 24 hours."
              />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the CPL Ground School at Airborne Aviation Academy, Dwarka. Please share July 2026 batch details and fee."
          nextCourses={[
            { label: 'ATPL Ground School', href: '/courses/atpl', note: 'Prepare for ATPL exams and upgrade to Captain — CPL holders only' },
            { label: 'Instrument Rating', href: '/courses/instrument-rating', note: 'Add IR to your CPL for airline-ready pilot profile' },
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'GD/PI and mock interview coaching by Rajeet Khalsa' },
          ]}
          relatedCourses={[
            { label: 'DGCA Ground School', href: '/courses/ground-school' },
            { label: 'PPL', href: '/courses/private-pilot-license' },
            { label: 'Multi-Engine Rating', href: '/courses/multi-engine-rating' },
            { label: 'Aviation English ICAO L4', href: '/courses/aviation-english-icao' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
