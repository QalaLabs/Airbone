import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'

import CoursePageFooter from '@/components/CoursePageFooter'
import CourseReviews from '@/components/CourseReviews'
import JsonLd from '@/components/JsonLd'
import { buildCoursePageGraph } from '@/lib/schema'
import { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'

export const metadata = {
  title: 'Commercial Pilot License Ground Classes in Delhi — DGCA Complied | Airborne Aviation',
  description: 'Clear all 5 DGCA CPL papers on your first attempt. DGCA Complied CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
  alternates: { canonical: '/courses/commercial-pilot-license-cpl' },
  openGraph: {
    title: 'Commercial Pilot License Ground Classes in Delhi — DGCA Complied | Airborne Aviation',
    description: 'Clear all 5 DGCA CPL papers on your first attempt. DGCA Complied CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
    url: 'https://www.airborneaviation.in/courses/commercial-pilot-license-cpl',
  },
  twitter: {
    title: 'Commercial Pilot License Ground Classes in Delhi — DGCA Complied | Airborne Aviation',
    description: 'Clear all 5 DGCA CPL papers on your first attempt. DGCA Complied CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
  },
}

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['commercial-pilot-license-cpl'],
  faqs: [
  {
    q: 'What DGCA exams are required for CPL?',
    a: 'Six DGCA examinations: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. Each paper requires minimum 70% to pass.'
  },
  {
    q: 'How much does CPL cost in India?',
    a: 'CPL training in India costs ₹55–65 lakh at DGCA-approved FTOs, covering 200 flying hours, ground school, DGCA exam fees, and medical. Education loans available via SBI, Bank of Baroda, PNB.'
  },
  {
    q: 'What is the DGCA CPL Ground School fee at Airborne?',
    a: 'The tuition fee is ₹2,70,000 covering all 5 DGCA theoretical papers taught directly by Capt. Navrang Singh.'
  },
  {
    q: 'How long does CPL Ground School take?',
    a: 'Approximately 3 months. Batches are capped at 25 students. Next batch starts July 2026.'
  },
  {
    q: 'Is CPL ground school taught by Capt. Navrang Singh directly?',
    a: 'Yes. Every core class is taught directly by Capt. Navrang Singh. No subcontracted instructors.'
  }
],
})

const SUBJECTS = [
  { name: 'Air Navigation', detail: 'General Navigation, Radio Aids, Instrument, Mass & Balance, Performance and Flight Planning' },
  { name: 'Aviation Meteorology', detail: 'Atmosphere, weather systems, METAR/TAF, forecasting' },
  { name: 'Air Regulations', detail: 'DGCA CAR, ICAO Annex 2, rules of the air, licensing regulations' },
  { name: 'Technical General', detail: 'Aerodynamics, aircraft systems, piston/turbine engines' },
  { name: 'Technical Specific', detail: 'Aircraft type systems for specific aircraft types' },
  { name: 'RTR', detail: 'Part 1: MCQ as per module; Part 2: Real Life Communication in simulated environment with ATC' },
]

const FEE_ROWS = [
  { component: 'DGCA Ground School (all subjects)', amount: '₹2,70,000' },
  { component: 'Flying Training — 200 hours', amount: '₹55 Lakh' },
  { component: 'DGCA Exam Fees (Regular Session) (5 papers)', amount: '₹2,500/Exam' },
  { component: 'DGCA Exam Fees (on-Demand) (5 papers)', amount: '₹5,000/Exam' },
  { component: 'DGCA Class 2 Medical', amount: '₹10,000' },
  { component: 'DGCA Class 1 Medical', amount: '₹10,000' },
  { component: 'Simulator Sessions (A320 FBS)', amount: '₹12,000' },
  { component: 'Total (approximate)', amount: '₹55–65 lakh' },
]

const ISSUANCE = [
  { req: 'Age', detail: 'Minimum 18 years' },
  { req: 'Education', detail: 'Class 12 with Physics and Mathematics' },
  { req: 'Flying Training', detail: '200 hours' },
  { req: 'DGCA Exam', detail: 'Passed' },
]

export default function CPLPage() {
  return (
    <>
      <JsonLd data={coursePageGraph} />

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
                Dwarka, Delhi · 3–6 Months · ₹2,70,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Commercial Pilot License Ground Classes in Delhi — DGCA Complied
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75', maxWidth: '100%' }}>
                Airborne Aviation Academy offers a DGCA Complied Commercial Pilot License (CPL) Ground School in Dwarka, Delhi. The CPL Ground School covers all 5 DGCA written examination papers — taught personally by Capt. Navrang Singh. Structured concept-focused preparation for DGCA exams. July 2026 batch now enrolling. 25 seats. ₹2,70,000.
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

            {/* Issuance */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                CPL Issuance Requirements
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
                    {ISSUANCE.map((row, i) => (
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
                  { title: 'Founder Teaches Every Class', body: 'All five DGCA papers personally taught by Capt. Navrang Singh — no junior staff on core subjects.' },
                  { title: 'First-Principles Approach', body: 'No question banks. DGCA syllabi taught from fundamentals up.' },
                  { title: 'Small Batches — Max 25', body: 'Training paced according to each student\'s learning speed.' },
                  { title: '1-on-1 Doubt Sessions', body: 'Individual doubt-solving sessions with Capt. Navrang Singh until concepts are clear.' },
                ].map((c, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '1.5rem', borderRadius: '4px' }}>
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
                  { q: 'How long does CPL Ground School take?', a: '3–6 months for the complete ground school curriculum. Weekend and weekday batches available.' },
                  { q: 'How long is the full CPL path?', a: 'The complete CPL journey from ground school to license issuance typically takes 12–18 months, depending on flying weather and training pace.' },
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
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>3–6 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Batch Size</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>Max 25 Students</div>
                <span className="course-sidebar-note">July 2026 batch now enrolling</span>
              </div>
              <LeadForm
                courseName="CPL Ground Classes (₹2,70,000)"
                source="Course Detail: commercial-pilot-license-cpl"
                successMessage="Thank you! Your CPL Ground School enquiry has been received. An Airborne admissions counsellor will contact you within 24 hours."
              />
            </div>
          </div>

        </div>
        <CourseReviews />
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the CPL Ground School at Airborne Aviation Academy, Dwarka. Please share July 2026 batch details and fee."
          nextCourses={[
            { label: 'ATPL Ground School', href: '/courses/atpl', note: 'Prepare for ATPL exams and upgrade to Captain — CPL holders only' },
            { label: 'Parent Centric Flying Guide', href: '/courses/flying-training-india-abroad', note: 'Comprehensive CPL flight training guidance and Indian CPL conversion support' },
            { label: 'GD & PI Course', href: '/courses/gd-pi', note: 'Group discussion and interview coaching' },
          ]}
          relatedCourses={[
            { label: 'ATPL Ground School', href: '/courses/atpl' },
            { label: 'Airline Interview Prep', href: '/courses/airline-preparation' },
            { label: 'A320 Simulator FBS', href: '/courses/a320-simulator' },
            { label: 'PPL', href: '/courses/private-pilot-license' },
            { label: 'Cadet Preparation', href: '/courses/cadet-preparation' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
