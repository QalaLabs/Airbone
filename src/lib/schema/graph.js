import {
  buildOrganization,
  buildWebsite,
  buildLogoImage,
  buildFounderPerson,
  buildLeadershipPeople,
  buildServices,
  buildPlace,
  buildPrimaryImage,
} from './organization.js'
import {
  buildBreadcrumbList,
  buildFaqPage,
  buildWebPage,
  buildCourseEntity,
  buildArticleEntity,
  buildItemList,
  buildCourseStub,
  sanitizeSchemaText,
} from './builders.js'
import { id } from './ids.js'
import { absUrl, ORG } from './constants.js'

/** Wrap entities in a single @graph document */
export function asGraph(entities) {
  const graph = entities.filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/** Core nodes shared across most pages */
export function coreEntities({
  includeServices = false,
  includeCatalog = false,
  includeLeadership = false,
} = {}) {
  const nodes = [
    buildLogoImage(),
    buildOrganization({ includeServices, includeCatalog }),
    buildWebsite(),
    buildPlace(),
    buildFounderPerson({ includeFull: true }),
  ]
  if (includeLeadership) nodes.push(...buildLeadershipPeople())
  if (includeServices) nodes.push(...buildServices())
  return nodes
}

/** Homepage knowledge graph */
export function buildHomeGraph(faqs = []) {
  const stubs = [
    buildCourseStub('commercial-pilot-license-cpl', 'DGCA Complied CPL Ground School', '/courses/commercial-pilot-license-cpl'),
    buildCourseStub('ground-school', 'DGCA Complied Ground School', '/courses/ground-school'),
    buildCourseStub('atpl', 'ATPL Ground School', '/courses/atpl'),
    buildCourseStub('cadet-preparation', 'Cadet Pilot Program Preparation', '/courses/cadet-preparation'),
    buildCourseStub('airline-preparation', 'Airline Interview Preparation', '/courses/airline-preparation'),
    buildCourseStub('gd-pi', 'GD & PI Course', '/courses/gd-pi'),
    buildCourseStub('cas-compass-adapt', 'CASS / Compass / ADAPT Prep', '/courses/cas-compass-adapt'),
    buildCourseStub('a320-simulator', 'Airbus A320 Simulator FBS', '/courses/a320-simulator'),
    buildCourseStub('cabin-crew-training', 'Cabin Crew Training', '/courses/cabin-crew-training'),
  ]

  const image = buildPrimaryImage('/footage/hero-cockpit.jpg', `${ORG.name} - pilot training in Dwarka, Delhi`)

  return asGraph([
    ...coreEntities({ includeServices: true, includeCatalog: true, includeLeadership: true }),
    image,
    buildWebPage({
      path: '/',
      name: `${ORG.name} | DGCA Ground School Delhi`,
      description: ORG.description,
      primaryImagePath: '/footage/hero-cockpit.jpg',
      mainEntity: id.org(),
    }),
    buildFaqPage(faqs, '/'),
    ...stubs,
  ])
}

/** About page — strong Person + Org graph */
export function buildAboutGraph() {
  const image = buildPrimaryImage('/team/navrang_portrait.jpg', 'Capt. Navrang Singh')
  return asGraph([
    ...coreEntities({ includeServices: true, includeLeadership: true }),
    image,
    buildWebPage({
      path: '/about',
      name: `About ${ORG.name}`,
      description: ORG.description,
      primaryImagePath: '/team/navrang_portrait.jpg',
      mainEntity: id.founder(),
    }),
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ],
      '/about'
    ),
  ])
}

/** Contact page */
export function buildContactGraph() {
  return asGraph([
    ...coreEntities({ includeServices: true }),
    buildWebPage({
      path: '/contact',
      name: `Contact ${ORG.name}`,
      description: `Contact ${ORG.name}, Dwarka, New Delhi. Book a demo class or career counselling session.`,
      mainEntity: id.org(),
    }),
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ],
      '/contact'
    ),
  ])
}

/**
 * Full course page graph
 * @param {object} opts
 */
