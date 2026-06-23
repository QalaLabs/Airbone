import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'DGCA Compliance | Airborne Aviation Academy',
  description: 'Airborne Aviation Academy\'s DGCA compliance status. Our courses are aligned to DGCA CPL and ATPL ground school requirements. Regulatory information for aviation aspirants.',
  alternates: { canonical: '/dgca-compliance' },
}

const DGCA_POINTS = [
  {
    title: 'DGCA CPL Examination Alignment',
    desc: 'All CPL ground school subjects taught at Airborne Aviation Academy are structured in strict accordance with the DGCA-approved CPL syllabus under CAR Section 7, Series B. Our curriculum covers all 6 examination papers: Air Navigation, Meteorology, Air Regulations, Technical General, Technical Specific, and Radio Telephony.',
  },
  {
    title: 'DGCA ATPL Alignment',
    desc: 'Our ATPL ground school program follows the DGCA Airline Transport Pilot License theoretical knowledge syllabus, preparing candidates for the transition from First Officer to Pilot-in-Command on scheduled operations.',
  },
  {
    title: 'Simulator — DGCA FTD Level 5',
    desc: 'Our in-house Airbus A320 Flight Training Device (FTD) is used for familiarisation training, airline interview preparation, and cadet selection readiness. Students wishing to log FTD hours toward DGCA credit must do so under a DGCA-approved FTO using a licensed simulator.',
  },
  {
    title: 'Partner FTOs',
    desc: 'Airborne Aviation Academy collaborates with DGCA-approved Flying Training Organisations (FTOs) in India, and internationally recognised flight schools in the United States, New Zealand, and South Africa for flying hour accumulation and license issuance.',
  },
  {
    title: 'Medical Requirements',
    desc: 'All students are advised to obtain a DGCA Class 1 Medical Certificate from an authorised DGCA Aviation Medical Examiner (AME) prior to beginning flight training. Airborne does not issue or certify medical fitness — this remains the sole prerogative of the DGCA and authorised AMEs.',
  },
  {
    title: 'DGCA License Conversion Support',
    desc: 'For students who complete flight training abroad, Airborne provides guidance and support for DGCA license conversion under CAR Section 7 — including document preparation, skill test preparation, and administrative facilitation.',
  },
]

export default function DGCACompliancePage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Regulatory</p>
            <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
              DGCA Compliance
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginTop: '1rem', lineHeight: '1.7', fontFamily: 'var(--font-b)' }}>
              Airborne Aviation Academy aligns its ground school programs with the DGCA (Directorate General of Civil Aviation) regulatory framework for CPL, ATPL, and related aviation training programs in India.
            </p>
          </div>

          {/* Compliance badge */}
          <div style={{ background: '#00162e', border: '1px solid rgba(216,160,39,0.3)', borderLeft: '4px solid #D8A027', padding: '1.5rem 1.75rem', borderRadius: '1px', marginBottom: '3rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>✈️</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>DGCA-Focused Ground Training</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-b)', lineHeight: '1.6', margin: 0 }}>
                Airborne is not an FTO and does not conduct flight training. We are a specialist ground school and aviation career preparation centre. All our programs are designed to prepare students for DGCA examinations and airline selection processes.
              </p>
            </div>
          </div>

          {/* Compliance points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            {DGCA_POINTS.map((point, i) => (
              <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem', borderRadius: '1px' }}>
                <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{point.title}</h2>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.62)', fontFamily: 'var(--font-b)', lineHeight: '1.7', margin: 0 }}>{point.desc}</p>
              </div>
            ))}
          </div>

          {/* Important Note */}
          <div style={{ background: '#000f1e', border: '1px solid rgba(219,36,30,0.2)', borderLeft: '3px solid #DB241E', padding: '1.5rem', borderRadius: '1px', marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 800, color: '#DB241E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Regulatory Disclaimer</h3>
            <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-b)', lineHeight: '1.6', margin: 0 }}>
              DGCA regulations are updated periodically. The information on this page is provided for general guidance only. Always verify current requirements directly at <a href="https://dgca.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#D8A027', textDecoration: 'none' }}>dgca.gov.in</a> or by contacting the DGCA regional office in your jurisdiction.
            </p>
          </div>

          {/* Contact */}
          <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.75rem', borderRadius: '1px', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Questions About Compliance?</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-b)', marginBottom: '1.25rem' }}>
              Our admissions team can help clarify DGCA eligibility requirements, CPL examination pathways, and license conversion processes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '0.65rem 1.5rem' }}>Contact Admissions</Link>
              <a href="tel:+919953777320" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '0.65rem 1.5rem' }}>+91 9953 777 320</a>
            </div>
          </div>

          {/* Bottom links */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Privacy Policy →</Link>
            <Link href="/terms" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Terms of Service →</Link>
            <Link href="/courses" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Our Courses →</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
