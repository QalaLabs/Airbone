import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import CoursePageFooter from '@/components/CoursePageFooter'
import CourseReviews from '@/components/CourseReviews'
import JsonLd from '@/components/JsonLd'
import { buildCoursePageGraph } from '@/lib/schema'
import { COURSE_SCHEMA } from '@/lib/schema/courseRegistry'

export const metadata = {
  title: 'Comprehensive Airline Preparation Program | DGCA + A320 + ADAPT + GD/PI | Airborne Delhi',
  description: 'CPL to First Officer in 2.5 months. DGCA Ground Refresher, ADAPT Screening, A320 Systems & Sim Prep, and GD/PI - all in one program. 4 hrs/day. ₹1,25,000. Airborne Aviation Academy, Dwarka Delhi.',
  alternates: { canonical: '/courses/airline-preparation' },
}

const coursePageGraph = buildCoursePageGraph({
  ...COURSE_SCHEMA['airline-preparation'],
  faqs: [
    {
      q: 'What does the Comprehensive Airline Preparation Program cover?',
      a: 'The program covers four pillars: DGCA Ground Refresher (Navigation, Technical General, Meteorology, Air Regulation), ADAPT Screening Preparation (psychometric, mental math, physics), Airbus A320 Systems & Simulator Orientation, and Group Discussion & Personal Interview coaching. All in 2.5 months, 4 hours per day.',
    },
    {
      q: 'Who is this program for?',
      a: 'CPL holders preparing for airline selection - IndiGo, Air India, Akasa Air, and similar carriers. The curriculum is built around airline hiring filters: written tests, ADAPT psychometric screening, simulator checks, and HR/GD/PI rounds.',
    },
    {
      q: 'How is this different from the GD & PI Course?',
      a: 'The GD & PI Course (₹30,000) covers only communication skills and interview prep. This program is the full pre-airline track - it adds DGCA ground subject refresher, ADAPT test training, and A320 systems preparation on top of GD/PI coaching.',
    },
    {
      q: 'What is the daily schedule?',
      a: 'Each day runs 4 hours: 2 hours of Navigation or Technical General, 1 hour of Meteorology or ADAPT training, and 1 hour of A320 Systems or Simulator Orientation. The schedule is designed for focused, daily progression - not cramming.',
    },
    {
      q: 'Do I need to know A320 systems before joining?',
      a: 'No prior A320 knowledge required. The program builds from aircraft general principles through each system, then moves into cockpit orientation and mock simulator sessions in the final weeks.',
    },
    {
      q: 'What is ADAPT and why does it matter?',
      a: 'ADAPT is an airline pre-screening test covering cognitive ability, numerical reasoning, psychometric profiling, and physics. Airlines like IndiGo use it as a filter before interview rounds. We prepare you with mock ADAPT test environments and full module-wise practice.',
    },
  ],
})

const MODULES = [
  {
    number: '01',
    title: 'Advanced DGCA Ground Refresher',
    tag: '2 hrs/day',
    description: 'Navigation, Technical General, Meteorology, and Air Regulation - rebuilt from the ground up for airline written examinations. Not a CPL recap. A systematic re-engagement with the concepts airlines actually test.',
    topics: ['Earth & Geometry · Direction · Magnetic Compass', 'Dead Reckoning · GPS & GNSS · ILS · TCAS', 'Pressure Instruments · Gyro Theory · RADAR', 'METARs & SIGMETs · Air Regulation · RVSM · LVP'],
  },
  {
    number: '02',
    title: 'ADAPT Screening Preparation',
    tag: '1 hr/day',
    description: 'Most CPL holders walk into ADAPT cold - and fail. We run you through cognitive drills, mental arithmetic, physics principles, and simulated test environments until the format feels routine.',
    topics: ['Distance · Time · Speed · Area calculations', 'Ohm\'s Law · Power · Optics · Classical Mechanics', 'Numerical Series · Mental Arithmetic', 'Psychometric Test Modules I, II & III', 'Full simulated ADAPT test environment run'],
  },
  {
    number: '03',
    title: 'Airbus A320 Preparation',
    tag: '1 hr/day',
    description: 'System-by-system walkthrough of the A320 - from Air Conditioning to the APU, from Auto Flight to the FMS. The final weeks shift to cockpit orientation sessions that simulate what you\'ll face in a type rating assessment.',
    topics: ['Air Conditioning · Pressurization · Auto Flight', 'Flight Controls · Fuel · Hydraulic · Electrical', 'Landing Gear · Navigation · Surveillance', 'APU · Engines · Cockpit Windows', 'Sim/Cockpit Mock Orientation (8 sessions)'],
  },
  {
    number: '04',
    title: 'Group Discussion & Personal Interview',
    tag: 'Lec 41–45',
    description: 'The final block. Aviation current affairs, situation-based questions, communication under pressure, and mock interview panels with feedback. You go into your airline interview having already done it before.',
    topics: ['Aviation current affairs & industry awareness', 'Situation-based & competency questions', 'Communication skills & professional presence', 'Mock GD sessions with structured debrief', 'Full PI mock with panel-format feedback'],
  },
]

