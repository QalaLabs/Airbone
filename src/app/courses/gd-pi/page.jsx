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
  title: 'GD & PI Course Delhi | ₹30,000 | Airborne Aviation',
  description: 'Foundational GD & PI course in Dwarka - group discussion, personal interview and personality development with Rajeet Khalsa (ex-Air India AGM). 3 months. ₹30,000.',
  alternates: { canonical: '/courses/gd-pi' },
}

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['gd-pi'],
  faqs: [
  {
    q: 'How long is the GD & PI course?',
    a: '3 months for intensive preparation, with ongoing mock sessions available.'
  },
  {
    q: 'How is this different from Airline Interview Preparation?',
    a: 'GD & PI Course (₹30,000) is the foundational track for group discussion and interview skills. Airline Interview Preparation (₹1,25,000) is the premium 3-month package with deeper mock airline panels and extended coaching.'
  },
  {
    q: 'Is this only for pilots?',
    a: 'Open to both pilot and cabin crew candidates. GD/PI formats are adjusted for the specific role.'
  }
],
})

const MODULES = [
  { module: 'Group Discussion (GD)', detail: 'Topic selection strategy, structure, timed mock GDs with panel feedback, aviation and current affairs topics used by IndiGo/Air India.' },
  { module: 'Personal Interview (PI)', detail: 'Airline-specific questions, technical and HR round prep, common pitfalls, handling difficult questions.' },
  { module: 'Personality Development', detail: 'Professional presence, body language, first impression, interview confidence, handling difficult scenarios.' },
  { module: 'Communication & Diction', detail: 'English fluency, clarity, voice modulation, aviation phraseology in non-technical contexts.' },
  { module: 'Resume & Application', detail: 'Aviation resume format, what airlines look for, covering letter strategy.' },
  { module: 'Mock Interview Rounds', detail: 'Full-length recorded mock interviews with debrief - airline-panel-style feedback by ex-industry professionals.' },
]

export default function GdPiCoursePage() {
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
          <span className="current">GD &amp; PI Course</span>
        </div>

        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom_instructor.jpg" alt="GD and PI Course at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3 Months · ₹30,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                GD &amp; PI Course
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Foundational 3-month GD &amp; PI Course for CPL holders and cadet applicants. Covers Group Discussion (GD), Personal Interview (PI), Personality Development (PD), and aviation communication - led by Rajeet Khalsa, retired AGM (Training) at Air India. Need the premium airline selection track? See{' '}
                <Link href="/courses/airline-preparation" style={{ color: 'var(--red)', fontWeight: 600 }}>Airline Interview Preparation (₹1,25,000)</Link>.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why GD &amp; PI Preparation Matters
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                Having a CPL does not guarantee an airline seat. Every airline - IndiGo, Air India, Akasa Air, SpiceJet - runs a multi-round selection process where communication, personality, and situational judgement are assessed alongside technical competence. Candidates who have never trained for GD/PI consistently underperform in airline assessments, even when technically qualified.
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
                Rajeet Khalsa retired as AGM (Training) at Air India after 37+ years. A certified soft skills trainer and image consultant who trained cabin crew and airline professionals for India&apos;s national carrier. At Airborne, Rajeet runs GD/PI and personality modules - sessions built on real airline selection formats.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                FAQs
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'How long is the GD & PI course?', a: '3 months for intensive preparation, with ongoing mock sessions available.' },
                  { q: 'How is this different from Airline Interview Preparation?', a: 'This ₹30,000 course is the foundational GD/PI track. Airline Interview Preparation (₹1,25,000) is the premium package with deeper mock airline panels.' },
                  { q: 'Is this only for pilots?', a: 'Open to both pilot and cabin crew candidates. GD/PI formats are adjusted for the specific role.' },
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
                <div className="course-sidebar-price">₹30,000</div>
                <span className="course-sidebar-note">GD + PI + Mock Interviews + PD</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 3 Months</div>
              </div>
              <LeadForm courseName="GD & PI Course (₹30,000)" source="Course Detail: gd-pi" />
            </div>
          </div>

        </div>
        <CourseReviews />
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the GD & PI Course (₹30,000) at Airborne Aviation Academy. Please share details."
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Premium 3-month airline selection track (₹1,25,000)' },
            { label: 'Cadet Pilot Preparation', href: '/courses/cadet-preparation', note: 'Full aptitude, SIM and interview prep for IndiGo, Air India & Akasa cadet programs' },
          ]}
          relatedCourses={[
            { label: 'Airline Interview Prep', href: '/courses/airline-preparation' },
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
