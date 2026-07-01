import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Aviation English ICAO Level 4 Delhi | Airborne Aviation',
  description: 'Achieve ICAO English Level 4 for your DGCA CPL or RTR licence at Airborne Aviation Academy, Dwarka Delhi. Structured aviation English course. Fees ₹50K–1L.',
  alternates: { canonical: '/courses/aviation-english-icao' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Aviation English ICAO L4', path: '/courses/aviation-english-icao' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Aviation English — ICAO Level 4 Proficiency',
  description: 'Structured Aviation English course at Airborne Aviation Academy, Dwarka Delhi. Prepares candidates for ICAO English Level 4 proficiency required for DGCA CPL and RTR licence.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', priceCurrency: 'INR', description: '₹50,000–₹1 lakh. Contact for current pricing.' },
  courseMode: 'onsite',
  duration: 'P3M',
  url: 'https://www.airborneaviation.in/courses/aviation-english-icao',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is ICAO English Level 4 mandatory for CPL in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. DGCA India requires a minimum ICAO English Language Proficiency (ELP) Level 4 (Operational) for CPL issuance and RTR(A) certification. Candidates must demonstrate Level 4 proficiency in pronunciation, structure, vocabulary, fluency, comprehension, and interactions.' }
    },
    {
      '@type': 'Question',
      name: 'How long does the Aviation English ICAO L4 course take?',
      acceptedAnswer: { '@type': 'Answer', text: '1–3 months depending on current proficiency level. Students with strong English foundations may be test-ready in 4–6 weeks. Those needing more structured improvement typically take 2–3 months.' }
    },
    {
      '@type': 'Question',
      name: 'Where is the ICAO English Level 4 test taken?',
      acceptedAnswer: { '@type': 'Answer', text: 'ICAO ELP testing is conducted by DGCA-approved test centres in India (not at Airborne). Airborne prepares candidates for the test — the actual ELP assessment is at the DGCA-approved evaluator centre.' }
    },
    {
      '@type': 'Question',
      name: 'What are the 6 components of ICAO English proficiency?',
      acceptedAnswer: { '@type': 'Answer', text: 'ICAO ELP is assessed across 6 components: Pronunciation (accent clarity), Structure (grammar), Vocabulary (aviation and general), Fluency (natural speech pace), Comprehension (understanding spoken English), and Interactions (managing misunderstandings). Level 4 (Operational) must be achieved in all 6.' }
    }
  ]
}

const ICAO_LEVELS = [
  { level: 'Level 1', label: 'Pre-elementary', note: 'Cannot pass basic communication tests' },
  { level: 'Level 2', label: 'Elementary', note: 'Limited communication ability' },
  { level: 'Level 3', label: 'Pre-operational', note: 'Emerging ability — below DGCA minimum' },
  { level: 'Level 4', label: 'Operational', note: '✓ DGCA CPL & RTR minimum (target level)', highlight: true },
  { level: 'Level 5', label: 'Extended', note: 'Strong communicator — extended license validity' },
  { level: 'Level 6', label: 'Expert', note: 'Native/near-native proficiency — lifelong license' },
]

const CURRICULUM = [
  { topic: 'Pronunciation & Clarity', detail: 'Accent reduction, phoneme accuracy, vowel/consonant precision for aviation environments' },
  { topic: 'Aviation Phraseology', detail: 'ICAO standard phraseology, R/T communications, ATC interaction language' },
  { topic: 'Grammar & Sentence Structure', detail: 'Tense accuracy, conditional sentences, passive voice — all common in ATC communications' },
  { topic: 'Aviation Vocabulary', detail: 'Technical terms, plain English equivalents, situation-specific vocabulary banks' },
  { topic: 'Comprehension Practice', detail: 'Listening to ATC audio, ATIS broadcasts, cockpit voice recordings at varying speed and accent' },
  { topic: 'Fluency Building', detail: 'Conversation sessions, role-play scenarios, reducing hesitation in high-pressure situations' },
  { topic: 'Mock ELP Test Sessions', detail: 'Timed practice tests structured to ICAO ELP format with individual feedback and scoring' },
]

