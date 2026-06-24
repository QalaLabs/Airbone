import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'DGCA CPL Ground School Dwarka Delhi | Airborne Aviation',
  description: 'Clear all 5 DGCA CPL papers on your first attempt. Mentor-led CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh. ₹2,70,000. July 2026 batch — 25 seats.',
  alternates: { canonical: '/courses/commercial-pilot-license-cpl' },
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
  url: 'https://airborneaviation.in/courses/commercial-pilot-license-cpl',
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
  { component: 'Flying Training — 200 hours', amount: '₹45–55 lakh' },
  { component: 'DGCA Exam Fees (6 papers)', amount: '₹25,000–₹40,000' },
  { component: 'DGCA Class 1 Medical', amount: '₹10,000–₹25,000' },
  { component: 'Student Pilot License (SPL)', amount: '₹15,000–₹25,000' },
  { component: 'Simulator Sessions', amount: '₹10,000/hr' },
  { component: 'Total (approximate)', amount: '₹65–75 lakh' },
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
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>CPL Ground School</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap">
          <img src="/campus/classroom_navrang.jpg" alt="CPL Ground School at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · 3 Months · ₹2,70,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Commercial Pilot License (CPL) Course in Delhi — DGCA Approved
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '100%' }}>
                Airborne Aviation Academy offers a DGCA-approved Commercial Pilot License (CPL) Ground School in Dwarka, Delhi. The CPL Ground School covers all 5 DGCA written examination papers — taught personally by Capt. Navrang Singh, who has maintained a 100% first-attempt pass rate across 2,500+ students since 2009. July 2026 batch now enrolling. 25 seats. ₹2,70,000.
              </p>
            </div>

            {/* Subjects */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                DGCA Ground School — Curriculum Subjects
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {SUBJECTS.map((s, i) => (
                  <div key={i} style={{ background: '#00162e', borderLeft: '3px solid #DB241E', padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-h)', letterSpacing: '0.1em', color: '#D8A027', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{s.code}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                CPL Course Fees — Full Breakdown
              </h2>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)' }}>
                  <thead>
                    <tr style={{ background: '#00162e', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Fee Component</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#D8A027' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEE_ROWS.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.25rem', color: i === FEE_ROWS.length - 1 ? '#FFFFFF' : 'rgba(255,255,255,0.7)', fontWeight: i === FEE_ROWS.length - 1 ? 700 : 400 }}>{row.component}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#D8A027', fontWeight: i === FEE_ROWS.length - 1 ? 900 : 600, fontSize: i === FEE_ROWS.length - 1 ? '1rem' : '0.875rem' }}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                Education loans available via SBI, Bank of Baroda, and PNB. Contact our admissions team for loan guidance.
              </p>
            </div>

            {/* Eligibility */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                CPL Eligibility Requirements
              </h2>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)' }}>
                  <thead>
                    <tr style={{ background: '#00162e', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Requirement</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ELIGIBILITY.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{row.req}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.8)' }}>{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Why Airborne */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Why Choose Airborne for CPL Ground School?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { icon: '🎯', title: '100% First-Attempt Pass Rate', body: 'Maintained across 2,500+ students over 15 years.' },
                  { icon: '👨‍✈️', title: 'Founder Teaches Every Class', body: 'Capt. Navrang Singh personally leads each session — no junior staff.' },
                  { icon: '📚', title: 'First-Principles Approach', body: 'No question banks. DGCA syllabi taught from fundamentals up.' },
                  { icon: '🏫', title: 'Small Batches — Max 25', body: 'Individual attention and personalised pacing for every student.' },
                ].map((c, i) => (
                  <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'What DGCA exams are required for CPL?', a: 'Six DGCA examinations: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. Each paper requires minimum 70% to pass.' },
                  { q: 'How much does CPL Ground School cost at Airborne?', a: '₹2,70,000 covering all 5 DGCA theoretical papers taught directly by Capt. Navrang Singh. All subjects included — no separate fees per paper.' },
                  { q: 'How much does the full CPL cost in India?', a: 'CPL training in India costs ₹65–75 lakh at DGCA-approved FTOs, covering 200 flying hours, ground school, DGCA exam fees, and medical. Education loans available via SBI, Bank of Baroda, PNB.' },
                  { q: 'What is the batch size?', a: 'Strictly capped at 25 students per session to maintain high contact ratios and personalised pacing.' },
                  { q: 'How long does CPL Ground School take?', a: 'Approximately 3 months for the complete 5-subject ground school curriculum. Weekend and weekday batches available.' },
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
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Ground School Fee</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹2,70,000</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>All 5 DGCA subjects included</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>⏱️ 3 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Batch Size</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>👥 Max 25 Students</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>July 2026 batch now enrolling</span>
              </div>
              <LeadForm courseName="CPL Ground School" source="Course Detail: commercial-pilot-license-cpl" />
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
