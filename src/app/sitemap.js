import { fetchPublic } from '@/lib/adminApi'

const STATIC_COURSE_SLUGS = [
  'cpl-ground-classes',
  'atpl',
  'cadet-preparation',
  'a320-simulator',
  'cas-compass-adapt',
  'airline-preparation',
  'flying-training-india-abroad',
  'cabin-crew',
]

export default async function sitemap() {
  const baseUrl = 'https://www.airborneaviation.in'

  const staticRoutes = [
    '', '/about', '/courses', '/jobs', '/resources', '/contact',
    '/privacy', '/terms', '/dgca-compliance',
    '/blog/how-to-become-pilot-india',
    '/blog/pilot-salary-india',
    '/blog/dgca-ground-school-guide',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }))


  const staticCourseRoutes = STATIC_COURSE_SLUGS.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  let dynamicCourseRoutes = []
  try {
    const courses = await fetchPublic('/courses', { limit: 100 })
    if (Array.isArray(courses)) {
      const staticSlugs = new Set(STATIC_COURSE_SLUGS)
      dynamicCourseRoutes = courses
        .map((course) => {
          const slug = course.slug === 'cpl-ground-classes' ? 'commercial-pilot-license-cpl'
            : course.slug === 'flying-training' ? 'flying-training-india-abroad'
            : course.slug
          return slug
        })
        .filter((slug) => !staticSlugs.has(slug))
        .map((slug) => ({
          url: `${baseUrl}/courses/${slug}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
    }
  } catch {
    // Admin API unavailable — sitemap generates with static routes only
  }

  return [...staticRoutes, ...staticCourseRoutes, ...dynamicCourseRoutes]
}
