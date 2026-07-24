import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Instrument Rating Course Delhi — DGCA Approved | Airborne',
  description: 'Earn your DGCA Instrument Rating at Airborne Aviation Academy, Dwarka Delhi — 2,500+ students trained. ILS, VOR, NDB approach training. PPL/CPL holders. Fees ₹3–5L. Enquire now.',
  alternates: { canonical: '/courses/instrument-rating' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Instrument Rating', path: '/courses/instrument-rating' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Instrument Rating (IR)',
  description: 'DGCA Instrument Rating training at Airborne Aviation Academy, Dwarka Delhi. ILS, VOR, NDB approaches. Prerequisite: PPL or CPL.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: { '@type': 'Offer', priceCurrency: 'INR', description: '₹3–5 lakh. Contact for current pricing.' },
  coursePrerequisites: 'Valid DGCA PPL or CPL · 50 hours cross-country as PIC',
  courseMode: 'onsite',
  duration: 'P3M',
  url: 'https://www.airborneaviation.in/courses/instrument-rating',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Instrument Rating required for CPL in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Instrument Rating (IR) is part of the CPL training requirement in India. DGCA requires instrument flying hours as part of the 200-hour CPL minimum. Most CPL graduates have their IR as part of their training.' }
    },
    {
      '@type': 'Question',
      name: 'How long does Instrument Rating training take?',
      acceptedAnswer: { '@type': 'Answer', text: '2–3 months for ground and flight training. The IR involves ground instruction on IFR procedures, instrument approaches, and airspace, plus minimum flying hours on instruments under supervision.' }
    },
    {
      '@type': 'Question',
      name: 'Can I use the Airborne A320 simulator for IR practice?',
      acceptedAnswer: { '@type': 'Answer', text: "Yes. Airborne's in-house A320 FTD is used for instrument approach practice — ILS, VOR, and NDB approaches — before actual flying. This significantly reduces flight hours needed for IR proficiency." }
    }
  ]
}

const TRAINING_CONTENT = [
  { topic: 'ILS Approaches', detail: 'Instrument Landing System precision approaches to DGCA standards' },
  { topic: 'VOR Tracking & Holding', detail: 'VOR radials, airways navigation, holding patterns' },
  { topic: 'NDB Approaches', detail: 'Non-directional beacon approach procedures and execution' },
  { topic: 'IFR Departure & Arrival', detail: 'SID, STAR, and transition procedures under IFR' },
  { topic: 'Emergency Instrument Flying', detail: 'Unusual attitude recovery, partial panel flying' },
  { topic: 'IFR Communications', detail: 'ATC clearances, read-back procedures, IFR phraseology' },
]

export default function InstrumentRatingPage() {
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
          <span className="current">Instrument Rating</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Instrument Rating training at Airborne Aviation Academy, Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 2–3 Months · ₹3–5 Lakh
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Instrument Rating (IR) Course — DGCA Approved, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                An Instrument Rating (IR) allows pilots to fly in Instrument Meteorological Conditions (IMC) — clouds, reduced visibility, and night operations — using only cockpit instruments. The IR is a mandatory component of DGCA CPL training and essential for any pilot pursuing a commercial airline career.
              </p>
            </div>

            {/* What is IR */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What Is an Instrument Rating?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                An Instrument Rating (IR) is a DGCA-issued rating added to your PPL or CPL that authorises you to fly aircraft solely by reference to instruments — without visual reference to the ground or horizon. The IR involves both ground school theory (IFR procedures, approach plates, airspace) and practical instrument flying under the supervision of a DGCA-approved flight instructor.
              </p>
            </div>

            {/* Training Content */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Instrument Rating Training Content
              </h2>
              <div className="course-subject-grid">
                {TRAINING_CONTENT.map((s, i) => (
                  <div key={i} className="course-subject-card">
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.25rem' }}>{s.topic}</div>
                    <div className="course-subject-card-detail">{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Instrument Rating Eligibility
              </h2>
              <ul className="course-list">
                {[
                  'Valid DGCA PPL or CPL holder',
                  'Minimum 50 hours cross-country flying as Pilot-in-Command (PIC)',
                  'Valid DGCA Class 1 Medical Certificate',
                  'Basic instrument flying exposure (recommended)',
                ].map((item, i) => (
                  <li key={i} className="course-list-item">{item}</li>
                ))}
              </ul>
            </div>

            {/* A320 Simulator */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                A320 Simulator Practice — Before You Fly
              </h2>
              <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', border: '1px solid rgba(0, 39, 76, 0.08)', padding: '1.5rem', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                  Airborne's in-house A320 FTD (Flight Training Device) is available for instrument approach practice — ILS, VOR, and NDB procedures — before your actual flying hours begin. Simulator practice reduces instrument flying costs significantly by building approach proficiency before transitioning to the aircraft.
                </p>
                <Link href="/courses/a320-simulator" style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Book A320 Simulator Session →
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Is Instrument Rating required for CPL in India?', a: 'Instrument Rating (IR) is part of the CPL training requirement in India. DGCA requires instrument flying hours as part of the 200-hour CPL minimum. Most CPL graduates have their IR as part of their training.' },
                  { q: 'How long does Instrument Rating training take?', a: '2–3 months for ground and flight training. The IR involves ground instruction on IFR procedures, instrument approaches, and airspace, plus minimum flying hours on instruments under supervision.' },
                  { q: "Can I use the Airborne A320 simulator for IR practice?", a: "Yes. Airborne's in-house A320 FTD is used for instrument approach practice — ILS, VOR, and NDB approaches — before actual flying. This significantly reduces flight hours needed for IR proficiency." },
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
                <div className="course-sidebar-price">₹3–5L</div>
                <span className="course-sidebar-note">Ground school + flying through partner FTO</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 2–3 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Prerequisite</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>PPL or CPL Holder</div>
              </div>
              <LeadForm courseName="Instrument Rating" source="Course Detail: instrument-rating" />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the DGCA Instrument Rating course at Airborne Aviation Academy, Dwarka. Please share details and fee."
          nextCourses={[
            { label: 'Commercial Pilot License (CPL)', href: '/courses/commercial-pilot-license-cpl', note: 'Combine your IR with CPL ground school for a complete airline-ready profile' },
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'Prepare for airline GD/PI rounds with Rajeet Khalsa — ex-Air India AGM' },
          ]}
          relatedCourses={[
            { label: 'A320 Simulator', href: '/courses/a320-simulator' },
            { label: 'Multi-Engine Rating', href: '/courses/multi-engine-rating' },
            { label: 'PPL', href: '/courses/private-pilot-license' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
