import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'

export const metadata = {
  title: 'DGCA Ground School Guide — All Subjects, Exams & Prep Strategy 2026',
  description: 'Complete DGCA ground school guide for CPL and ATPL aspirants. Covers all 6 exam subjects, exam schedule, pass criteria, preparation strategies, and common mistakes. By Airborne Aviation Academy.',
  alternates: { canonical: '/blog/dgca-ground-school-guide' },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Resources', path: '/resources' },
  { name: 'DGCA Ground School Guide', path: '/blog/dgca-ground-school-guide' },
])

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'DGCA Ground School Guide — All Subjects, Exams & Prep Strategy 2026',
  description: 'Complete DGCA ground school guide for CPL and ATPL aspirants.',
  author: { '@type': 'Person', name: 'Capt. Navrang Singh' },
  publisher: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    logo: { '@type': 'ImageObject', url: 'https://airborneaviation.academy/logo-primary.png' },
    url: 'https://airborneaviation.academy',
  },
  datePublished: '2026-01-20',
  dateModified: '2026-06-01',
  url: 'https://airborneaviation.academy/blog/dgca-ground-school-guide',
  mainEntityOfPage: 'https://airborneaviation.academy/blog/dgca-ground-school-guide',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'How many times does DGCA conduct CPL exams per year?', acceptedAnswer: { '@type': 'Answer', text: 'DGCA conducts CPL written examinations 4 times per year — in January, April, July, and October. You can attempt subjects in any order, but must complete all 6 within the validity period of your Student Pilot License.' } },
    { '@type': 'Question', name: 'What is the passing percentage for DGCA CPL exams?', acceptedAnswer: { '@type': 'Answer', text: 'You must score a minimum of 70% in each subject to pass a DGCA CPL written examination. There is no aggregate — each subject is independently scored and must be passed individually.' } },
    { '@type': 'Question', name: 'How many attempts are allowed for DGCA CPL exams?', acceptedAnswer: { '@type': 'Answer', text: 'There is no official limit on attempts, but the SPL (Student Pilot License) validity constrains you to clear all papers within a set period. Multiple failures can result in suspension of examination privileges and affect airline applications.' } },
    { '@type': 'Question', name: 'Can I study for DGCA exams on my own?', acceptedAnswer: { '@type': 'Answer', text: 'Technically yes, but the failure rate for self-study candidates is significantly higher. DGCA exams are conceptual, not rote-based. Subjects like Air Navigation and Meteorology require systematic, mentor-led understanding of applied principles.' } },
  ],
}

const SUBJECTS = [
  { name: 'Air Navigation', difficulty: 'Hard', weight: 'Very High', desc: 'Covers dead reckoning, chart reading, wind calculations, position fixing, airspeed/groundspeed conversions, and great circle navigation. Mathematical and requires consistent practice.' },
  { name: 'Meteorology', difficulty: 'Medium', weight: 'High', desc: 'Atmosphere, pressure systems, METAR/TAF decoding, icing, turbulence, thunderstorms, and weather phenomena affecting flight operations. Conceptual but highly applicable.' },
  { name: 'Air Regulations', difficulty: 'Medium', weight: 'High', desc: 'Indian Aircraft Rules 1937, DGCA CAARs, ICAO Annexes, airspace classifications, ATC procedures, and pilot licensing rules. Memory-intensive and regulation-heavy.' },
  { name: 'Technical General', difficulty: 'Hard', weight: 'Very High', desc: 'Aircraft systems: engines (piston and turbine), fuel systems, hydraulics, landing gear, pressurisation, and airframe structures. Requires strong engineering intuition.' },
  { name: 'Technical Specific', difficulty: 'Medium', weight: 'Medium', desc: 'Type-specific knowledge for the aircraft used in training (typically Cessna 152/172 or Piper PA28). Covers POH procedures, performance charts, systems.' },
  { name: 'Radio Telephony (RT)', difficulty: 'Easy', weight: 'Low', desc: 'ATC phraseology, R/T procedures, frequency usage, distress signals, and communications discipline. Mostly practical understanding. Cleared early by most students.' },
]