const MASTER_PLAN = [
  { block: 'Lec 1', nav: 'Earth & Geometry; Direction; Magnetic Compass', met: 'Basic Weather Principles; Atmosphere', a320: 'Aircraft General // Air Conditioning / Pressurization / Ventilation', isRevision: false },
  { block: 'Lec 2', nav: 'Departure / Scale', met: 'Temperature', a320: 'Auto Flight – General // Auto Flight - Flight Management', isRevision: false },
  { block: 'Lec 3', nav: 'Maps / Charts / Projection', met: 'Air Density', a320: 'Revision Session', isRevision: false },
  { block: 'Lec 4', nav: 'Convergency / Convergent Angle', met: 'Humidity / Wind', a320: 'Auto Flight - Flight Guidance // Auto Flight - Flight Augmentation', isRevision: false },
  { block: 'Lec 5', nav: '1:60 Scale; Dead Reckoning', met: 'Winds', a320: 'Auto Flight - AOC Functions // Auto Flight - Print Interface', isRevision: false },
  { block: 'Review', nav: 'Navigation Revision Block I', met: 'Visibility & Fog', a320: 'Revision Session', isRevision: true },
  { block: 'Lec 6', nav: 'Solar System / Time', met: 'Meteorology Revision Block I', a320: 'Communications // Electrical Systems', isRevision: false },
  { block: 'Lec 7', nav: 'Payload / Weight Planning', met: 'Clouds', a320: 'Equipment // Fire Protection', isRevision: false },
  { block: 'Lec 8', nav: 'Payload / Weight Planning', met: 'Optical Phenomena', a320: 'Revision Session', isRevision: false },
  { block: 'Lec 9', nav: 'INS / ETOPS Operations', met: 'Precipitation / Ice Accretion', a320: 'Flight Controls // Fuel Systems', isRevision: false },
  { block: 'Lec 10', nav: 'GPS & GNSS Navigation', met: 'Thunderstorm Dynamics', a320: 'Hydraulic Systems // Ice and Rain Protection', isRevision: false },
  { block: 'Review', nav: 'Navigation Revision Block II', met: 'Thunderstorm Case Studies', a320: 'Revision Session', isRevision: true },
  { block: 'Lec 12', nav: 'Basic Radio Principles', met: 'CAT (Clear Air Turbulence)', a320: 'Indicating/Recording Systems // Landing Gear', isRevision: false },
  { block: 'Lec 13', nav: 'Basic Radio Principles', met: 'Climatology of the Indian Subcontinent', a320: 'Lights // Navigation Systems', isRevision: false },
  { block: 'Lec 14', nav: 'ADF / NDB Systems', met: 'Meteorology Revision Block II', a320: 'Revision Session', isRevision: false },
  { block: 'Lec 15', nav: 'VOR Systems', met: 'General Circulation', a320: 'Surveillance // Oxygen Systems', isRevision: false },
  { block: 'Lec 16', nav: 'ILS (Instrument Landing System); Revision III', met: 'METARs / SIGMETs Decoding', a320: 'Pneumatic // Water / Waste Systems', isRevision: false },
  { block: 'Review', nav: 'Navigation Revision Block III', met: 'Air Masses; Western Disturbances', a320: 'Revision Session', isRevision: true },
  { block: 'Lec 18', nav: 'RADAR / Radio Altimeter Principles', met: 'Meteorology Revision Block III', a320: 'Maintenance System // Information Systems', isRevision: false },
  { block: 'Lec 19', nav: 'SSR; Ground Radar; Airborne Weather Radar', met: 'Self-Study / Focus Session', a320: 'APU // Doors', isRevision: false },
  { block: 'Lec 20', nav: 'DME / GPWS Systems', met: 'Self-Study / Focus Session', a320: 'Revision Session', isRevision: false },
  { block: 'Lec 21', nav: 'Pressure Instruments', met: 'Air Regulation: Introduction', a320: 'Cockpit Windows // Engines', isRevision: false },
  { block: 'Lec 22', nav: 'Pressure Altimeter / ASI', met: 'IFR / VFR Rules; Airspace Classification', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Lec 23', nav: 'VSI / Machmeter', met: 'Aircraft Classification; Squawk Codes', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Review', nav: 'Navigation Revision Block IV', met: 'RVSM Operations / NOTAMs Analysis', a320: 'Sim/Cockpit Mock Orientation', isRevision: true },
  { block: 'Lec 25', nav: 'Gyro Theory / Artificial Horizon', met: 'Fuel Policy Regulation', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Lec 26', nav: 'Turn & Slip Indicator', met: 'Wake Turbulence Separation Limits', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Lec 27', nav: 'Magnetism & Direct Reading Compass', met: 'Human Factors & Crew Resource Management', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Lec 28', nav: 'TCAS Operations', met: 'Rules of the Air', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Lec 29', nav: 'Navigation Revision Block V', met: 'AWO CAR – LVP (Low Visibility Procedures), LVTO', a320: 'Sim/Cockpit Mock Orientation', isRevision: false },
  { block: 'Lec 30–32', nav: 'Revision & Doubt Solving', met: 'Revision & Doubt Solving', a320: 'Revision & Doubt Solving', isRevision: true },
]

