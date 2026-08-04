import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import ProgramCard from '@/components/ProgramCard'
import { buildCoursesIndexGraph } from '@/lib/schema'
import { COURSES_INDEX_ITEMS } from '@/lib/schema/courseRegistry'

const ALL_COURSES = [
  {
    id: 'dgca-ground-school',
    title: 'DGCA CPL Ground Classes',
    tag: 'Ground School',
    duration: '3–6 Months',
    desc: 'Intensive ground school covering DGCA CPL subjects. Eligibility: 10+2 Physics & Maths. Duration: 3–6 months. Taught by Capt. Navrang Singh.',
    price: '₹2,70,000',
    href: '/courses/commercial-pilot-license-cpl',
    accent: 'var(--gold)',
  },
  {
    id: 'cpl',
    title: 'Commercial Pilot License (CPL)',
    tag: 'Flying Training',
    duration: '12–18 Months',
    desc: 'Complete CPL path with flying training guidance and Indian CPL conversion support. Cost may vary ₹45–75 Lakh (typical ~₹65 Lakh). Duration: 12–18 months.',
    price: '₹65 Lakh*',
    href: '/courses/flying-training-india-abroad',
    accent: 'var(--red)',
  },
  {
    id: 'cadet',
    title: 'Cadet Preparation',
    tag: 'Cadet Selection',
    duration: 'Flexible',
    desc: 'The quickest entry into aviation. IndiGo, Air India, and Akasa cadet pilot program preparation.',
    price: '₹50,000',
    href: '/courses/cadet-preparation',
    accent: 'var(--red)',
  },
  {
    id: 'airline-prep',
    title: 'Airline Preparation',
    tag: 'Airline Prep',
    duration: '3 Months',
    desc: 'Structured airline interview preparation - GD, PI, and soft skills for IndiGo, Air India, Akasa and more. Duration: 3 months.',
    price: '₹1,25,000',
    href: '/courses/airline-preparation',
    accent: 'var(--red)',
  },
  {
    id: 'gd-pi',
    title: 'GD & PI Course',
    tag: 'GD / PI',
    duration: '3 Months',
    desc: 'Group discussions, panel interviews, and personal development masterclasses led by retired Air India AGM Rajeet Khalsa. Duration: 3 months.',
    price: '₹30,000',
    href: '/courses/gd-pi',
    accent: 'var(--gold)',
  },
  {
    id: 'cas-compass',
    title: 'CASS Compass Adapt',
    tag: 'Aptitude Test',
    duration: '1 Month',
    desc: 'Structured preparation for airline pilot aptitude test batteries - numerical, spatial, psychomotor, and multi-tasking.',
    price: '₹30,000',
    href: '/courses/cas-compass-adapt',
    accent: 'var(--gold)',
  },
  {
    id: 'atpl',
    title: 'ATPL Ground School',
    tag: 'Ground School',
    duration: '2–3 Months',
    desc: 'DGCA ATPL written and viva preparation for commercial pilots upgrading toward command. Eligibility: 21 years. Duration: 2–3 months.',
    price: '₹1,50,000',
    href: '/courses/atpl',
    accent: 'var(--gold)',
  },
  {
    id: 'simulator',
    title: 'Airbus A320 Simulator FBS',
    tag: 'Simulator',
    duration: 'Flexible',
    desc: 'In-house Airbus A320 FBS simulator. Eligibility: CPL. Type rating familiarisation and airline SIM prep.',
    price: '₹12,000',
    href: '/courses/a320-simulator',
    accent: 'var(--gold)',
  },
  {
    id: 'flying-guide',
    title: "Securing Your Child's Future in Aviation",
    tag: 'Parents',
    duration: 'Flexible',
    desc: 'Comprehensive CPL flight training guidance and Indian CPL conversion support - built for parents and aspirants.',
    price: 'Free',
    href: '/courses/securing-your-childs-future-in-aviation',
    accent: 'var(--red)',
  },
  {
    id: 'cabin-crew',
    title: 'Cabin Crew Training',
    tag: 'Hospitality',
    duration: '3–6 Months',
    desc: 'Cabin crew & aviation hospitality training with 100%* scholarship offer upon scoring ≥70%.',
    price: '₹59,000',
    href: '/courses/cabin-crew-training',
    accent: 'var(--gold)',
  },
  {
    id: 'ppl',
    title: 'Private Pilot License (PPL)',
    tag: 'Flying Training',
    duration: '3–6 Months',
    desc: 'Initial pilot license program. Complete flight training hours and ground school preparation for private pilot license certification.',
    price: '₹25,00,000',
    href: '/courses/private-pilot-license',
    accent: 'var(--red)',
  },
]

export const metadata = {
  title: 'Pilot Training Courses in Delhi CPL, ATPL, Cabin Crew | Airborne',
  description: 'Browse DGCA-aligned aviation courses at Airborne Aviation Academy, Dwarka Delhi. CPL ground school, ATPL, Cabin Crew, A320 SIM FBS, cadet prep. Compare fees and timelines.',
}

const coursesIndexGraph = buildCoursesIndexGraph(COURSES_INDEX_ITEMS)

// Revalidate every 60 s so freshly published courses appear quickly
export const revalidate = 60

export default async function CoursesPage() {

  return (
    <>
      <JsonLd data={coursesIndexGraph} />
      <Header />
      <main className="course-main-wrapper courses-listing theme-light" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>
        <div className="container-xl">
        <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Courses' }]} />

        {/* Header Hero Section */}
        <div style={{ maxWidth: '800px', marginBottom: '4rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start', color: 'var(--red)' }}>Academy Syllabus</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase', color: 'var(--navy)' }}>
            Pilot Training Courses at
            <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}> Airborne Aviation Academy Dwarka, Delhi</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(33,33,33,0.7)', fontSize: '1.02rem', lineHeight: '1.7', maxWidth: '100%' }}>
            Airborne Aviation Academy, Dwarka, Delhi offers DGCA Complied pilot training programs — from CPL ground school and ATPL exam prep to A320 Simulator FBS and cadet selection coaching. Every course is mentor-led and structured for DGCA exam readiness.
          </p>
        </div>

        {/* Heading Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                height: '1px',
                width: '2rem',
                background: 'var(--red)',
              }}
            />
            <span
              className="chapter-num"
              style={{
                color: 'var(--red)',
                fontFamily: 'var(--font-h)',
                fontSize: '0.625rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              AT A GLANCE
            </span>
          </div>
          <h2
            className="display-xl"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              color: 'var(--navy)',
              fontWeight: 800,
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            ALL COURSES AT AIRBORNE
          </h2>
        </div>

        {/* Course Cards Grid */}
        <div style={{ marginBottom: '5rem' }}>
          <div className="program-grid-4x2">
            {ALL_COURSES.map((program, idx) => (
              <ProgramCard key={program.id} program={program} index={idx} />
            ))}
          </div>
        </div>

        <style>{`
          .program-grid-4x2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
            gap: 1.5rem;
          }
        `}</style>


        </div>

      </main>
      <Footer />
    </>
  )
}
