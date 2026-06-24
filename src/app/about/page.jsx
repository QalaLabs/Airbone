import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'

export const metadata = {
  title: 'About Airborne Aviation Academy DGCA Approved | Dwarka Delhi',
  description: 'Airborne Aviation Academy, Dwarka Delhi founded by Capt. Navrang Singh in 2009. 2,500+ trained. DGCA-approved FTO. Meet our faculty, fleet & placement record.',
  alternates: { canonical: '/about' },
}

const FOUNDERS = [
  {
    name: 'Captain Navrang Singh',
    role: 'Co-founder & Head Mentor',
    image: '/footage/cockpit_pilot_silhouette.jpg',
    bio: 'An active commercial airline captain with 15+ years of teaching expertise. Capt. Navrang specializes in translating highly technical aviation concepts (Air Navigation, Meteorology, Regulations) into practical cockpit understanding. Under his leadership, the academy has maintained the highest first-attempt DGCA examination pass rate in Delhi NCR.',
    accent: 'Concept Clarity over rote learning'
  },
  {
    name: 'Deepak Aggarwal',
    role: 'Co-founder & Business Head',
    image: '/footage/student_overhead_panel.jpg',
    bio: 'Deepak is the first contact point for aspirants, offering realistic career counseling, financing guidance, and structured study plans. He monitors batch sizing restrictions (capping inputs at 25 per session) to maintain high student-teacher contact ratios.',
    accent: 'Honest counseling and strict enrollment limits'
  },
  {
    name: 'Piyush Chandra',
    role: 'Head of Operations',
    image: '/footage/simulator_entry_dark.jpg',
    bio: 'Piyush manages academic scheduling, partner flight school relationships (USA, NZ, SA), and DGCA license conversion pathways. His operational guidance ensures that students experience zero administrative friction when transitioning from foreign training logs back to Indian skies.',
    accent: 'Seamless international flight pathways'
  },
  {
    name: 'Capt. Mukul Mitra Barua',
    role: 'Lead Trainer – Aviation Training & Safety',
    image: '/footage/pilot-portrait.jpg',
    bio: 'An ex-Alliance Air cabin and cockpit crew member with years of flying-side career. Now retired from active flying, he leads training at Airborne in flight safety, aircraft knowledge, Safety Management Systems (SMS), Dangerous Goods Regulations (DGR), and Aviation Security (AVSEC).',
    accent: 'Building the safety-first crew mindset'
  },
  {
    name: 'Rajeet Khalsa',
    role: 'Lead Trainer – Soft Skills & Professional Readiness',
    image: '/footage/clouds-above.jpg',
    bio: 'Retired AGM (Training) at Air India, where she spent decades training cabin crew for India’s national carrier. A certified soft skills trainer and image consultant, she brings over 37 years of experience in aviation, communication, grooming, and professional presence.',
    accent: 'Developing premium professional presence'
  },
  {
    name: 'Capt. Vishal Chechi',
    role: 'Lead Trainer – Technical',
    image: '/footage/simulator_entry_dark.jpg',
    bio: 'A seasoned pilot who specializes in technical systems coaching, aircraft-specific ratings (A320/B737), and raw instrument procedures training. He prepares commercial pilot license holders for technical type rating examinations.',
    accent: 'Bridging CPL theory and type-rating systems'
  }
]

