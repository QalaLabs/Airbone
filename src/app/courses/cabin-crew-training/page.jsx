import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { getBreadcrumbSchema } from '@/utils/seo'
import CoursePageFooter from '@/components/CoursePageFooter'

export const metadata = {
  title: 'Cabin Crew Training Delhi | Scholarship Available | Airborne',
  description: 'Launch your cabin crew career with Airborne\'s 3-module certified training in Delhi. Batch 1 scholarship available. Grooming, safety & airline placement. Pre-register.',
  alternates: { canonical: '/courses/cabin-crew-training' },
  openGraph: {
    title: 'Cabin Crew Training Delhi | Scholarship Available | Airborne',
    description: 'Launch your cabin crew career with Airborne\'s 3-module certified training in Delhi. Batch 1 scholarship available. Grooming, safety & airline placement. Pre-register.',
    url: 'https://www.airborneaviation.in/courses/cabin-crew-training',
  },
  twitter: {
    title: 'Cabin Crew Training Delhi | Scholarship Available | Airborne',
    description: 'Launch your cabin crew career with Airborne\'s 3-module certified training in Delhi. Batch 1 scholarship available. Grooming, safety & airline placement. Pre-register.',
  },
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Cabin Crew Training', path: '/courses/cabin-crew-training' },
])

const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Cabin Crew Training Program',
  description: '3-module cabin crew certification at Airborne Aviation Academy, Delhi. Pathway 1: Elite Finishing. Pathway 2: Advanced Communication. Pathway 3: Basic Foundation. Batch 1 scholarship available.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    address: { '@type': 'PostalAddress', streetAddress: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7', addressLocality: 'Dwarka', addressRegion: 'New Delhi', postalCode: '110075' }
  },
  offers: [
    { '@type': 'Offer', name: 'Pathway 1 — Elite Finishing (Regular)', price: '54000', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Pathway 2 — Advanced Communication (Regular)', price: '30000', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Pathway 3 — Basic Foundation (Regular)', price: '30000', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Batch 1 Scholarship — P1 Level', price: '5000', priceCurrency: 'INR', description: 'First 20 students. P1 (worth ₹54,000) is free.' },
  ],
  courseMode: 'onsite',
  duration: 'P6M',
  url: 'https://www.airborneaviation.in/courses/cabin-crew-training',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who teaches the cabin crew program at Airborne?',
      acceptedAnswer: { '@type': 'Answer', text: 'Capt. Mukul Mitra Barua (ex-cabin & cockpit crew, Alliance Air) and Rajeet Khalsa (retired AGM Training, Air India, 37+ years). Not generalist coaches — real airline industry professionals.' }
    },
    {
      '@type': 'Question',
      name: 'What is the cabin crew course fee at Airborne?',
      acceptedAnswer: { '@type': 'Answer', text: 'Batch 1 scholarship (first 20 students): P1 level = ₹5,000 (uniform + goodies only) | P2 level = ₹35,000 total | P3 level = ₹59,000 total (₹54,000 + ₹5,000). P1 (worth ₹54,000) is free for all Batch 1 students. Regular pricing after Batch 1: P1 = ₹54,000, P2 = ₹30,000, P3 = ₹30,000.' }
    },
    {
      '@type': 'Question',
      name: 'Can boys join the cabin crew program?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The program is open to all candidates meeting eligibility criteria. Airlines hire male cabin crew across domestic and international carriers.' }
    },
    {
      '@type': 'Question',
      name: 'Does Airborne guarantee cabin crew placement?',
      acceptedAnswer: { '@type': 'Answer', text: 'No institute can guarantee airline selection. Airborne provides structured interview preparation, resume coaching, mock interviews, and career guidance. Final selection rests with the airline.' }
    },
    {
      '@type': 'Question',
      name: 'What is the minimum height for cabin crew?',
      acceptedAnswer: { '@type': 'Answer', text: 'Most Indian airlines require a minimum height of 157 cm for cabin crew. Airborne screens candidates during eligibility assessment and prepares them for airline-standard requirements.' }
    }
  ]
}

