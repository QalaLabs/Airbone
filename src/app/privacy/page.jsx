import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Airborne Aviation Academy',
  description: 'Privacy Policy for Airborne Aviation Academy. How we collect, use, and protect personal information submitted via our website and enquiry forms.',
  alternates: { canonical: '/privacy' },
}

const LAST_UPDATED = '21st April 2026'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div className="container-md">

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Legal</p>
            <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
              Privacy Policy
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: '0.75rem', fontFamily: 'var(--font-b)' }}>
              Last Updated: {LAST_UPDATED} · Airborne Aviation Private Limited, Dwarka, New Delhi
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-b)', fontSize: '0.92rem', lineHeight: '1.8' }}>

            <div>
              <p>This Privacy Policy describes how Airborne Aviation Private Limited, operating as Airborne Aviation Academy, collects, uses, stores, and protects any information you provide when you use our website or services.</p>
              <p style={{ marginTop: '0.75rem' }}>We are committed to ensuring that your privacy is protected at all times. If we ask you to provide information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this Privacy Policy.</p>
              <p style={{ marginTop: '0.75rem' }}>Airborne Aviation Private Limited may update this Privacy Policy from time to time by changing this page. You should review this page periodically to ensure that you are comfortable with any changes.</p>
            </div>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>1. Information We Collect</h2>
              <p>We may collect the following information from users of our website or services:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Name</li>
                <li>Contact information, including email address and phone number</li>
                <li>Demographic information such as postcode, preferences, and interests</li>
                <li>Educational or career-related details you choose to share with us</li>
                <li>Other information relevant to customer surveys, enquiries, or offers</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>2. How We Use the Information We Collect</h2>
              <p>We collect this information to understand your requirements and provide you with better service, including but not limited to the following purposes:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Maintaining internal records</li>
                <li>Responding to your enquiries and counselling requests</li>
                <li>Improving our website, services, and student experience</li>
                <li>Periodically sending emails about training programs, offers, updates, or other information that may be relevant to you using the email address you have provided</li>
                <li>Contacting you for feedback, surveys, or market research</li>
                <li>Reaching out to you via phone, email, WhatsApp, or other available communication channels</li>
                <li>Customizing the website and communication based on your interests and preferences</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>3. Security of Your Information</h2>
              <p>We are committed to ensuring that your information is secure. In order to prevent unauthorized access, disclosure, or misuse, we have appropriate physical, electronic, and managerial procedures in place to safeguard the information we collect online.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>4. How We Use Cookies</h2>
              <p>A cookie is a small file that asks permission to be placed on your computer&apos;s hard drive. Once you agree, the file is added, and the cookie helps analyze web traffic or lets you know when you visit a particular website.</p>
              <p style={{ marginTop: '0.75rem' }}>Cookies allow web applications to respond to you as an individual. The website can tailor its operations to your needs, likes, and dislikes by gathering and remembering information about your preferences.</p>
              <p style={{ marginTop: '0.75rem' }}>We may use traffic log cookies to identify which pages are being visited and used. This helps us analyze webpage traffic data and improve our website in order to better serve our visitors. This information is used only for statistical analysis purposes and is then removed from the system.</p>
              <p style={{ marginTop: '0.75rem' }}>Overall, cookies help us provide you with a better website experience by enabling us to monitor which pages are useful to you and which are not. A cookie does not give us access to your computer or any information about you, other than the data you choose to share with us.</p>
              <p style={{ marginTop: '0.75rem' }}>You may choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. However, doing so may prevent you from taking full advantage of the website.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>5. Controlling Your Personal Information</h2>
              <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
              <p style={{ marginTop: '0.75rem' }}>Whenever you are asked to fill in a form on the website, you may choose not to provide certain information or indicate that you do not want the information to be used for marketing purposes, where such an option is available.</p>
              <p style={{ marginTop: '0.75rem' }}>If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by contacting us at <a href="mailto:info@airborneaviation.in" style={{ color: '#D8A027', textDecoration: 'none' }}>info@airborneaviation.in</a>.</p>
              <p style={{ marginTop: '0.75rem' }}>We will not sell, distribute, or lease your personal information to third parties unless we have your permission or are required by law to do so.</p>
              <p style={{ marginTop: '0.75rem' }}>We may use your personal information to send you promotional information about third parties only if you have consented to receive such information.</p>
              <p style={{ marginTop: '0.75rem' }}>If you believe that any information we are holding about you is incorrect or incomplete, please contact us as soon as possible at the email address listed above. We will promptly correct any information found to be incorrect.</p>
            </section>
            
            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>6. Third-Party Disclosure</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. However, we may share information where necessary:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>To comply with applicable law, regulation, legal process, or governmental request.</li>
                <li>To protect our legal rights or prevent fraud or misuse.</li>
              </ul>
            </section>

            <section>
              <p>For any privacy-related questions, please contact:</p>
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
            <Link href="/terms" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Terms &amp; Conditions →</Link>
            <Link href="/dgca-compliance" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>DGCA Compliance →</Link>
            <Link href="/contact" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Contact Us →</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
