import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import JsonLd from '@/components/JsonLd'
import CoursePageFooter from '@/components/CoursePageFooter'
import CourseReviews from '@/components/CourseReviews'
import { buildArticlePageGraph } from '@/lib/schema'

export const metadata = {
  title: "Securing Your Child's Future in Aviation | Parent Guidance | Airborne",
  description: 'Comprehensive CPL flight training guidance and Indian CPL conversion support built for parents and aspirants. Evaluate training options, costs, and DGCA pathways.',
  alternates: { canonical: '/courses/securing-your-childs-future-in-aviation' },
}

const PARENT_FAQS = [
  {
    q: 'How can parents support a student entering CPL training?',
    a: 'Understand the two core phases: DGCA Ground School exams in India and 200 Flying Hours (either in India or abroad). Ensuring your child passes DGCA exams early reduces total training timeline and financial uncertainty.',
  },
  {
    q: 'What is the financial breakdown for a complete pilot training journey?',
    a: 'DGCA CPL Ground School costs ~₹2.7 Lakh. Flying training ranges from ₹45–75 Lakh depending on location (India vs USA/Philippines). Conversion flying (if trained abroad) adds ₹5–10 Lakh. Total budget should plan for ₹60–75 Lakh.',
  },
  {
    q: 'Are job prospects for fresh CPL holders good in India?',
    a: 'Indian carriers (IndiGo, Air India, Akasa) have over 1,100 aircraft on order. Demand for commercial pilots remains high, but airlines strictly evaluate DGCA exam scores, flying proficiency, and simulator screening.',
  },
]

const parentGuideGraph = buildArticlePageGraph({
  path: '/courses/securing-your-childs-future-in-aviation',
  headline: "Securing Your Child's Future in Aviation - Comprehensive Parent & Aspirant Guidance",
  description:
    'A structured guide for parents and aspirants evaluating commercial pilot training, DGCA requirements, total investment, timeline, and airline placement pathways.',
  datePublished: '2026-01-10',
  dateModified: '2026-08-04',
  imagePath: '/footage/cockpit_instruments_closeup.jpg',
  faqs: PARENT_FAQS,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: "Securing Your Child's Future in Aviation", path: '/courses/securing-your-childs-future-in-aviation' },
  ],
})

const FINANCIAL_STEPS = [
  { step: 'Phase 1: Ground School', cost: '₹2.70 Lakh', duration: '3–6 Months', detail: 'DGCA CPL written exam prep (Air Regs, Navigation, Meteorology, Technical General & Specific).' },
  { step: 'Phase 2: Flying Training', cost: '₹45–65 Lakh', duration: '12–18 Months', detail: '200 Flying Hours on Single-Engine & Multi-Engine aircraft in India or DGCA-approved foreign FTOs.' },
  { step: 'Phase 3: CPL Conversion & Type Rating', cost: '₹5–15 Lakh', duration: '3–6 Months', detail: 'DGCA skill test conversion (if abroad) and A320/B737 simulator screening prep.' },
]

export default function SecuringChildFuturePage() {
  return (
    <>
      <JsonLd data={parentGuideGraph} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/courses">Courses</Link>
          <span>/</span>
          <span className="current">Securing Your Child&apos;s Future in Aviation</span>
        </div>

        {/* Hero Section */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/cockpit_instruments_closeup.jpg" alt="Securing Your Child's Future in Aviation - Parent Guidance" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        {/* Layout Grid: Content + LeadForm Sidebar */}
        <div className="course-details-layout">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                Parent &amp; Aspirant Counseling — Airborne Aviation Academy
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Securing Your Child&apos;s Future in Aviation
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Comprehensive guidance on pilot training pathways, DGCA compliance, financial planning, and airline career roadmaps built to give parents complete clarity before making a career investment.
              </p>
            </div>

            {/* Overview Section */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Overview: A Clear Roadmap for Parents
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', marginBottom: '1rem' }}>
                Investing in a Commercial Pilot License (CPL) is a major family decision. With total training investments ranging between ₹60 Lakh and ₹75 Lakh, parents deserve absolute transparency regarding regulatory requirements, training timelines, safety records, and airline hiring prospects.
              </p>
              <p style={{ fontSize: '0.92rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.7', margin: 0 }}>
                Airborne Aviation Academy provides unbiased counseling to help parents and students evaluate the best path—whether doing integrated ground school and flying in India or choosing verified foreign Flight Training Organisations (FTOs) with Indian DGCA conversion support.
              </p>
            </div>

            {/* Financial & Timeline Breakdown Table */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Financial &amp; Timeline Breakdown
              </h2>
              <div style={{ border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '8px', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', background: 'rgba(0, 39, 76, 0.03)', color: 'var(--navy)', fontWeight: 700 }}>Training Phase</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', background: 'rgba(0, 39, 76, 0.03)', color: 'var(--navy)', fontWeight: 700 }}>Typical Investment</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', background: 'rgba(0, 39, 76, 0.03)', color: 'var(--navy)', fontWeight: 700 }}>Expected Duration</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', background: 'rgba(0, 39, 76, 0.03)', color: 'var(--navy)', fontWeight: 700 }}>Key Milestone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FINANCIAL_STEPS.map((row, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid rgba(0, 39, 76, 0.05)' }}>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontWeight: 700, fontSize: '0.85rem' }}>{row.step}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>{row.cost}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '0.85rem' }}>{row.duration}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.65)', fontSize: '0.82rem', lineHeight: '1.5' }}>{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parent FAQs */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Frequently Asked Questions by Parents
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {PARENT_FAQS.map((faq, i) => (
                  <div key={i} className="course-faq-item">
                    <h3 className="course-faq-q">{faq.q}</h3>
                    <p className="course-faq-a">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: LeadForm */}
          <div>
            <LeadForm courseName="Securing Your Child's Future in Aviation" source="Course Detail: securing-your-childs-future-in-aviation" />
          </div>

        </div>

        {/* Reviews Section */}
        <CourseReviews courseSlug="securing-your-childs-future-in-aviation" />

        {/* Footer Navigation & CTA Bar */}
        <CoursePageFooter
          whatsappText="Hi, I want to discuss pilot training guidance for my child with Airborne Aviation Academy."
          nextCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl', note: 'Begin DGCA CPL ground school in Dwarka' },
            { label: 'Commercial Pilot License (CPL)', href: '/courses/flying-training-india-abroad', note: 'Compare flying training in India vs abroad' },
            { label: 'Cadet Preparation', href: '/courses/cadet-preparation', note: 'IndiGo & Air India cadet screening prep' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'Flying Training India vs Abroad', href: '/courses/flying-training-india-abroad' },
            { label: 'DGCA Ground School', href: '/courses/ground-school' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
