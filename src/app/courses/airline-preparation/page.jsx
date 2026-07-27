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
  title: 'Airline Interview Preparation Delhi | 3 Months | Airborne',
  description: 'Premium airline interview preparation in Dwarka — multi-round GD, PI, soft skills and mock panels for IndiGo, Air India, Akasa and more. 3 months. ₹1,50,000.',
  alternates: { canonical: '/courses/airline-preparation' },
}

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['airline-preparation'],
  faqs: [
  {
    q: 'How is Airline Interview Preparation different from the GD & PI Course?',
    a: 'The GD & PI Course (₹30,000) covers core group discussion and interview foundations. Airline Interview Preparation (₹1,50,000) is the premium 3-month track with deeper mock airline panels, extended soft-skills coaching, and selection-format drills for IndiGo, Air India, Akasa and similar airlines.'
  },
  {
    q: 'How long is Airline Interview Preparation?',
    a: '3 months of structured preparation with ongoing mock sessions available.'
  },
  {
    q: 'Is this only for pilots?',
    a: 'Open to both pilot and cabin crew candidates. Formats are adjusted for the role. Cabin crew candidates are also covered under Cabin Crew Training pathways.'
  }
],
})

const MODULES = [
  { module: 'Airline Selection Roadmap', detail: 'Stage-by-stage walkthrough of IndiGo, Air India, Akasa and similar airline hiring funnels — what each round tests and how to prepare.' },
  { module: 'Advanced Group Discussion', detail: 'Timed multi-candidate GDs on aviation and current-affairs topics used by airline panels, with structured debriefs.' },
  { module: 'Technical + HR Interview Drills', detail: 'Airline-specific technical questions, HR behavioural rounds, and handling pressure questions under panel conditions.' },
  { module: 'Soft Skills & Presence', detail: 'Professional presence, body language, diction, and confidence coaching for final selection rounds.' },
  { module: 'Resume & Application Strategy', detail: 'Aviation resume format, what airline recruiters scan for, and application sequencing across cadet and direct-entry paths.' },
  { module: 'Full Mock Airline Panels', detail: 'Recorded full-length mock panels with ex-industry feedback — closest rehearsal to a live airline interview day.' },
]

export default function AirlinePreparationPage() {
  return (
    <>
      <JsonLd data={coursePageGraph} />

      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        <div className="course-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/courses">Courses</Link>
          <span>/</span>
          <span className="current">Airline Interview Preparation</span>
        </div>

        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom_instructor.jpg" alt="Airline Interview Preparation at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3 Months · ₹1,50,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Airline Interview Preparation
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Premium 3-month airline interview preparation for CPL holders and cadet applicants targeting IndiGo, Air India, Akasa and similar airlines. Multi-round GD, PI, soft skills and full mock panels — led by Rajeet Khalsa, retired AGM (Training) at Air India with 37+ years of experience. Looking for the foundational track? See our{' '}
                <Link href="/courses/gd-pi" style={{ color: 'var(--red)', fontWeight: 600 }}>GD &amp; PI Course (₹30,000)</Link>.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why Airline Interview Preparation Matters
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                A CPL alone does not secure an airline seat. Every major carrier runs multi-round selection where communication, personality and situational judgement sit alongside technical competence. This premium track rehearses the full selection day — not just a single mock interview.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                What The Program Covers
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {MODULES.map((m, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? 'rgba(0, 39, 76, 0.02)' : 'transparent', border: '1px solid rgba(0, 39, 76, 0.08)', borderLeft: '3px solid #DB241E', padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>{m.module}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.55)', lineHeight: '1.6' }}>{m.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                Your Trainer | Rajeet Khalsa
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                Rajeet Khalsa retired as AGM (Training) at Air India after 37+ years. A certified soft skills trainer and image consultant who trained cabin crew and airline professionals for India&apos;s national carrier. At Airborne, Rajeet leads this premium airline interview track.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                FAQs
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'How is this different from the GD & PI Course?', a: 'GD & PI Course (₹30,000) is the foundational track. Airline Interview Preparation (₹1,50,000) is the premium 3-month package with deeper mock airline panels and extended coaching.' },
                  { q: 'How long is Airline Interview Preparation?', a: '3 months of structured preparation, with ongoing mock sessions available.' },
                  { q: 'Is this only for pilots?', a: 'Open to both pilot and cabin crew candidates. Formats are adjusted for the role.' },
                ].map((faq, i) => (
                  <div key={i} className="course-faq-item">
                    <h3 className="course-faq-q">{faq.q}</h3>
                    <p className="course-faq-a">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="course-sidebar-card">
                <span className="course-sidebar-label">Course Fee</span>
                <div className="course-sidebar-price">₹1,50,000</div>
                <span className="course-sidebar-note">Premium airline selection track</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 3 Months</div>
              </div>
              <LeadForm courseName="Airline Interview Preparation (₹1,50,000)" source="Course Detail: airline-preparation" />
            </div>
          </div>

        </div>
        <CourseReviews />
        <CoursePageFooter
          whatsappText="Hi, I'm interested in Airline Interview Preparation (₹1,50,000) at Airborne Aviation Academy. Please share details."
          nextCourses={[
            { label: 'GD & PI Course (₹30,000)', href: '/courses/gd-pi', note: 'Foundational GD/PI track if you want the core program first' },
            { label: 'Cadet Pilot Preparation', href: '/courses/cadet-preparation', note: 'Aptitude, SIM and interview prep for IndiGo, Air India & Akasa cadet programs' },
          ]}
          relatedCourses={[
            { label: 'GD & PI Course', href: '/courses/gd-pi' },
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'ATPL Ground School', href: '/courses/atpl' },
            { label: 'A320 Simulator FBS', href: '/courses/a320-simulator' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