export default function AviationEnglishPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">Aviation English ICAO L4</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom.jpg" alt="Aviation English ICAO Level 4 course at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 1–3 Months · ₹50K–1L
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Aviation English — ICAO Level 4 Proficiency Course, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                ICAO English Level 4 (Operational) is a mandatory requirement for your DGCA CPL and RTR(A) licence. Airborne Aviation Academy prepares candidates at Ramphal Chowk, Dwarka — structured training across all six ICAO ELP components, with mock test sessions and individual pronunciation coaching.
              </p>
            </div>

            {/* What is ICAO L4 */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is ICAO English Level 4?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: '0 0 1.5rem 0' }}>
                ICAO (International Civil Aviation Organisation) rates pilot English Language Proficiency (ELP) on a 6-point scale. Level 4 — Operational — is the minimum required for DGCA CPL issuance and RTR(A) certification. The test evaluates six components: Pronunciation, Structure, Vocabulary, Fluency, Comprehension, and Interactions. All six must reach Level 4 to pass.
              </p>
              {/* ICAO Levels Table */}
              <div className="course-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="course-table" style={{ minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Label</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ICAO_LEVELS.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(0, 39, 76, 0.04)', background: row.highlight ? 'rgba(216,160,39,0.06)' : (i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent') }}>
                        <td style={{ padding: '0.875rem 1.25rem', color: row.highlight ? '#D8A027' : 'rgba(0, 39, 76, 0.55)', fontWeight: 700 }}>{row.level}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: row.highlight ? '#FFFFFF' : 'rgba(0, 39, 76, 0.75)', fontWeight: row.highlight ? 700 : 400 }}>{row.label}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: row.highlight ? '#D8A027' : 'rgba(0, 39, 76, 0.55)', fontWeight: row.highlight ? 600 : 400 }}>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Who Needs It */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Who Needs ICAO Level 4?
              </h2>
              <ul className="course-list">
                {[
                  'All CPL aspirants — DGCA CPL issuance requires ICAO ELP Level 4 minimum',
                  'RTR (Aero) applicants — RTR(A) certification requires ICAO Level 4',
                  'Cabin crew candidates applying to international airlines (some require Level 4)',
                  'Pilots trained abroad seeking DGCA license conversion',
                ].map((item, i) => (
                  <li key={i} className="course-list-item">{item}</li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Course Curriculum
              </h2>
              <div className="course-subject-grid">
                {CURRICULUM.map((s, i) => (
                  <div key={i} className="course-subject-card">
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.25rem' }}>{s.topic}</div>
                    <div className="course-subject-card-detail">{s.detail}</div>
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
                  { q: 'Is ICAO English Level 4 mandatory for CPL in India?', a: 'Yes. DGCA India requires a minimum ICAO English Language Proficiency (ELP) Level 4 for CPL issuance and RTR(A) certification. Candidates must demonstrate Level 4 proficiency across all six ICAO ELP components.' },
                  { q: 'How long does the Aviation English ICAO L4 course take?', a: '1–3 months depending on current proficiency level. Students with strong English foundations may be test-ready in 4–6 weeks. Those needing more structured improvement typically take 2–3 months.' },
                  { q: 'Where is the ICAO English Level 4 test taken?', a: 'ICAO ELP testing is conducted by DGCA-approved test centres in India — not at Airborne. Airborne prepares candidates for the test. The actual ELP assessment is at the DGCA-approved evaluator centre.' },
                  { q: 'What are the 6 ICAO ELP components?', a: 'Pronunciation, Structure (grammar), Vocabulary, Fluency, Comprehension, and Interactions. Level 4 (Operational) must be achieved in all six components simultaneously.' },
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
                <span className="course-sidebar-label">Course Fee</span>
                <div className="course-sidebar-price">₹50K–1L</div>
                <span className="course-sidebar-note">Contact for current batch pricing</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 1–3 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">ICAO Target</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>Level 4 (Operational)</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(0, 39, 76, 0.4)', display: 'block', marginTop: '0.25rem' }}>DGCA CPL & RTR minimum</span>
              </div>
              <LeadForm courseName="Aviation English ICAO L4" source="Course Detail: aviation-english-icao" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Aviation English ICAO Level 4 course at Airborne Aviation Academy, Dwarka. Please share batch details."
          nextCourses={[
            { label: 'Commercial Pilot License (CPL)', href: '/courses/commercial-pilot-license-cpl', note: 'Complete your DGCA CPL ground school with Capt. Navrang Singh' },
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Use your English proficiency to excel in airline GD/PI rounds' },
          ]}
          relatedCourses={[
            { label: 'DGCA Ground School', href: '/courses/ground-school' },
            { label: 'Cadet Pilot Preparation', href: '/courses/cadet-preparation' },
            { label: 'Cabin Crew Training', href: '/courses/cabin-crew-training' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
