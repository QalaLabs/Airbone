import { fetchPublic } from '@/lib/adminApi'

const STATIC_COURSE_SLUGS = [
  'commercial-pilot-license-cpl',
  'atpl',
  'cadet-preparation',
  'a320-simulator',
  'cas-compass-adapt',
  'airline-preparation',
  'gd-pi',
  'flying-training-india-abroad',
  'securing-your-childs-future-in-aviation',
  'cabin-crew-training',
  'ground-school',
  'multi-engine-rating',
  'private-pilot-license',
  'aviation-english-icao',
]

// Offline fallback for the seeded blog Resources (slugs match their route folders).
const FALLBACK_BLOG_SLUGS = [
  'how-to-become-pilot-india',
  'pilot-salary-india',
  'dgca-ground-school-guide',
  'pilot-training-cost-india',
]

export default async function sitemap() {
  const baseUrl = 'https://www.airborneaviation.in'
  const now = new Date().toISOString()

  const staticRoutes = [
    '', '/about', '/courses', '/jobs', '/resources', '/contact',
    '/privacy', '/terms', '/dgca-compliance', '/refund-policy',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  const staticCourseRoutes = STATIC_COURSE_SLUGS.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  let dynamicCourseRoutes = []
  let blogRoutes = FALLBACK_BLOG_SLUGS.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  try {
    const [courses, blogs] = await Promise.all([
      fetchPublic('/courses', { limit: 100 }),
      fetchPublic('/blogs', { limit: 100 }),
    ])

    if (Array.isArray(courses)) {
      const staticSlugs = new Set(STATIC_COURSE_SLUGS)
      dynamicCourseRoutes = courses
        .map((course) =>
          course.slug === 'cpl-ground-classes' ? 'commercial-pilot-license-cpl'
            : course.slug === 'flying-training' ? 'flying-training-india-abroad'
            : course.slug === 'cabin-crew' ? 'cabin-crew-training'
            : course.slug
        )
        .filter((slug) => !staticSlugs.has(slug))
        .map((slug) => ({
          url: `${baseUrl}/courses/${slug}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
    }

    if (Array.isArray(blogs)) {
      const seen = new Set()
      blogRoutes = blogs
        .map((blog) => ({ slug: blog.slug ?? blog.id, publishedAt: blog.publishedAt }))
        .filter(({ slug }) => slug && !seen.has(slug) && seen.add(slug))
        .map(({ slug, publishedAt }) => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: publishedAt ? new Date(publishedAt).toISOString() : now,
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      if (blogRoutes.length === 0) {
        blogRoutes = FALLBACK_BLOG_SLUGS.map((slug) => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      }
    }
  } catch {
    // Admin API unavailable — sitemap generates with static routes only
  }

  return [...staticRoutes, ...staticCourseRoutes, ...dynamicCourseRoutes, ...blogRoutes]
}