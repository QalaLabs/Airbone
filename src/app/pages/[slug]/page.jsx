import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import CmsPageContent from '@/components/cms/CmsPageContent'
import { fetchPublicWithStatus } from '@/lib/adminApi'
import { safeMediaSrc } from '@/lib/cms/safeContent'

export const revalidate = 60

const SLUG_RE = /^[a-z0-9-]{1,255}$/

/**
 * Published CMS page by slug. The admin public API only returns PUBLISHED pages
 * of the public website organization; anything else is a 404. An unreachable
 * admin is an error (never a cached 404).
 */
async function loadPage(slug) {
  if (!SLUG_RE.test(slug)) return null
  const { data, status } = await fetchPublicWithStatus('/pages', { slug })
  if (status !== 200) throw new Error(`CMS pages unavailable (status ${status})`)
  return data && typeof data === 'object' && !Array.isArray(data) ? data : null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const page = await loadPage(slug).catch(() => null)
  if (!page) return { title: 'Page not found | Airborne Aviation' }
  const image = safeMediaSrc(page.ogImage)
  return {
    title: page.seoTitle || `${page.title} | Airborne Aviation`,
    description: page.seoDesc || page.description || undefined,
    keywords: Array.isArray(page.seoKeywords) && page.seoKeywords.length ? page.seoKeywords : undefined,
    alternates: { canonical: `/pages/${page.slug}` },
    openGraph: image ? { images: [image] } : undefined,
  }
}

export default async function CmsPage({ params }) {
  const { slug } = await params
  const page = await loadPage(slug)
  if (!page) notFound()

  return (
    <>
      <Header />
      <main className="theme-light" style={{ minHeight: '80vh', background: 'var(--paper)', padding: '5rem var(--margin) 6rem' }}>
        <article className="container-xl" style={{ maxWidth: '860px' }} data-testid="cms-page">
          <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: page.title }]} />
          <h1 className="ov-h1" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginTop: '1rem', color: 'var(--navy)' }}>
            {page.title}
          </h1>
          {page.description ? <p style={{ marginTop: '1rem', color: 'rgba(33,33,33,0.7)', lineHeight: 1.7 }}>{page.description}</p> : null}
          <CmsPageContent page={page} />
        </article>
      </main>
      <Footer />
    </>
  )
}
