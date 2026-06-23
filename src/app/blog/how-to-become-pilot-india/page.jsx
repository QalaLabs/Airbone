import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getBreadcrumbSchema } from '@/utils/seo'

export const metadata = {
  title: 'How to Become a Pilot in India After 12th — Step-by-Step 2026',
  description: 'Complete guide to becoming a commercial pilot in India after 12th. CPL eligibility, DGCA exams, flying hours, costs, and airline placement tips from Airborne Aviation Academy, Dwarka.',
  alternates: { canonical: '/blog/how-to-become-pilot-india' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Resources', path: '/resources' },
  { name: 'How to Become a Pilot in India', path: '/blog/how-to-become-pilot-india' },
])

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Become a Pilot in India After 12th — Step-by-Step Guide 2026',
  description: 'Complete step-by-step guide to becoming a commercial pilot in India after Class 12, written by Capt. Navrang Singh.',
  author: { '@type': 'Person', name: 'Capt. Navrang Singh' },
  publisher: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    logo: { '@type': 'ImageObject', url: 'https://airborneaviation.in/favicon.svg' },
    url: 'https://airborneaviation.in',
  },
  datePublished: '2026-01-15',
  dateModified: '2026-06-01',
  url: 'https://airborneaviation.in/blog/how-to-become-pilot-india',
  mainEntityOfPage: 'https://airborneaviation.in/blog/how-to-become-pilot-india',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What subjects are required in Class 12 to become a pilot in India?', acceptedAnswer: { '@type': 'Answer', text: 'Physics and Mathematics are mandatory in Class 12 (10+2), with a minimum aggregate of 50% marks as per DGCA requirements.' } },
    { '@type': 'Question', name: 'What is the minimum age to get a CPL in India?', acceptedAnswer: { '@type': 'Answer', text: 'You must be at least 17 to obtain a Student Pilot License, and 18 years old at the time of applying for a CPL.' } },
    { '@type': 'Question', name: 'How much does pilot training cost in India?', acceptedAnswer: { '@type': 'Answer', text: 'Total CPL training in India costs between ₹40–60 lakhs including ground school fees (₹1–2L), flying school fees, and DGCA exam fees.' } },
    { '@type': 'Question', name: 'How long does it take to become a commercial pilot in India?', acceptedAnswer: { '@type': 'Answer', text: 'The complete CPL journey takes between 18–36 months. Ground school runs parallel to flying and typically takes 12–18 months.' } },
  ],
}

const STEPS = [
  {
    num: '01',
    title: 'Confirm Class 12 Eligibility',
    body: 'The DGCA requires Physics and Mathematics in your 10+2 with a minimum 50% aggregate. If you passed without these, NIOS exam is a valid path to meet the requirement before applying.',
    note: 'DGCA Class 1 Medical check is recommended before you invest in training. Common disqualifiers include uncorrected vision beyond limits and colour blindness — get this done first.',
  },
  {
    num: '02',
    title: 'Clear Your DGCA Class 1 Medical',
    body: 'A DGCA Class 1 Medical examination at an authorised AME (Aviation Medical Examiner) checks vision, cardiovascular health, hearing, and general fitness. This clearance is required before your first solo flight.',
    note: null,
  },
  {
    num: '03',
    title: 'Enrol in DGCA Ground School',
    body: 'Ground school builds the theoretical foundation for 6 DGCA written exams: Air Navigation, Meteorology, Air Regulations, Technical General, Technical Specific, and Radio Telephony. Exams are held 4 times per year. First-attempt passes require structured, conceptual preparation — not rote memorisation.',
    note: null,
  },
  {
    num: '04',
    title: 'Choose a Flight School (India or Abroad)',
    body: 'You need a minimum of 200 flying hours for CPL eligibility, of which at least 100 hours must be as Pilot-in-Command. Flight schools in India take 24–36 months; abroad (USA, NZ, SA) typically 14–18 months with a DGCA conversion requirement afterwards.',
    note: null,
  },
  {
    num: '05',
    title: 'Clear All 6 DGCA Written Exams',
    body: 'Each subject requires a minimum 70% score. Failed attempts carry a penalty — preparation quality is critical. Most students who join Airborne achieve first-attempt clears across all subjects.',
    note: null,
  },
  {
    num: '06',
    title: 'Complete Flying Hours & Apply for CPL',
    body: 'With 200 hours and all 6 theory papers cleared, apply for your CPL at the DGCA regional office. A skill test (flight test) with a DGCA examiner follows. Upon passing, your Commercial Pilot License is issued.',
    note: null,
  },
  {
    num: '07',
    title: 'Airline Preparation — GD/PI & Type Rating',
    body: 'Airlines run structured cadet selection processes including CAS Compass and ADAPT aptitude tests, group discussions, simulator assessments, and technical interviews. A CPL alone does not secure a seat — targeted preparation is critical.',
    note: null,
  },
]

