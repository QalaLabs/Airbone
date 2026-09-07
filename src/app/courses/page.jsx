import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import ProgramCard from '@/components/ProgramCard'
import { buildCoursesIndexGraph } from '@/lib/schema'
import { COURSES_INDEX_ITEMS } from '@/lib/schema/courseRegistry'
import { fetchPublic } from '@/lib/adminApi'
import { resolveCatalogItems, LEGACY_COURSE_ITEMS } from '@/lib/publicCourses'

export const metadata = {
  title: 'Pilot Training Courses in Delhi CPL, ATPL, Cabin Crew | Airborne',
  description: 'Browse DGCA-aligned aviation courses at Airborne Aviation Academy, Dwarka Delhi. CPL ground school, ATPL, Cabin Crew, A320 SIM FBS, cadet prep. Compare fees and timelines.',
}

const coursesIndexGraph = buildCoursesIndexGraph(COURSES_INDEX_ITEMS)

// Revalidate every 60 s so freshly published courses appear quickly
export const revalidate = 60

export default async function CoursesPage() {
  // Canonical catalog = Admin PUBLISHED courses. If Admin is unreachable,
  // fall back to the documented offline copy so the page never empties.
  const apiCourses = await fetchPublic('/courses', { limit: 100 })
  const courses = apiCourses == null ? LEGACY_COURSE_ITEMS : resolveCatalogItems(apiCourses)

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
            {courses.map((program, idx) => (
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
