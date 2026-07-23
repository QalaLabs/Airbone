import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Flying Training India vs Abroad | Cost & DGCA Guide | Airborne',
  description: 'Compare flying training in India vs abroad. DGCA requirements, cost comparison, license conversion guide, and which countries are recognised. Free counselling.',
  alternates: { canonical: '/courses/flying-training-india-abroad' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Flying Training India vs Abroad', path: '/courses/flying-training-india-abroad' },
])

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Flying Training in India vs Abroad | Complete Guide for 2026',
  description: 'A structured comparison of CPL flight training in India versus abroad, covering cost, timeline, DGCA license conversion, and airline hiring outcomes.',
  author: {
    '@type': 'Organization',
    name: 'Airborne Aviation Academy',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Airborne Aviation Academy',
    url: 'https://www.airborneaviation.in',
  },
  url: 'https://www.airborneaviation.in/courses/flying-training-india-abroad',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is it cheaper to do pilot training in India or abroad?',
      acceptedAnswer: { '@type': 'Answer', text: 'Direct training cost can be lower in Philippines/USA (₹35–45L vs ₹65–75L). However, once conversion costs (₹5–15L), living expenses abroad, and additional 12–18 months before airline entry are added, India-trained CPL holders often reach their first airline seat faster and at lower total cost.' }
    },
    {
      '@type': 'Question',
      name: 'Does DGCA recognise FAA or EASA pilot licenses?',
      acceptedAnswer: { '@type': 'Answer', text: 'DGCA does not directly accept FAA or EASA CPL for commercial operations in India. Pilots trained abroad must clear DGCA CPL written examinations and pass a DGCA Skill Test to receive an Indian CPL.' }
    },
    {
      '@type': 'Question',
      name: 'Can I do DGCA ground school while flying abroad?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Airborne offers DGCA ground school for students completing flying hours abroad or between training phases. Completing DGCA exams before returning to India reduces total conversion time significantly.' }
    }
  ]
}

const COMPARISON = [
  { param: 'Total Cost', india: '₹55–65 lakh (CPL)', abroad: '₹35–65 lakh depending on country' },
  { param: 'Duration', india: '18–24 months', abroad: '12–18 months training + 12–18 months conversion' },
  { param: 'DGCA CPL Direct', india: 'Yes — issued directly by DGCA', abroad: 'No — requires conversion to DGCA CPL' },
  { param: 'Airline Eligibility', india: 'Immediately after CPL + required hours', abroad: 'After conversion + DGCA Skill Test' },
  { param: 'Weather', india: 'Variable — monsoon disruptions', abroad: 'Generally more consistent (Philippines, USA)' },
  { param: 'Forex Risk', india: 'None — INR fees', abroad: 'High — USD/EUR exposure' },
  { param: 'Ground School', india: 'Integrated during training', abroad: 'DGCA exams required for conversion' },
  { param: 'Support Network', india: 'Family proximity, no visa dependency', abroad: 'Isolated environment; visa complications possible' },
]

const DECISION = [
  { scenario: 'Budget under ₹60 lakhs total', recommendation: 'Train in India', reason: 'Abroad total cost (training + living + conversion) almost always exceeds ₹60L' },
  { scenario: 'Want DGCA CPL fastest', recommendation: 'Train in India', reason: 'Direct DGCA CPL path; no conversion delay of 12–18 months' },
  { scenario: 'Family abroad / dual residency', recommendation: 'Consider abroad', reason: 'Living cost covered; no visa issues; may make financial sense' },
  { scenario: 'Want to fly internationally eventually', recommendation: 'Either path works', reason: 'DGCA CPL is ICAO-compliant; conversion routes exist both ways' },
]

export default function FlyingTrainingIndiaAbroadPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">India vs Abroad</span>
        </div>

        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Flying Training India vs Abroad — CPL Guide" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                Expert Guide — Airborne Aviation Academy
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Flying Training in India vs Abroad | Complete Guide for 2026
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                The India vs abroad debate is one of the most common questions Airborne's admissions team receives. The answer depends on your budget, timeline, and final career goal — not on where your batchmate trained. This guide lays out the actual comparison based on 2025–26 data, including DGCA conversion requirements you will need if you train outside India.
              </p>
            </div>

            {/* India vs Abroad Table */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                India vs Abroad — Key Comparison
              </h2>
              <div style={{ border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '8px', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>India</th>
                      <th>Abroad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.55)', fontWeight: 600, fontSize: '0.82rem' }}>{row.param}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontSize: '0.82rem' }}>{row.india}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.65)', fontSize: '0.82rem' }}>{row.abroad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DGCA License Conversion */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                DGCA License Conversion — What Pilots Trained Abroad Must Know
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', marginBottom: '1rem' }}>
                If you train abroad, you return with a foreign CPL (FAA, EASA, CAAP Philippines, CASA Australia, Transport Canada, UK CAA, CAA NZ). To fly commercially in India, you must convert it to a DGCA CPL. Conversion typically takes 6–18 months and includes:
              </p>
              <ul className="course-list">
                {[
                  'Full DGCA CPL written examinations (6 papers)',
                  'DGCA Skill Test (flight check)',
                  'Valid DGCA Class 1 Medical',
                  'Timeline: 6–18 months · conversion costs typically ₹5–15 lakh (excluding living / additional hours)',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.6' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Which Is Better Decision Table */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Which Is Better — Training in India or Abroad?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                {DECISION.map((d, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? 'rgba(0, 39, 76, 0.02)' : 'transparent', borderBottom: i < DECISION.length - 1 ? '1px solid rgba(0, 39, 76, 0.05)' : 'none', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.5fr', gap: '1rem', alignItems: 'start' }}>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.75)', fontWeight: 600 }}>{d.scenario}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700 }}>{d.recommendation}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.5)', lineHeight: '1.5' }}>{d.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Airborne Helps */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                How Airborne Aviation Helps
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                If you train in India, Airborne provides CPL ground school, DGCA exam prep, and airline placement preparation from the same campus. If you train abroad and return for conversion, Airborne offers DGCA conversion ground school — all subjects covered in structured batches — plus the 200-hour Indian aircraft coordination through our partner ATOs.
              </p>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                Book a free 30-minute counselling session with Capt. Navrang Singh's team to get a cost and timeline breakdown specific to your profile.
              </p>
            </div>

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                FAQs — Flying Training India vs Abroad
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Is it cheaper to do pilot training in India or abroad?', a: 'Direct training cost can be lower in Philippines/USA (₹35–45L vs ₹65–75L). However, once conversion costs (₹5–15L), living expenses abroad, and additional 12–18 months before airline entry are added, India-trained CPL holders often reach their first airline seat faster and at lower total cost.' },
                  { q: 'Does DGCA recognise FAA or EASA pilot licenses?', a: 'DGCA does not directly accept FAA or EASA CPL for commercial operations in India. Pilots trained abroad must clear DGCA CPL written examinations and pass a DGCA Skill Test to receive an Indian CPL.' },
                  { q: 'Can I do DGCA ground school while flying abroad?', a: 'Yes. Airborne offers DGCA ground school for students completing flying hours abroad or between training phases. Completing DGCA exams before returning to India reduces total conversion time significantly.' },
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
            <LeadForm courseName="Flying Training Counselling (India vs Abroad)" source="Course Detail: flying-training-india-abroad" />
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I want a free counselling session to compare flying training in India vs abroad. Please share details from Airborne Aviation Academy."
          nextCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl', note: 'Begin DGCA CPL ground school in Dwarka — next batch July 2026' },
            { label: 'DGCA Ground School', href: '/courses/ground-school', note: 'All 5 DGCA subjects by Capt. Navrang Singh — ₹2,70,000' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'DGCA Ground School', href: '/courses/ground-school' },
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
