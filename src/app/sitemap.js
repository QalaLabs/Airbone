import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
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
  'private-pilot-license',
]

// Offline fallback for the seeded blog Resources (slugs match their route folders).
const FALLBACK_BLOG_SLUGS = [
  'how-to-become-pilot-india',
  'pilot-salary-india',
  'dgca-ground-school-guide',
  'pilot-training-cost-india',
]

const STATIC_ROUTE_DEFS = [
  { route: '', file: 'src/app/page.jsx', priority: 1.0 },
  { route: '/about', file: 'src/app/about/page.jsx', priority: 0.8 },
  { route: '/courses', file: 'src/app/courses/page.jsx', priority: 0.8 },
  { route: '/jobs', file: 'src/app/jobs/page.jsx', priority: 0.8 },
  { route: '/resources', file: 'src/app/resources/page.jsx', priority: 0.8 },
  { route: '/contact', file: 'src/app/contact/page.jsx', priority: 0.8 },
  { route: '/privacy', file: 'src/app/privacy/page.jsx', priority: 0.8 },
  { route: '/terms', file: 'src/app/terms/page.jsx', priority: 0.8 },
  { route: '/dgca-compliance', file: 'src/app/dgca-compliance/page.jsx', priority: 0.8 },
  { route: '/refund-policy', file: 'src/app/refund-policy/page.jsx', priority: 0.8 },
  { route: '/blog', file: 'src/app/blog/page.jsx', priority: 0.8 },
  { route: '/webinar', file: 'public/webinar/page.html', priority: 0.85 },
]

const DATE_CACHE = new Map()
const BUILD_DATE = new Date().toISOString()

function getGitOrFileDate(relPath) {
  if (!relPath) return null
  if (DATE_CACHE.has(relPath)) {
    return DATE_CACHE.get(relPath)
  }

  const normalized = relPath.replace(/\\/g, '/')
  const fullPath = path.join(process.cwd(), normalized)

  // 1. Try Git commit date for the exact route file
  try {
    const gitDate = execSync(`git log -1 --format=%cI -- "${normalized}"`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 3000,
    }).trim()

    if (gitDate) {
      const parsed = new Date(gitDate)
      if (!isNaN(parsed.getTime())) {
        const iso = parsed.toISOString()
        DATE_CACHE.set(relPath, iso)
        return iso
      }
    }
  } catch {
    // Git unavailable or file untracked
  }

  // 2. Fall back to filesystem mtime
  try {
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath)
      const mtime = stat.mtime.toISOString()
      DATE_CACHE.set(relPath, mtime)
      return mtime
    }
  } catch {
    // Filesystem error
  }

  return null
}

function getRouteLastMod(filePath, fallbackDate = null) {
  const fileDate = getGitOrFileDate(filePath)
  if (fileDate) return fileDate
  if (fallbackDate) {
    try {
      const parsed = new Date(fallbackDate)
      if (!isNaN(parsed.getTime())) return parsed.toISOString()
    } catch {
      // fallback parsing failed
    }
  }
  return BUILD_DATE
}

export default async function sitemap() {
  const baseUrl = 'https://www.airborneaviation.in'

  const staticRoutes = STATIC_ROUTE_DEFS.map(({ route, file, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: getRouteLastMod(file),
    changeFrequency: 'monthly',
    priority,
  }))

  const staticCourseRoutes = STATIC_COURSE_SLUGS.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: getRouteLastMod(`src/app/courses/${slug}/page.jsx`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  let dynamicCourseRoutes = []
  let blogRoutes = FALLBACK_BLOG_SLUGS.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: getRouteLastMod(`src/app/blog/${slug}/page.jsx`),
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
        .map((course) => ({
          slug:
            course.slug === 'cpl-ground-classes'
              ? 'commercial-pilot-license-cpl'
              : course.slug === 'flying-training'
                ? 'flying-training-india-abroad'
                : course.slug === 'cabin-crew'
                  ? 'cabin-crew-training'
                  : course.slug,
          publishedAt: course.publishedAt,
        }))
        .filter(({ slug }) => !staticSlugs.has(slug))
        .map(({ slug, publishedAt }) => ({
          url: `${baseUrl}/courses/${slug}`,
          lastModified: getRouteLastMod(
            `src/app/courses/${slug}/page.jsx`,
            publishedAt || getGitOrFileDate('src/app/courses/[slug]/page.jsx')
          ),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
    }

    if (Array.isArray(blogs)) {
      const seen = new Set()
      blogRoutes = blogs
        .map((blog) => ({
          slug: blog.slug ?? blog.id,
          publishedAt: blog.publishedAt,
        }))
        .filter(({ slug }) => slug && !seen.has(slug) && seen.add(slug))
        .map(({ slug, publishedAt }) => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: getRouteLastMod(
            `src/app/blog/${slug}/page.jsx`,
            publishedAt || getGitOrFileDate('src/app/blog/[slug]/page.jsx')
          ),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      if (blogRoutes.length === 0) {
        blogRoutes = FALLBACK_BLOG_SLUGS.map((slug) => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: getRouteLastMod(`src/app/blog/${slug}/page.jsx`),
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