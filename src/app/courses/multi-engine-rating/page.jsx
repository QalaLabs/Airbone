import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Multi-Engine Rating India — DGCA Approved | Airborne Aviation',
  description: 'Add a DGCA Multi-Engine Rating to your PPL or CPL at Airborne Aviation Academy, Dwarka. Twin-engine aircraft training. PPL/CPL holders. Fees ₹3–5L. Enquire.',
  alternates: { canonical: '/courses/multi-engine-rating' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Multi-Engine Rating', path: '/courses/multi-engine-rating' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Multi-Engine Rating (MER)',
  description: 'DGCA Multi-Engine Rating training at Airborne Aviation Academy. Twin-engine endorsement for PPL and CPL holders.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', priceCurrency: 'INR', description: '₹3–5 lakh. Contact for current pricing.' },
  coursePrerequisites: 'Valid DGCA PPL or CPL',
  courseMode: 'onsite',
  duration: 'P2M',
  url: 'https://airborneaviation.in/courses/multi-engine-rating',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Multi-Engine Rating mandatory for airlines in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Most scheduled airline operations in India use multi-engine aircraft (A320, B737). While the MER itself is not a standalone airline requirement, most airline-entry pilot profiles require multi-engine time as part of CPL training. Airlines look for pilots who have logged multi-engine hours during their CPL flying.' }
    },
    {
      '@type': 'Question',
      name: 'How long does Multi-Engine Rating training take?',
      acceptedAnswer: { '@type': 'Answer', text: '1–2 months. The MER involves ground school covering twin-engine systems and asymmetric flight, plus practical flying hours on a multi-engine aircraft.' }
    },
    {
      '@type': 'Question',
      name: 'What aircraft is used for Multi-Engine Rating training?',
      acceptedAnswer: { '@type': 'Answer', text: 'Multi-Engine Rating training is conducted through our DGCA-approved partner FTOs on twin-engine piston aircraft. Contact Airborne admissions for current aircraft type and availability.' }
    }
  ]
}

const TRAINING_CONTENT = [
  { topic: 'Twin-Engine Systems', detail: 'Two-engine aircraft fuel, hydraulics, electrics, and systems management' },
  { topic: 'Asymmetric Flight', detail: 'Single-engine flying techniques, engine-out climb and approach procedures' },
  { topic: 'VMC Demonstration', detail: 'Visual Minimum Control speed demonstrations and loss of control prevention' },
  { topic: 'Engine Failure Procedures', detail: 'Engine failure on takeoff, climb, cruise, and approach — full drill' },
  { topic: 'Multi-Engine Weight & Balance', detail: 'Performance calculations and loading for twin-engine aircraft' },
  { topic: 'Feathering & Restart', detail: 'Propeller feathering procedures and in-flight engine restart drills' },
]

export default function MultiEngineRatingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>Multi-Engine Rating</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap">
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Multi-Engine Rating training at Airborne Aviation Academy" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · 1–2 Months · ₹3–5 Lakh
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Multi-Engine Rating (MER) — Twin-Engine Training, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                A Multi-Engine Rating (MER) adds a twin-engine aircraft endorsement to your existing DGCA PPL or CPL. It is an essential step for pilots targeting commercial airline operations — virtually every scheduled airline in India operates twin or multi-engine aircraft. The MER gives you the skills and licence authority to act as Pilot-in-Command of multi-engine aircraft.
              </p>
            </div>

            {/* What is MER */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                What Is a Multi-Engine Rating?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                A Multi-Engine Rating (MER) is a DGCA endorsement that authorises a pilot to fly aircraft with two or more engines. It involves both theoretical training (twin-engine systems, asymmetric flight theory, performance calculations) and practical flying on a multi-engine aircraft — including engine-out procedures, asymmetric approaches, and feathering drills. The MER is a crucial milestone for any pilot building toward airline operations.
              </p>
            </div>

            {/* Training Content */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Multi-Engine Training Content
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {TRAINING_CONTENT.map((s, i) => (
                  <div key={i} style={{ background: '#00162e', borderLeft: '3px solid #DB241E', padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>{s.topic}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                MER Eligibility Requirements
              </h2>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Valid DGCA PPL or CPL holder',
                  'Valid DGCA Medical Certificate (Class 1 or Class 2)',
                  'Completion of required solo and cross-country flying hours (as applicable)',
                  'Valid RTR(A) Radio Telephony certificate',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* MER + CPL path */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                MER + CPL + IR — Airline-Ready Pilot Profile
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                The combination of a DGCA CPL, Instrument Rating (IR), and Multi-Engine Rating (MER) is the standard profile expected by Indian airlines for First Officer positions. Pilots who hold all three ratings and have 200+ total hours are eligible to apply directly to IndiGo, Air India, Akasa Air, and other scheduled carriers.
              </p>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Is Multi-Engine Rating mandatory for airlines in India?', a: 'Most scheduled airline operations in India use multi-engine aircraft (A320, B737). Airlines look for pilots who have logged multi-engine hours during their CPL flying — the MER is an essential part of a complete pilot profile.' },
                  { q: 'How long does Multi-Engine Rating training take?', a: '1–2 months. The MER involves ground school covering twin-engine systems and asymmetric flight, plus practical flying hours on a multi-engine aircraft.' },
                  { q: 'What aircraft is used for Multi-Engine Rating training?', a: 'Multi-Engine Rating training is conducted through our DGCA-approved partner FTOs on twin-engine piston aircraft. Contact Airborne admissions for current aircraft type and availability.' },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>{faq.q}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Course Fee</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹3–5L</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>Ground school + flying through partner FTO</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>⏱️ 1–2 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Prerequisite</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>PPL / CPL Holder</div>
              </div>
              <LeadForm courseName="Multi-Engine Rating" source="Course Detail: multi-engine-rating" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the DGCA Multi-Engine Rating course at Airborne Aviation Academy. Please share details and fee."
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Complete your airline preparation with GD/PI coaching by Rajeet Khalsa' },
            { label: 'A320 Simulator', href: '/courses/a320-simulator', note: 'Practice jet familiarisation and instrument approaches on our A320 FTD' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'Instrument Rating', href: '/courses/instrument-rating' },
            { label: 'PPL', href: '/courses/private-pilot-license' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
