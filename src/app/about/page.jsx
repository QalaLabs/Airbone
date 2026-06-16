import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'About Airborne Aviation — DGCA Approved Delhi',
  description: 'Airborne Aviation Academy, Dwarka Delhi — led by Capt. Navrang Singh. 15+ years of DGCA-approved pilot training. Meet our faculty, fleet & placement record.',
  alternates: {
    canonical: 'https://airborneaviation.in/about/',
  },
  openGraph: {
    title: 'About Airborne Aviation Academy — DGCA Approved | Dwarka Delhi',
    description: 'Airborne Aviation Academy, Dwarka Delhi — led by Capt. Navrang Singh. 15+ years of DGCA-approved pilot training.',
    url: 'https://airborneaviation.in/about/',
    type: 'website',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Capt. Navrang Singh',
  jobTitle: 'Chief Flight Instructor & Founder',
  worksFor: {
    '@type': 'EducationalOrganization',
    name: 'Airborne Aviation Academy',
    url: 'https://airborneaviation.in',
  },
  description: 'DGCA CPL holder with 15+ years of flight instruction experience. Founder of Airborne Aviation Academy, Ramphal Chowk, Dwarka, New Delhi. Active commercial airline captain.',
  url: 'https://airborneaviation.in/about/',
  knowsAbout: ['DGCA CPL examination', 'Air Navigation', 'Aviation Meteorology', 'Commercial Pilot License India', 'Pilot training Delhi'],
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Airborne Aviation Academy',
  url: 'https://airborneaviation.in',
  description: 'DGCA-approved Flying Training Organisation (FTO) at Ramphal Chowk, Dwarka, New Delhi. Founded by Capt. Navrang Singh. Offers CPL, ATPL, PPL, and cabin crew training.',
  foundingDate: '2010',
  founder: { '@type': 'Person', name: 'Capt. Navrang Singh' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ramphal Chowk, Sector 7 Dwarka',
    addressLocality: 'New Delhi',
    postalCode: '110075',
    addressCountry: 'IN',
  },
  telephone: '+91-9953777320',
  email: 'admissions@airborneaviation.in',
  alumni: [
    { '@type': 'Person', name: 'Ruzal Dhral', memberOf: { '@type': 'Organization', name: 'IndiGo' } },
    { '@type': 'Person', name: 'Capt. Nipun Singh', memberOf: { '@type': 'Organization', name: 'Air India' } },
    { '@type': 'Person', name: 'Capt. Himanish Sagwal', memberOf: { '@type': 'Organization', name: 'Emirates' } },
  ],
}

const FOUNDERS = [
  {
    name: 'Capt. Navrang Singh',
    role: 'Founder & Chief Ground Instructor',
    image: '/footage/cockpit_pilot_silhouette.jpg',
    bio: 'An active commercial airline captain with 15+ years of teaching expertise. Capt. Navrang specializes in translating highly technical aviation concepts (Air Navigation, Meteorology, Regulations) into practical cockpit understanding. Under his leadership, the academy has maintained the highest first-attempt DGCA examination pass rate in Delhi NCR.',
    accent: 'Concept Clarity over rote learning'
  },
  {
    name: 'Deepak Sir',
    role: 'Business Head & Operations Director',
    image: '/footage/student_overhead_panel.jpg',
    bio: 'Deepak manages academic scheduling, partner flight school relationships (USA, NZ, SA), and DGCA license conversion pathways. His operational guidance ensures that students experience zero administrative friction when transition from foreign training logs back to Indian skies.',
    accent: 'Seamless international flight pathways'
  },
  {
    name: 'Piyush Sir',
    role: 'Student Relations & Admissions Lead',
    image: '/footage/simulator_entry_dark.jpg',
    bio: 'Piyush is the first contact point for aspirants, offering realistic career counseling, financing guidance, and structured study plans. He monitors batch sizing restrictions (capping inputs at 25 per session) to maintain high student-teacher contact ratios.',
    accent: 'Honest counseling and strict enrollment limits'
  }
]

const STATS = [
  { value: '15+ Yrs', label: 'Teaching Legacy' },
  { value: '100%', label: 'DGCA Exam Pass Rate' },
  { value: '2,100+', label: 'Aspirants Mentored' },
  { value: 'Max 25', label: 'Student Batch Limit' }
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Hero Section */}
        <div style={{ maxWidth: '800px', marginBottom: '5rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>DGCA Approved Flying School</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            About Airborne Aviation Academy —
            <em style={{ color: '#DB241E', fontStyle: 'normal' }}> Dwarka, Delhi.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '100%' }}>
            Airborne Aviation Academy is a DGCA-approved Flying Training Organisation (FTO) located at Ramphal Chowk, Dwarka, New Delhi. Founded by Capt. Navrang Singh, the academy offers CPL, ATPL, PPL, cabin crew, and DGCA ground school programs. Airborne has trained 2,100+ aspirants currently pursuing and flying with Indian airlines including IndiGo, Air India, and Akasa Air.
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
                  borderTop: founder.name === 'Capt. Navrang Singh' ? '3px solid #DB241E' : '1px solid rgba(255,255,255,0.08)',
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
                    {founder.name === 'Capt. Navrang Singh' ? (
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
            <h2 className="ov-h2" style={{ marginTop: '0.75rem' }}>The Commander\'s Pathway</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              Chronological summary of Capt. Navrang Singh\'s aviation legacy and academy achievements.
            </p>
          </div>

          <div className="timeline" style={{ maxWidth: '800px' }}>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2011</div>
              <h4 className="timeline-title">Commercial License Endorsement</h4>
              <p className="timeline-text">
                Cleared advanced multi-engine instrument check-rides. Began specialized tutoring for aviation physics and regulations.
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2016</div>
              <h4 className="timeline-title">Dwarka Center Inauguration</h4>
              <p className="timeline-text">
                Established Airborne Aviation Academy ground school at Ramphal Chowk. Authored the core navigation syllabus.
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2021</div>
              <h4 className="timeline-title">Airbus A320 Commander rating</h4>
              <p className="timeline-text">
                Obtained jet rating. Expanded center by installing an in-house Airbus A320 Flight Training Device (FTD).
              </p>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-year">2026</div>
              <h4 className="timeline-title">2,100+ Aviation Aspirants Mentored</h4>
              <p className="timeline-text">
                Maintaining a verified 100% DGCA exam clearance record. Successfully directing pilots to major Indian and global airlines.
              </p>
            </div>
          </div>
        </div>

        {/* Academy Values */}
        <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '3.5rem var(--margin)', borderRadius: '1px' }}>
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

      </main>
      <Footer />
    </>
  )
}
