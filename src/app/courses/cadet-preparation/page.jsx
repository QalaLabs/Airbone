import NextBatchBadge from '@/components/NextBatchBadge'
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
  title: 'Cadet Pilot Program Prep IndiGo, Air India, Akasa | Airborne',
  description: 'Prepare for IndiGo, Air India & Akasa cadet pilot programs at Airborne, Dwarka. Aptitude tests, GD-PI & simulator prep since 2009. Enrol today.',
  alternates: { canonical: '/courses/cadet-preparation' },
}

const FAQS = [
  {
    q: 'What is the eligibility for airline cadet pilot programmes?',
    rawAnswer: 'The three programmes share the same core requirements: 10+2 with Physics, Mathematics and English, a minimum age of 18, and the ability to clear a DGCA Class 1 medical before training. The main differences are: IndiGo requires minimum 51% in Physics, Math and English; Air India requires 60% overall; Akasa requires 10+2 with Physics, Math and English. Criteria can change with each intake, so always confirm on the airline official careers page.',
    a: (
      <>
        The three programmes share the same core requirements: 10+2 with Physics, Mathematics and English, a minimum age of 18, and the ability to clear a DGCA Class 1 medical before training. The main differences are:
        <ul style={{ margin: '0.75rem 0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong>IndiGo Cadet Pilot Programme:</strong> Indian citizen or OCI; minimum 51% in each of Physics, Mathematics and English; maximum two attempts per selection stage.</li>
          <li><strong>Air India Cadet Pilot Programme:</strong> Indian citizen or OCI; age 18–30; 60% overall in 10+2 and 60% in each of English, Mathematics and Physics; minimum height 158 cm; reapply after a 3-month gap.</li>
          <li><strong>Akasa SkyCadet Programme:</strong> Indian citizens only; minimum 18 at application and maximum 40 at enrolment; 10+2 with Physics, Mathematics and English.</li>
        </ul>
        Criteria can change with each intake, so always confirm on the airline&apos;s official careers page.
      </>
    ),
  },
  {
    q: 'Does Airborne guarantee cadet selection?',
    rawAnswer: "No. Airline selection is entirely the airline's decision. Airborne prepares every candidate to perform at their best at each stage, with the aim of clearing selection in the first attempt. If a student is not selected, we continue preparing them for their next attempt.",
    a: "No. Airline selection is entirely the airline's decision. Airborne prepares every candidate to perform at their best at each stage, with the aim of clearing selection in the first attempt. If a student is not selected, we continue preparing them for their next attempt.",
  },
  {
    q: 'What should you expect from your instructor?',
    rawAnswer: 'Our instructors are airline pilots who cleared the cadet selection process themselves in their first attempt. They know every stage of cadet selection and airline training requirements in depth, and they prepare you to be airline-ready from day one.',
    a: 'Our instructors are airline pilots who cleared the cadet selection process themselves in their first attempt. They know every stage of cadet selection and airline training requirements in depth, and they prepare you to be airline-ready from day one.',
  },
]

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['cadet-preparation'],
  imagePath: '/campus/cadet-pilot-training.jpg',
  price: '50000',
  faqs: FAQS.map((f) => ({ q: f.q, a: f.rawAnswer })),
})

const STAGES = [
  { stage: 'Online Application', format: 'Resume + academic records', prep: 'Resume crafting and document preparation' },
  { stage: 'Aptitude Test', format: 'Numerical, spatial, psychomotor, English (1.5–3 hrs)', prep: 'Full mock test battery with performance analysis' },
  { stage: 'Psychometric Evaluation', format: 'Personality and cognitive test battery', prep: 'Psychometric familiarisation sessions' },
  { stage: 'Simulator Assessment', format: 'Basic flying aptitude on a simulator', prep: 'A320 simulator preparation at Airborne' },
  { stage: 'GD + PI Round', format: 'Group discussion and personal interview with airline panel', prep: 'Mock GD/PI with feedback from airline pilots' },
  { stage: 'Medical', format: 'DGCA Class 1 Medical', prep: 'Pre-medical briefing and guidance' },
]

const CADET_SELECTIONS = [
  {
    name: 'Nayonika Dhagat',
    programme: 'IndiGo Cadet Pilot Programme, via Chimes Aviation Academy',
  },
  {
    name: 'Daksh Jangra',
    programme: 'Air India Cadet Pilot Programme',
  },
  {
    name: 'Krresh Taneja',
    programme: 'IndiGo Cadet Pilot Programme, via Chimes Aviation Academy',
  },
  {
    name: 'Bhaawee Arora',
    programme: 'Akasa SkyCadet Pilot Training Programme',
  },
  {
    name: 'Daksh Yadav',
    programme: 'IndiGo Cadet Pilot Programme, via Chimes Aviation Academy',
  },
  {
    name: 'Akshat Gupta',
    programme: 'Air India Cadet Pilot Programme',
  },
]

