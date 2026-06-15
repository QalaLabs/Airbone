import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { fetchPublic, formatFee } from '@/lib/adminApi'

export const metadata = {
  title: 'Courses & Programs | Airborne Aviation Academy Delhi',
  description: 'Explore our aviation training disciplines in Dwarka, Delhi. Programs include DGCA CPL Ground School, Cadet Pilot preparation, Airbus A320 SIM training, and Airline Prep.',
}

// Revalidate every 60 s so freshly published courses appear quickly
export const revalidate = 60

export default async function CoursesPage() {
  const courses = await fetchPublic('/courses', { limit: 20 }) ?? []

  const flagship = courses.find((c) => c.metadata?.flagship === true) ?? courses[0] ?? null
  const supporting = flagship ? courses.filter((c) => c.id !== flagship.id) : []

  // Helper: pull extra display fields from metadata JSON
  const meta = (course, key, fallback = null) =>
    course?.metadata?.[key] ?? fallback

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Header Hero Section */}
        <div style={{ maxWidth: '800px', marginBottom: '3.5rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Academy Syllabus</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Course Portfolio &amp;
            <em style={{ color: '#D8A027', fontStyle: 'normal' }}> Flight Paths.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.02rem', lineHeight: '1.6', maxWidth: '100%' }}>
            From absolute beginner ground training to advanced jet type readiness, our disciplines are structured to build conceptual clarity and meet strict DGCA requirements.
          </p>
        </div>

        {/* Empty state */}
        {courses.length === 0 && (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#00162e', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '1rem' }}>
              Course catalog is being updated.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>
              Contact us at <a href="tel:+919953777320" style={{ color: '#D8A027' }}>+91 9953-777-320</a> for current batch information.
            </p>
          </div>
        )}

        {/* Flagship Program */}
        {flagship && (
          <div
            className="cpl-hero-banner"
            style={{
              borderRadius: '1px',
              padding: '3rem var(--margin)',
              marginBottom: '5rem',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div className="cpl-badge-ribbon">FLAGSHIP</div>

            {/* Left Info Column */}
            <div>
              <span className="badge" style={{ borderColor: '#DB241E', background: 'rgba(219,36,30,0.12)', color: '#DB241E', marginBottom: '1.25rem' }}>
                ⭐ {meta(flagship, 'batch', 'Next batch — contact us')}
              </span>
              <h2 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.1' }}>
                {flagship.title}
              </h2>
              <p style={{ fontSize: '0.98rem', color: '#D8A027', fontWeight: 700, margin: '1rem 0 1.5rem 0', letterSpacing: '0.05em' }}>
                {flagship.subtitle ?? meta(flagship, 'tagline', '')}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', marginBottom: '2rem' }}>
                {flagship.description ?? ''}
              </p>

              {/* Subjects from curriculum */}
              {Array.isArray(flagship.curriculum) && flagship.curriculum.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: '1rem' }}>
                    Core Program Syllabus
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {flagship.curriculum.map((m) => (
                      <div key={m.module} style={{ background: '#000f1e', borderLeft: '2px solid #DB241E', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 600 }}>
                        ✓ {m.module}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {flagship.fee && (
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Tuition Fee</span>
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 900, color: '#D8A027' }}>
                      {formatFee(flagship.fee)}
                    </span>
                  </div>
                )}
                <div>
                  <Link href={`/courses/${flagship.slug}`} className="btn btn-ghost" style={{ padding: '0.9rem 2rem', textDecoration: 'none' }}>
                    Detailed Curriculum →
                  </Link>
                </div>
              </div>
            </div>

            {/* Image */}
            {meta(flagship, 'image') && (
              <div className="cpl-banner-image-wrap">
                <img src={meta(flagship, 'image')} alt={flagship.title} className="cpl-banner-image" />
              </div>
            )}

            {/* Lead Form */}
            <div>
              <LeadForm courseName={flagship.title} source="Flagship Featured Banner" />
            </div>
          </div>
        )}

        {/* Supporting Courses */}
        {supporting.length > 0 && (
          <>
            <div style={{ marginBottom: '2.5rem' }}>
              <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Supporting Programs</p>
              <h2 className="ov-h2" style={{ marginTop: '0.5rem' }}>Simulator &amp; Cadet Preparation Packages</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {supporting.map((course) => (
                <div
                  key={course.id}
                  style={{
                    background: '#00162e',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '1px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                  }}
                >
                  {meta(course, 'image') && (
                    <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
                      <img
                        src={meta(course, 'image')}
                        alt={course.title}
                        className="course-card-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D8A027', fontWeight: 700 }}>
                          {course.duration ?? ''}
                        </span>
                        {meta(course, 'availability') && (
                          <span className="badge" style={{ fontSize: '0.55rem', padding: '0.2rem 0.5rem', margin: 0, borderColor: 'rgba(216,160,39,0.4)', background: 'rgba(216,160,39,0.05)', color: '#D8A027' }}>
                            {meta(course, 'availability')}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.8rem', textTransform: 'uppercase', lineHeight: '1.3' }}>
                        {course.title}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        {course.subtitle ?? ''}
                      </p>
                    </div>

                    <div>
                      {course.fee && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Tuition Rate</span>
                          <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {formatFee(course.fee)}
                          </span>
                        </div>
                      )}

                      <Link
                        href={`/courses/${course.slug}`}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', textDecoration: 'none', textAlign: 'center', display: 'block' }}
                      >
                        View Curriculum →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </main>
      <Footer />
    </>
  )
}
