import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'

export const metadata = {
  title: 'Flying Training India vs Abroad — CPL Guide | Airborne Aviation',
  description: 'Compare flying training in India vs abroad for a DGCA CPL. Cost, timeline, DGCA license conversion, and which path makes more sense. Expert guide by Airborne.',
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
  headline: 'Flying Training in India vs Abroad — Which Is Better for a DGCA CPL?',
  description: 'A structured comparison of CPL flight training in India versus abroad, covering cost, timeline, DGCA license conversion, and airline hiring outcomes.',
  author: {
    '@type': 'Organization',
    name: 'Airborne Aviation Academy',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Airborne Aviation Academy',
    url: 'https://airborneaviation.in',
  },
  url: 'https://airborneaviation.in/courses/flying-training-india-abroad',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I convert a foreign CPL to a DGCA CPL?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. DGCA allows conversion of foreign CPLs under the bilateral agreement framework. The process requires passing DGCA written examinations in all subjects, completing 200 hours on Indian-registered aircraft (in most cases), and holding a valid foreign CPL from an ICAO contracting state. The conversion process typically takes 12–18 months and requires a significant additional cost outlay after you return to India.' }
    },
    {
      '@type': 'Question',
      name: 'Is flying training abroad cheaper than India?',
      acceptedAnswer: { '@type': 'Answer', text: 'On headline flight cost per hour, some countries (Philippines, South Africa, USA) can be cheaper than India. However, total cost including living expenses, forex risk, return flights, DGCA conversion costs, and the additional 200 hours on Indian aircraft often makes the total spend higher than training in India from the start. The decision should be based on total-cost-of-ownership, not per-hour rate.' }
    },
    {
      '@type': 'Question',
      name: 'Do Indian airlines prefer India-trained pilots?',
      acceptedAnswer: { '@type': 'Answer', text: 'Indian airlines evaluate pilots on licence validity, flight hours, medical status, and aptitude test scores — not training country. However, pilots with DGCA CPL (India) and 200+ hours on Indian-registered aircraft can apply to cadet programs immediately. Pilots returning with a foreign CPL must first complete conversion before applying.' }
    }
  ]
}

const COMPARISON = [
  { param: 'Total Cost (indicative)', india: '₹35–60 lakhs (CPL + IR + ground)', abroad: '₹55–90 lakhs (training + living + conversion)' },
  { param: 'Duration', india: '18–24 months', abroad: '12–18 months (training only) + 12–18 months conversion' },
  { param: 'DGCA CPL direct?', india: 'Yes — train and get DGCA CPL directly', abroad: 'No — foreign CPL first, then conversion required' },
  { param: 'Airline eligibility (India)', india: 'Immediately after CPL + 200 hrs', abroad: 'After conversion completion + 200 hrs on Indian aircraft' },
  { param: 'Weather / flying days', india: 'Monsoon disruption risk (varies by ATO location)', abroad: 'Varies — Philippines, USA, South Africa have high flying days' },
  { param: 'Forex risk', india: 'None — INR fees', abroad: 'High — USD/EUR/ZAR exposure' },
  { param: 'Ground school (DGCA)', india: 'Done during training — integrated', abroad: 'Must be re-done in India for DGCA conversion' },
  { param: 'Support network', india: 'Family proximity, no visa dependency', abroad: 'Isolated environment; visa complications possible' },
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
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>India vs Abroad</span>
        </div>

        <div className="course-hero-image-wrap">
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Flying Training India vs Abroad — CPL Guide" className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                Expert Guide — Airborne Aviation Academy
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                Flying Training in India vs Abroad — Which Path Is Right for You?
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                The India vs abroad debate is one of the most common questions Airborne's admissions team receives. The answer depends on your budget, timeline, and final career goal — not on where your batchmate trained. This guide lays out the actual comparison based on 2025–26 data, including DGCA conversion requirements you will need if you train outside India.
              </p>
            </div>

            {/* India vs Abroad Table */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                India vs Abroad — Full Comparison
              </h2>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#00162e', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Parameter</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#D8A027' }}>India</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Abroad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.82rem' }}>{row.param}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#D8A027', fontSize: '0.82rem' }}>{row.india}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>{row.abroad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DGCA License Conversion */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                DGCA License Conversion — What It Actually Involves
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', marginBottom: '1rem' }}>
                If you train abroad, you return with a foreign CPL (FAA, EASA, CAA Philippines, etc.). To fly commercially in India, you must convert it to a DGCA CPL. The conversion process includes:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Pass DGCA written exams in all subjects (Air Navigation, Air Regulations, Meteorology, Technical General, Technical Specific, RTR)',
                  'Complete 200 hours on Indian-registered aircraft (requirement varies by bilateral agreement)',
                  'Pass DGCA skill test (flight check with DGCA-approved examiner)',
                  'Hold valid DGCA Class 1 Medical throughout conversion period',
                  'Timeline: 12–18 months post-return · additional cost: ₹15–25 lakhs',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6' }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Which Is Better Decision Table */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Which Is Better — Decision Guide
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                {DECISION.map((d, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: i < DECISION.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.5fr', gap: '1rem', alignItems: 'start' }}>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{d.scenario}</div>
                    <div style={{ fontSize: '0.82rem', color: '#D8A027', fontWeight: 700 }}>{d.recommendation}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>{d.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Airborne Helps */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                How Airborne Helps — Whichever Path You Choose
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                If you train in India, Airborne provides CPL ground school, DGCA exam prep, and airline placement preparation from the same campus. If you train abroad and return for conversion, Airborne offers DGCA conversion ground school — all subjects covered in structured batches — plus the 200-hour Indian aircraft coordination through our partner ATOs.
              </p>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: 0 }}>
                Book a free 30-minute counselling session with Capt. Navrang Singh's team to get a cost and timeline breakdown specific to your profile.
              </p>
            </div>

            {/* FAQ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Can I convert a foreign CPL to a DGCA CPL?', a: 'Yes. DGCA allows conversion of foreign CPLs under the bilateral agreement framework. The process requires passing DGCA written examinations in all subjects, completing 200 hours on Indian-registered aircraft (in most cases), and holding a valid foreign CPL from an ICAO contracting state. The conversion process typically takes 12–18 months and requires a significant additional cost outlay after you return to India.' },
                  { q: 'Is flying training abroad cheaper than India?', a: 'On headline flight cost per hour, some countries (Philippines, South Africa, USA) can be cheaper than India. However, total cost including living expenses, forex risk, return flights, DGCA conversion costs, and the additional 200 hours on Indian aircraft often makes the total spend higher than training in India from the start. The decision should be based on total-cost-of-ownership, not per-hour rate.' },
                  { q: 'Do Indian airlines prefer India-trained pilots?', a: 'Indian airlines evaluate pilots on licence validity, flight hours, medical status, and aptitude test scores — not training country. However, pilots with DGCA CPL (India) and 200+ hours on Indian-registered aircraft can apply to cadet programs immediately. Pilots returning with a foreign CPL must first complete conversion before applying.' },
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
            <LeadForm courseName="Flying Training Counselling (India vs Abroad)" source="Course Detail: flying-training-india-abroad" />
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
