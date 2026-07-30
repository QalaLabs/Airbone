/**
 * Shared course page reviews (1–3) + optional parent testimonial block.
 */
export const DEFAULT_COURSE_REVIEWS = [
  {
    name: 'Arjun Mehta',
    role: 'CPL Ground School · 2024',
    quote: 'Capt. Navrang made Air Navigation finally click. Mock papers felt exactly like the DGCA session.',
  },
  {
    name: 'Sneha Reddy',
    role: 'Parent · Cadet Aspirant',
    quote: 'As a parent, weekly reports and honest counselling gave us clarity before we spent on flying hours.',
  },
  {
    name: 'Capt. Nipun Singh',
    role: 'Alumnus · Air India',
    quote: 'The discipline and viva drills at Airborne stayed with me through airline selection.',
  },
]

export const PARENT_TESTIMONIALS = [
  {
    name: 'Mrs. Sharma',
    role: 'Parent of CPL student',
    quote: 'Airborne treated our son like family. Capt. Navrang Sir explained every DGCA paper in language we understood - and the progress messages kept us calm.',
  },
  {
    name: 'Mr. Kapoor',
    role: 'Parent · Cadet pathway',
    quote: 'Transparent fees, clear timelines in months, and Capt. Navrang’s mentorship - that combination sold us.',
  },
]

export default function CourseReviews({ reviews = DEFAULT_COURSE_REVIEWS, title = 'Student & Parent Reviews' }) {
  const list = reviews.slice(0, 3)
  return (
    <section style={{ marginTop: '3.5rem', marginBottom: '2rem' }} aria-labelledby="course-reviews-heading">
      <h2 id="course-reviews-heading" style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1.25rem' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {list.map((r) => (
          <figure
            key={r.name + r.role}
            style={{
              margin: 0,
              background: '#fff',
              border: '1px solid rgba(0,39,76,0.08)',
              borderLeft: '3px solid var(--gold)',
              padding: '1.25rem',
              borderRadius: '2px',
            }}
          >
            <blockquote style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(33,33,33,0.75)' }}>
              “{r.quote}”
            </blockquote>
            <figcaption style={{ marginTop: '0.85rem', fontFamily: 'var(--font-h)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy)' }}>
              {r.name}
              <span style={{ display: 'block', marginTop: '0.2rem', fontWeight: 600, color: 'var(--red)', letterSpacing: '0.1em' }}>{r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
