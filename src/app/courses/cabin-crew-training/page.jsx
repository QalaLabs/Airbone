import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'

import CoursePageFooter from '@/components/CoursePageFooter'
import CourseReviews from '@/components/CourseReviews'
import JsonLd from '@/components/JsonLd'
import { buildCoursePageGraph } from '@/lib/schema'
import { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'
import CabinCrewEligibilityQuiz from '@/components/CabinCrewEligibilityQuiz'

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

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['cabin-crew-training'],
  faqs: [
  {
    q: 'Who teaches the cabin crew program at Airborne?',
    a: 'Capt. Mukul Mitra Barua (ex-cabin & cockpit crew, Alliance Air) and Rajeet Khalsa (retired AGM Training, Air India, 37+ years). Not generalist coaches - real airline industry professionals.'
  },
  {
    q: 'What is the cabin crew course fee at Airborne?',
    a: 'Tuition ₹59,000. 100%* scholarship offer upon scoring ≥70% on the eligibility assessment. *Terms apply - Batch scholarship conditions explained at counselling.'
  },
  {
    q: 'Can boys join the cabin crew program?',
    a: 'Yes. The program is open to all candidates meeting eligibility criteria. Airlines hire male cabin crew across domestic and international carriers.'
  },
  {
    q: 'Does Airborne guarantee cabin crew placement?',
    a: 'No institute can guarantee airline selection. Airborne provides structured interview preparation, resume coaching, mock interviews, and career guidance. Final selection rests with the airline.'
  },
  {
    q: 'What is the minimum height for cabin crew?',
    a: 'Most Indian airlines require a minimum height of 157 cm for cabin crew. Airborne screens candidates during eligibility assessment and prepares them for airline-standard requirements.'
  }
],
})