const FAQS = [
  { q: 'What subjects are required in Class 12 to become a pilot?', a: 'Physics and Mathematics are mandatory in Class 12 (10+2), with a minimum aggregate of 50% marks.' },
  { q: 'What is the minimum age to get a CPL in India?', a: 'You must be at least 18 years old at the time of applying for a CPL. You can begin your Student Pilot License (SPL) at 17.' },
  { q: 'How much does pilot training cost in India?', a: 'Total CPL training in India costs between ₹40–60 lakhs, including ground school (₹1–2L), flying fees, DGCA exam fees, and medical costs. Training abroad can be cheaper on a per-hour basis but requires DGCA conversion.' },
  { q: 'How long does it take to become a commercial pilot in India?', a: 'The complete CPL journey takes 18–36 months depending on flight school availability. Ground school typically runs 12–18 months in parallel.' },
]

export default function HowToBecomePilotPage() {
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
          <span style={{ color: '#D8A027' }}>How to Become a Pilot</span>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-h)' }}>
              Career Guide · Updated June 2026
            </span>
            <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: '1.15', marginBottom: '1.25rem' }}>
              How to Become a Pilot in India After 12th
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.75', marginBottom: '1.5rem', fontFamily: 'var(--font-b)' }}>
              A complete, honest roadmap — from Class 12 to the airline cockpit. Written by the faculty at Airborne Aviation Academy, Dwarka, who have guided 2,500+ students into aviation careers.
            </p>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 600, letterSpacing: '0.05em' }}>
              <span>By Capt. Navrang Singh</span>
              <span>·</span>
              <span>12 min read</span>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '3.5rem' }}>
            {STEPS.map((step) => (
              <div key={step.num} style={{ borderLeft: '3px solid #DB241E', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Step {step.num}
                </span>
                <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {step.title}
                </h2>
                <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.72)', lineHeight: '1.75', fontFamily: 'var(--font-b)', margin: 0 }}>
                  {step.body}
                </p>
                {step.note && (
                  <div style={{ background: '#00162e', border: '1px solid rgba(216,160,39,0.2)', padding: '1rem 1.25rem', marginTop: '1rem', borderRadius: '1px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-b)' }}>
                    💡 <strong style={{ color: '#D8A027' }}>Important:</strong> {step.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Related Courses */}
          <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '1.25rem' }}>Programs at Airborne Aviation Academy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'CPL Ground School — Complete DGCA Prep', href: '/courses/cpl-ground-classes' },
                { label: 'A320 Simulator Training — Type Rating Familiarisation', href: '/courses/a320-simulator' },
                { label: 'Cadet Preparation — IndiGo, Air India, Akasa', href: '/courses/cadet-preparation' },
                { label: 'Flying Training India vs Abroad — Cost Comparison', href: '/courses/flying-training-india-abroad' },
              ].map((c) => (
                <Link key={c.href} href={c.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600, padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>{c.label}</span>
                  <span style={{ color: '#D8A027' }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', borderRadius: '1px' }}>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{faq.q}</h3>
                  <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', margin: 0, fontFamily: 'var(--font-b)', lineHeight: '1.6' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: '#00162e', border: '1px solid rgba(216,160,39,0.3)', borderTop: '4px solid #DB241E', padding: '2.5rem', textAlign: 'center', borderRadius: '1px' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-h)' }}>Admissions Open — July 2026</span>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Start Your Pilot Journey Today
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto', fontFamily: 'var(--font-b)' }}>
              Book a free 90-minute demo class with Capt. Navrang Singh. Get honest counselling and a personalised roadmap — no obligation.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary" style={{ textDecoration: 'none' }}>Book Free Demo →</Link>
              <a href="https://wa.me/919953777320?text=Hi%2C%20I%20want%20to%20know%20how%20to%20become%20a%20pilot%20in%20India" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                💬 WhatsApp Us
              </a>
            </div>
          </div>

          {/* Internal links */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 700, marginBottom: '1rem' }}>Related Articles</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/blog/pilot-salary-india" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Pilot Salary in India 2026 →</Link>
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
