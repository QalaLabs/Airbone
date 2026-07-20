import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Airline GD PI Interview Preparation Delhi | Airborne Aviation',
  description: 'Airline interview preparation at Airborne, Dwarka — 2,500+ students trained. GD, PI, personal development, mock interviews by Rajeet Khalsa. IndiGo, Air India, Akasa-ready.',
  alternates: { canonical: '/courses/airline-preparation' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Airline Interview Prep', path: '/courses/airline-preparation' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'GD/PI & Airline Interview Preparation',
  description: 'Structured airline interview preparation covering group discussion, personal interview, personal development, communication skills, resume crafting, and mock interviews.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  url: 'https://www.airborneaviation.in/courses/airline-preparation',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who trains the airline interview preparation module at Airborne?',
      acceptedAnswer: { '@type': 'Answer', text: 'The module is led by Rajeet Khalsa, a certified soft-skills trainer with airline HR experience. Rajeet has prepared hundreds of CPL holders for IndiGo, Air India, Akasa Air, and SpiceJet selection panels.' }
    },
    {
      '@type': 'Question',
      name: 'What makes airline interviews different from normal job interviews?',
      acceptedAnswer: { '@type': 'Answer', text: 'Airline selection panels assess CRM (Crew Resource Management) principles, situational judgement, composure under pressure, and cultural fit with the airline. Standard job interview prep does not cover these. Airborne\'s program is aviation-specific — every scenario, role-play, and mock interview is calibrated to actual airline interview formats.' }
    }
  ]
}

const MODULES = [
  { module: 'Group Discussion (GD)', detail: 'Topic types used by IndiGo, Air India & Akasa. Speaking strategy, listening, leadership signals, time management within GD.' },
  { module: 'Personal Interview (PI)', detail: 'Question bank from real airline panels. CRM principles, situational questions, "tell me about a time when..." frameworks.' },
  { module: 'Personal Development', detail: 'Grooming standards, posture, body language, uniform protocol, eye contact, and composure under high-pressure assessment.' },
  { module: 'Communication Skills', detail: 'Phonetics, aviation English, ICAO phraseology for interview context, clarity of expression, technical vocabulary confidence.' },
  { module: 'Resume & Document Prep', detail: 'Airline-format logbook summary, CPL document checklist, medical certificate presentation, licence endorsement formatting.' },
  { module: 'Mock Interviews', detail: 'Structured mock sessions with Rajeet Khalsa. Video recorded, scored against airline rubric, full written debrief provided.' },
]

export default function AirlinePreparationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">Airline Interview Prep</span>
        </div>

        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom_instructor.jpg" alt="Airline GD PI Interview Preparation at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · ₹1,00,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                GD/PI & Airline Interview Preparation — IndiGo, Air India & Akasa
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Getting a CPL is the qualifying step. Getting hired is a different skill. Airborne's airline interview preparation program — led by Rajeet Khalsa — prepares pilots for the GD, PI, and final selection rounds at India's top carriers. Every module is calibrated to actual airline interview formats, not generic HR coaching.
              </p>
            </div>

            {/* Trainer */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Your Trainer — Rajeet Khalsa
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                Rajeet Khalsa is a certified soft-skills and personal development trainer with deep airline HR experience. At Airborne, Rajeet leads all GD/PI preparation, mock interview sessions, and personal development coaching. Students trained by Rajeet have successfully cleared selection panels at IndiGo, Air India, Akasa Air, and SpiceJet.
              </p>
            </div>

            {/* Modules */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What's Covered — 6 Modules
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

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Who trains the airline interview preparation module at Airborne?', a: 'The module is led by Rajeet Khalsa, a certified soft-skills trainer with airline HR experience. Rajeet has prepared hundreds of CPL holders for IndiGo, Air India, Akasa Air, and SpiceJet selection panels.' },
                  { q: 'What makes airline interviews different from normal job interviews?', a: "Airline selection panels assess CRM (Crew Resource Management) principles, situational judgement, composure under pressure, and cultural fit with the airline. Standard job interview prep does not cover these. Airborne's program is aviation-specific — every scenario, role-play, and mock interview is calibrated to actual airline interview formats." },
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
                <div className="course-sidebar-price">₹1,00,000</div>
                <span className="course-sidebar-note">GD + PI + Mock Interviews + PD</span>
              </div>
              <LeadForm courseName="GD/PI & Airline Interview Preparation" source="Course Detail: airline-preparation" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Airline GD/PI Interview Preparation course at Airborne Aviation Academy. Please share details."
          nextCourses={[
            { label: 'Cadet Pilot Preparation', href: '/courses/cadet-preparation', note: 'Full aptitude, SIM and interview prep for IndiGo, Air India & Akasa cadet programs' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'ATPL Ground School', href: '/courses/atpl' },
            { label: 'A320 Simulator', href: '/courses/a320-simulator' },
            { label: 'Cadet Preparation', href: '/courses/cadet-preparation' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
