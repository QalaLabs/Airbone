import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Airborne Aviation Academy',
  description: 'Privacy Policy for Airborne Aviation Academy. How we collect, use, and protect personal information submitted via our website and enquiry forms.',
  alternates: { canonical: '/privacy' },
}

const LAST_UPDATED = 'June 2026'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Legal</p>
            <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
              Privacy Policy
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: '0.75rem', fontFamily: 'var(--font-b)' }}>
              Last Updated: {LAST_UPDATED} · Airborne Aviation Academy Pvt. Ltd., Dwarka, New Delhi
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-b)', fontSize: '0.92rem', lineHeight: '1.8' }}>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>1. Introduction</h2>
              <p>Airborne Aviation Academy Pvt. Ltd. (&quot;Airborne&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website at <strong style={{ color: '#fff' }}>airborneaviation.academy</strong>. This Privacy Policy explains what personal information we collect when you use our website, how we use it, and how we protect it.</p>
              <p style={{ marginTop: '0.75rem' }}>By using our website or submitting an enquiry form, you consent to the practices described in this policy.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>2. Information We Collect</h2>
              <p>We collect the following categories of personal information:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {[
                  { title: 'Contact & Enquiry Data', desc: 'When you submit an enquiry or lead form, we collect your Full Name, Phone Number, and Email Address. This information is used to contact you with course details and admissions information.' },
                  { title: 'Course Interest', desc: 'We collect the course or program you express interest in to provide relevant information and match you with the appropriate faculty member.' },
                  { title: 'Website Usage Data', desc: 'We may collect anonymised data about how you interact with our website, such as pages visited, time on site, and referrer source. This is used to improve website quality and content.' },
                  { title: 'Cookies', desc: 'Our website may use session cookies for technical functionality. We do not use tracking cookies for advertising purposes. You may disable cookies in your browser settings without affecting core website functionality.' },
                ].map((item) => (
                  <div key={item.title} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', borderRadius: '1px', borderLeft: '3px solid #D8A027' }}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>{item.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>3. How We Use Your Information</h2>
              <p>We use the information you provide for the following purposes:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>To respond to your admissions enquiries within 24 hours</li>
                <li>To share course syllabi, batch schedules, and fee information relevant to your interest</li>
                <li>To contact you via phone call or WhatsApp message with counselling support</li>
                <li>To send you information about upcoming batch schedules, only if you have expressed prior interest</li>
                <li>To improve our website content, course offerings, and student experience</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>We do <strong style={{ color: '#fff' }}>not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>4. Lead Form Data</h2>
              <p>When you submit an enquiry through any lead form on our website, your data is transmitted securely to our internal admissions management system. An Airborne admissions counsellor will typically contact you within 24 hours via phone or WhatsApp.</p>
              <p style={{ marginTop: '0.75rem' }}>Automated follow-up communications may be triggered via our CRM system. You can opt out of these communications at any time by contacting us at <strong style={{ color: '#fff' }}>info@airborneaviation.in</strong>.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>5. Data Security</h2>
              <p>We implement appropriate technical and organisational measures to protect your personal data from unauthorised access, alteration, disclosure, or destruction. Our website operates over HTTPS (TLS encryption). Lead form submissions are transmitted to our backend systems using secure API calls with authentication keys.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>6. Data Retention</h2>
              <p>We retain your contact and enquiry data for a period necessary to manage your admissions relationship with us — typically up to 2 years from the date of last contact. You may request deletion of your data at any time by contacting us directly.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Request access to the personal data we hold about you</li>
                <li>Request correction of inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Withdraw consent for data processing at any time</li>
              </ul>
              <p style={{ marginTop: '0.75rem' }}>To exercise any of these rights, contact us at <strong style={{ color: '#fff' }}>info@airborneaviation.in</strong> or call <strong style={{ color: '#fff' }}>+91 9953 777 320</strong>.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>8. Third-Party Links</h2>
              <p>Our website may contain links to external websites (e.g., Google Maps, WhatsApp). We are not responsible for the privacy practices of these third-party sites. We encourage you to review their privacy policies separately.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. The date at the top of this page will reflect the most recent revision. Continued use of our website following any changes constitutes your acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>10. Contact Us</h2>
              <p>For any privacy-related questions, data requests, or opt-out requests, please contact:</p>
              <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '1px', marginTop: '1rem' }}>
                <p style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-h)', fontSize: '0.92rem' }}>Airborne Aviation Academy Pvt. Ltd.</strong>
                  <span>E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi — 110075</span>
                  <span>Email: <a href="mailto:info@airborneaviation.in" style={{ color: '#D8A027', textDecoration: 'none' }}>info@airborneaviation.in</a></span>
                  <span>Phone: <a href="tel:+919953777320" style={{ color: '#D8A027', textDecoration: 'none' }}>+91 9953 777 320</a></span>
                </p>
              </div>
            </section>

          </div>

          {/* Bottom links */}
          <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/terms" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Terms of Service →</Link>
            <Link href="/dgca-compliance" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>DGCA Compliance →</Link>
            <Link href="/contact" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Contact Us →</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
