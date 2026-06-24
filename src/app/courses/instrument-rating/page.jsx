import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Instrument Rating Course Delhi — DGCA Approved | Airborne',
  description: 'Earn your DGCA Instrument Rating at Airborne Aviation Academy, Dwarka Delhi. ILS, VOR, NDB approach training. PPL/CPL holders. Fees ₹5–8L. Enquire now.',
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
  offers: { '@type': 'Offer', priceCurrency: 'INR', description: '₹5–8 lakh. Contact for current pricing.' },
  coursePrerequisites: 'Valid DGCA PPL or CPL · 50 hours cross-country as PIC',
  courseMode: 'onsite',
  duration: 'P3M',
  url: 'https://airborneaviation.in/courses/instrument-rating',
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
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>Instrument Rating</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap">
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Instrument Rating training at Airborne Aviation Academy, Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 Dwarka, Delhi · 2–3 Months · ₹5–8 Lakh
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Instrument Rating (IR) Course — DGCA Approved, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                An Instrument Rating (IR) allows pilots to fly in Instrument Meteorological Conditions (IMC) — clouds, reduced visibility, and night operations — using only cockpit instruments. The IR is a mandatory component of DGCA CPL training and essential for any pilot pursuing a commercial airline career.
              </p>
            </div>

            {/* What is IR */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                What Is an Instrument Rating?
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                An Instrument Rating (IR) is a DGCA-issued rating added to your PPL or CPL that authorises you to fly aircraft solely by reference to instruments — without visual reference to the ground or horizon. The IR involves both ground school theory (IFR procedures, approach plates, airspace) and practical instrument flying under the supervision of a DGCA-approved flight instructor.
              </p>
            </div>

            {/* Training Content */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Instrument Rating Training Content
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
                Instrument Rating Eligibility
              </h2>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Valid DGCA PPL or CPL holder',
                  'Minimum 50 hours cross-country flying as Pilot-in-Command (PIC)',
                  'Valid DGCA Class 1 Medical Certificate',
                  'Basic instrument flying exposure (recommended)',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* A320 Simulator */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                A320 Simulator Practice — Before You Fly
              </h2>
              <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: '4px' }}>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                  Airborne's in-house A320 FTD (Flight Training Device) is available for instrument approach practice — ILS, VOR, and NDB procedures — before your actual flying hours begin. Simulator practice reduces instrument flying costs significantly by building approach proficiency before transitioning to the aircraft.
                </p>
                <Link href="/courses/a320-simulator" style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', fontWeight: 700, color: '#D8A027', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Book A320 Simulator Session →
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Is Instrument Rating required for CPL in India?', a: 'Instrument Rating (IR) is part of the CPL training requirement in India. DGCA requires instrument flying hours as part of the 200-hour CPL minimum. Most CPL graduates have their IR as part of their training.' },
                  { q: 'How long does Instrument Rating training take?', a: '2–3 months for ground and flight training. The IR involves ground instruction on IFR procedures, instrument approaches, and airspace, plus minimum flying hours on instruments under supervision.' },
                  { q: "Can I use the Airborne A320 simulator for IR practice?", a: "Yes. Airborne's in-house A320 FTD is used for instrument approach practice — ILS, VOR, and NDB approaches — before actual flying. This significantly reduces flight hours needed for IR proficiency." },
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
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027' }}>₹5–8L</div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>Ground school + flying through partner FTO</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>⏱️ 2–3 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>Prerequisite</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>PPL or CPL Holder</div>
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
