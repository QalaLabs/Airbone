import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'

import CoursePageFooter from '@/components/CoursePageFooter'
import CourseReviews from '@/components/CourseReviews'
import JsonLd from '@/components/JsonLd'
import { buildCoursePageGraph } from '@/lib/schema'
import { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'
import StudentJourneyLimeTimeline from '@/components/StudentJourneyLimeTimeline'

export const metadata = {
  title: 'Commercial Pilot License Ground Classes in Delhi - DGCA Complied | Airborne Aviation',
  description: 'Clear all 5 DGCA CPL papers on your first attempt. DGCA Complied CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
  alternates: { canonical: '/courses/commercial-pilot-license-cpl' },
  openGraph: {
    title: 'Commercial Pilot License Ground Classes in Delhi - DGCA Complied | Airborne Aviation',
    description: 'Clear all 5 DGCA CPL papers on your first attempt. DGCA Complied CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
    url: 'https://www.airborneaviation.in/courses/commercial-pilot-license-cpl',
  },
  twitter: {
    title: 'Commercial Pilot License Ground Classes in Delhi - DGCA Complied | Airborne Aviation',
    description: 'Clear all 5 DGCA CPL papers on your first attempt. DGCA Complied CPL Ground School in Dwarka, Delhi by Capt. Navrang Singh.',
  },
}

const CPL_FAQS = [
  {
    q: 'What DGCA exams are required for CPL?',
    a: 'Six DGCA examinations: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. Each paper requires minimum 70% to pass.',
  },
  {
    q: 'How much does CPL Ground School cost at Airborne?',
    a: '₹2,70,000 covering DGCA CPL theory subjects including RTR, taught directly by Capt. Navrang Singh. All subjects included - no separate fees per paper.',
  },
  {
    q: 'How much does the full CPL cost in India?',
    a: 'CPL training in India costs ₹55–65 lakh at DGCA-approved FTOs, covering 200 flying hours, ground school, DGCA exam fees, and medical. Education loans available via SBI, Bank of Baroda, PNB.',
  },
  {
    q: 'What is the batch size?',
    a: 'Strictly capped at 25 students per session to maintain high contact ratios and personalised pacing.',
  },
  {
    q: 'How long does CPL Ground School take?',
    a: '3–6 months for the complete ground school curriculum. Weekend and weekday batches available.',
  },
  {
    q: 'How long is the full CPL path?',
    a: 'The complete CPL journey from ground school to license issuance typically takes 12–18 months, depending on flying weather and training pace.',
  },
]

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['commercial-pilot-license-cpl'],
  faqs: CPL_FAQS,
})

const SUBJECTS = [
  { code: '01', title: 'Air Navigation', desc: 'General navigation, instrumentation, flight planning, and radio navigation aids.' },
  { code: '02', title: 'Aviation Meteorology', desc: 'Atmospheric pressure, winds, cloud formations, and decoding METAR/TAF forecasts.' },
  { code: '03', title: 'Air Regulations', desc: 'ICAO conventions, Rules of the Air, air traffic services, and national flight regulations.' },
  { code: '04', title: 'Technical General', desc: 'Aircraft engines, airframe systems, aerodynamics, flight controls, and emergency equipment.' },
  { code: '05', title: 'Technical Specific', desc: 'System specifications for training fleets like Cessna 152/172 or multi-engine aircraft.' },
  { code: '06', title: 'RTR (Aero)', desc: 'Radio Telephony transmission, reception protocols, and operational safety comms.' },
]

const FEE_ROWS = [
  { component: 'CPL Ground School', amount: '₹75,000' },
  { component: 'Flying Training (200 Hours)', amount: '₹42,00,000' },
  { component: 'Class 2 & Class 1 Medicals', amount: '₹15,000' },
  { component: 'DGCA Exams & Licensing fees', amount: '₹20,000' },
  { component: 'Simulator Sessions (A320 FBS)', amount: '₹12,000' },
  { component: 'Total (approximate)', amount: '₹55–65 lakh' },
]

