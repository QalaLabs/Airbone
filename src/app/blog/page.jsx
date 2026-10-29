import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import BlogCategoryFilter from '@/components/cms/BlogCategoryFilter'
import { buildBlogIndexGraph } from '@/lib/schema'
import { fetchPublic } from '@/lib/adminApi'
import { mergeBlogPosts, CATEGORIES } from '@/lib/cms/blogCatalog.js'
import { DEFAULT_COURSE_REVIEWS, PARENT_TESTIMONIALS } from '@/components/CourseReviews'

export const metadata = {
  title: 'Aviation Blog - Pilot Training Guides | Airborne Aviation',
  description: 'Guides on becoming a pilot in India, CPL costs, DGCA ground school, and pilot salaries - from Airborne Aviation Academy, Dwarka Delhi.',
  alternates: { canonical: '/blog' },
}

export const revalidate = 60

const blogIndexGraph = buildBlogIndexGraph()

export default async function BlogIndexPage({ searchParams }) {
  const resolvedParams = await searchParams
  const initialCategory = resolvedParams?.category || 'All'

  // Fetch published CMS blogs from Admin API and merge with legacy articles
  const apiBlogs = await fetchPublic('/blogs', { limit: 100 })
  const posts = mergeBlogPosts(Array.isArray(apiBlogs) ? apiBlogs : [])

  // Canonical: Admin APPROVED testimonials; curated set only when the API is unavailable/empty.
  const apiReviews = await fetchPublic('/testimonials', { limit: 6 })
  const reviews = Array.isArray(apiReviews) && apiReviews.some((t) => t?.content)
    ? apiReviews
        .filter((t) => t?.content)
        .map((t) => ({
          name: t.authorName || 'Airborne Student',
          role: t.authorTitle || (t.batchYear ? `Batch ${t.batchYear}` : 'Student'),
          quote: t.content,
        }))
    : [...DEFAULT_COURSE_REVIEWS, ...PARENT_TESTIMONIALS]

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
            Practical guides for aspirants and parents — written from Dwarka training floor experience.
          </p>

          {/* Interactive Category Filter Pills and Unified Article Grid */}
          <BlogCategoryFilter
            categories={CATEGORIES}
            initialCategory={initialCategory}
            posts={posts}
          />

          <section style={{ marginTop: '4rem' }} aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" style={{ fontFamily: 'var(--font-h)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Student &amp; Parent Reviews
            </h2>
            <p style={{ margin: '0 0 1.5rem', color: 'rgba(33,33,33,0.65)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              What students and their parents say about training and counselling at Airborne.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {reviews.map((r, i) => (
                <figure
                  key={`${r.name}-${i}`}
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
