import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Cadet Pilot Program Prep IndiGo, Air India, Akasa | Airborne',
  description: 'Prepare for IndiGo, Air India & Akasa cadet pilot programs at Airborne, Dwarka. Aptitude tests, GD-PI, simulator prep — join now.',
  alternates: { canonical: '/courses/cadet-preparation' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Cadet Pilot Preparation', path: '/courses/cadet-preparation' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Cadet Pilot Program Preparation',
  description: 'Structured preparation for IndiGo, Air India & Akasa Air cadet pilot programs. Aptitude tests, GD/PI, simulator assessment preparation.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  coursePrerequisites: 'Valid DGCA CPL or CPL in progress',
  url: 'https://airborneaviation.academy/courses/cadet-preparation',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the IndiGo JFO cadet program eligibility?',
      acceptedAnswer: { '@type': 'Answer', text: 'IndiGo JFO typically requires a valid DGCA CPL with IR, minimum 200 hours total time, and DGCA Class 1 Medical. IndiGo conducts online aptitude tests, SIM assessments, and panel interviews.' }
    },
    {
      '@type': 'Question',
      name: 'Does Airborne guarantee cadet selection?',
      acceptedAnswer: { '@type': 'Answer', text: "No. Airline selection is entirely the airline's decision. Airborne prepares candidates to perform at their best at every stage — selection outcomes rest with the airline." }
    }
  ]
}

const STAGES = [
  { stage: 'Online Application', format: 'Resume + academic records', prep: 'Resume crafting and document preparation' },
  { stage: 'Aptitude Test', format: 'Numerical, spatial, psychomotor, English (1.5–3 hrs)', prep: 'Full mock test battery with performance analysis' },
  { stage: 'Psychometric Evaluation', format: 'Personality and cognitive test battery', prep: 'Psychometric familiarisation sessions' },
  { stage: 'Simulator Assessment', format: 'Basic flying aptitude in FNPT or FFS', prep: 'A320 simulator preparation at Airborne' },
  { stage: 'GD + PI Round', format: 'Group discussion and personal interview with airline panel', prep: 'Mock GD/PI with airline-standard feedback by Rajeet Khalsa' },
  { stage: 'Medical', format: 'DGCA Class 1 Medical', prep: 'Pre-medical briefing and guidance' },
]

export default function CadetPreparationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>Cadet Pilot Preparation</span>
        </div>

        <div className="course-hero-image-wrap">
          <img src="/campus/campus_training.jpg" alt="Cadet Pilot Program Preparation at Airborne Aviation Academy" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · ₹50,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Cadet Pilot Program Preparation — IndiGo, Air India & Akasa
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                Airborne Aviation Academy prepares aspiring pilots for the cadet pilot programs of India's leading airlines — IndiGo, Air India, and Akasa Air. Our cadet preparation covers aptitude testing, psychometric evaluation, GD/PI, and the complete selection pathway from application to type rating.
              </p>
            </div>

            {/* What Is a Cadet Program */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                What Is a Cadet Pilot Program?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                A cadet pilot program is an airline-sponsored pathway where the airline selects fresh CPL holders, funds or co-funds their A320/B737 type rating, and fast-tracks them to a First Officer seat. In India, IndiGo's JFO Program, Air India's iFLY/Cadet Scheme, and Akasa Air's cadet pathway are the most sought-after airline-entry routes.
              </p>
            </div>

            {/* Selection Stages */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Cadet Program Selection Stages — What Airborne Prepares You For
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {STAGES.map((s, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>{s.stage}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{s.format}</div>
                    <div style={{ fontSize: '0.8rem', color: '#D8A027', lineHeight: '1.5' }}>{s.prep}</div>
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
                  { q: 'What is the IndiGo JFO cadet program eligibility?', a: 'IndiGo JFO typically requires a valid DGCA CPL with IR, minimum 200 hours total time, and DGCA Class 1 Medical. IndiGo conducts online aptitude tests, SIM assessments, and panel interviews.' },
                  { q: 'Does Airborne guarantee cadet selection?', a: "No. Airline selection is entirely the airline's decision. Airborne prepares candidates to perform at their best at every stage — selection outcomes rest with the airline." },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>{faq.q}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Course Fee</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹50,000</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>Aptitude prep, GD/PI, SIM familiarisation</span>
              </div>
              <LeadForm courseName="Cadet Pilot Program Preparation" source="Course Detail: cadet-preparation" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in Cadet Pilot Program Preparation at Airborne Aviation Academy, Dwarka. Please share details for IndiGo/Air India/Akasa cadet prep."
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Advanced GD/PI coaching by Rajeet Khalsa — ex-Air India AGM Training' },
            { label: 'A320 Simulator', href: '/courses/a320-simulator', note: 'Simulator assessment practice on our in-house A320 FTD' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'ATPL Ground School', href: '/courses/atpl' },
            { label: 'CAS Compass & ADAPT', href: '/courses/cas-compass-adapt' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
