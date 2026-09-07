import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import CoursePageFooter from '@/components/CoursePageFooter'
import { fetchPublic, fetchPublicWithStatus } from '@/lib/adminApi'
import { displayCourseFee, courseFeeNumeric } from '@/lib/courseFees'
import JsonLd from '@/components/JsonLd'
import { buildCoursePageGraph } from '@/lib/schema'

export const revalidate = 60

// Map marketing URL slug → canonical Admin slug (BD-1 / Section 6 conventions)
function marketingToApiSlug(slug) {
  return slug === 'commercial-pilot-license-cpl'
    ? 'cpl-ground-classes'
    : slug === 'flying-training-india-abroad'
      ? 'flying-training'
      : slug
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const apiSlug = marketingToApiSlug(slug)

  const course = await fetchPublic('/courses', { slug: apiSlug })
  if (!course) return {}

  return {
    title: course.seoTitle ?? `${course.title} | Airborne Aviation Academy`,
    description: course.seoDesc ?? (course.subtitle ?? `${course.title} - details, syllabus, and batch information.`),
    alternates: { canonical: `/courses/${slug}` },
  }
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params
  const apiSlug = marketingToApiSlug(slug)
  const { data: course, status } = await fetchPublicWithStatus('/courses', { slug: apiSlug })

  // status 0 = network error, 5xx = admin down — show service error, not 404
  if (!course && (status === 0 || status >= 500)) {
    return (
      <>
        <Header />
        <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--red)', fontWeight: 700, marginBottom: '1rem' }}>Service Unavailable</p>
            <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '1rem' }}>Course Temporarily Unavailable</h1>
            <p style={{ color: 'rgba(0, 39, 76, 0.75)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              We are having trouble reaching our servers. Please try again in a moment or contact us directly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/courses" className="btn btn-ghost" style={{ textDecoration: 'none', background: 'rgba(0, 39, 76, 0.04)', color: 'var(--navy)', borderColor: 'rgba(0, 39, 76, 0.15)' }}>← All Courses</Link>
              <a href="tel:+919953777320" className="btn btn-primary">Call +91 9953 777 320</a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!course) notFound()

  // Pull extra display fields from metadata JSON (admin sets these when creating course)
  const meta = (key, fallback = null) => course.metadata?.[key] ?? fallback
  const image = meta('image', '/footage/cockpit_instruments_closeup.jpg')
  const batch = meta('batch', 'Contact us for next batch')
  const highlights = meta('highlights', [])
  const subjects = Array.isArray(course.curriculum) && course.curriculum.length > 0
    ? course.curriculum.map((m) => m.module)
    : meta('subjects', [])

  // Admin DB fee is authoritative (BD-1). Exceptions apply only for
  // courses with no Admin record or no single price (e.g. flying-training band).
  const feeLabel = displayCourseFee(course.slug, course.fee) ?? 'Contact us'
  const schemaPrice = courseFeeNumeric(course.slug, course.fee)
  const courseSchema = buildCoursePageGraph({
    slug: course.slug,
    name: course.title,
    description: course.description || course.subtitle || '',
    path: `/courses/${slug}`,
    price: schemaPrice,
    duration: course.duration ?? '',
    imagePath: image,
    courseMode: 'onsite',
  })

  return (
    <>
      <JsonLd data={courseSchema} />
      <Header />
      <main className="course-main-wrapper" style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div className="course-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/courses">Courses</Link>
          <span>/</span>
          <span className="current">{course.title}</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap" style={{ borderRadius: '8px' }}>
          <img src={image} alt={course.title} className="course-hero-image" />
          <div className="course-hero-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 39, 76, 0.4) 0%, transparent 100%)' }} />
        </div>

        {/* Layout Grid */}
        <div className="course-details-layout">

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', minWidth: 0, width: '100%' }}>
            <div>
              <span className="badge" style={{ borderColor: 'var(--red)', background: 'rgba(219,36,30,0.06)', color: 'var(--red)', boxShadow: 'none' }}>
                📍 {batch}
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1', color: 'var(--navy)' }}>
                {course.title}
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(0, 39, 76, 0.75)', fontSize: '1.05rem', lineHeight: '1.75', maxWidth: '100%' }}>
                {course.description ?? course.subtitle ?? ''}
              </p>
            </div>

            {/* Curriculum Subjects */}
            {subjects.length > 0 && (
              <div className="course-section-divider">
                <h2 className="course-section-title">
                  Curriculum Subjects
                </h2>
                <div className="course-subject-grid">
                  {subjects.map((subj, i) => (
                    <div key={i} className="course-subject-card">
                      <div className="course-subject-card-title">{subj}</div>
                      <div className="course-subject-card-detail">Complete training &amp; syllabus coverage.</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Program Highlights */}
            {highlights.length > 0 && (
              <div className="course-section-divider">
                <h2 className="course-section-title">
                  Program Highlights
                </h2>
                <ul className="course-list">
                  {highlights.map((item, i) => (
                    <li key={i} className="course-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements intentionally omitted from public course pages (client feedback L5) */}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '120px' }}>

              {/* Fee Card */}
              <div className="course-sidebar-card">
                {course.duration && (
                  <>
                    <span className="course-sidebar-label">
                      Total Program Duration
                    </span>
                    <div className="course-sidebar-value">
                      ⏱️ {course.duration}
                    </div>
                  </>
                )}

                <span className="course-sidebar-label">
                  Course Tuition Fee
                </span>
                <div className="course-sidebar-price">
                  {feeLabel}
                </div>
                <span className="course-sidebar-note">
                  *Excluding external licensing exam/viva processing fees.
                </span>
              </div>

              {/* Lead Form */}
              <LeadForm courseName={course.title} source={`Course Detail: ${course.slug}`} />
            </div>
          </div>
        </div>

        <CoursePageFooter
          whatsappText={`Hi, I'm interested in the ${course.title} at Airborne Aviation Academy, Dwarka. Please share batch details and fee.`}
          nextCourses={[
            { label: 'Airline Interview Preparation', href: '/courses/airline-preparation', note: 'GD/PI and mock interview coaching to land your first officer seat' },
            { label: 'Airbus A320 Simulator', href: '/courses/a320-simulator', note: 'Type rating familiarisation and cadet SIM prep' },
          ]}
          relatedCourses={[
            { label: 'CPL Ground School', href: '/courses/commercial-pilot-license-cpl' },
            { label: 'ATPL Ground School', href: '/courses/atpl' },
            { label: 'Cadet Preparation', href: '/courses/cadet-preparation' },
            { label: 'All Courses', href: '/courses' },
          ]}
        />
      </main>
      <Footer />
    </>
  )
}
