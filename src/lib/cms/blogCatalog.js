// Canonical catalog and helper functions for Airborne Aviation Blog
// Unifies CMS-backed published articles and legacy articles.

export const AUTHORS = Object.freeze({
  'Capt. Navrang Singh': {
    name: 'Capt. Navrang Singh',
    role: 'Co-founder & Head Mentor',
    bio: 'Co-founder and Head Mentor at Airborne Aviation Academy. Flight instructor and aviation mentor with extensive airline training experience since 2009.',
    imagePath: '/team/navrang_portrait.jpg',
  },
  'Deepak Aggarwal': {
    name: 'Deepak Aggarwal',
    role: 'Co-founder & Business Head',
    bio: 'Co-founder and Business Head at Airborne Aviation Academy. Leads pilot career pathways, institutional partnerships, and student counselling.',
    imagePath: '/team/deepak_portrait.jpg',
  },
  'Airborne Editorial Team': {
    name: 'Airborne Editorial Team',
    role: 'Aviation Knowledge Team',
    bio: 'Expert aviation ground instructors, airline pilots, and career advisors at Airborne Aviation Academy, Dwarka Delhi.',
    imagePath: '/campus/og_image.jpg',
  },
})

export const CATEGORIES = Object.freeze([
  'All',
  'Pilot Training',
  'DGCA Exams',
  "Parents' Guide",
  'Cabin Crew',
])

export function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'Pilot Training'
  const c = cat.trim().toLowerCase()
  if (c.includes('dgca') || c.includes('exam')) return 'DGCA Exams'
  if (c.includes('parent')) return "Parents' Guide"
  if (c.includes('cabin') || c.includes('crew')) return 'Cabin Crew'
  return 'Pilot Training'
}

