import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import RichText from '@/components/cms/RichText'
import { fetchPublic } from '@/lib/adminApi'
import { safeMediaSrc } from '@/lib/cms/safeContent'
import { buildArticlePageGraph } from '@/lib/schema'
import {
  LEGACY_POSTS,
  AUTHORS,
  mergeBlogPosts,
  getRelatedPosts,
  calculateReadingTime,
} from '@/lib/cms/blogCatalog.js'
import { extractTableOfContents } from '@/lib/cms/toc.js'

export const revalidate = 60

async function loadPost(slug) {
  const apiPost = await fetchPublic('/blogs', { slug })
  if (apiPost && typeof apiPost === 'object' && !Array.isArray(apiPost)) {
    const meta = apiPost.metadata && typeof apiPost.metadata === 'object' ? apiPost.metadata : {}
    const bodyHtml = typeof meta.bodyHtml === 'string' ? meta.bodyHtml.trim() : ''
    const body = typeof meta.body === 'string' && meta.body.trim() ? meta.body : apiPost.description ?? ''
    const authorName = typeof meta.author === 'string' && meta.author.trim() ? meta.author.trim() : 'Capt. Navrang Singh'
    const readTime = meta.readTime || calculateReadingTime(bodyHtml || body)

    return {
      slug: apiPost.slug,
      title: apiPost.title,
      seoTitle: apiPost.seoTitle || apiPost.title,
      seoDesc: apiPost.seoDesc || apiPost.description,
      description: apiPost.description,
      excerpt: apiPost.description || 'Read the full guide.',
      category: apiPost.category || meta.category || 'Pilot Training',
      tags: Array.isArray(apiPost.tags) ? apiPost.tags : [],
      author: authorName,
      body,
      bodyHtml,
      thumbnailUrl: apiPost.thumbnailUrl,
      thumbnailAlt: meta.featuredImageAlt || apiPost.thumbnailAlt || apiPost.title,
      publishedAt: apiPost.publishedAt || apiPost.createdAt,
      updatedAt: apiPost.updatedAt || apiPost.publishedAt || apiPost.createdAt,
      readTime,
      isGated: apiPost.isGated,
      fileUrl: apiPost.fileUrl,
      externalUrl: apiPost.externalUrl,
      faqs: Array.isArray(apiPost.faqs) ? apiPost.faqs : [],
    }
  }

  const legacy = LEGACY_POSTS.find((p) => p.slug === slug)
  if (legacy) {
    return {
      ...legacy,
      body: legacy.excerpt,
      bodyHtml: '',
      isGated: false,
    }
  }

  return null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) return { title: 'Article not found | Airborne Aviation' }

  const image = safeMediaSrc(post.thumbnailUrl) || 'https://www.airborneaviation.in/campus/og_image.jpg'
  const canonicalUrl = `/blog/${post.slug}`
  const publishedTime = post.publishedAt || post.createdAt
  const modifiedTime = post.updatedAt || publishedTime

  return {
    title: post.seoTitle ?? `${post.title} | Airborne Aviation`,
    description: post.seoDesc ?? post.excerpt ?? post.description ?? undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: post.seoTitle ?? post.title,
      description: post.seoDesc ?? post.excerpt ?? post.description,
      url: `https://www.airborneaviation.in${canonicalUrl}`,
      publishedTime,
      modifiedTime,
      authors: [post.author || 'Capt. Navrang Singh'],
      images: [{ url: image, alt: post.thumbnailAlt || post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle ?? post.title,
      description: post.seoDesc ?? post.excerpt ?? post.description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) notFound()

  // Fetch all articles for related post suggestions
  const apiBlogs = await fetchPublic('/blogs', { limit: 100 })
  const allPosts = mergeBlogPosts(Array.isArray(apiBlogs) ? apiBlogs : [])
  const relatedPosts = getRelatedPosts(post.slug, post.category, post.tags, allPosts)

  const thumbnailUrl = safeMediaSrc(post.thumbnailUrl)
  const paragraphs = post.body ? post.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : []
  const link = post.isGated ? null : post.externalUrl || post.fileUrl || null

  const plainBody = (
    <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ margin: 0, color: 'rgba(33,33,33,0.85)', lineHeight: 1.75 }}>
          {p}
        </p>
      ))}
    </div>
  )

  // Extract headings for Table of Contents
  const toc = post.bodyHtml ? extractTableOfContents(post.bodyHtml) : []

  // Resolve author profile
  const authorInfo = AUTHORS[post.author] || {
    name: post.author,
    role: 'Aviation Expert',
    bio: 'Instructor and aviation specialist at Airborne Aviation Academy.',
    imagePath: '/team/navrang_portrait.jpg',
  }

  // Format dates
  const publishDateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  const updatedDateStr = post.updatedAt && post.updatedAt !== post.publishedAt
    ? new Date(post.updatedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  // Build JSON-LD structured data
  const jsonLdGraph = buildArticlePageGraph({
    path: `/blog/${post.slug}`,
    headline: post.title,
    description: post.seoDesc || post.excerpt || post.description || '',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    imagePath: thumbnailUrl || '/campus/og_image.jpg',
    author: post.author,
    faqs: Array.isArray(post.faqs) && post.faqs.length ? post.faqs : undefined,
  })

  return (
    <>
      <JsonLd data={jsonLdGraph} />
      <Header />
      <main className="theme-light" style={{ minHeight: '80vh', background: 'var(--paper)', padding: '5rem var(--margin) 6rem' }}>
        <article className="container-xl" style={{ maxWidth: '780px', margin: '0 auto' }} data-testid="blog-post">
          <Breadcrumb
            items={[
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: post.title },
            ]}
          />

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--red, #DB241E)',
                background: 'rgba(219,36,30,0.06)',
                padding: '0.2rem 0.65rem',
                borderRadius: '4px',
              }}
            >
              {post.category}
            </span>
            {publishDateStr && (
              <span style={{ fontSize: '0.82rem', color: 'rgba(33,33,33,0.55)' }}>
                Published: {publishDateStr}
              </span>
            )}
            {updatedDateStr && (
              <span style={{ fontSize: '0.82rem', color: 'rgba(33,33,33,0.45)' }}>
                (Updated: {updatedDateStr})
              </span>
            )}
            {post.readTime && (
              <span style={{ fontSize: '0.82rem', color: 'rgba(33,33,33,0.45)' }}>
                • {post.readTime}
              </span>
            )}
          </div>

          <h1
            className="ov-h1"
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              marginTop: '1rem',
              color: 'var(--navy, #00274C)',
              lineHeight: 1.25,
              fontWeight: 800,
            }}
          >
            {post.title}
          </h1>

          {/* Author Byline Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              marginTop: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid rgba(0,39,76,0.1)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy)' }}>
                By {authorInfo.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(33,33,33,0.6)' }}>
                {authorInfo.role}
              </p>
            </div>
          </div>

          {/* Featured Hero Image */}
          {thumbnailUrl && (
            <div style={{ marginTop: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,39,76,0.08)' }}>
              <img
                src={thumbnailUrl}
                alt={post.thumbnailAlt || post.title}
                fetchPriority="high"
                loading="eager"
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          )}

          {/* Table of Contents for Long Articles */}
          {toc.length >= 2 && (
            <nav
              aria-label="Table of contents"
              style={{
                marginTop: '2.5rem',
                background: '#fff',
                border: '1px solid rgba(0,39,76,0.1)',
                borderLeft: '4px solid var(--navy)',
                borderRadius: '6px',
                padding: '1.25rem 1.5rem',
              }}
            >
              <h2
                style={{
                  margin: '0 0 0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--navy)',
                }}
              >
                Table of Contents
              </h2>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', listStyleType: 'decimal' }}>
                {toc.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      marginBottom: '0.45rem',
                      marginLeft: item.level === 3 ? '1rem' : '0',
                    }}
                  >
                    <a
                      href={`#${item.id}`}
                      style={{
                        color: 'var(--navy)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: item.level === 2 ? 600 : 400,
                      }}
                      className="toc-link"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Article Body */}
          <div style={{ marginTop: '2.5rem' }}>
            {post.bodyHtml ? (
              <RichText html={post.bodyHtml} fallback={plainBody} />
            ) : (
              plainBody
            )}
          </div>

          {/* Resource Download / Link Button if Applicable */}
          {link && (
            <p style={{ marginTop: '2.5rem' }}>
              <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Open resource
              </a>
            </p>
          )}
          {post.isGated && (
            <p style={{ marginTop: '2.5rem' }}>
              <Link href="/resources" className="btn btn-primary">
                Get this resource
              </Link>
            </p>
          )}

          {/* Article Tags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                marginTop: '3.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(0,39,76,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)' }}>
                Tags:
              </span>
              {post.tags.map((t) => {
                const tagSlug = String(t).toLowerCase().replace(/[^a-z0-9-]/g, '')
                return (
                  <Link
                    key={t}
                    href={`/blog/tag/${tagSlug}`}
                    style={{
                      fontSize: '0.78rem',
                      background: 'rgba(0,39,76,0.05)',
                      color: 'var(--navy)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      border: '1px solid rgba(0,39,76,0.08)',
                    }}
                  >
                    #{t}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Author Biography Footer Card */}
          <div
            style={{
              marginTop: '2.5rem',
              background: '#fff',
              border: '1px solid rgba(0,39,76,0.1)',
              borderRadius: '8px',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>
                About {authorInfo.name}
              </p>
              <p style={{ margin: '0.2rem 0 0.6rem', fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600 }}>
                {authorInfo.role}
              </p>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(33,33,33,0.75)', lineHeight: 1.65 }}>
                {authorInfo.bio}
              </p>
            </div>
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '2px solid rgba(0,39,76,0.08)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  marginBottom: '1.25rem',
                }}
              >
                Related Articles
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {relatedPosts.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    style={{
                      display: 'block',
                      background: '#fff',
                      border: '1px solid rgba(0,39,76,0.08)',
                      borderRadius: '6px',
                      padding: '1.25rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--red)' }}>
                      {r.category}
                    </span>
                    <h3
                      style={{
                        margin: '0.5rem 0',
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: 'var(--navy)',
                        lineHeight: 1.4,
                      }}
                    >
                      {r.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(33,33,33,0.65)', lineHeight: 1.5 }}>
                      {r.excerpt?.slice(0, 90)}...
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div style={{ marginTop: '3.5rem' }}>
            <Link href="/blog" style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'underline', fontSize: '0.92rem' }}>
              ← Back to all articles
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