const PATHWAYS = [
  {
    num: '1',
    title: 'Elite Cabin Crew Finishing Batch',
    duration: '3 Months',
    classTime: '90 Minutes',
    regular: '₹54,000',
    scholarship: '₹5,000 (uniform + goodies only)',
    best: 'Near-selection candidates needing final polish',
    focus: ['Final grooming polish', 'Professional presence', 'Service behaviour refinement', 'GD and PI readiness', 'Interview finishing support'],
  },
  {
    num: '2',
    title: 'Advanced Communication, GD/PI & Personality',
    duration: '3 Months',
    classTime: '90 Minutes',
    regular: '₹30,000',
    scholarship: '₹35,000 (P2 + P1 free)',
    best: 'Candidates with communication or confidence gaps',
    focus: ['Spoken communication improvement', 'GD practice', 'PI preparation', 'Personality development', 'Confidence building'],
  },
  {
    num: '3',
    title: 'Basic Communication & Global Hospitality',
    duration: '6 Months',
    classTime: '90 Minutes',
    regular: '₹30,000',
    scholarship: '₹59,000 (P3 + P2 + P1 free)',
    best: 'Beginners needing complete foundation',
    focus: ['Communication foundation', 'Hospitality standards', 'Grooming basics', 'Professional readiness', 'Zero-to-selection journey'],
  },
]

const CURRICULUM = [
  { module: 'Aviation Fundamentals', content: 'Aviation industry intro, aircraft familiarisation, airport operations, cabin crew responsibilities, airline terminology' },
  { module: 'Grooming & Personal Presentation', content: 'Personal hygiene, makeup/hairstyle protocols (Indian & international airline standards), uniform presentation, body language' },
  { module: 'Communication Skills', content: 'Spoken English clarity, voice modulation, passenger interaction, public announcement practice, confidence building exercises' },
  { module: 'Safety & Emergency Procedures', content: 'Aircraft safety equipment, fire-fighting, emergency evacuation, water survival, turbulence handling' },
  { module: 'First Aid Training', content: 'CPR, medical emergency handling on board, passenger care, burn/injury management, recovery procedures' },
  { module: 'Customer Service Excellence', content: 'International hospitality standards, VIP passenger handling, complaint resolution, cultural awareness for multi-nationality flights' },
  { module: 'Airline Interview Preparation', content: 'Resume preparation, GD strategy, HR interview techniques, personality development, mock interview cycles with feedback' },
]

const CAREER_OPTIONS = [
  { role: 'Cabin Crew', sector: 'Domestic & International Airlines' },
  { role: 'Ground Staff', sector: 'Airports & Airline Operations' },
  { role: 'Guest Relations Executive', sector: 'Hospitality & Hotels' },
  { role: 'Customer Service Associate', sector: 'Aviation Industry' },
  { role: 'Travel & Tourism Executive', sector: 'Tourism Sector' },
]

