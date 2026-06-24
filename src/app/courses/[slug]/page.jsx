import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import CoursePageFooter from '@/components/CoursePageFooter'
import { fetchPublic, fetchPublicWithStatus, formatFee } from '@/lib/adminApi'
import { getCourseSchema, getBreadcrumbSchema } from '@/utils/seo'

export const revalidate = 60

const COURSE_SEO = {
  'commercial-pilot-license-cpl': {
    title: 'CPL Course Delhi Commercial Pilot License | Airborne Aviation',
    description: "Enrol in Airborne's DGCA-approved CPL course in Dwarka, Delhi. 200 flying hours, 6 DGCA exams, airline placement support. Fees ₹45–55L. Check eligibility."
  },
  'cpl-ground-classes': {
    title: 'CPL Course Delhi Commercial Pilot License | Airborne Aviation',
    description: "Enrol in Airborne's DGCA-approved CPL course in Dwarka, Delhi. 200 flying hours, 6 DGCA exams, airline placement support. Fees ₹45–55L. Check eligibility."
  },
  'atpl': {
    title: 'ATPL Ground School India All Subjects | Airborne Aviation',
    description: 'ATPL ground school in Delhi by Airborne Aviation Academy. Complete airline transport pilot license exam prep all subjects, DGCA-aligned. Enrol now.'
  },
  'cadet-preparation': {
    title: 'Cadet Pilot Program Prep IndiGo, Air India, Akasa | Airborne',
    description: 'Prepare for IndiGo, Air India & Akasa cadet pilot programs at Airborne, Dwarka. Aptitude tests, GD-PI, simulator prep join now.'
  },
  'a320-simulator': {
    title: 'Airbus A320 Simulator Training Delhi | Airborne Aviation',
    description: 'A320 simulator at Airborne Aviation Academy, Dwarka. Airline interview prep, type rating familiarisation, cadet selection practice. Book a session today.'
  },
  'cas-compass-adapt': {
    title: 'CAS Compass & ADAPT Test Preparation Pilot Aptitude | Airborne',
    description: 'Prepare for DGCA CAS Compass and ADAPT pilot aptitude screening tests at Airborne Aviation Academy, Dwarka. Structured preparation for cadet pilot selection.'
  },
  'airline-preparation': {
    title: 'Airline Interview Prep Delhi GD/PI & Personality | Airborne',
    description: 'Structured airline interview prep at Airborne, Dwarka. GD/PI coaching and personality development by retired Air India AGM with 37+ years experience. Book now.'
  },
  'flying-training-india-abroad': {
    title: 'Flying Training India vs Abroad Cost & DGCA Guide | Airborne',
    description: 'Compare flying training in India vs abroad. DGCA requirements, cost comparison, license conversion guide, and which countries are recognised. Free counselling.'
  },
  'flying-training': {
    title: 'Flying Training India vs Abroad Cost & DGCA Guide | Airborne',
    description: 'Compare flying training in India vs abroad. DGCA requirements, cost comparison, license conversion guide, and which countries are recognised. Free counselling.'
  },
  'cabin-crew': {
    title: 'Cabin Crew Training Delhi Airline Veterans | Airborne Aviation',
    description: 'Cabin crew training in Dwarka, Delhi by ex-Alliance Air & Air India AGM trainers. 3 structured pathways. ₹30K–₹54K. Small batches. Book free counselling.'
  },
  'ground-school': {
    title: 'DGCA Ground School Delhi CPL & ATPL Classes | Airborne',
    description: "Pass your DGCA CPL & ATPL exams with Airborne's expert-led ground school in Dwarka, Delhi. All subjects. Taught by airline pilots. Enrol now."
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const apiSlug = slug === 'commercial-pilot-license-cpl' ? 'cpl-ground-classes' : (slug === 'flying-training-india-abroad' ? 'flying-training' : slug)
  
  const course = await fetchPublic('/courses', { slug: apiSlug })
  if (!course) return {}
  
  const custom = COURSE_SEO[slug] || COURSE_SEO[apiSlug]
  if (custom) {
    return {
      title: custom.title,
      description: custom.description,
    }
  }

  return {
    title: `${course.title} | Airborne Aviation Academy`,
    description: course.subtitle ?? `${course.title} — details, syllabus, and batch information.`,
  }
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params
  const apiSlug = slug === 'commercial-pilot-license-cpl' ? 'cpl-ground-classes' : (slug === 'flying-training-india-abroad' ? 'flying-training' : slug)
  const { data: course, status } = await fetchPublicWithStatus('/courses', { slug: apiSlug })

  // status 0 = network error, 5xx = admin down — show service error, not 404
  if (!course && (status === 0 || status >= 500)) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#DB241E', fontWeight: 700, marginBottom: '1rem' }}>Service Unavailable</p>
            <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '1rem' }}>Course Temporarily Unavailable</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              We are having trouble reaching our servers. Please try again in a moment or contact us directly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/courses" className="btn btn-ghost" style={{ textDecoration: 'none' }}>← All Courses</Link>
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

  const courseSchema = getCourseSchema({
    title: course.title,
    slug: course.slug,
    tagline: course.subtitle ?? '',
    price: course.fee ? formatFee(course.fee) : 'Contact us',
    duration: course.duration ?? '',
    overview: course.description ?? '',
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: course.title, path: `/courses/${course.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontFamily: 'var(--font-h)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/courses" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Courses</Link>
          <span>/</span>
          <span style={{ color: '#D8A027' }}>{course.title}</span>
        </div>

        {/* Hero Image */}
        <div className="course-hero-image-wrap">
          <img src={image} alt={course.title} className="course-hero-image" />
          <div className="course-hero-overlay" />
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.6fr 1fr', gap: '4rem' }}>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.08)', color: '#DB241E' }}>
                📍 {batch}
              </span>
              <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', textTransform: 'uppercase', marginTop: '1.5rem', lineHeight: '1.1' }}>
                {course.title}
              </h1>
              <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '100%' }}>
                {course.description ?? course.subtitle ?? ''}
              </p>
            </div>

            {/* Curriculum Subjects */}
            {subjects.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  Curriculum Subjects
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {subjects.map((subj, i) => (
                    <div key={i} style={{ background: '#00162e', borderLeft: '3px solid #DB241E', padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {subj}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Program Highlights */}
            {highlights.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  Program Highlights
                </h2>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {highlights.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Eligibility Requirements */}
            {(course.eligibility || course.slug === 'cabin-crew') && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 800, color: '#D8A027', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  Eligibility Requirements
                </h2>
                <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                  {course.slug === 'cabin-crew' ? '12th pass or above, 18–27 years of age, basic English ability' : course.eligibility}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '120px' }}>

              {/* Fee Card */}
              <div style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.08)', padding: '2rem', borderRadius: '1px', textAlign: 'center' }}>
                {course.duration && (
                  <>
                    <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>
                      Total Program Duration
                    </span>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem' }}>
                      ⏱️ {course.duration}
                    </div>
                  </>
                )}

                <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>
                  Course Tuition Fee
                </span>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', fontWeight: 900, color: '#D8A027', letterSpacing: '0.02em' }}>
                  {course.slug === 'cabin-crew' ? '₹30K–₹54K' : (course.fee ? formatFee(course.fee) : 'Contact us')}
                </div>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.5rem' }}>
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
