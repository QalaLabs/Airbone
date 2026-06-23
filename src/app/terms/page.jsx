import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Airborne Aviation Academy',
  description: 'Terms of Service for Airborne Aviation Academy. Educational content disclaimer, admissions terms, training disclaimers, and contact details.',
  alternates: { canonical: '/terms' },
}

const LAST_UPDATED = 'June 2026'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Legal</p>
            <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
              Terms of Service
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: '0.75rem', fontFamily: 'var(--font-b)' }}>
              Last Updated: {LAST_UPDATED} · Airborne Aviation Academy Pvt. Ltd., Dwarka, New Delhi
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-b)', fontSize: '0.92rem', lineHeight: '1.8' }}>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
              <p>By accessing or using the website at <strong style={{ color: '#fff' }}>airborneaviation.academy</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
              <p style={{ marginTop: '0.75rem' }}>These terms apply to all visitors, students, and prospective students who access or use any services offered by Airborne Aviation Academy Pvt. Ltd.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>2. Educational Content Disclaimer</h2>
              <div style={{ background: '#00162e', border: '1px solid rgba(219,36,30,0.25)', borderLeft: '3px solid #DB241E', padding: '1.25rem 1.5rem', borderRadius: '1px', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>Important Notice</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Content published on this website — including blog articles, career guides, salary information, and regulatory information — is for general informational purposes only. It does not constitute professional legal, financial, or regulatory advice.</p>
              </div>
              <p>Aviation regulations, DGCA requirements, and airline policies change frequently. While we endeavour to keep all published content accurate and up to date, Airborne Aviation Academy cannot guarantee the completeness, accuracy, or currency of all information at the time of reading.</p>
              <p style={{ marginTop: '0.75rem' }}>Always verify regulatory requirements directly with the DGCA (Directorate General of Civil Aviation) and your chosen flight school before making career or financial decisions.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>3. Admissions Disclaimer</h2>
              <p>Submission of an enquiry form on this website does not guarantee admission to any program at Airborne Aviation Academy. Admissions are subject to:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Available batch capacity (maximum 25 students per batch)</li>
                <li>Meeting eligibility requirements for the specific course</li>
                <li>DGCA medical fitness requirements (where applicable)</li>
                <li>Completion of the admissions counselling process</li>
                <li>Payment of applicable course fees</li>
              </ul>
              <p style={{ marginTop: '0.75rem' }}>All fee and batch information displayed on this website is indicative and subject to change. Confirmed fees and batch dates will be communicated by our admissions team prior to enrollment.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>4. Training Disclaimer</h2>
              <p>Airborne Aviation Academy provides ground school preparation, simulator familiarisation, and career readiness training. We are not an FTO (Flying Training Organisation) licensed to conduct actual flight training. Flying hours must be obtained through a separate DGCA-approved FTO.</p>
              <p style={{ marginTop: '0.75rem' }}>Placement support and airline preparation services are provided in good faith. Airborne does not guarantee employment outcomes, airline selection results, or DGCA examination pass rates for individual students. Historical pass rates and placement records are shared for informational purposes only and are not contractual commitments.</p>
              <p style={{ marginTop: '0.75rem' }}>Aviation careers involve significant physical, psychological, and regulatory requirements outside our control. Airborne Aviation Academy is not liable for outcomes resulting from DGCA medical disqualification, examination failures, airline rejection, or changes in aviation industry conditions.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>5. Course Fees and Payments</h2>
              <p>Course fees are confirmed during the admissions counselling process before enrollment. All payments are subject to Airborne Aviation Academy&apos;s fee structure in effect at the time of enrollment. Fees are generally non-refundable after the commencement of a batch unless otherwise agreed in writing.</p>
              <p style={{ marginTop: '0.75rem' }}>For fee-related queries, please contact our admissions desk directly at <strong style={{ color: '#fff' }}>+91 9953 777 320</strong>.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>6. Intellectual Property</h2>
              <p>All content on this website — including text, graphics, course materials, study guides, and resources — is the intellectual property of Airborne Aviation Academy Pvt. Ltd. and is protected by applicable copyright laws. You may not reproduce, distribute, or commercially exploit any content without prior written permission.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>7. Limitation of Liability</h2>
              <p>To the fullest extent permitted by applicable law, Airborne Aviation Academy shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of this website or our services. Our total liability in any matter relating to the website or services shall not exceed the fees paid for the specific service in question.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>8. Governing Law</h2>
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>9. Changes to These Terms</h2>
              <p>We reserve the right to modify these Terms of Service at any time. The date at the top of this page indicates the most recent revision. Continued use of our website following any changes constitutes your acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>10. Contact</h2>
              <p>For any questions about these Terms of Service, please contact us:</p>
              <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '1px', marginTop: '1rem' }}>
                <p style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-h)', fontSize: '0.92rem' }}>Airborne Aviation Academy Pvt. Ltd.</strong>
                  <span>E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi — 110075</span>
                  <span>Email: <a href="mailto:info@airborneaviation.academy" style={{ color: '#D8A027', textDecoration: 'none' }}>info@airborneaviation.academy</a></span>
                  <span>Phone: <a href="tel:+919953777320" style={{ color: '#D8A027', textDecoration: 'none' }}>+91 9953 777 320</a></span>
                </p>
              </div>
            </section>

          </div>

          {/* Bottom links */}
          <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Privacy Policy →</Link>
            <Link href="/dgca-compliance" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>DGCA Compliance →</Link>
            <Link href="/contact" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Contact Us →</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
