import { COURSES } from '@/utils/coursesData'

export default async function sitemap() {
  const baseUrl = 'https://airborneaviation.in'

  // Static routes
  const staticRoutes = ['', '/about', '/courses', '/jobs', '/resources', '/contact'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic course routes
  const courseRoutes = COURSES.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...courseRoutes]
}
