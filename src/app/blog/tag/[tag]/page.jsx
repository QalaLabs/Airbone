import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { fetchPublic } from '@/lib/adminApi'
import { mergeBlogPosts } from '@/lib/cms/blogCatalog.js'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { tag } = await params
  const cleanTag = decodeURIComponent(tag || '').toLowerCase().replace(/[^a-z0-9-]/g, '')
  return {
    title: `${cleanTag.toUpperCase()} Guides | Airborne Aviation`,
    description: `Browse all articles, guides and study resources tagged with ${cleanTag} from Airborne Aviation Academy.`,
    alternates: { canonical: `/blog/tag/${cleanTag}` },
  }
}

export default async function BlogTagPage({ params }) {
  const { tag } = await params
  const cleanTag = decodeURIComponent(tag || '').toLowerCase().replace(/[^a-z0-9-]/g, '')

  const apiBlogs = await fetchPublic('/blogs', { limit: 100 })
  const allPosts = mergeBlogPosts(Array.isArray(apiBlogs) ? apiBlogs : [])

  const matchingPosts = allPosts.filter((post) => {
    return Array.isArray(post.tags) && post.tags.some((t) => {
      const normalized = String(t).toLowerCase().replace(/[^a-z0-9-]/g, '')
      return normalized === cleanTag
    })
  })

  return (
    <>
      <Header />
      <main className="theme-light" style={{ minHeight: '80vh', background: 'var(--paper)', padding: '5rem var(--margin) 6rem' }}>
        <div className="container-xl" style={{ maxWidth: '960px' }}>
          <Breadcrumb
            items={[
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: `#${cleanTag}` },
            ]}
          />

          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start', color: 'var(--red)' }}>
            Tag Archive
          </p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginTop: '0.75rem', color: 'var(--navy)' }}>
            Articles tagged <span style={{ color: 'var(--red)' }}>#{cleanTag}</span>
          </h1>

          <p style={{ marginTop: '0.75rem', color: 'rgba(33,33,33,0.65)', maxWidth: '40rem', lineHeight: 1.7 }}>
            Showing {matchingPosts.length} published {matchingPosts.length === 1 ? 'article' : 'articles'} in this topic.
          </p>

          <div style={{ marginTop: '2.5rem' }}>
            {matchingPosts.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#fff', borderRadius: '6px', border: '1px solid rgba(0,39,76,0.08)' }}>
                <p style={{ margin: 0, color: 'rgba(33,33,33,0.6)', fontSize: '0.95rem' }}>
                  No published articles found for #{cleanTag}.
                </p>
                <Link
                  href="/blog"
                  style={{
                    display: 'inline-block',
                    marginTop: '1.25rem',
                    color: 'var(--navy)',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                  }}
                >
                  ← Return to all articles
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {matchingPosts.map((post) => {
                  const formattedDate = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : null

                  return (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      style={{
                        display: 'block',
                        background: '#fff',
                        border: '1px solid rgba(0,39,76,0.08)',
                        borderRadius: '6px',
                        padding: '1.75rem 2rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(0,39,76,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--red, #DB241E)',
                            background: 'rgba(219,36,30,0.06)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                          }}
                        >
                          {post.category}
                        </span>
                        {formattedDate && (
                          <span style={{ fontSize: '0.78rem', color: 'rgba(33,33,33,0.5)' }}>
                            {formattedDate}
                          </span>
                        )}
                        {post.readTime && (
                          <span style={{ fontSize: '0.78rem', color: 'rgba(33,33,33,0.45)' }}>
                            • {post.readTime}
                          </span>
                        )}
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-h)',
                          fontSize: '1.25rem',
                          color: 'var(--navy, #00274C)',
                          fontWeight: 800,
                          lineHeight: 1.35,
                        }}
                      >
                        {post.title}
                      </h2>

                      <p style={{ margin: '0.65rem 0 0', color: 'rgba(33,33,33,0.7)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                        {post.excerpt}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ marginTop: '3rem' }}>
            <Link
              href="/blog"
              style={{
                color: 'var(--navy)',
                fontWeight: 700,
                textDecoration: 'underline',
                fontSize: '0.9rem',
              }}
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
