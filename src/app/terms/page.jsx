import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions | Airborne Aviation Academy',
  description: 'Terms and Conditions for Airborne Aviation Academy. Usage terms, intellectual property, limitation of liability, and contact details.',
  alternates: { canonical: '/terms' },
}

const LAST_UPDATED = '21st April 2026'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div className="container-md">

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Legal</p>
            <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
              Terms & Conditions
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: '0.75rem', fontFamily: 'var(--font-b)' }}>
              Last Updated: {LAST_UPDATED} · Airborne Aviation Private Limited, Dwarka, New Delhi
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-b)', fontSize: '0.92rem', lineHeight: '1.8' }}>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
              <p>By browsing, accessing, or using the website, you agree to be bound by these Terms & Conditions and the Privacy Policy. If you do not agree, you should not use the website or services.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>2. General Use</h2>
              <p>The content of the pages of this website is provided for your general information and use only. It is subject to change without notice.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>3. No Warranty</h2>
              <p>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors, and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>4. Intellectual Property</h2>
              <p>This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</p>
              <p style={{ marginTop: '0.75rem' }}>All trademarks reproduced in this website, which are not the property of, or licensed to the operator, are acknowledged on the website.</p>
              <p style={{ marginTop: '0.75rem' }}>Unauthorised use of this website may give rise to a claim for damages and/or be a criminal offence.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>5. User Conduct</h2>
              <p>From time to time, this website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).</p>
              <p style={{ marginTop: '0.75rem' }}>Your use of this website and any dispute arising out of such use of the website is subject to the laws of India.</p>
              <p style={{ marginTop: '0.75rem' }}>We shall not be held responsible for any content that appears on your website or any third-party website. You agree to protect and defend us against all claims that may arise from your use of our website or services. No link(s) should appear on any website that may be interpreted as defamatory, obscene, criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of any third-party rights.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>6. Limitation of Liability</h2>
              <p>The company expressly excludes liability for any inaccuracies or errors to the fullest extent permitted by law. The Company shall not be liable for any loss or damage of any nature arising directly or indirectly from the use of the website, or from any information or service provided on the website.</p>
              <p style={{ marginTop: '0.75rem' }}>We shall also not be liable for any loss or damage arising directly or indirectly from the decline of authorization for any transaction where such decline results from the user or trainee exceeding any preset limit or any limitation imposed by the relevant service provider, banking institution, or payment system.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>7. Accuracy of Information</h2>
              <p>While we make reasonable efforts to keep the information on this website up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or the information, services, or related content contained on the website for any purpose.</p>
              <p style={{ marginTop: '0.75rem' }}>Any reliance you place on such information is therefore strictly at your own risk.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>8. Changes to Terms & Conditions</h2>
              <p>We may change, update, add, or remove portions of these Terms & Conditions at any time. Please check the terms periodically for changes. Your continued use of the website after changes have been posted will constitute acceptance of those changes.</p>
            </section>

            <section>
              <p>For any questions about these Terms & Conditions, please contact us:</p>
              <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '1px', marginTop: '1rem' }}>
                <p style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-h)', fontSize: '0.92rem' }}>Airborne Aviation Private Limited</strong>
                  <span>E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi — 110075</span>
                  <span>Email: <a href="mailto:info@airborneaviation.in" style={{ color: '#D8A027', textDecoration: 'none' }}>info@airborneaviation.in</a></span>
                  <span>Phone: <a href="tel:+919953777320" style={{ color: '#D8A027', textDecoration: 'none' }}>+91 9953 777 320</a></span>
                </p>
              </div>
            </section>

          </div>

          {/* Bottom links */}
          <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Privacy Policy →</Link>
            <Link href="/refund-policy" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Refund &amp; Cancellation Policy →</Link>
            <Link href="/contact" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Contact Us →</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