const ADAPT_BLOCKS = [
  { block: 'Lec 32', tech: 'Atmosphere & Air Properties; Aerodynamic Principles', adapt: 'ADAPT I: Distance, Time, Speed, Area calculations' },
  { block: 'Lec 33', tech: 'Aerofoil & Wing Geometry', adapt: 'Volume & Momentum physics principles' },
  { block: 'Lec 33', tech: 'Lift Dynamics; Wake Turbulence; Ground Effect', adapt: "Ohm's Law; Power & Electrical concepts" },
  { block: 'Lec 34', tech: 'Drag Coefficient & Minimization', adapt: 'Optics & Classical Mechanics refresher' },
  { block: 'Lec 35', tech: 'Stall Characteristics & Recovery', adapt: 'Numerical Series & Mental Arithmetic training' },
  { block: 'Lec 36', tech: 'High Lift Devices; Aircraft Stability', adapt: 'Aviation Unit Conversions' },
  { block: 'Lec 37', tech: 'Flight Controls; Flight Mechanics', adapt: 'ADAPT II: Psychometric Test Training Module I' },
  { block: 'Lec 38', tech: 'High-Speed Flight Theory', adapt: 'Psychometric Test Training Module II' },
  { block: 'Lec 39', tech: 'Propeller Dynamics', adapt: 'Psychometric Test Training Module III' },
  { block: 'Lec 40', tech: 'Core Revision + Jet Engines Integration', adapt: 'Practical ADAPT: Simulated Test Environment Run' },
  { block: 'Lec 41–45', tech: 'Group Discussion (GD)', adapt: 'Personal Interview (PI)' },
]