export default function CadetPreparationPage() {
  return (
    <>
      <JsonLd data={coursePageGraph} />

      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">Cadet Pilot Preparation</span>
        </div>

        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/campus/cadet-pilot-training.jpg" alt="Cadet Pilot Program Preparation at Airborne Aviation Academy" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            {/* 1 · HERO — TAGLINE + INTRO ENDING CHANGED */}
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(219,36,30,0.1)', border: '1px solid rgba(219,36,30,0.3)', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.08em', color: '#DB241E', textTransform: 'uppercase', marginBottom: '1rem' }}>
                A DIRECT ROUTE TO THE AIRLINE COCKPIT
              </div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · ₹50,000
              </span>
              <NextBatchBadge style={{ marginLeft: '0.5rem' }} />
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Cadet Pilot Program Preparation - IndiGo, Air India &amp; Akasa
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Airborne Aviation Academy prepares aspiring pilots for the cadet pilot programs of India&apos;s leading airlines - IndiGo, Air India, and Akasa Air. Our cadet preparation covers aptitude testing, psychometric evaluation, GD/PI, and the complete selection pathway from application to airline selection.
              </p>
            </div>

            {/* 2 · PARAGRAPH REPLACED: What Is a Cadet Program */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is a Cadet Pilot Program?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                A cadet pilot program is an airline-guided pathway. The airline selects aspiring pilots and trains them to its own procedures and requirements, in a structured, fast-track manner, to serve the airline from the right seat as a First Officer. Selected cadets typically receive an LOI (Letter of Intent): the airline&apos;s written intent to employ them on successful completion of training, subject to the airline&apos;s terms.
              </p>
            </div>

            {/* 3 · PROGRAMME NAMES CORRECTED: Cadet Pathways by Airline */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Cadet Pathways by Airline
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderLeft: '3px solid #D8A027', padding: '1.5rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>INDIGO</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(0, 39, 76, 0.75)', marginBottom: '0.75rem', fontWeight: 700 }}>IndiGo Cadet Pilot Programme</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.5' }}>Airline selection through IndiGo&apos;s approved training partners, with a Letter of Intent on clearing selection</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderLeft: '3px solid #D8A027', padding: '1.5rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AIR INDIA</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(0, 39, 76, 0.75)', marginBottom: '0.75rem', fontWeight: 700 }}>Air India Cadet Pilot Programme</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.5' }}>CPL training at the Air India Flying Academy, Amravati, and Air India&apos;s partner schools</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderLeft: '3px solid #D8A027', padding: '1.5rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AKASA AIR</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(0, 39, 76, 0.75)', marginBottom: '0.75rem', fontWeight: 700 }}>Akasa SkyCadet Pilot Training Programme</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.5' }}>Ground school, CPL training and Boeing 737 MAX type rating</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.65)', marginTop: '1.25rem', lineHeight: '1.6' }}>
                Programme details change with each intake. Always confirm on the airline&apos;s official careers page.
              </p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.55)', marginTop: '0.35rem', lineHeight: '1.6' }}>
                For mock tests and specific airline preparation, contact <a href="mailto:deepak@airborneaviation.in" style={{ color: '#D8A027', textDecoration: 'underline' }}>deepak@airborneaviation.in</a>
              </p>
            </div>

            {/* 4A · 4B: Selection Stages Table */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Cadet Program Selection Stages - What Airborne Prepares You For
              </h2>
              <div className="course-table-wrap">
                <table className="course-table" aria-label="Cadet Program Selection Stages and Preparation">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', minWidth: '150px' }}>Selection Stage</th>
                      <th style={{ textAlign: 'left', minWidth: '180px' }}>Airline Requirement</th>
                      <th style={{ textAlign: 'left', minWidth: '200px' }}>Airborne Preparation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAGES.map((s, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>
                          {s.stage}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.5' }}>
                          {s.format}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 500, lineHeight: '1.5' }}>
                          {s.prep}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5 · NEW SECTION: Learn From Airline Pilots */}
            <div className="course-section-divider">
              <div
                style={{
                  background: 'linear-gradient(135deg, #001f3f 0%, #001529 100%)',
                  border: '1px solid rgba(216, 160, 39, 0.25)',
                  borderRadius: '8px',
                  padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                  color: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 12px 36px rgba(0, 21, 41, 0.25)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-h)',
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    color: '#D8A027',
                    textTransform: 'uppercase',
                    marginBottom: '0.6rem',
                  }}
                >
                  LEARN FROM AIRLINE PILOTS
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-h)',
                    fontSize: 'clamp(1.2rem, 2.2vw, 1.65rem)',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: '1.25',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    margin: '0 0 0.85rem',
                  }}
                >
                  WHY SETTLE FOR AN ORDINARY INSTRUCTOR WHEN AN AIRLINE PILOT CAN PREPARE YOU?
                </h3>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.6',
                    margin: '0 0 1.5rem',
                  }}
                >
                  Selected through an airline cadet program. Now your instructor.
                </p>
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderLeft: '4px solid #DB241E',
                    borderRadius: '4px',
                    padding: '0.85rem 1.15rem',
                    fontSize: '0.88rem',
                    color: 'rgba(255, 255, 255, 0.92)',
                    lineHeight: '1.55',
                  }}
                >
                  Choose your instructor wisely. IndiGo&apos;s cadet selection allows <span style={{ color: '#DB241E', fontWeight: 800 }}>only two attempts</span> per stage.
                </div>
              </div>
            </div>

            {/* 6A · SUB-HEADLINE WORD CHANGED & 7 · NEW SECTION: OUR CADET SELECTIONS (REPLACES SHORTS) */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Cadet Pilot Screening &amp; Aptitude Prep
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: '0 0 2.5rem' }}>
                ADAPT test preparation, psychomotor screening drills, and airline cadet intake guidance.
              </p>

              <h2 className="course-section-title" style={{ marginTop: '2.5rem' }}>
                Our Cadet Selections
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.7)', marginTop: '-1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Last batch selections: 3 of our 6 selected cadets cleared selection through Chimes Aviation Academy.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                {CADET_SELECTIONS.map((cadet, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(0, 39, 76, 0.08)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0, 39, 76, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Navy Video Placeholder */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #001830 0%, #00274C 100%)',
                        aspectRatio: '16/10',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255, 255, 255, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-h)',
                          fontSize: '0.62rem',
                          letterSpacing: '0.16em',
                          fontWeight: 800,
                          color: '#D8A027',
                          textTransform: 'uppercase',
                        }}
                      >
                        REVIEW VIDEO
                      </span>
                    </div>

                    {/* Cadet details */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-h)',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: 'var(--navy)',
                          marginBottom: '0.3rem',
                        }}
                      >
                        {cadet.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'rgba(0, 39, 76, 0.65)',
                          lineHeight: '1.45',
                        }}
                      >
                        {cadet.programme}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Card 7: Action CTA Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)',
                    border: '2px solid #DB241E',
                    borderRadius: '6px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '1.25rem',
                    boxShadow: '0 6px 24px rgba(219, 36, 30, 0.08)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-h)',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: 'var(--navy)',
                      lineHeight: '1.2',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}
                  >
                    YOU CAN BE<br />THE NEXT.
                  </h3>
                  <Link
                    href="/contact"
                    className="btn btn-primary"
                    aria-label="Book a free demo"
                    style={{
                      fontSize: '0.82rem',
                      padding: '0.7rem 1.25rem',
                      width: '100%',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    BOOK A FREE DEMO
                  </Link>
                </div>
              </div>
            </div>

            {/* 8 · ALL FAQS REPLACED (3) */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                FAQs
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {FAQS.map((faq, i) => (
                  <div key={i} className="course-faq-item">
                    <h3 className="course-faq-q">{faq.q}</h3>
                    <div className="course-faq-a" style={{ color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.65', fontSize: '0.9rem' }}>
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="course-sidebar-card">
                <span className="course-sidebar-label">Course Fee</span>
                <div className="course-sidebar-price">₹50,000</div>
                <span className="course-sidebar-note">Aptitude prep, GD/PI, SIM familiarisation</span>
              </div>
              <LeadForm
                courseName="Cadet Pilot Program Preparation"
                source="Course Detail: cadet-preparation"
                successMessage="Your enquiry has been received."
              />
            </div>
          </div>

        </div>
        <CourseReviews />
        <CoursePageFooter
          whatsappText="Hi, I'm interested in Cadet Pilot Program Preparation at Airborne Aviation Academy, Dwarka. Please share details for IndiGo/Air India/Akasa cadet prep."
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Advanced GD/PI coaching' },
            { label: 'A320 Simulator', href: '/courses/a320-simulator', note: 'Simulator assessment practice on our in-house A320 FTD' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'ATPL Ground School', href: '/courses/atpl' },
            { label: 'CASS Compass & ADAPT', href: '/courses/cas-compass-adapt' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
