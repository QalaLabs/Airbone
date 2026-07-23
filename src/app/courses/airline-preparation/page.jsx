import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Airline Interview Prep Delhi | GD/PI & Personality | Airborne',
  description: 'Structured airline interview prep at Airborne, Dwarka. GD/PI coaching and personality development by retired Air India AGM with 37+ years experience. Book now.',
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
  name: 'Airline Preparation | GD/PI, Personality Development & Interview Coaching',
  description: 'Structured airline interview preparation covering group discussion, personal interview, personality development, communication & diction, resume & application, and mock interview rounds.',
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
      name: 'How long is the airline preparation course?',
      acceptedAnswer: { '@type': 'Answer', text: '4–6 weeks for intensive preparation, with ongoing mock sessions available. Duration is adjusted based on how soon the candidate has an actual interview.' }
    },
    {
      '@type': 'Question',
      name: 'Is this only for pilots?',
      acceptedAnswer: { '@type': 'Answer', text: 'Open to both pilot and cabin crew candidates. GD/PI formats are adjusted for the specific role. Cabin crew candidates are also covered under the Cabin Crew Training pathways.' }
    }
  ]
}

const MODULES = [
  { module: 'Group Discussion (GD)', detail: 'Topic selection strategy, structure, timed mock GDs with panel feedback, aviation and current affairs topics used by IndiGo/Air India.' },
  { module: 'Personal Interview (PI)', detail: 'Airline-specific questions, technical and HR round prep, common pitfalls, handling difficult questions.' },
  { module: 'Personality Development', detail: 'Professional presence, body language, first impression, interview confidence, handling difficult scenarios.' },
  { module: 'Communication & Diction', detail: 'English fluency, clarity, voice modulation, aviation phraseology in non-technical contexts.' },
  { module: 'Resume & Application', detail: 'Aviation resume format, what airlines look for, covering letter strategy.' },
  { module: 'Mock Interview Rounds', detail: 'Full-length recorded mock interviews with debrief — airline-panel-style feedback by ex-industry professionals.' },
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
                Airline Preparation | GD/PI, Personality Development & Interview Coaching
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Airborne Aviation Academy offers structured airline interview preparation for CPL holders and cadet program applicants. The program covers Group Discussion (GD), Personal Interview (PI), Personality Development (PD), and aviation communication — led by Rajeet Khalsa, retired AGM (Training) at Air India with 37+ years of experience.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why Airline Interview Preparation Matters
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                Having a CPL does not guarantee an airline seat. Every airline — IndiGo, Air India, Akasa Air, SpiceJet — runs a multi-round selection process where communication, personality, and situational judgement are assessed alongside technical competence. Candidates who have never trained for GD/PI consistently underperform in airline assessments, even when technically qualified.
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
                Rajeet Khalsa retired as AGM (Training) at Air India after 37+ years. A certified soft skills trainer and image consultant who trained cabin crew and airline professionals for India&apos;s national carrier. At Airborne, Rajeet runs GD/PI and personality modules — sessions built on real airline selection formats.
              </p>
            </div>

            <div className="course-section-divider">
              <h2 className="course-section-title">
                FAQs
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'How long is the airline preparation course?', a: '4–6 weeks for intensive preparation, with ongoing mock sessions available. Duration is adjusted based on how soon the candidate has an actual interview.' },
                  { q: 'Is this only for pilots?', a: 'Open to both pilot and cabin crew candidates. GD/PI formats are adjusted for the specific role. Cabin crew candidates are also covered under the Cabin Crew Training pathways.' },
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
              <LeadForm courseName="Airline Preparation | GD/PI & Interview Coaching" source="Course Detail: airline-preparation" />
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
