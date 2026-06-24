import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import { fetchPublic, formatFee } from '@/lib/adminApi'

export const metadata = {
  title: 'Aviation Courses Delhi | CPL - ATPL - Cabin Crew | Airborne',
  description: 'Browse all DGCA-approved aviation courses at Airborne Aviation Academy, Dwarka Delhi. CPL ground school, ATPL, Cabin Crew, A320 SIM, cadet prep. Compare fees and eligibility.',
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
              Contact us at <a href="tel:+919953777320" style={{ color: '#D8A027' }}>+91 9953 777 320</a> for current batch information.
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
                <Link href={`/courses/${flagship.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {flagship.title}
                </Link>
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
                <Link href={`/courses/${flagship.slug}`} style={{ display: 'block' }}>
                  <img src={meta(flagship, 'image')} alt={flagship.title} className="cpl-banner-image" />
                </Link>
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
                    <Link
                      href={`/courses/${course.slug}`}
                      style={{ display: 'block', width: '100%', height: '160px', overflow: 'hidden' }}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <img
                        src={meta(course, 'image')}
                        alt={course.title}
                        className="course-card-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>
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
                        <Link href={`/courses/${course.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {course.title}
                        </Link>
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {course.subtitle ?? ''}
                      </p>

                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-b)', marginBottom: '1.5rem' }}>
                        <strong>Eligibility:</strong> {course.slug === 'cabin-crew' ? '12th pass, 18–27 yrs' : (course.eligibility || 'Class 12 or above')}
                      </p>
                    </div>

                    <div>
                      {course.fee && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Tuition Rate</span>
                          <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {course.slug === 'cabin-crew' ? '₹30K–₹54K' : formatFee(course.fee)}
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

        {/* Course Comparison Table */}
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>At a Glance</p>
            <h2 className="ov-h2" style={{ marginTop: '0.5rem', textTransform: 'uppercase' }}>All Courses at Airborne</h2>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .compare-row {
              transition: background 0.2s;
            }
            .compare-row:hover {
              background: rgba(216,160,39,0.08) !important;
            }
            .compare-course-link {
              color: inherit;
              text-decoration: none;
              border-bottom: 1px solid rgba(216,160,39,0.35);
              transition: color 0.2s, border-color 0.2s;
              cursor: pointer;
              outline: none;
              padding-bottom: 1px;
            }
            .compare-course-link:hover {
              color: #D8A027;
              border-color: #D8A027;
            }
            .compare-course-link:focus-visible {
              outline: 2px solid #D8A027;
              outline-offset: 3px;
              border-radius: 2px;
            }
          `}} />

          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1px', background: '#00162e', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.85rem', color: '#fff', fontFamily: 'var(--font-b)' }}>
              <thead>
                <tr style={{ background: '#000f1e', borderBottom: '2px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-h)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.15em', color: '#D8A027' }}>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Course</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Duration</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Min Eligibility</th>
                  <th style={{ padding: '1.2rem 1.5rem' }}>Est. Fee</th>
                  <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>DGCA Approved</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Commercial Pilot License (CPL)', slug: 'commercial-pilot-license-cpl', dur: '12–18 months', elig: '10+2 Phys+Maths, 17 yrs', fee: '₹45–55L',    dgca: '✓' },
                  { name: 'ATPL Ground School',             slug: 'atpl',                        dur: '4–6 months',   elig: 'CPL holder',               fee: '₹3–8L',     dgca: '✓' },
                  { name: 'Private Pilot License (PPL)',    slug: 'private-pilot-license',       dur: '3–6 months',   elig: '10+2, 16 yrs',             fee: '₹8–12L',    dgca: '✓' },
                  { name: 'Instrument Rating',              slug: 'instrument-rating',           dur: '2–3 months',   elig: 'PPL holder',               fee: '₹5–8L',     dgca: '✓' },
                  { name: 'Multi-Engine Rating',            slug: 'multi-engine-rating',         dur: '1–2 months',   elig: 'PPL/CPL holder',           fee: '₹3–5L',     dgca: '✓' },
                  { name: 'Airbus A320 Type Rating',        slug: 'a320-simulator',              dur: '2–4 months',   elig: 'CPL + 200 hrs',            fee: '₹8–15L',    dgca: '✓' },
                  { name: 'DGCA Ground School',             slug: 'ground-school',               dur: '3–6 months',   elig: 'Any',                      fee: '₹2,70,000', dgca: '✓' },
                  { name: 'Cabin Crew Training',            slug: 'cabin-crew-training',         dur: '3–6 months',   elig: '12th pass, 18–27 yrs',     fee: '₹30K–₹54K', dgca: '—' },
                  { name: 'Aviation English (ICAO L4)',     slug: 'aviation-english-icao',       dur: '1–3 months',   elig: 'Any',                      fee: '₹50K–1L',   dgca: '—' },
                  { name: 'Flight Dispatcher',              slug: 'flight-dispatcher',           dur: '3–6 months',   elig: '10+2',                     fee: '₹1–2L',     dgca: '—' },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className="compare-row"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700, color: '#fff' }}>
                      {row.slug ? (
                        <Link href={`/courses/${row.slug}`} className="compare-course-link">
                          {row.name}
                        </Link>
                      ) : row.name}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>{row.dur}</td>
                    <td style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.8)' }}>{row.elig}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700, color: '#D8A027' }}>{row.fee}</td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontWeight: 900, color: row.dgca === '✓' ? '#DB241E' : 'rgba(255,255,255,0.3)', fontSize: row.dgca === '✓' ? '1.1rem' : '0.9rem' }}>{row.dgca}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
