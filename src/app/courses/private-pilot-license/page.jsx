import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Private Pilot Licence (PPL) India | Airborne Aviation',
  description: 'Learn to fly for recreation or business with a Private Pilot Licence. PPL training through Airborne Aviation\'s partner FTOs. ₹25,00,000 complete flight training.',
  alternates: { canonical: '/courses/private-pilot-license' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Private Pilot License', path: '/courses/private-pilot-license' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Private Pilot License (PPL)',
  description: 'PPL training through Airborne Aviation Academy\'s partner FTOs. Ground school by Capt. Navrang Singh. Complete flight training package.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', price: '2500000', priceCurrency: 'INR', description: 'Complete PPL flight training through partner FTO' },
  courseMode: 'onsite',
  duration: 'P6M',
  url: 'https://airborneaviation.in/courses/private-pilot-license',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can PPL hours count toward CPL?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Flying hours logged during PPL training count toward the 200 total hours required for a DGCA CPL. Many students begin with PPL to build flight time before pursuing CPL.' }
    },
    {
      '@type': 'Question',
      name: 'Is PPL required before CPL in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Not mandatory by DGCA regulation, but strongly recommended. PPL builds fundamental flying skills that form the foundation of CPL training. Most experienced instructors recommend the PPL route.' }
    },
    {
      '@type': 'Question',
      name: 'What is the minimum age for PPL?',
      acceptedAnswer: { '@type': 'Answer', text: 'Minimum age of 17 years at the time of PPL issuance. You can begin training from 16 years with a Student Pilot License (SPL).' }
    },
    {
      '@type': 'Question',
      name: 'How long does PPL training take?',
      acceptedAnswer: { '@type': 'Answer', text: '3–6 months depending on flying weather, aircraft availability, and training pace. Minimum 40 flying hours required by DGCA.' }
    }
  ]
}

const SUBJECTS = [
  { name: 'Air Navigation (Basics)', detail: 'Map reading, position fixing, cross-country navigation' },
  { name: 'Aviation Meteorology', detail: 'Basic weather systems, clouds, visibility, wind effects on flight' },
  { name: 'Air Regulations', detail: 'Rules of the air, visual flight rules, airspace classifications' },
  { name: 'Technical General (Piston)', detail: 'Piston engine systems, propellers, basic aerodynamics' },
  { name: 'Radio Telephony (RTR)', detail: 'R/T procedures, phraseology, emergency communications' },
]

const ELIGIBILITY = [
  { req: 'Age', detail: 'Minimum 17 years at PPL issuance (16+ to begin SPL training)' },
  { req: 'Education', detail: 'Class 10+2 (any stream) — no specific subjects required' },
  { req: 'Medical', detail: 'DGCA Class 2 Medical Certificate from approved AME' },
  { req: 'Flying Hours', detail: 'Minimum 40 hours total flying, including 10 hours solo' },
  { req: 'Language', detail: 'Basic English communication ability' },
]

const PPL_TO_CPL = [
  { step: '1', title: 'Begin with PPL', detail: 'Build foundational flying skills and log initial hours.' },
  { step: '2', title: 'DGCA Ground School', detail: 'Complete all 5 CPL papers with Capt. Navrang Singh at Airborne.' },
  { step: '3', title: 'CPL Flying Training', detail: 'Complete 200 total hours including 100 hours PIC through partner FTO.' },
  { step: '4', title: 'DGCA CPL Issuance', detail: 'Submit logbooks and papers to DGCA for CPL issuance.' },
]

export default function PPLPage() {
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
          <span className="current">Private Pilot License</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Private Pilot License training at Airborne Aviation Academy" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3–6 Months · ₹8–12L Flying + Ground School
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Private Pilot License (PPL) — Learn to Fly in India
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                The Private Pilot License (PPL) is the first step in your aviation journey — the license that puts you in the left seat and lets you fly. Airborne Aviation Academy provides PPL ground school in Dwarka, Delhi, alongside access to DGCA-approved partner flying training organisations (FTOs) for your practical flying hours.
              </p>
            </div>

            {/* What is PPL */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is a Private Pilot License?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                A Private Pilot License (PPL) issued by DGCA India allows you to fly as Pilot-in-Command (PIC) of a single-engine aircraft for private, recreational, or business purposes — not for commercial hire. PPL requires a minimum of 40 flying hours including 10 hours solo flight. It is the recommended stepping stone before CPL, and all PPL hours count toward CPL requirements.
              </p>
            </div>

            {/* Eligibility */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                PPL Eligibility Requirements
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
                    {ELIGIBILITY.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.req}</td>
                        <td>{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subjects */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                PPL Ground School Subjects
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

            {/* PPL to CPL path */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                PPL to CPL — Your Path Forward
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {PPL_TO_CPL.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.25rem 0', borderBottom: i < PPL_TO_CPL.length - 1 ? '1px solid rgba(0, 39, 76, 0.05)' : 'none' }}>
                    <div style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '50%', background: '#DB241E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-h)', fontSize: '0.8rem', fontWeight: 900, color: 'var(--navy)' }}>{s.step}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.55)', lineHeight: '1.5' }}>{s.detail}</div>
                    </div>
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
                  { q: 'Can PPL hours count toward CPL?', a: 'Yes. Flying hours logged during PPL training count toward the 200 total hours required for a DGCA CPL. Many students begin with PPL to build flight time before pursuing CPL.' },
                  { q: 'Is PPL required before CPL?', a: 'Not mandatory by DGCA regulation, but strongly recommended. PPL builds fundamental flying skills that form the foundation of CPL training.' },
                  { q: 'What is the minimum age for PPL?', a: 'Minimum age of 17 years at the time of PPL issuance. You can begin training from 16 years with a Student Pilot License (SPL).' },
                  { q: 'How long does PPL training take?', a: '3–6 months depending on flying weather, aircraft availability, and training pace. Minimum 40 flying hours required by DGCA.' },
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
                <span className="course-sidebar-label">Flying Training Fee</span>
                <div className="course-sidebar-price">₹8–12L</div>
                <span className="course-sidebar-note">Through DGCA-approved partner FTO</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 3–6 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Min Flying Hours</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>✈️ 40 Hours</div>
              </div>
              <LeadForm courseName="Private Pilot License (PPL)" source="Course Detail: private-pilot-license" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Private Pilot License (PPL) course at Airborne Aviation Academy. Please share details and fee."
          nextCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl', note: 'Step up from PPL to CPL ground school — all PPL hours count toward your CPL' },
            { label: 'Instrument Rating', href: '/courses/instrument-rating', note: 'Add an Instrument Rating to fly in all weather conditions' },
          ]}
          relatedCourses={[
            { label: 'DGCA Ground School', href: '/courses/ground-school' },
            { label: 'Multi-Engine Rating', href: '/courses/multi-engine-rating' },
            { label: 'Flying Training India vs Abroad', href: '/courses/flying-training-india-abroad' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