const STRATEGY = [
  { tip: 'Start with Air Navigation from Day 1', detail: 'Navigation is the most time-consuming subject. Begin it immediately and work through it systematically alongside flying. Do not leave it to the last.' },
  { tip: 'Clear RT Early — Build Confidence', detail: 'Radio Telephony is the least demanding. Clear it in your first exam session to begin your pass tally and build examination confidence.' },
  { tip: 'Use DGCA Study Material, Not just Third-Party Books', detail: 'The questions in DGCA exams come from approved JAR and DGCA syllabus. Study primary texts. Third-party answer banks alone will not build the conceptual understanding needed for applied questions.' },
  { tip: 'Attempt 2–3 Subjects Per Session Maximum', detail: 'Do not attempt all 6 in one session. Splitting across 2–3 sessions with proper preparation ensures higher first-attempt scores and reduces the risk of retakes.' },
  { tip: 'Air Regulations Changes Annually — Verify Current CAARs', detail: 'DGCA updates Civil Aviation Regulations periodically. Always verify the latest version before your exam. Your ground school faculty should flag any regulatory changes.' },
]

export default function DGCAGroundSchoolGuidePage() {
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
          <span style={{ color: '#D8A027' }}>DGCA Ground School Guide</span>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '1rem', fontFamily: 'var(--font-h)' }}>
              Exam Guide · Updated June 2026
            </span>
            <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: '1.15', marginBottom: '1.25rem' }}>
              DGCA Ground School — Complete Exam Guide 2026
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.75', fontFamily: 'var(--font-b)' }}>
              Everything you need to know about the 6 DGCA CPL written examinations — subject breakdown, difficulty levels, preparation strategy, and the most common mistakes candidates make. By the faculty at Airborne Aviation Academy, Dwarka.
            </p>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '1.5rem' }}>
              <span>By Capt. Navrang Singh</span>
              <span>·</span>
              <span>14 min read</span>
            </div>
          </div>

          {/* Exam Schedule */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.25rem' }}>DGCA Exam Schedule & Structure</h2>
            <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.75rem', borderRadius: '1px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                {[
                  { label: 'Sessions Per Year', value: '4' },
                  { label: 'Exam Months', value: 'Jan · Apr · Jul · Oct' },
                  { label: 'Pass Percentage', value: '70% per subject' },
                  { label: 'Total Subjects (CPL)', value: '6' },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 900, color: '#D8A027', marginBottom: '0.25rem' }}>{item.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-b)', lineHeight: '1.7' }}>
              There is no fixed order in which you must clear the 6 subjects. You can attempt any combination in each session. Most structured ground schools plan a 2-session strategy: 3 subjects in Session 1 and 3 in Session 2. At Airborne, our CPL batch schedule is designed to have students exam-ready by the second session after joining.
            </p>
          </section>

          {/* Subjects Breakdown */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.5rem' }}>The 6 CPL Subjects — Detailed Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {SUBJECTS.map((s, i) => (
                <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${s.difficulty === 'Hard' ? '#DB241E' : s.difficulty === 'Medium' ? '#D8A027' : 'rgba(255,255,255,0.3)'}`, padding: '1.5rem', borderRadius: '1px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0 }}>{s.name}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', background: s.difficulty === 'Hard' ? 'rgba(219,36,30,0.15)' : s.difficulty === 'Medium' ? 'rgba(216,160,39,0.15)' : 'rgba(255,255,255,0.08)', color: s.difficulty === 'Hard' ? '#DB241E' : s.difficulty === 'Medium' ? '#D8A027' : 'rgba(255,255,255,0.5)', borderRadius: '2px' }}>{s.difficulty}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-b)', lineHeight: '1.6', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Preparation Strategy */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Preparation Strategy — What Actually Works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {STRATEGY.map((s, i) => (
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
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-b)', margin: 0 }}>Max 25 students per batch · Taught by Capt. Navrang Singh · 100% first-attempt pass record</p>
            </div>
            <Link href="/courses/cpl-ground-classes" className="btn btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>View Course →</Link>
          </div>

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

          {/* CTA & Lead Form */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-h)' }}>Admissions Open — July 2026</span>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Clear Your DGCA Exams — First Attempt
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto', fontFamily: 'var(--font-b)' }}>
                Join Airborne's mentor-led CPL ground school in Dwarka. Batches limited to 25 students. Book a free demo class to assess your readiness.
              </p>
            </div>
            <LeadForm courseName="DGCA Ground School Preparation" source="Blog: DGCA Ground School Guide" />
          </div>

          {/* Internal links */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-h)', fontWeight: 700, marginBottom: '1rem' }}>Related Articles</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/blog/how-to-become-pilot-india" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>How to Become a Pilot in India →</Link>
              <Link href="/blog/pilot-salary-india" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>Pilot Salary in India 2026 →</Link>
              <Link href="/courses/atpl" style={{ color: '#D8A027', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'var(--font-h)', fontWeight: 600 }}>ATPL Ground School →</Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
