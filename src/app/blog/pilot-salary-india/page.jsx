import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getBreadcrumbSchema } from '@/utils/seo'

export const metadata = {
  title: 'Pilot Salary in India 2026 — CPL vs ATPL Income Guide | Airborne',
  description: 'Complete pilot salary guide for India in 2026. First Officer vs Captain pay at IndiGo, Air India, Akasa, Vistara. CPL salary expectations, growth timeline, and perks explained.',
  alternates: { canonical: '/blog/pilot-salary-india' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Resources', path: '/resources' },
  { name: 'Pilot Salary in India', path: '/blog/pilot-salary-india' },
])

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Pilot Salary in India 2026 — CPL vs ATPL Income Guide',
  description: 'Complete pilot salary guide for India in 2026, covering First Officer vs Captain pay, airline-by-airline breakdown, and growth timeline.',
  author: { '@type': 'Person', name: 'Capt. Navrang Singh' },
  publisher: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    logo: { '@type': 'ImageObject', url: 'https://airborneaviation.in/favicon.svg' },
    url: 'https://airborneaviation.in',
  },
  datePublished: '2026-02-01',
  dateModified: '2026-06-01',
  url: 'https://airborneaviation.in/blog/pilot-salary-india',
  mainEntityOfPage: 'https://airborneaviation.in/blog/pilot-salary-india',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the starting salary of a pilot in India?', acceptedAnswer: { '@type': 'Answer', text: 'A fresh CPL holder joining as a First Officer (trainee) at an Indian airline can expect a starting salary in the range of ₹1.5–3 lakhs per month, depending on the airline and aircraft type.' } },
    { '@type': 'Question', name: 'What is the salary of an Airbus A320 Captain in India?', acceptedAnswer: { '@type': 'Answer', text: 'A senior A320 Captain at major Indian airlines typically earns between ₹7–14 lakhs per month, including base pay, flying allowances, night allowances, and other perks.' } },
    { '@type': 'Question', name: 'How many years does it take to become a Captain in India?', acceptedAnswer: { '@type': 'Answer', text: 'Typically 8–15 years from the time of CPL, depending on airline expansion, attrition, and individual performance. IndiGo and Air India have had accelerated upgrades during periods of high growth.' } },
    { '@type': 'Question', name: 'Do Indian pilots get free travel benefits?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Most Indian airlines offer free or heavily discounted standby travel for the pilot and immediate family members, along with crew travel on international carriers through bilateral agreements.' } },
  ],
}

const SALARY_TABLE = [
  { rank: 'Trainee First Officer', airline: 'IndiGo / Air India', monthly: '₹1.5–2.5L', annual: '₹18–30L' },
  { rank: 'First Officer (Junior)', airline: 'All major carriers', monthly: '₹2.5–4L', annual: '₹30–48L' },
  { rank: 'First Officer (Senior)', airline: 'All major carriers', monthly: '₹4–6L', annual: '₹48–72L' },
  { rank: 'Captain (Narrow body)', airline: 'IndiGo / Akasa / Vistara', monthly: '₹6–10L', annual: '₹72–1.2Cr' },
  { rank: 'Captain (Wide body)', airline: 'Air India International', monthly: '₹10–16L', annual: '₹1.2–2Cr' },
]

const PERKS = [
  'Free standby travel for pilot and family on own and partner airlines',
  'Medical coverage (Class 1 renewal costs borne by airline)',
  'Accommodation and transport allowance during layovers',
  'Night and weekend flying allowances on top of base salary',
  'Annual leave credit (28–45 days depending on airline)',
  'Crew discount on cargo for household goods import/export',
]

const GROWTH_TIMELINE = [
  { years: 'Year 0–2', stage: 'CPL & Ground School', note: 'DGCA theory papers, flying hours accumulation, cadet selection attempts' },
  { years: 'Year 2–4', stage: 'Trainee / Junior First Officer', note: 'Type rating, line training, initial airline roster' },
  { years: 'Year 4–8', stage: 'Senior First Officer', note: 'Route experience, building towards 3,000 PIC hours for upgrade' },
  { years: 'Year 8–15', stage: 'Captain Upgrade', note: 'Simulator check rides, command training, PIC designation' },
  { years: 'Year 15+', stage: 'Senior Captain / Fleet Captain', note: 'Training captain, management roles, international routes' },
]

