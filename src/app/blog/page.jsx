import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { buildBlogIndexGraph } from '@/lib/schema'
import { DEFAULT_COURSE_REVIEWS, PARENT_TESTIMONIALS } from '@/components/CourseReviews'

export const metadata = {
  title: 'Aviation Blog - Pilot Training Guides | Airborne Aviation',
  description: 'Guides on becoming a pilot in India, CPL costs, DGCA ground school, and pilot salaries - from Airborne Aviation Academy, Dwarka Delhi.',
  alternates: { canonical: '/blog' },
}

const blogIndexGraph = buildBlogIndexGraph()

const POSTS = [
  {
    slug: 'how-to-become-pilot-india',
    title: 'How to Become a Pilot in India After Class 12',
    excerpt: 'Step-by-step roadmap from Class 12 to CPL - medicals, ground school, flying hours, and airline entry.',
  },
  {
    slug: 'pilot-training-cost-india',
    title: 'Pilot Training Cost in India - Full Breakdown',
    excerpt: 'Transparent cost ranges for ground school, flying training, medicals, and exams.',
  },
  {
    slug: 'dgca-ground-school-guide',
    title: 'DGCA Ground School Guide',
    excerpt: 'What DGCA CPL subjects cover, how long ground school takes, and how to prepare for first-attempt passes.',
  },
  {
    slug: 'pilot-salary-india',
    title: 'Pilot Salary in India',
    excerpt: 'Cadet to commander compensation bands across major Indian carriers.',
  },
]

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd data={blogIndexGraph} />
      <Header />
      <main className="theme-light" style={{ minHeight: '80vh', background: 'var(--paper)', padding: '5rem var(--margin) 6rem' }}>
        <div className="container-xl" style={{ maxWidth: '960px' }}>
          <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Blog' }]} />
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start', color: 'var(--red)' }}>Knowledge Base</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '1rem', textTransform: 'uppercase', color: 'var(--navy)' }}>
            Aviation <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Blog</em>
          </h1>
          <p style={{ marginTop: '1rem', color: 'rgba(33,33,33,0.65)', maxWidth: '40rem', lineHeight: 1.7 }}>
            Practical guides for aspirants and parents - written from Dwarka training floor experience.
          </p>

          <div style={{ display: 'grid', gap: '1.25rem', marginTop: '3rem' }}>
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  display: 'block',
                  background: '#fff',
                  border: '1px solid rgba(0,39,76,0.08)',
                  borderRadius: '4px',
                  padding: '1.5rem 1.75rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(0,39,76,0.04)',
                }}
              >
                <h2 style={{ margin: 0, fontFamily: 'var(--font-h)', fontSize: '1.15rem', color: 'var(--navy)', fontWeight: 800 }}>
                  {post.title}
                </h2>
                <p style={{ margin: '0.65rem 0 0', color: 'rgba(33,33,33,0.6)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>

          <section style={{ marginTop: '4rem' }} aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Student &amp; Parent Reviews
            </h2>
            <p style={{ margin: '0 0 1.5rem', color: 'rgba(33,33,33,0.65)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              What students and their parents say about training and counselling at Airborne.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {[...DEFAULT_COURSE_REVIEWS, ...PARENT_TESTIMONIALS].map((r) => (
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
        </div>
      </main>
      <Footer />
    </>
  )
}