export function calculateReadingTime(content) {
  if (!content || typeof content !== 'string') return null
  // Strip HTML tags and collapse whitespace
  const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return null
  const words = clean.split(' ').filter(Boolean).length
  if (words === 0) return null
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

export const LEGACY_POSTS = Object.freeze([
  {
    slug: 'how-to-become-pilot-india',
    title: 'How to Become a Pilot in India After 12th - Step-by-Step 2026',
    seoTitle: 'How to Become a Pilot in India After 12th | 2026 Guide',
    seoDesc: 'Complete guide to becoming a commercial pilot in India after 12th: CPL eligibility, DGCA exams, flying hours, costs, and airline placement.',
    excerpt: 'Step-by-step roadmap from Class 12 to CPL - medicals, ground school, flying hours, and airline entry.',
    category: 'Pilot Training',
    tags: ['cpl', 'pilot-training', 'dgca', 'commercial-pilot', 'airline-preparation'],
    author: 'Capt. Navrang Singh',
    publishedAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    readTime: '8 min read',
    thumbnailUrl: '/campus/campus_reception_dwarka.jpg',
    thumbnailAlt: 'Airborne Aviation training centre reception Dwarka New Delhi',
    faqs: [
      { q: 'What subjects are required in Class 12 to become a pilot?', a: 'Physics and Mathematics are mandatory in Class 12 (10+2), with a minimum aggregate of 50% marks.' },
      { q: 'What is the minimum age to get a CPL in India?', a: 'You must be at least 18 years old at the time of applying for a CPL. You can begin your Student Pilot License (SPL) at 17.' },
      { q: 'How much does pilot training cost in India?', a: 'Total CPL training in India costs between ₹40–60 lakhs, including ground school (₹1–2L), flying fees, DGCA exam fees, and medical costs.' },
      { q: 'How long does it take to become a commercial pilot in India?', a: 'The complete CPL journey takes 18–36 months depending on flight school availability. Ground school typically runs 12–18 months in parallel.' },
    ],
  },
  {
    slug: 'pilot-training-cost-india',
    title: 'Pilot Training Cost in India 2026 - Complete CPL Fee Breakdown',
    seoTitle: 'Pilot Training Cost in India 2026 - Complete CPL Fee Breakdown',
    seoDesc: 'Complete breakdown of pilot training cost in India for 2026 - CPL ground school, flying hours, DGCA exam fees, medical, and total investment compared to training abroad.',
    excerpt: 'Transparent cost ranges for ground school, flying training, medicals, exams, and airline type ratings.',
    category: 'Pilot Training',
    tags: ['pilot-training-cost', 'cpl-cost', 'dgca-fees', 'flying-training-cost'],
    author: 'Capt. Navrang Singh',
    publishedAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    readTime: '6 min read',
    thumbnailUrl: '/campus/campus_classroom_dwarka.jpg',
    thumbnailAlt: 'Modern DGCA ground school classroom at Airborne Aviation Dwarka',
    faqs: [
      { q: 'What is the minimum budget required to start pilot training?', a: 'Ground school and initial medicals require an upfront commitment of ₹1.5L to ₹3L before flying training deposits are due.' },
      { q: 'Is flying training abroad cheaper than in India?', a: 'Hourly flying rates abroad can be more economical and weather allows faster hour-building, but living expenses and DGCA license conversion fees must be budgeted.' },
    ],
  },
  {
    slug: 'dgca-ground-school-guide',
    title: 'DGCA Ground School Guide - All Subjects, Exams & Prep Strategy 2026',
    seoTitle: 'DGCA Ground School Guide - All Subjects, Exams & Prep Strategy 2026',
    seoDesc: 'Complete DGCA ground school guide for CPL and ATPL aspirants. Covers all 6 exam subjects, exam schedule, pass criteria, preparation strategies, and common mistakes.',
    excerpt: 'What DGCA CPL subjects cover, how long ground school takes, and how to prepare for first-attempt passes.',
    category: 'DGCA Exams',
    tags: ['dgca-exams', 'ground-school', 'air-navigation', 'meteorology', 'air-regulations'],
    author: 'Capt. Navrang Singh',
    publishedAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    readTime: '10 min read',
    thumbnailUrl: '/campus/a320_simulator_bay.jpg',
    thumbnailAlt: 'Airborne Aviation cockpit simulator training bay',
    faqs: [
      { q: 'How many DGCA theory exams are required for CPL?', a: 'Candidates must clear 6 papers: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR (Aero).' },
      { q: 'What is the pass mark for DGCA exams?', a: 'The pass mark is 70% in each subject.' },
    ],
  },
  {
    slug: 'pilot-salary-india',
    title: 'Commercial Pilot Salary in India 2026 - First Officer to Captain Bands',
    seoTitle: 'Commercial Pilot Salary in India 2026 - First Officer to Captain Bands',
    seoDesc: 'Cadet to commander compensation bands across major Indian carriers, flight pay multipliers, allowances, and international career trajectory.',
    excerpt: 'Cadet to commander compensation bands across major Indian carriers, allowances, and salary growth.',
    category: 'Pilot Training',
    tags: ['pilot-salary', 'airline-jobs', 'first-officer', 'captain-salary'],
    author: 'Capt. Navrang Singh',
    publishedAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    readTime: '7 min read',
    thumbnailUrl: '/campus/student_lounge_dwarka.jpg',
    thumbnailAlt: 'Airborne Aviation student study and flight planning lounge',
    faqs: [
      { q: 'What is the starting salary of a First Officer in India?', a: 'Starting compensation for Junior First Officers typically ranges between ₹1.2 Lakh to ₹2.5 Lakh per month depending on airline scale.' },
      { q: 'How long does it take to become an Airline Captain?', a: 'Reaching Commander rank usually requires 3,000–4,000 total flying hours, typically achieved within 5 to 7 years of active airline flying.' },
    ],
  },
])

/**
 * Merge API-backed CMS blogs with legacy posts.
 * - Deduplicates by slug.
 * - CMS version overrides legacy entry.
 * - Sorts newest first by publishedAt.
 */
export function mergeBlogPosts(apiBlogs = [], legacyPosts = LEGACY_POSTS) {
  const map = new Map()

  // 1. Add all legacy posts
  for (const post of legacyPosts) {
    if (post && post.slug) {
      map.set(post.slug, {
        slug: post.slug,
        title: post.title,
        seoTitle: post.seoTitle || post.title,
        seoDesc: post.seoDesc || post.excerpt,
        excerpt: post.excerpt || post.description || 'Read the full guide.',
        category: normalizeCategory(post.category),
        tags: Array.isArray(post.tags) ? post.tags : [],
        author: post.author || 'Capt. Navrang Singh',
        publishedAt: post.publishedAt || '2026-01-01T00:00:00.000Z',
        updatedAt: post.updatedAt || post.publishedAt || '2026-01-01T00:00:00.000Z',
        readTime: post.readTime || '6 min read',
        thumbnailUrl: post.thumbnailUrl || null,
        thumbnailAlt: post.thumbnailAlt || post.title,
        faqs: Array.isArray(post.faqs) ? post.faqs : [],
        isCms: false,
      })
    }
  }

  // 2. Overlay / add CMS-backed articles
  if (Array.isArray(apiBlogs)) {
    for (const b of apiBlogs) {
      if (!b || !b.slug) continue
      const meta = b.metadata && typeof b.metadata === 'object' ? b.metadata : {}
      const bodyHtml = typeof meta.bodyHtml === 'string' ? meta.bodyHtml : ''
      const calculatedTime = calculateReadingTime(bodyHtml || b.description || '')
      const authorName = typeof meta.author === 'string' && meta.author.trim() ? meta.author.trim() : 'Capt. Navrang Singh'
      const existing = map.get(b.slug)

      map.set(b.slug, {
        slug: b.slug,
        title: b.title,
        seoTitle: b.seoTitle || b.title,
        seoDesc: b.seoDesc || b.description,
        excerpt: b.description || existing?.excerpt || 'Read the full guide.',
        category: normalizeCategory(b.category || meta.category || existing?.category),
        tags: Array.isArray(b.tags) && b.tags.length ? b.tags : (existing?.tags || []),
        author: authorName,
        publishedAt: b.publishedAt || b.createdAt || existing?.publishedAt || new Date().toISOString(),
        updatedAt: b.updatedAt || b.publishedAt || b.createdAt || existing?.updatedAt || new Date().toISOString(),
        readTime: meta.readTime || calculatedTime || existing?.readTime || '6 min read',
        thumbnailUrl: b.thumbnailUrl || existing?.thumbnailUrl || null,
        thumbnailAlt: b.thumbnailAlt || existing?.thumbnailAlt || b.title,
        faqs: Array.isArray(b.faqs) ? b.faqs : (existing?.faqs || []),
        isCms: true,
        bodyHtml,
        raw: b,
      })
    }
  }

  // 3. Sort newest first
  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime() || 0
    const timeB = new Date(b.publishedAt).getTime() || 0
    return timeB - timeA
  })
}

/**
 * Find 2-3 related posts for a given article, avoiding duplicates and self.
 */
export function getRelatedPosts(currentSlug, currentCategory, currentTags = [], allPosts = []) {
  if (!Array.isArray(allPosts) || allPosts.length === 0) return []
  const candidates = allPosts.filter((p) => p.slug !== currentSlug)
  if (candidates.length <= 3) return candidates

  const tagsSet = new Set((currentTags || []).map((t) => String(t).toLowerCase()))
  const catNorm = normalizeCategory(currentCategory)

  // Score each candidate by tag matches + category match
  const scored = candidates.map((post) => {
    let score = 0
    if (normalizeCategory(post.category) === catNorm) score += 2
    for (const t of post.tags || []) {
      if (tagsSet.has(String(t).toLowerCase())) score += 1
    }
    return { post, score }
  })

  // Sort by score desc, then by date desc
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime()
  })

  return scored.slice(0, 3).map((s) => s.post)
}