const PATHWAYS = [
  {
    num: '1',
    title: 'Elite Cabin Crew Finishing Batch',
    duration: '3 Months',
    classTime: '90 Minutes',
    regular: '₹54,000',
    scholarship: '₹0',
    scholarshipNote: '100% Scholarship (score ≥70%, + ₹5,000 registration fee)',
    best: 'Near-selection candidates needing final polish',
    focus: ['Final grooming polish', 'Professional presence', 'Service behaviour refinement', 'GD and PI readiness', 'Interview finishing support'],
  },
  {
    num: '2',
    title: 'Advanced Communication, GD/PI & Personality',
    duration: '3 Months',
    classTime: '90 Minutes',
    regular: '₹30,000',
    scholarship: '₹30,000',
    scholarshipNote: 'For scholarship holders (includes Phase 1)',
    best: 'Candidates with communication or confidence gaps',
    focus: ['Spoken communication improvement', 'GD practice', 'PI preparation', 'Personality development', 'Confidence building'],
  },
  {
    num: '3',
    title: 'Basic Communication & Global Hospitality',
    duration: '6 Months',
    classTime: '90 Minutes',
    regular: '₹30,000',
    scholarship: '₹54,000',
    scholarshipNote: 'For scholarship holders (includes Phase 2 + Phase 1)',
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
      <JsonLd data={coursePageGraph} />

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
          <img src="/footage/cabin-crew-training-hero.jpg" alt="Cabin Crew Training at Airborne Aviation Academy, Dwarka Delhi" className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 3–6 Months · ₹59,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Cabin Crew & Aviation Hospitality Training - Dwarka, Delhi
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Structured cabin crew training for serious aviation aspirants - from scholarship-based finishing to communication, GD/PI, personality development, and hospitality foundation pathways. Trained by airline veterans - ex-Alliance Air cabin and cockpit crew, and a retired Air India AGM (Training) - not generalist coaches.
              </p>
              <CabinCrewEligibilityQuiz />
            </div>

            {/* Trainers */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Trained by Industry Veterans
              </h2>
              <div className="course-subject-grid">
                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '2rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capt. Mukul Mitra Barua</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--navy)', fontFamily: 'var(--font-h)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Lead Trainer - Aviation Training & Safety</div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                    Capt. Mukul's career in aviation began in the cabin and progressed to the cockpit. With years flying with Alliance Air - first as cabin crew and later as cockpit crew - he gives students a rare 360° view of airline operations. Leads training in flight safety, SMS, DGR, and AVSEC.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.45)', fontStyle: 'italic', margin: 0, borderLeft: '2px solid rgba(216,160,39,0.3)', paddingLeft: '0.75rem' }}>
                    "Cabin crew is not about looking the part. It is about being the calmest person on board when something goes wrong."
                  </p>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', padding: '2rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rajeet Khalsa</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--navy)', fontFamily: 'var(--font-h)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Lead Trainer - Soft Skills & Professional Readiness</div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
                    Rajeet Khalsa retired as AGM (Training) at Air India, where she spent decades training cabin crew for India's national carrier. A certified soft skills trainer and image consultant with 37+ years of experience. Leads communication, grooming, confidence building, and personality development.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.45)', fontStyle: 'italic', margin: 0, borderLeft: '2px solid rgba(216,160,39,0.3)', paddingLeft: '0.75rem' }}>
                    "You are being assessed from the moment you walk in. Every cabin crew interview is won or lost on professional presence - that is what we build."
                  </p>
                </div>
              </div>
            </div>

            {/* Course Fee, Duration & Batch Size */}
            <div className="course-section-divider">
              <div className="course-sidebar-card" style={{ textAlign: 'left' }}>
                <div style={{ display: 'inline-block', background: 'rgba(219,36,30,0.1)', border: '1px solid rgba(219,36,30,0.3)', borderRadius: '2px', padding: '0.25rem 0.75rem', fontSize: '0.68rem', fontFamily: 'var(--font-h)', letterSpacing: '0.15em', color: '#DB241E', textTransform: 'uppercase', marginBottom: '1.5rem' }}>100%* Scholarship</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                  <div>
                    <span className="course-sidebar-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Course Fee</span>
                    <div className="course-sidebar-price" style={{ margin: 0 }}>₹59,000</div>
                    <span className="course-sidebar-note" style={{ display: 'block', marginTop: '0.25rem' }}>*Upon Scoring ≥70%</span>
                  </div>
                  <div>
                    <span className="course-sidebar-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Duration</span>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.25rem' }}>⏱️ 3–6 Months</div>
                  </div>
                  <div>
                    <span className="course-sidebar-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Batch Size</span>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.25rem' }}>👥 Max 20 Students</div>
                  </div>
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
                  <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(0, 39, 76, 0.08)', boxShadow: '0 4px 20px rgba(0, 39, 76, 0.02)', borderLeft: '3px solid var(--navy)', padding: '2rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ flexShrink: 0, width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#DB241E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{p.num}</div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.45)', marginTop: '0.2rem' }}>{p.duration} · {p.classTime} daily · Best for: {p.best}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'rgba(0, 39, 76, 0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>PATHWAY PRICE</div>
                          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>{p.regular}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'rgba(219,36,30,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>SCHOLARSHIP PRICE</div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                            <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 900, color: '#DB241E', textShadow: p.scholarship === '₹0' ? '0 0 10px rgba(219,36,30,0.15)' : 'none' }}>
                              {p.scholarship}
                            </span>
                            {p.scholarship === '₹0' && (
                              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--gold)', background: 'rgba(216, 160, 39, 0.12)', border: '1px solid rgba(216, 160, 39, 0.25)', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', alignSelf: 'center' }}>
                                Free Training
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#DB241E', marginTop: '0.15rem' }}>{p.scholarshipNote}</div>
                        </div>
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
              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <a 
                  href="#enroll-form" 
                  style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                    background: 'linear-gradient(135deg, #DB241E 0%, #B31915 100%)', 
                    color: '#ffffff', textDecoration: 'none', fontWeight: 800, 
                    fontFamily: 'var(--font-h)', fontSize: '0.85rem', textTransform: 'uppercase', 
                    letterSpacing: '0.08em', padding: '1rem 2rem', borderRadius: '4px',
                    boxShadow: '0 4px 15px rgba(219,36,30,0.3)', transition: 'all 0.25s',
                    cursor: 'pointer'
                  }}
                >
                  <span>Give Eligibility Test</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Curriculum */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                What You Will Learn - Curriculum
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {CURRICULUM.map((row, i) => (
                  <div key={i} className="cabin-curriculum-card">
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--red)' }}>✦</span>
                      <span>{row.module}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.6)', lineHeight: '1.5', margin: 0 }}>
                      {row.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Options */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Career Opportunities After the Course
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {CAREER_OPTIONS.map((row, i) => (
                  <div key={i} className="cabin-career-card">
                    <div style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '0.2rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.25rem 0', letterSpacing: '0.04em' }}>
                        {row.role}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.55)', margin: 0 }}>
                        {row.sector}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.45)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                Airborne provides structured interview prep and career guidance. Final selection rests with the recruiting airline.
              </p>
            </div>

            {/* Parent Trust Section */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Why Parents Trust Airborne Academy
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {[
                  { title: 'Taught by Senior Airline Managers', desc: 'No generalist image coaches. Classes are taken by a retired AGM from Air India and ex-Alliance Air cockpit crew.' },
                  { title: 'Safe & Secure Center Environment', desc: 'Modern high-street center at Ramphal Chowk with CCTV monitoring, biometric checks, and separate facilities.' },
                  { title: 'Full Transparency on Fee Structures', desc: 'All fee elements and scholarship rules are documented upfront. No middleman or extra exam processing hidden charges.' },
                  { title: 'Daily Attendance Notifications', desc: 'Parents receive check-in and checkout validation alerts, assuring student location security.' },
                  { title: 'Mock Cabin Simulator Sessions', desc: 'Practice safety and service procedures inside our real mock aircraft setup.' },
                  { title: 'Direct Industry Recruitment Ties', desc: 'We host exclusive interview drives with major domestic carriers at our Dwarka center.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(219,36,30,0.02)', border: '1px solid rgba(219,36,30,0.08)', padding: '1.5rem', borderRadius: '4px' }}>
                    <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.65)', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Showcase Image Showcase */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Dwarka Center & Training Showcase
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#fff', border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,39,76,0.01)' }}>
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img src="/campus/classroom_full.jpg" alt="Dwarka center classroom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>Smart Classroom Infrastructure</h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(0,39,76,0.55)', margin: 0 }}>High definition projection and audio setups for conceptual and visual aviation sessions.</p>
                  </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid rgba(0, 39, 76, 0.08)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,39,76,0.01)' }}>
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img src="/campus/reception.jpg" alt="Dwarka center lobby" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>Dwarka Counseling Lobby</h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(0,39,76,0.55)', margin: 0 }}>Transparent parent counselor desks and student onboarding hubs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="course-section-divider">
              <h2 className="course-section-title">
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  { q: 'Who teaches the cabin crew program at Airborne?', a: 'Capt. Mukul Mitra Barua (ex-cabin & cockpit crew, Alliance Air) and Rajeet Khalsa (retired AGM Training, Air India, 37+ years). Not generalist coaches - real airline industry professionals.' },
                  { q: 'What is the cabin crew course fee?', a: 'Tuition ₹59,000. 100%* scholarship offer upon scoring ≥70% on the assessment. *Terms apply - explained at counselling.' },
                  { q: 'Can boys join the cabin crew program?', a: 'Yes. The program is open to all candidates meeting eligibility criteria. Airlines hire male cabin crew across domestic and international carriers.' },
                  { q: 'Does Airborne guarantee cabin crew placement?', a: 'No institute can guarantee airline selection. Airborne provides structured interview preparation, resume coaching, mock interviews, and career guidance. Final selection rests with the airline.' },
                  { q: 'Why are your fees higher than other institutes?', a: 'Because this is airline-standard training - taught by actual airline professionals, not generalist coaches. Compare trainers, structure, and outcomes - not just price.' },
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
              <LeadForm
                courseName="Cabin Crew Training (₹59,000)"
                source="Course Detail: cabin-crew-training"
                successMessage="Thank you! Your Cabin Crew Training enquiry has been received. An Airborne admissions counsellor will contact you within 24 hours."
              />
            </div>
          </div>

        </div>
        <CourseReviews />
        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Cabin Crew Training program at Airborne Aviation Academy, Dwarka. Please share batch details and fee structure."
          relatedCourses={[
            { label: 'Flight Dispatcher', href: '/courses/flight-dispatcher' },
            { label: 'Airline Interview Prep', href: '/courses/airline-preparation' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
        <style dangerouslySetInnerHTML={{__html: `
          .cabin-curriculum-card {
            background: #ffffff;
            border: 1px solid rgba(0, 39, 76, 0.08);
            padding: 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,39,76,0.01);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .cabin-curriculum-card:hover {
            transform: translateY(-4px);
            border-color: var(--red);
            box-shadow: 0 12px 30px rgba(219,36,30,0.08);
          }
          .cabin-career-card {
            background: #ffffff;
            border: 1px solid rgba(0, 39, 76, 0.08);
            padding: 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,39,76,0.01);
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .cabin-career-card:hover {
            transform: translateY(-4px);
            border-color: var(--gold);
            box-shadow: 0 12px 30px rgba(216,160,39,0.08);
          }
        `}} />
      </main>
      <Footer />
    </>
  )
}