const ISSUANCE = [
  {
    req: 'Age',
    detail: 'Minimum 18 years',
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  },
  {
    req: 'Education',
    detail: 'Class 12 with Physics and Mathematics',
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.9a2 2 0 0 0 1.66 0z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    )
  },
  {
    req: 'Flying Training',
    detail: '200 hours',
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5l-8.2-1.8c-.8-.2-1.7.2-2 1-.3.8 0 1.7.7 2.1l7.8 4.2-4.2 4.2-3.1-1c-.5-.2-1.1-.1-1.5.3L2 19.5l3.5 1 1 3.5.5-1c.4-.4.5-1 .3-1.5l-1-3.1 4.2-4.2 4.2 7.8c.4.7 1.3 1 2.1.7.8-.3 1.2-1.2 1-2z" />
      </svg>
    )
  },
  {
    req: 'DGCA Exam',
    detail: 'Passed',
    iconColor: '#7c3aed',
    iconBg: '#f3e8ff',
    bg: '#FFFBF0',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }
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
          <img src="/footage/hero-cockpit.jpg" alt="CPL Ground School at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" style={{ width: '100%', height: '100%', objectFit: 'fill', objectPosition: 'center' }} />
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
                Commercial Pilot License Ground Classes in Delhi - DGCA Complied
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75', maxWidth: '100%' }}>
                Airborne Aviation Academy offers a DGCA Complied Commercial Pilot License (CPL) Ground School in Dwarka, Delhi. The CPL Ground School covers DGCA theory subjects including RTR - taught personally by Capt. Navrang Singh. Structured concept-focused preparation for DGCA exams. Batches capped at 25 seats. ₹2,70,000.
              </p>
            </div>

            {/* Subjects */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                DGCA Ground School - Curriculum Subjects
              </h2>
              <div className="course-subject-grid">
                {SUBJECTS.map((s, i) => (
                  <div key={i} className="cpl-subject-card">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--red)', background: 'rgba(219,36,30,0.06)', padding: '0.15rem 0.4rem', borderRadius: '2px', border: '1px solid rgba(219,36,30,0.15)', fontFamily: 'var(--font-h)' }}>
                        SUBJECT {s.code}
                      </span>
                    </div>
                    <div className="course-subject-card-title">{s.title}</div>
                    <div className="course-subject-card-detail">{s.desc}</div>
                  </div>
                ))}
              </div>
              <StudentJourneyLimeTimeline />
            </div>

            {/* Fee Breakdown */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                CPL Course Fees - Full Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {FEE_ROWS.map((row, i) => {
                  const isTotal = i === FEE_ROWS.length - 1;
                  return (
                    <div key={i} style={{
                      background: isTotal ? 'var(--navy)' : '#ffffff',
                      border: '1px solid rgba(0, 39, 76, 0.08)',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,39,76,0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderTop: isTotal ? '3px solid var(--red)' : '1px solid rgba(0, 39, 76, 0.08)'
                    }}>
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.78rem', fontWeight: 700, color: isTotal ? 'rgba(255,255,255,0.7)' : 'rgba(0, 39, 76, 0.45)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                        {row.component}
                      </div>
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: isTotal ? '#ffffff' : 'var(--navy)' }}>
                        {row.amount}
                      </div>
                    </div>
                  )
                })}
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
              <div className="cpl-requirements-grid">
                {ISSUANCE.map((row, i) => (
                  <div
                    key={i}
                    className="cpl-requirement-card"
                    style={{ background: row.bg || '#ffffff' }}
                  >
                    <div
                      className="cpl-requirement-icon-wrap"
                      style={{ backgroundColor: row.iconBg, color: row.iconColor }}
                    >
                      {row.icon}
                    </div>
                    <h3 className="cpl-requirement-title">
                      {row.req}
                    </h3>
                    <div className="cpl-requirement-divider" />
                    <p className="cpl-requirement-desc">
                      {row.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why NOW is the best time to fly */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why NOW is the Best Time to Become a Pilot in India
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {[
                  { title: '1,500+ Aircraft Ordered', desc: 'IndiGo, Air India, and Akasa Air have placed record-breaking aircraft orders, creating a decade-long demand for new flight deck crew.' },
                  { title: 'Severe Pilot Shortage', desc: 'Boeing estimates that Indian carriers will need 8,000+ new commercial pilots over the next 10 years to staff the expanding domestic fleet.' },
                  { title: 'Rapid Captain Upgrades', desc: 'Industry expansion has halved the traditional time needed to upgrade from First Officer to Command Captain.' },
                ].map((item, idx) => (
                  <div key={idx} className="cpl-why-now-card">
                    <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.65)', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Training & Simulator Showcase */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Flight Training & Simulator Showcase
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/10', boxShadow: '0 4px 20px rgba(0,39,76,0.01)' }}>
                  <img src="/footage/cpl-flying-training-cockpit.jpg" alt="Flight Training cockpit" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/10', boxShadow: '0 4px 20px rgba(0,39,76,0.01)' }}>
                  <img src="/footage/simulator-training.jpg" alt="A320 Simulator Training sessions" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>

            {/* Why Airborne */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why Choose Airborne for CPL Ground School?
              </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { title: 'Founder Teaches Every Class', body: 'All five DGCA papers personally taught by Capt. Navrang Singh - no junior staff on core subjects.' },
                  { title: 'First-Principles Approach', body: 'No question banks. DGCA syllabi taught from fundamentals up.' },
                  { title: 'Small Batches - Max 25', body: 'Training paced according to each student\'s learning speed.' },
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
                {CPL_FAQS.map((faq, i) => (
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
                <span className="course-sidebar-note">DGCA CPL theory subjects including RTR</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>3–6 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Batch Size</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>Max 25 Students</div>
                <span className="course-sidebar-note">Contact admissions for next batch dates</span>
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
          whatsappText="Hi, I'm interested in the CPL Ground School at Airborne Aviation Academy, Dwarka. Please share next batch details and fee."
          nextCourses={[
            { label: 'ATPL Ground School', href: '/courses/atpl', note: 'Prepare for ATPL exams and upgrade to Captain - CPL holders only' },
            { label: "Securing Your Child's Future in Aviation", href: '/courses/flying-training-india-abroad', note: 'Comprehensive CPL flight training guidance and Indian CPL conversion support' },
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
        <style dangerouslySetInnerHTML={{__html: `
          .cpl-subject-card {
            background: #ffffff;
            border: 1px solid rgba(0, 39, 76, 0.08);
            padding: 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,39,76,0.01);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .cpl-subject-card:hover {
            transform: translateY(-4px);
            border-color: #84cc16;
            box-shadow: 0 12px 30px rgba(132, 204, 22, 0.08);
          }
          .cpl-why-now-card {
            background: #ffffff;
            border: 1px solid rgba(132, 204, 22, 0.15);
            border-left: 4px solid #84cc16;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(132, 204, 22, 0.02);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .cpl-why-now-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(132, 204, 22, 0.08);
          }
        `}} />
      </main>
      <Footer />
    </>
  )
}