const tableCell = {
  padding: '0.75rem 1rem',
  fontSize: '0.78rem',
  color: 'rgba(0, 39, 76, 0.75)',
  lineHeight: '1.55',
  verticalAlign: 'top',
  borderBottom: '1px solid rgba(0, 39, 76, 0.06)',
}

const tableHeader = {
  padding: '0.9rem 1rem',
  fontSize: '0.72rem',
  fontFamily: 'var(--font-h)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--navy)',
  borderBottom: '2px solid rgba(0, 39, 76, 0.12)',
  background: 'rgba(0, 39, 76, 0.03)',
  whiteSpace: 'nowrap',
}

export default function AirlinePreparationPage() {
  return (
    <>
      <JsonLd data={coursePageGraph} />

      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/courses">Courses</Link>
          <span>/</span>
          <span className="current">Airline Preparation Program</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img
            src="/footage/airline-preparation-hero.jpg"
            alt="Comprehensive Airline Preparation Program at Airborne Aviation Academy, Dwarka Delhi"
            className="course-hero-image"
          />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        <div className="course-details-layout">

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>

            {/* SECTION 1: Hero / Introduction */}
            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 Dwarka, Delhi · 2.5 Months · 4 Hrs/Day · ₹1,25,000
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                Comprehensive Airline Preparation Program
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                Getting a CPL is one thing. Getting a seat on the flight deck is another.
              </p>
              <p className="ov-body" style={{ marginTop: '0.75rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75' }}>
                This program bridges the gap between commercial pilot training and airline hiring standards. In 2.5 months - 4 focused hours every day - you cover DGCA ground subjects at airline examination depth, ADAPT psychometric screening, Airbus A320 systems end-to-end, and full GD/PI preparation. Four areas airlines actually screen for, in one structured program.
              </p>
              <p style={{ marginTop: '0.75rem', color: 'rgba(0, 39, 76, 0.55)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                Looking for just the interview track?{' '}
                <Link href="/courses/gd-pi" style={{ color: 'var(--red)', fontWeight: 600 }}>See our GD &amp; PI Course (₹30,000)</Link>.
              </p>
            </div>

            {/* SECTION 2: Program Modules */}
            <div className="course-section-divider">
              <h2 className="course-section-title">What The Program Covers</h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.6)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Four modules. Each one targets a specific filter in the airline selection process.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {MODULES.map((m) => (
                  <div key={m.number} style={{ border: '1px solid rgba(0, 39, 76, 0.1)', borderTop: '3px solid #DB241E', padding: '1.5rem', background: 'rgba(0, 39, 76, 0.015)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 900, color: 'rgba(219,36,30,0.15)', lineHeight: 1 }}>{m.number}</span>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--red)', background: 'rgba(219,36,30,0.08)', padding: '0.2rem 0.6rem', borderRadius: '3px', letterSpacing: '0.05em' }}>{m.tag}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.6rem', lineHeight: '1.3' }}>{m.title}</div>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.65', marginBottom: '1rem' }}>{m.description}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {m.topics.map((t, i) => (
                        <li key={i} style={{ fontSize: '0.75rem', color: 'rgba(0, 39, 76, 0.6)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--red)', flexShrink: 0, marginTop: '1px' }}>›</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Schedule Structure */}
            <div className="course-section-divider">
              <h2 className="course-section-title">Daily Schedule Structure</h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.6)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Every day is 4 hours - structured so you build depth in each area without letting any one subject crowd out the others.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'rgba(0, 39, 76, 0.1)', border: '1px solid rgba(0, 39, 76, 0.1)' }}>
                {[
                  { hrs: '2 hrs', subject: 'Navigation &\nTechnical General', color: 'rgba(0, 39, 76, 0.04)' },
                  { hrs: '1 hr', subject: 'Meteorology &\nADAPT Training', color: 'rgba(219,36,30,0.03)' },
                  { hrs: '1 hr', subject: 'Airbus A320\nSystems & Sim Prep', color: 'rgba(0, 39, 76, 0.04)' },
                ].map((slot) => (
                  <div key={slot.hrs + slot.subject} style={{ background: slot.color, padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', fontWeight: 900, color: 'var(--red)', lineHeight: 1 }}>{slot.hrs}</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)', marginTop: '0.5rem', lineHeight: '1.4', whiteSpace: 'pre-line' }}>{slot.subject}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: Master Study Plan */}
            <div className="course-section-divider">
              <h2 className="course-section-title">Master Study Plan - Lecture by Lecture</h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.6)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Lectures 1 through 32. Every session is mapped. You know exactly what gets covered, when.
              </p>
              <div style={{ overflowX: 'auto', borderRadius: '4px', border: '1px solid rgba(0, 39, 76, 0.1)' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', background: '#fff' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeader, minWidth: '90px' }}>Block</th>
                      <th style={{ ...tableHeader, minWidth: '220px' }}>Navigation & Technical General<br /><span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>2 hrs</span></th>
                      <th style={{ ...tableHeader, minWidth: '200px' }}>Meteorology & ADAPT Training<br /><span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>1 hr</span></th>
                      <th style={{ ...tableHeader, minWidth: '220px' }}>A320 Systems & Sim Prep<br /><span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>1 hr</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {MASTER_PLAN.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          background: row.isRevision
                            ? 'rgba(219,36,30,0.04)'
                            : i % 2 === 0 ? 'rgba(0, 39, 76, 0.015)' : '#fff',
                        }}
                      >
                        <td style={{ ...tableCell, fontFamily: 'var(--font-h)', fontWeight: 700, color: row.isRevision ? 'var(--red)' : 'var(--navy)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {row.block}
                        </td>
                        <td style={tableCell}>{row.nav}</td>
                        <td style={tableCell}>{row.met}</td>
                        <td style={tableCell}>{row.a320}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(0, 39, 76, 0.4)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Scroll horizontally on mobile · Revision rows highlighted in red
              </p>
            </div>

            {/* Specialization Blocks */}
            <div className="course-section-divider">
              <div style={{ display: 'inline-block', background: 'rgba(219,36,30,0.08)', border: '1px solid rgba(219,36,30,0.2)', borderRadius: '4px', padding: '0.4rem 0.9rem', fontSize: '0.72rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.08em', color: '#DB241E', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Technical Transition Phase
              </div>
              <h2 className="course-section-title">Specialization Blocks - Technical General & ADAPT Mastery</h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(0, 39, 76, 0.6)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                From Lecture 32 onward, the focus shifts. This is where CPL general knowledge gets upgraded into airline-testing depth - and ADAPT preparation moves from theory into timed simulation.
              </p>
              <div style={{ overflowX: 'auto', borderRadius: '4px', border: '1px solid rgba(0, 39, 76, 0.1)' }}>
                <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse', background: '#fff' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeader, minWidth: '90px' }}>Block</th>
                      <th style={{ ...tableHeader, minWidth: '240px' }}>Technical General Focus<br /><span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Lectures 32–45</span></th>
                      <th style={{ ...tableHeader, minWidth: '240px' }}>ADAPT Screening Prep<br /><span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Lectures 32–45</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADAPT_BLOCKS.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0, 39, 76, 0.015)' : '#fff' }}>
                        <td style={{ ...tableCell, fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--navy)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {row.block}
                        </td>
                        <td style={tableCell}>{row.tech}</td>
                        <td style={tableCell}>{row.adapt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(0, 39, 76, 0.4)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Scroll horizontally on mobile · GD/PI sessions run Lec 41–45
              </p>
            </div>

            {/* Who Should Attend */}
            <div className="course-section-divider">
              <h2 className="course-section-title">Who This Program Is For</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  'CPL holders targeting IndiGo, Air India, Akasa Air, or similar airline recruitment',
                  'Pilots who have cleared DGCA exams but need to sharpen their airline-exam-level knowledge',
                  'Candidates who have failed ADAPT screening and need structured test preparation',
                  'Pilots approaching type rating and wanting A320 systems groundwork before simulator sessions',
                  'Anyone who wants the full airline-readiness package - not just interview prep',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', border: '1px solid rgba(0, 39, 76, 0.07)', borderLeft: '3px solid #DB241E', background: 'rgba(0, 39, 76, 0.015)' }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(0, 39, 76, 0.75)', lineHeight: '1.6' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="course-section-divider">
              <h2 className="course-section-title">Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {[
                  {
                    q: 'What does the program cover?',
                    a: 'Four modules - DGCA Ground Refresher (Navigation, Technical General, Meteorology, Air Regulation), ADAPT Screening Prep (psychometric, mental math, physics), A320 Systems & Simulator Orientation, and GD/PI coaching. 2.5 months, 4 hours per day.',
                  },
                  {
                    q: 'How is this different from the GD & PI Course?',
                    a: 'The GD & PI Course (₹30,000) covers only interview and communication preparation. This program adds DGCA ground subject refresher, ADAPT test training, and A320 systems preparation - making it the full pre-airline package.',
                  },
                  {
                    q: 'Do I need A320 knowledge before joining?',
                    a: 'No. The A320 module builds from basics through to cockpit orientation. Prior type rating is not required.',
                  },
                  {
                    q: 'What is ADAPT and who uses it?',
                    a: 'ADAPT is an airline pre-screening test covering cognitive ability, numerical reasoning, psychometric profiling, and physics. Airlines including IndiGo use it before the interview stage. The program prepares you with module-wise practice and a full simulated test run.',
                  },
                  {
                    q: 'Is this only for pilots?',
                    a: 'The DGCA, ADAPT, and A320 modules are pilot-specific. The GD/PI module is applicable to both pilots and cabin crew candidates. Cabin crew applicants wanting only the interview track should see our GD & PI Course.',
                  },
                  {
                    q: 'How many hours per day is the program?',
                    a: '4 hours per day - 2 hours of Navigation or Technical General, 1 hour of Meteorology or ADAPT, and 1 hour of A320 Systems or Sim Orientation.',
                  },
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
                <span className="course-sidebar-label">Course Fee</span>
                <div className="course-sidebar-price">₹1,25,000</div>
                <span className="course-sidebar-note">Full airline preparation program</span>
                <div style={{ margin: '1.25rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">Duration</span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)' }}>⏱️ 2.5 Months</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(0, 39, 76, 0.5)', marginTop: '0.35rem' }}>4 hours per day</div>
                <div style={{ margin: '1.25rem 0', borderTop: '1px solid rgba(0, 39, 76, 0.08)' }} />
                <span className="course-sidebar-label">What's Included</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {['DGCA Ground Refresher', 'ADAPT Test Preparation', 'A320 Systems & Sim Prep', 'GD & PI Coaching'].map((item) => (
                    <div key={item} style={{ fontSize: '0.78rem', color: 'rgba(0, 39, 76, 0.65)', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--red)' }}>›</span>{item}
                    </div>
                  ))}
                </div>
              </div>
              <LeadForm courseName="Comprehensive Airline Preparation Program (₹1,25,000)" source="Course Detail: airline-preparation" />
            </div>
          </div>

        </div>

        <CourseReviews />

        <CoursePageFooter
          whatsappText="Hi, I'm interested in the Comprehensive Airline Preparation Program (₹1,25,000) at Airborne Aviation Academy. Please share details."
          nextCourses={[
            { label: 'GD & PI Course (₹30,000)', href: '/courses/gd-pi', note: 'Foundational interview track if you want only GD/PI preparation' },
            { label: 'Cadet Pilot Preparation', href: '/courses/cadet-preparation', note: 'Full aptitude, SIM and interview prep for IndiGo, Air India & Akasa cadet programs' },
          ]}
          relatedCourses={[
            { label: 'GD & PI Course', href: '/courses/gd-pi' },
            { label: 'A320 Simulator FBS', href: '/courses/a320-simulator' },
            { label: 'CASS / Compass / ADAPT Prep', href: '/courses/cas-compass-adapt' },
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />

      </main>
      <Footer />
    </>
  )
}
