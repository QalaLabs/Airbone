import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'CAS Compass & ADAPT Test Preparation | Pilot Aptitude | Airborne',
  description: 'Prepare for DGCA CAS Compass and ADAPT pilot aptitude screening tests at Airborne Aviation Academy, Dwarka. Structured preparation for cadet pilot selection.',
  alternates: { canonical: '/courses/cas-compass-adapt' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'CAS Compass & ADAPT Prep', path: '/courses/cas-compass-adapt' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'CAS Compass & ADAPT Pilot Aptitude Test Preparation',
  description: 'Structured preparation for CAS Compass and ADAPT pilot aptitude screening tests. Covers numerical, spatial, multi-tasking, psychomotor, and personality assessment.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  url: 'https://www.airborneaviation.in/courses/cas-compass-adapt',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can aptitude test scores be improved with preparation?',
      acceptedAnswer: { '@type': 'Answer', text: 'Performance on timed tests improves substantially with familiarity and practice under time pressure. Structured preparation reduces first-exposure anxiety and helps candidates perform closer to their actual ability ceiling.' }
    },
    {
      '@type': 'Question',
      name: 'Which airlines use CAS Compass or ADAPT?',
      acceptedAnswer: { '@type': 'Answer', text: "Several Indian airlines use aptitude screening tools in cadet and direct entry selection. Airborne's preparation covers cognitive, spatial, and psychomotor components common across all major airline aptitude test formats." }
    }
  ]
}

const PREP_MODULES = [
  { domain: 'Numerical Reasoning', what: 'Speed and accuracy with numbers under time pressure', how: 'Timed drill sessions with difficulty progression' },
  { domain: 'Spatial Reasoning', what: '3D visualisation and instrument reading', how: 'Flight instrument interpretation exercises' },
  { domain: 'Multi-Tasking', what: 'Managing multiple information streams simultaneously', how: 'Dual-task exercises under time pressure' },
  { domain: 'Psychomotor Coordination', what: 'Hand-eye coordination for flight controls', how: 'Tracking and joystick coordination tasks' },
  { domain: 'Personality Assessment', what: 'Temperament and cockpit suitability', how: 'Awareness coaching (not gaming the test)' },
]

export default function CASCompassAdaptPage() {
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
          <span className="current">CAS Compass & ADAPT Prep</span>
        </div>

        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom_instructor.jpg" alt="CAS Compass and ADAPT Test Preparation at Airborne Aviation Academy" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · ₹30,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                CAS Compass & ADAPT Pilot Aptitude Test Preparation | Dwarka, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Airborne Aviation Academy offers structured preparation for the CAS Compass and ADAPT pilot aptitude test batteries used in airline and cadet selection. Our program covers all five domains — numerical, spatial, multi-tasking, psychomotor, and personality — with timed drills, hardware practice, and expert debrief.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is The ADAPT Test?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                ADAPT (Automated Dynamic Aptitude Profile Test) is a computerised pilot aptitude test battery assessing cognitive fitness, multi-tasking ability, spatial reasoning, and decision-making under pressure. Airlines use ADAPT scores as part of cadet and direct entry selection.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is The CAS Compass Test?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                CAS Compass is an aviation-specific psychometric assessment evaluating cognitive ability, procedural learning, instrument interpretation, and suitability for pilot training — used by several Indian and international airline cadet programs as a first-round screening tool.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Airborne Prepares You For
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '0.75rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr', gap: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0, 39, 76, 0.45)' }}>Test Component</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0, 39, 76, 0.45)' }}>Skill Tested</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0, 39, 76, 0.45)' }}>Preparation Method</div>
                </div>
                {PREP_MODULES.map((m, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? 'rgba(0, 39, 76, 0.02)' : 'transparent', borderTop: '1px solid rgba(0, 39, 76, 0.05)', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr', gap: '1rem', alignItems: 'start' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>{m.domain}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.55)', lineHeight: '1.5' }}>{m.what}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--navy)', lineHeight: '1.5' }}>{m.how}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                FAQs
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Can aptitude test scores be improved with preparation?', a: 'Performance on timed tests improves substantially with familiarity and practice under time pressure. Structured preparation reduces first-exposure anxiety and helps candidates perform closer to their actual ability ceiling.' },
                  { q: 'Which airlines use CAS Compass or ADAPT?', a: "Several Indian airlines use aptitude screening tools in cadet and direct entry selection. Airborne's preparation covers cognitive, spatial, and psychomotor components common across all major airline aptitude test formats." },
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
                <span className="course-sidebar-note">All 5 domains · CAS Compass + ADAPT</span>
              </div>
              <LeadForm courseName="CAS Compass & ADAPT Preparation" source="Course Detail: cas-compass-adapt" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I want to prepare for the CAS Compass / ADAPT pilot aptitude test at Airborne Aviation Academy, Dwarka. Please share details."
          nextCourses={[
            { label: 'Cadet Pilot Preparation', href: '/courses/cadet-preparation', note: 'Full GD/PI and SIM prep for IndiGo, Air India & Akasa cadet programs' },
            { label: 'A320 Simulator', href: '/courses/a320-simulator', note: 'Practice the SIM assessment with our in-house A320 FTD' },
          ]}
          relatedCourses={[
            { label: 'Cadet Preparation', href: '/courses/cadet-preparation' },
            { label: 'Airline Interview Prep', href: '/courses/airline-preparation' },
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
