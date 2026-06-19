import { fetchPublic } from '@/lib/adminApi'

export default async function sitemap() {
  const baseUrl = 'https://airborneaviation.in'

  const staticRoutes = ['', '/about', '/courses', '/jobs', '/resources', '/contact'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  let courseRoutes = []
  try {
    const courses = await fetchPublic('/courses', { limit: 100 })
    if (Array.isArray(courses)) {
      courseRoutes = courses.map((course) => {
        const canonicalSlug = course.slug === 'cpl-ground-classes' ? 'commercial-pilot-license-cpl' : (course.slug === 'flying-training' ? 'flying-training-india-abroad' : course.slug)
        return {
          url: `${baseUrl}/courses/${canonicalSlug}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.7,
        }
      })
    }
  } catch {
    // Admin API unavailable — sitemap still generates with static routes only
  }

  return [...staticRoutes, ...courseRoutes]
}