export function buildCoursePageGraph({
  slug,
  name,
  description,
  path,
  price,
  duration,
  courseMode = 'onsite',
  startDate,
  teaches,
  faqs,
  imagePath,
  coursePrerequisites,
  category,
  includeInstructor = true,
  maximumAttendeeCapacity,
}) {
  const coursePath = path || `/courses/${slug}`
  const { course, courseInstance, offer } = buildCourseEntity({
    slug,
    name,
    description,
    path: coursePath,
    price,
    duration,
    courseMode,
    startDate,
    teaches,
    coursePrerequisites,
    imagePath,
    category,
    includeInstructor,
    maximumAttendeeCapacity,
  })

  const nodes = [
    ...coreEntities(),
    course,
    courseInstance,
    offer,
    buildWebPage({
      path: coursePath,
      name,
      description,
      primaryImagePath: imagePath,
      mainEntity: id.course(slug),
    }),
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: name, path: coursePath },
      ],
      coursePath
    ),
    buildFaqPage(faqs, coursePath),
  ]

  if (imagePath) {
    nodes.push(buildPrimaryImage(imagePath, name))
  }

  return asGraph(nodes)
}

/** Courses index */
export function buildCoursesIndexGraph(items) {
  const stubs = (items || [])
    .filter((item) => item.courseSlug)
    .map((item) => buildCourseStub(item.courseSlug, item.name, item.path))

  return asGraph([
    ...coreEntities({ includeCatalog: true }),
    ...stubs,
    buildWebPage({
      path: '/courses',
      name: 'Pilot Training Courses | Airborne Aviation Academy',
      description:
        'Browse DGCA-aligned aviation courses at Airborne Aviation Academy, Dwarka Delhi - CPL ground school, ATPL, cabin crew, A320 simulator, and cadet preparation.',
      mainEntity: `${absUrl('/courses')}#itemlist`,
    }),
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
      ],
      '/courses'
    ),
    buildItemList({
      name: 'Aviation Courses at Airborne Aviation Academy',
      description:
        'Explore DGCA pilot ground school, CPL, ATPL, A320 simulator and cabin crew courses at Airborne Aviation Academy, Dwarka Delhi.',
      path: '/courses',
      items,
    }),
  ])
}

/** Article / blog post graph */
export function buildArticlePageGraph({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  faqs,
  imagePath,
  breadcrumbs,
}) {
  const crumbs =
    breadcrumbs ||
    [
      { name: 'Home', path: '/' },
      { name: 'Resources', path: '/resources' },
      { name: headline, path },
    ]

  return asGraph([
    ...coreEntities(),
    buildArticleEntity({
      path,
      headline,
      description,
      datePublished,
      dateModified,
      imagePath,
    }),
    buildWebPage({
      path,
      name: headline,
      description,
      primaryImagePath: imagePath,
      mainEntity: id.article(path),
    }),
    buildBreadcrumbList(crumbs, path),
    buildFaqPage(faqs, path),
    imagePath ? buildPrimaryImage(imagePath, headline) : null,
  ])
}

/** Blog index */
export function buildBlogIndexGraph() {
  return asGraph([
    ...coreEntities(),
    buildWebPage({
      path: '/blog',
      name: 'Aviation Blog | Airborne Aviation Academy',
      description: 'Guides on becoming a pilot in India, DGCA ground school, training costs, and pilot careers.',
    }),
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
      ],
      '/blog'
    ),
  ])
}

/** Resources page — FAQ schema omitted until FAQs are visible in the UI */
export function buildResourcesGraph(faqs) {
  return asGraph([
    ...coreEntities(),
    buildWebPage({
      path: '/resources',
      name: 'Aviation Resources | Airborne Aviation Academy',
      description: 'Guides, FAQs and resources for aspiring pilots from Airborne Aviation Academy.',
    }),
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: 'Resources', path: '/resources' },
      ],
      '/resources'
    ),
    // Only emit FAQPage when visible FAQs are provided
    faqs?.length ? buildFaqPage(faqs, '/resources') : null,
  ])
}

export { sanitizeSchemaText, absUrl, id }
