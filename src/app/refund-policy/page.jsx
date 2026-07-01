import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Refund & Cancellation Policy | Airborne Aviation Academy',
  description: 'Refund and Cancellation Policy for Airborne Aviation Academy. Details on fee refunds, cancellation terms, and related policies.',
  alternates: { canonical: '/refund-policy' },
}

const LAST_UPDATED = '21st April 2026'

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Legal</p>
            <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
              Refund & Cancellation Policy
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: '0.75rem', fontFamily: 'var(--font-b)' }}>
              Last Updated: {LAST_UPDATED} · Airborne Aviation Private Limited, Dwarka, New Delhi
            </p>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-b)', fontSize: '0.92rem', lineHeight: '1.8' }}>
            
            <p>This policy applies to payments made for training programs, counseling, simulator sessions, workshops, and related services offered by Airborne Aviation Academy.</p>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>1. General Policy</h2>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>By enrolling in any program or making a payment, you agree to this policy.</li>
                <li>Refunds are handled based on the operational commitments of the academy, such as reserved seats, batch planning, and faculty allocation.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>2. Fees Covered</h2>
              <p>This policy applies to payments including, but not limited to:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Registration fees</li>
                <li>Admission confirmation fees</li>
                <li>Tuition fees (ground classes/training programs)</li>
                <li>Simulator session fees</li>
                <li>Workshop or special session fees</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>3. Non-Refundable Charges</h2>
              <p>Unless specifically approved in writing by the academy, the following are generally non-refundable:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Registration fees and admission processing fees</li>
                <li>Counselling or consultation fees (if charged separately)</li>
                <li>Charges for study materials, digital resources, or access already provided</li>
                <li>Any amount for services already availed by the student</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>4. Cancellation Before Batch Commencement</h2>
              <p>If a student cancels before a batch commences, the following terms apply:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Cancellation more than 15 days before batch commencement: Students may request a refund of the tuition fee, subject to deductions for registration/admission charges, costs of materials/resources already issued, and any applicable administrative charges.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>5. After Batch Commencement</h2>
              <p>Once a batch has commenced, fees paid are generally non-refundable because seats have been reserved and academic planning/resource allocation has been completed. No refunds are typically issued for the unused portion of a course.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>6. Refund Processing</h2>
              <p>If approved, refunds are typically processed within 15 to 21 business days from the date of approval via the original payment method or bank transfer, minus any applicable bank, payment gateway, or transaction fees.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>7. Exceptions / No Refund</h2>
              <p>No refunds are applicable if admission or services are withdrawn due to misconduct, violation of academy rules, submission of false information, or behavior affecting academic discipline.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>8. Force Majeure</h2>
              <p>The academy is not responsible for delays or service interruptions caused by events beyond its control (e.g., natural disasters, government restrictions, technical outages). In such cases, the academy may reschedule or adjust services at its discretion.</p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>9. Final Decision</h2>
              <p>All refund and cancellation decisions are subject to the final review and approval of the academy&apos;s management. The academy reserves the right to revise this policy at any time without prior notice.</p>
            </section>

            <section>
              <p>For any refund or cancellation queries, please contact us at <a href="mailto:info@airborneaviation.in" style={{ color: '#D8A027', textDecoration: 'none' }}>info@airborneaviation.in</a> or call <a href="tel:+919953777320" style={{ color: '#D8A027', textDecoration: 'none' }}>+91 9953 777 320</a>.</p>
              
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
            <Link href="/terms" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Terms &amp; Conditions →</Link>
            <Link href="/contact" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Contact Us →</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