export default function PilotSalaryPage() {
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
          <span style={{ color: '#D8A027' }}>Pilot Salary India</span>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-h)' }}>
              Salary Guide · Updated June 2026
            </span>
            <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: '1.15', marginBottom: '1.25rem' }}>
              Pilot Salary in India — Complete 2026 Guide
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.75', fontFamily: 'var(--font-b)' }}>
              What do pilots actually earn in India? This guide covers real-world salary ranges at every career stage — from freshly minted First Officers to senior Captains flying international routes. Data compiled from current airline pay scales and Airborne alumni placement records.
            </p>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '1.5rem' }}>
              <span>By Capt. Navrang Singh</span>
              <span>·</span>
              <span>10 min read</span>
            </div>
          </div>

          {/* Salary Table */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Indian Pilot Salary Table 2026</h2>
            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1px', background: '#00162e' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#fff', fontFamily: 'var(--font-b)', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#000f1e', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-h)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D8A027' }}>
                    <th style={{ padding: '1.1rem 1.25rem', textAlign: 'left' }}>Rank / Stage</th>
                    <th style={{ padding: '1.1rem 1.25rem', textAlign: 'left' }}>Typical Airline</th>
                    <th style={{ padding: '1.1rem 1.25rem', textAlign: 'left' }}>Monthly (CTC)</th>
                    <th style={{ padding: '1.1rem 1.25rem', textAlign: 'left' }}>Annual (CTC)</th>
                  </tr>
                </thead>
                <tbody>
                  {SALARY_TABLE.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>{row.rank}</td>
                      <td style={{ padding: '1.1rem 1.25rem', color: 'rgba(255,255,255,0.7)' }}>{row.airline}</td>
                      <td style={{ padding: '1.1rem 1.25rem', color: '#D8A027', fontWeight: 700, fontFamily: 'var(--font-h)' }}>{row.monthly}</td>
                      <td style={{ padding: '1.1rem 1.25rem', color: '#D8A027', fontWeight: 700, fontFamily: 'var(--font-h)' }}>{row.annual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.75rem', fontFamily: 'var(--font-b)' }}>
              * Figures are approximate CTC ranges compiled from industry sources and alumni data. Actual packages vary by airline, seniority, and aircraft type. Allowances (flying, night, layover) contribute significantly to take-home.
            </p>
          </section>

          {/* Career Growth Timeline */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Career Growth Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {GROWTH_TIMELINE.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem', padding: '1.25rem 0', borderBottom: i < GROWTH_TIMELINE.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.7rem', fontWeight: 700, color: '#DB241E', letterSpacing: '0.05em', textTransform: 'uppercase', paddingTop: '0.2rem' }}>{item.years}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>{item.stage}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-b)', lineHeight: '1.5' }}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Perks */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Non-Monetary Benefits & Perks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PERKS.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-b)', lineHeight: '1.5' }}>
                  <span style={{ color: '#D8A027', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section style={{ marginBottom: '3.5rem' }}>
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

          {/* CTA */}
          <div style={{ background: '#00162e', border: '1px solid rgba(216,160,39,0.3)', borderTop: '4px solid #DB241E', padding: '2.5rem', textAlign: 'center', borderRadius: '1px' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-h)' }}>Admissions Open — July 2026</span>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Ready to Earn a Pilot's Salary?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem auto', fontFamily: 'var(--font-b)' }}>
              Begin with a free 90-minute demo class. Capt. Navrang Singh will give you an honest roadmap — timeline, costs, and realistic earning expectations.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary" style={{ textDecoration: 'none' }}>Book Free Demo →</Link>
              <a href="https://wa.me/919953777320?text=Hi%2C%20I%27d%20like%20to%20know%20about%20pilot%20salary%20and%20career%20prospects" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                💬 WhatsApp Us
              </a>
            </div>
          </div>

          {/* Internal links */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 700, marginBottom: '1rem' }}>Related Articles</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/blog/how-to-become-pilot-india" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>How to Become a Pilot in India →</Link>
              <Link href="/blog/dgca-ground-school-guide" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>DGCA Ground School Guide →</Link>
              <Link href="/courses" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>All Courses →</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
