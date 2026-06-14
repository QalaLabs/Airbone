import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { COURSES } from '@/utils/coursesData'
import { getCourseSchema, getBreadcrumbSchema } from '@/utils/seo'

// Generate static routes at build time for all 10 courses
export async function generateStaticParams() {
  return COURSES.map((course) => ({
    slug: course.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const course = COURSES.find((c) => c.slug === slug)

  if (!course) return {}

  return {
    title: `${course.title} | Airborne Aviation Academy`,
    description: `${course.tagline} Details, syllabus highlights, pricing structures, and batch parameters.`,
  }
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params
  const course = COURSES.find((c) => c.slug === slug)

  if (!course) {
    notFound()
  }

  const courseSchema = getCourseSchema(course)
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: course.title, path: `/courses/${course.slug}` }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        
        {/* Breadcrumb navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>{course.title}</span>
        </div>

        {/* Course Wide-Bleed Hero Image */}
        <div className="course-hero-image-wrap">
          <img src={course.image} alt={course.title} className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        {/* Dynamic Details Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.6fr 1fr', gap: '4rem' }}>
          
          {/* Main Course Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 {course.batch}
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                {course.title}
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '100%' }}>
                {course.overview}
              </p>
            </div>

            {/* Curriculum Breakdown */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Curriculum Subjects
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {course.subjects.map((subj) => (
                  <div key={subj} style={{ background: '#00162e', borderLeft: '3px solid #DB241E', padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {subj}
                  </div>
                ))}
              </div>
            </div>

            {/* Program Highlights */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Program Highlights
              </h2>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {course.highlights.map((item) => (
                  <li key={item} style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Form & Tuition Rates */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '120px' }}>
              
              {/* Fee Information Card */}
              <div style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>
                  Total Program Duration
                </span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem' }}>
                  ⏱️ {course.duration}
                </div>

                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>
                  Course Tuition Fee
                </span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027', letterSpacing: '0.02em' }}>
                  {course.price}
                </div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>
                  *Excluding external licensing exam/viva processing fees.
                </span>
              </div>

              {/* Lead Capture Form */}
              <LeadForm courseName={course.title} source={`Course Detail: ${course.slug}`} />

            </div>
          </div>

        </div>

      </main>
      <Footer />
    </>
  )
}