export default function CabinCrewTrainingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/" >Home</Link>
          <span>/</span>
          <Link href="/courses" >Courses</Link>
          <span>/</span>
          <span className="current">Cabin Crew Training</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src="/footage/classroom.jpg" alt="Cabin Crew Training at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3–6 Months · ₹30K–₹54K
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Cabin Crew & Aviation Hospitality Training — Dwarka, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Structured cabin crew training for serious aviation aspirants — from scholarship-based finishing to communication, GD/PI, personality development, and hospitality foundation pathways. Trained by airline veterans — ex-Alliance Air cabin and cockpit crew, and a retired Air India AGM (Training) — not generalist coaches.
              </p>
            </div>

            {/* Trainers */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Trained by Industry Veterans
              </h2>
              <div className="course-subject-grid">
                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '2rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capt. Mukul Mitra Barua</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--navy)', fontFamily: 'var(--font-h)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Lead Trainer — Aviation Training & Safety</div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                    Capt. Mukul's career in aviation began in the cabin and progressed to the cockpit. With years flying with Alliance Air — first as cabin crew and later as cockpit crew — he gives students a rare 360° view of airline operations. Leads training in flight safety, SMS, DGR, and AVSEC.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.45)', fontStyle: 'italic', margin: 0, borderLeft: '2px solid rgba(216,160,39,0.3)', paddingLeft: '0.75rem' }}>
                    "Cabin crew is not about looking the part. It is about being the calmest person on board when something goes wrong."
                  </p>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '2rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rajeet Khalsa</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--navy)', fontFamily: 'var(--font-h)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Lead Trainer — Soft Skills & Professional Readiness</div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                    Rajeet Khalsa retired as AGM (Training) at Air India, where she spent decades training cabin crew for India's national carrier. A certified soft skills trainer and image consultant with 37+ years of experience. Leads communication, grooming, confidence building, and personality development.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.45)', fontStyle: 'italic', margin: 0, borderLeft: '2px solid rgba(216,160,39,0.3)', paddingLeft: '0.75rem' }}>
                    "You are being assessed from the moment you walk in. Every cabin crew interview is won or lost on professional presence — that is what we build."
                  </p>
                </div>
              </div>
            </div>

            {/* Batch 1 Scholarship Banner */}
            <div className="course-section-divider">
              <div style={{ background: 'rgba(219,36,30,0.06)', border: '1px solid rgba(219,36,30,0.3)', borderRadius: '6px', padding: '1.5rem 2rem' }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#DB241E', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚡ Limited Time — Batch 1 Only</div>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.75rem' }}>Batch 1 Scholarship — First 20 Students</div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                  All Batch 1 students take a free eligibility test. Based on result, they are placed at P1, P2, or P3 level. <strong className="current">P1 (worth ₹54,000) is FREE for all Batch 1 students.</strong>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { level: 'P1 Level (near-selection)', fee: '₹5,000', note: 'Uniform + goodies only' },
                    { level: 'P2 Level (communication gaps)', fee: '₹35,000', note: 'P2 + P1 (P1 free)' },
                    { level: 'P3 Level (needs foundation)', fee: '₹59,000', note: 'P3 + P2 + P1 (P1 free) — ₹54,000 + ₹5,000' },
                  ].map((row, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(216,160,39,0.15)', borderRadius: '4px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(0, 39, 76, 0.55)', marginBottom: '0.4rem' }}>{row.level}</div>
                      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--navy)' }}>{row.fee}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(0, 39, 76, 0.4)', marginTop: '0.25rem' }}>{row.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pathways */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Cabin Crew Pathways & Pricing
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {PATHWAYS.map((p, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderRadius: '4px', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ flexShrink: 0, width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#DB241E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 900, color: 'var(--navy)' }}>P{p.num}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.45)', marginTop: '0.2rem' }}>{p.duration} · {p.classTime} daily · Best for: {p.best}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(0, 39, 76, 0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Regular Price</div>
                        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>{p.regular}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(219,36,30,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Batch 1 Scholarship</div>
                        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#DB241E' }}>{p.scholarship}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {p.focus.map((f, j) => (
                        <span key={j} style={{ fontSize: '0.72rem', color: 'rgba(0, 39, 76, 0.65)', background: 'rgba(0, 39, 76, 0.04)', border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '2px', padding: '0.25rem 0.6rem' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What You Will Learn — Curriculum
              </h2>
              <div style={{ border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '8px', overflow: 'hidden', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: 'var(--font-b)', minWidth: '500px' }}>
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Content Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CURRICULUM.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.module}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.65)' }}>{row.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Eligibility */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Eligibility
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Qualification', value: '10+2 Pass' },
                  { label: 'Age', value: '18–27 Years' },
                  { label: 'English', value: 'Basic English (improvement built into training)' },
                  { label: 'Physical', value: 'General airline grooming standards' },
                ].map((e, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderLeft: '3px solid #D8A027', padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--navy)', fontFamily: 'var(--font-h)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{e.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 600 }}>{e.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Options */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Career Opportunities After the Course
              </h2>
              <div className="course-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="course-table" style={{ minWidth: "600px" }}>
                  <thead>
                    <tr>
                      <th>Career Option</th>
                      <th>Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAREER_OPTIONS.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--navy)', fontWeight: 600 }}>{row.role}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(0, 39, 76, 0.65)' }}>{row.sector}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.45)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                Airborne provides structured interview prep and career guidance. Final selection rests with the recruiting airline.
              </p>
            </div>

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Who teaches the cabin crew program at Airborne?', a: 'Capt. Mukul Mitra Barua (ex-cabin & cockpit crew, Alliance Air) and Rajeet Khalsa (retired AGM Training, Air India, 37+ years). Not generalist coaches — real airline industry professionals.' },
                  { q: 'What is the cabin crew course fee?', a: 'Batch 1 scholarship (first 20 students): P1 level = ₹5,000 | P2 level = ₹35,000 | P3 level = ₹59,000 (₹54,000 + ₹5,000). P1 (worth ₹54,000) is free for all Batch 1 students. Regular pricing after Batch 1: P1 = ₹54,000, P2 = ₹30,000, P3 = ₹30,000.' },
                  { q: 'Can boys join the cabin crew program?', a: 'Yes. The program is open to all candidates meeting eligibility criteria. Airlines hire male cabin crew across domestic and international carriers.' },
                  { q: 'Does Airborne guarantee cabin crew placement?', a: 'No institute can guarantee airline selection. Airborne provides structured interview preparation, resume coaching, mock interviews, and career guidance. Final selection rests with the airline.' },
                  { q: 'Why are your fees higher than other institutes?', a: 'Because this is airline-standard training — taught by actual airline professionals, not generalist coaches. Compare trainers, structure, and outcomes — not just price.' },
                ].map((faq, i) => (
                  <div key={i} className="course-faq-item">
                    <h3 className="course-faq-q">{faq.q}</h3>
                    <p className="course-faq-a">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="course-sidebar-card">
                <div style={{ display: 'inline-block', background: 'rgba(219,36,30,0.1)', border: '1px solid rgba(219,36,30,0.3)', borderRadius: '2px', padding: '0.25rem 0.75rem', fontSize: '0.68rem', fontFamily: 'var(--font-h)', letterSpacing: '0.15em', color: '#DB241E', textTransform: 'uppercase', marginBottom: '1rem' }}>Batch 1 Scholarship</div>
                <span className="course-sidebar-label">Starting from</span>
                <div className="course-sidebar-price">₹5,000</div>
                <span className="course-sidebar-note">P1 value ₹54,000 — free for Batch 1</span>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 3–6 Months</div>
                <div style={{ margin: '1.5rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Batch Size</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>👥 Max 20 Students</div>
              </div>
              <LeadForm
                courseName="Cabin Crew Training (₹30K–₹54K)"
                source="Course Detail: cabin-crew-training"
                successMessage="Thank you! Your Cabin Crew Training enquiry has been received. An Airborne admissions counsellor will contact you within 24 hours."
              />
            </div>
          </div>

        </div>
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Cabin Crew Training program at Airborne Aviation Academy, Dwarka. Please share batch details and fee structure."
          nextCourses={[
            { label: 'Aviation English ICAO L4', href: '/courses/aviation-english-icao', note: 'Advance your English communication skills for international airline selections' },
          ]}
          relatedCourses={[
            { label: 'Flight Dispatcher', href: '/courses/flight-dispatcher' },
            { label: 'Airline Interview Prep', href: '/courses/airline-preparation' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
