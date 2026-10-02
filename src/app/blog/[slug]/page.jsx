import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { fetchPublic } from '@/lib/adminApi'

export const revalidate = 60

async function loadPost(slug) {
  const post = await fetchPublic('/blogs', { slug })
  return post && typeof post === 'object' && !Array.isArray(post) ? post : null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) return { title: 'Article not found | Airborne Aviation' }
  return {
    title: post.seoTitle ?? `${post.title} | Airborne Aviation`,
    description: post.seoDesc ?? post.description ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

/** Admin-published blog Resources that have no hand-built page of their own. */
export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) notFound()

  const body = typeof post.metadata?.body === 'string' && post.metadata.body.trim() ? post.metadata.body : post.description ?? ''
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const link = post.isGated ? null : post.externalUrl || post.fileUrl || null

  return (
    <>
      <Header />
      <main className="theme-light" style={{ minHeight: '80vh', background: 'var(--paper)', padding: '5rem var(--margin) 6rem' }}>
        <article className="container-xl" style={{ maxWidth: '760px' }} data-testid="blog-post">
          <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title }]} />
          <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginTop: '1rem', color: 'var(--navy)' }}>
            {post.title}
          </h1>
          <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: 0, color: 'rgba(33,33,33,0.8)', lineHeight: 1.75 }}>{p}</p>
            ))}
          </div>
          {link && (
            <p style={{ marginTop: '2rem' }}>
              <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open resource</a>
            </p>
          )}
          {post.isGated && (
            <p style={{ marginTop: '2rem' }}>
              <Link href="/resources" className="btn btn-primary">Get this resource</Link>
            </p>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