const STATS = [
  { value: '15+ Yrs', label: 'Teaching Legacy' },
  { value: '100%', label: 'DGCA Exam Pass Rate' },
  { value: '2,500+', label: 'Aspirants Mentored' },
  { value: 'Max 25', label: 'Student Batch Limit' }
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        
        {/* Hero Section */}
        <div style={{ maxWidth: '800px', marginBottom: '5rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Academy Authority</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Building Captains.
            <em style={{ color: '#DB241E', fontStyle: 'normal' }}> Transforming Lives.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '100%' }}>
            Located at Ramphal Chowk, Dwarka, Airborne Aviation Academy was established with a singular focus: to strip away the commercial noise of pilot training and return to rigorous, conceptual excellence.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4rem' }}>
          {STATS.map((stat) => (
            <div key={stat.label} style={{ background: '#00162e', padding: '2rem', borderLeft: '3px solid #D8A027', borderRadius: '1px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', fontWeight: 900, color: '#D8A027', marginBottom: '0.2rem' }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Meet the Founders / Instructors */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>The Flight Deck Leadership</p>
            <h2 className="ov-h2" style={{ marginTop: '0.75rem' }}>Core Mentors</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', mdGridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {FOUNDERS.map((founder) => (
              <div 
                key={founder.name} 
                style={{ 
                  background: '#000f1e', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderTop: founder.name.includes('Navrang') ? '3px solid #DB241E' : '1px solid rgba(255,255,255,0.08)',
                  padding: '2.5rem', 
                  borderRadius: '1px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Portrait Portrait Frame */}
                  <div className="avatar-container">
                    <div className="avatar-frame-gold">
                      <img src={founder.image} alt={founder.name} className="avatar-image" />
                    </div>
                    {founder.name.includes('Captain') || founder.name.includes('Capt.') ? (
                      <div className="captain-stripes" title="4 Captain Gold Stripes">
                        <div className="stripe-gold" />
                        <div className="stripe-gold" />
                        <div className="stripe-gold" />
                        <div className="stripe-gold" />
                      </div>
                    ) : (
                      <div className="captain-stripes" title="3 First Officer Gold Stripes">
                        <div className="stripe-gold" />
                        <div className="stripe-gold" />
                        <div className="stripe-gold" />
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    {founder.name}
                  </h3>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D8A027', fontWeight: 700, marginBottom: '1.5rem' }}>
                    {founder.role}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.68)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {founder.bio}
                  </p>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', fontSize: '0.78rem', fontStyle: 'italic', color: '#D8A027', fontWeight: 500 }}>
                  💡 Key Focus: {founder.accent}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials Timeline Section */}
        <div style={{ marginBottom: '5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4rem' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Career Milestones</p>
            <h2 className="ov-h2" style={{ marginTop: '0.75rem' }}>The Commander's Pathway</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              Chronological summary of Capt. Navrang Singh's aviation legacy and academy achievements.
            </p>
          </div>

          <div className="timeline" style={{ maxWidth: '800px' }}>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2009</div>
              <h4 className="timeline-title">CPL Tutoring Operations Begun</h4>
              <p className="timeline-text">
                Started taking classes for CPL in Sector 12, Dwarka from home, delivering a 100% result in the first batches.
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2012</div>
              <h4 className="timeline-title">Airborne Academy Inception</h4>
              <p className="timeline-text">
                Opened the first official commercial center under the brand name Airborne (300 sq ft office size).
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2015</div>
              <h4 className="timeline-title">Exam Coaching Milestones</h4>
              <p className="timeline-text">
                Successfully guided 100 students through formal DGCA exam sessions (spanning 4 sessions per calendar year).
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2016</div>
              <h4 className="timeline-title">Academy Office Expansion</h4>
              <p className="timeline-text">
                Upgraded to a 1000 sq ft office in Dwarka to house a student community crossing 300 active aspirants.
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2021</div>
              <h4 className="timeline-title">Establishment on Ramphal Chowk</h4>
              <p className="timeline-text">
                Established a 2000 sq ft center on the main road of Ramphal Chowk, pushing our student base past 1000.
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2024</div>
              <h4 className="timeline-title">A320 Simulator Fleet Upgrade</h4>
              <p className="timeline-text">
                Added an in-house Airbus A320 Simulator to the training fleet, upgrading the center to 5000 sq ft with premium amenities. Student base reached 2100+.
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2026</div>
              <h4 className="timeline-title">Private Limited Incorporation</h4>
              <p className="timeline-text">
                Incorporated as a private limited aviation training organization, with the student community base touching 2500+ annually.
              </p>
            </div>
          </div>
        </div>

        {/* Academy Values */}
        <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '3.5rem var(--margin)', borderRadius: '1px', marginBottom: '5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
            Why Serious Aspirants Choose Airborne
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'Zero Rote Learning', text: 'We do not sell test answer booklets. We build structural concept clarity. Understanding lift coefficients and hydraulic logic saves lives and secures airline cockpit roles.' },
              { title: 'In-House A320 Simulator', text: 'Unlike theoretical classes, our students spend training hours in our Dwarka FTD simulator. Practicing cockpit layouts bridges the gap between ground schooling and aircraft type check-rides.' },
              { title: 'International Integrity', text: 'We coordinate flight programs with foreign schools, handling validation, medical clearances, and flight hours. We guarantee complete, verified conversion support.' }
            ].map((v) => (
              <div key={v.title}>
                <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: '#D8A027', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {v.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6' }}>
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA & Lead Form */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-h)' }}>Admissions Open — July 2026</span>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Begin Your Training With Airborne
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto', fontFamily: 'var(--font-b)' }}>
              Take the first step towards your airline cockpit career. Book a free counselling session and demo class at our Dwarka academy.
            </p>
          </div>
          <LeadForm courseName="General Pilot Training & Counselling" source="About Page" />
        </div>

      </main>
      <Footer />
    </>
  )
}
