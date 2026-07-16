import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'

export const metadata = {
  title: 'Pilot Training Cost in India 2026 — Complete CPL Fee Breakdown',
  description: 'Complete breakdown of pilot training cost in India for 2026 — CPL ground school, flying hours, DGCA exam fees, medical, and total investment compared to training abroad.',
  alternates: { canonical: '/blog/pilot-training-cost-india' },
  openGraph: {
    title: 'Pilot Training Cost in India 2026 — Complete CPL Fee Breakdown',
    description: 'Full cost breakdown for becoming a commercial pilot in India — ground school, flying hours, exam fees, and total investment.',
    url: 'https://www.airborneaviation.in/blog/pilot-training-cost-india',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pilot Training Cost in India 2026 — Complete CPL Fee Breakdown',
    description: 'Full cost breakdown for becoming a commercial pilot in India — ground school, flying hours, exam fees, and total investment.',
  },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Resources', path: '/resources' },
  { name: 'Pilot Training Cost in India', path: '/blog/pilot-training-cost-india' },
])

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Pilot Training Cost in India 2026 — Complete CPL Fee Breakdown',
  description: 'Complete breakdown of pilot training cost in India for 2026 — CPL ground school, flying hours, DGCA exam fees, medical, and total investment.',
  author: { '@type': 'Person', name: 'Capt. Navrang Singh' },
  publisher: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    logo: { '@type': 'ImageObject', url: 'https://www.airborneaviation.in/logo-primary.png' },
    url: 'https://www.airborneaviation.in',
  },
  datePublished: '2026-06-15',
  dateModified: '2026-07-17',
  url: 'https://www.airborneaviation.in/blog/pilot-training-cost-india',
  mainEntityOfPage: 'https://www.airborneaviation.in/blog/pilot-training-cost-india',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the total cost of CPL training in India?', acceptedAnswer: { '@type': 'Answer', text: 'Total CPL training cost in India — including 200 flying hours, ground school, DGCA exam fees, and medical — typically ranges from ₹50 lakh onwards for complete flying training, or ₹2,70,000 for ground school alone if flying hours are arranged separately or already completed.' } },
    { '@type': 'Question', name: 'Is pilot training cheaper in India or abroad?', acceptedAnswer: { '@type': 'Answer', text: 'Direct training cost can be lower in the Philippines or USA (₹35–45L vs ₹55–75L in India). However, once DGCA conversion costs (₹5–15L), living expenses abroad, and an additional 12–18 months before airline entry are added, India-trained CPL holders often reach their first airline seat faster and at a lower total cost.' } },
    { '@type': 'Question', name: 'What does DGCA ground school cost at Airborne?', acceptedAnswer: { '@type': 'Answer', text: 'DGCA Ground School (all subjects) at Airborne Aviation Academy is ₹2,70,000. This covers Air Navigation, Meteorology, Air Regulations, Technical General & Specific, and RTR, taught personally by Capt. Navrang Singh.' } },
    { '@type': 'Question', name: 'Are there additional costs beyond ground school and flying hours?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — DGCA exam fees (₹25,000–₹40,000 for 6 papers), DGCA Class 1 Medical (₹10,000–₹25,000), and Student Pilot License (₹15,000–₹25,000) are separate from ground school and flying training fees. Airborne provides a full fee breakdown before enrolment.' } },
  ],
}

const COST_TABLE = [
  { component: 'DGCA Ground School (All Subjects)', cost: '₹2,70,000', note: 'Complete CPL ground school at Airborne' },
  { component: 'ATPL Ground School (incl. viva)', cost: '₹1,50,000', note: 'For CPL holders upgrading to ATPL' },
  { component: 'CPL Flying Training (Complete)', cost: '₹50,00,000 onwards', note: '200 flying hours via partner FTO' },
  { component: 'Private Pilot Licence (Complete)', cost: '₹25,00,000', note: '40 minimum flying hours' },
  { component: 'DGCA Exam Fees (6 papers)', cost: '₹25,000 – ₹40,000', note: 'Paid directly to DGCA' },
  { component: 'DGCA Class 1 Medical', cost: '₹10,000 – ₹25,000', note: 'Required before flying training' },
  { component: 'Student Pilot License (SPL)', cost: '₹15,000 – ₹25,000', note: 'Required to begin flying hours' },
  { component: 'Cadet Pilot Preparation', cost: '₹50,000', note: 'Airline cadet program preparation' },
  { component: 'GD & PI Preparation', cost: '₹30,000', note: 'Airline interview preparation' },
  { component: 'Airbus A320 SIM Training', cost: '₹10,000 / hr', note: 'In-house Airbus A320 FTD Level 5 simulator' },
]

const INDIA_VS_ABROAD = [
  { factor: 'Total Cost (CPL)', india: '₹55–65 lakh', abroad: '₹35–65 lakh (USA / Philippines / Australia / Canada)' },
  { factor: 'DGCA License', india: 'Issued directly by DGCA', abroad: 'Conversion required — 6 written exams + skill test' },
  { factor: 'Timeline to Airline Job', india: '12–18 months', abroad: '18–36 months including conversion' },
  { factor: 'Loan Availability', india: 'Easy — Indian banks, education loan', abroad: 'Harder to finance from India' },
  { factor: 'Weather for Flying', india: 'Variable, monsoon disruptions', abroad: 'Generally more consistent (Philippines, USA)' },
]

export default function PilotTrainingCostIndiaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/resources" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Resources</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>Pilot Training Cost in India</span>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-h)' }}>
              Cost Guide · Updated July 2026
            </span>
            <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: '1.15', marginBottom: '1.25rem' }}>
              Pilot Training Cost in India 2026 — Complete CPL Fee Breakdown
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.75', fontFamily: 'var(--font-b)' }}>
              Every rupee it takes to become a commercial pilot in India — ground school, flying hours, DGCA exam fees, medical, and how the total compares to training abroad. By the faculty at Airborne Aviation Academy, Dwarka.
            </p>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '1.5rem' }}>
              <span>By Capt. Navrang Singh</span>
              <span>·</span>
              <span>10 min read</span>
            </div>
          </div>

          {/* Table of Contents */}
          <nav aria-label="Table of contents" style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 1.75rem', borderRadius: '1px', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 700, display: 'block', marginBottom: '0.9rem' }}>On This Page</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                ['#full-breakdown', 'Full CPL Fee Breakdown'],
                ['#india-vs-abroad', 'India vs Abroad Cost Comparison'],
                ['#what-affects-cost', 'What Affects Your Total Cost'],
                ['#faqs', 'Frequently Asked Questions'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'var(--font-b)' }}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Full Fee Breakdown */}
          <section id="full-breakdown" style={{ marginBottom: '3rem', scrollMarginTop: '6rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Full CPL Fee Breakdown</h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-b)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Every Airborne Aviation course comes with a full fee breakdown provided at the time of enquiry — no hidden costs. Here is what each component of pilot training in India actually costs in 2026:
            </p>
            <div className="course-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="course-table" style={{ minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '1rem 1.25rem' }}>Cost Component</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Amount</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_TABLE.map((row) => (
                    <tr key={row.component}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{row.component}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#D8A027', fontWeight: 700 }}>{row.cost}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.55)' }}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* India vs Abroad */}
          <section id="india-vs-abroad" style={{ marginBottom: '3rem', scrollMarginTop: '6rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.25rem' }}>India vs Abroad — Cost Comparison</h2>
            <div className="course-table-wrap" style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table className="course-table" style={{ minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '1rem 1.25rem' }}>Factor</th>
                    <th style={{ padding: '1rem 1.25rem' }}>India (DGCA-Approved FTO)</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Abroad</th>
                  </tr>
                </thead>
                <tbody>
                  {INDIA_VS_ABROAD.map((row) => (
                    <tr key={row.factor}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{row.factor}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.7)' }}>{row.india}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.55)' }}>{row.abroad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-b)', lineHeight: '1.7' }}>
              Direct training cost can be lower in the Philippines or USA. However, once DGCA conversion costs (₹5–15L), living expenses abroad, and an additional 12–18 months before airline entry are added, India-trained CPL holders often reach their first airline seat faster and at a lower total cost. See our full <Link href="/courses/flying-training-india-abroad" style={{ color: '#D8A027' }}>India vs Abroad guide</Link> for a detailed breakdown.
            </p>
          </section>

          {/* What Affects Cost */}
          <section id="what-affects-cost" style={{ marginBottom: '3rem', scrollMarginTop: '6rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.25rem' }}>What Affects Your Total Cost</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { tip: 'Where you fly', detail: 'Flying hour costs vary by aircraft type, fuel prices, and the flying training organisation (FTO) you partner with.' },
                { tip: 'How many attempts you need on DGCA exams', detail: 'Each re-attempt has its own examination fee. Strong ground school preparation reduces retake costs significantly.' },
                { tip: 'Whether you train in India or abroad', detail: 'Training abroad may look cheaper upfront, but DGCA conversion costs and additional timeline add to the true total.' },
                { tip: 'Medical and licensing fees', detail: 'Class 1 Medical and SPL fees are one-time costs required before flying training begins — factor these in early.' },
              ].map((s, i) => (
                <div key={i} style={{ borderLeft: '3px solid #DB241E', paddingLeft: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>{s.tip}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-b)', lineHeight: '1.6', margin: 0 }}>{s.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Link — Course */}
          <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.75rem', borderRadius: '1px', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: '0.35rem' }}>DGCA CPL Ground School at Airborne</h3>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-b)', margin: 0 }}>₹2,70,000 · Max 25 students per batch · Taught by Capt. Navrang Singh</p>
            </div>
            <Link href="/courses/commercial-pilot-license-cpl" className="btn btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>View Course →</Link>
          </div>

          {/* FAQ */}
          <section id="faqs" style={{ marginBottom: '3.5rem', scrollMarginTop: '6rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqSchema.mainEntity.map((faq, i) => (
                <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', borderRadius: '1px' }}>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{faq.name}</h3>
                  <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', margin: 0, fontFamily: 'var(--font-b)', lineHeight: '1.6' }}>{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA & Lead Form */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-h)' }}>Get Your Personal Fee Breakdown</span>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Know Exactly What Your Training Will Cost
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto', fontFamily: 'var(--font-b)' }}>
                Talk to Airborne's admissions team for a full, personalised cost breakdown — no hidden fees, no surprises.
              </p>
            </div>
            <LeadForm courseName="DGCA CPL Ground School" source="Blog: Pilot Training Cost in India" />
          </div>

          {/* Internal links */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 700, marginBottom: '1rem' }}>Related Articles</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/blog/how-to-become-pilot-india" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>How to Become a Pilot in India →</Link>
              <Link href="/blog/dgca-ground-school-guide" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>DGCA Ground School Guide →</Link>
              <Link href="/courses/flying-training-india-abroad" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Flying Training: India vs Abroad →</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
