// Synthetic test data only — no production records or credentials.
export const INTAKE_KEY = 'e2e-intake-key-not-a-secret'

export const JOB_ID = '11111111-1111-4111-8111-111111111111'

const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

export const FIXTURES = {
  resources: [
    {
      id: 'res-gated',
      title: 'E2E Gated Brochure',
      description: 'Requires contact details',
      type: 'Brochure',
      isGated: true,
      fileUrl: null,
      externalUrl: null,
      metadata: {},
    },
    {
      id: 'res-file',
      title: 'E2E Open PDF',
      description: 'Direct download',
      type: 'Guide',
      isGated: false,
      fileUrl: 'https://files.example.test/open-guide.pdf',
      externalUrl: null,
      metadata: { fileName: 'open-guide.pdf' },
    },
    {
      id: 'res-external',
      title: 'E2E External Article',
      description: 'Opens a partner site',
      type: 'Article',
      isGated: false,
      fileUrl: null,
      externalUrl: 'https://partner.example.test/article',
      metadata: {},
    },
    {
      id: 'res-malicious',
      title: 'E2E Unsafe Link',
      description: 'javascript: URL must never be actionable',
      type: 'Article',
      isGated: false,
      fileUrl: null,
      externalUrl: 'javascript:alert(1)',
      metadata: {},
    },
  ],
  jobs: [
    {
      id: JOB_ID,
      slug: 'e2e-first-officer',
      title: 'E2E First Officer',
      description: 'Synthetic job for end-to-end tests.',
      requirements: 'CPL',
      location: 'Delhi',
      jobType: 'Full Time',
      experienceYears: 0,
      isFeatured: true,
      closesAt: inThirtyDays,
      publishedAt: new Date().toISOString(),
      metadata: { airline: 'E2E Air', imageId: '00000000-0000-4000-8000-00000000e201' },
      imageUrl: 'https://cdn.example.test/e2e-job.png',
    },
  ],
  testimonials: [],
  googleReviews: {
    configured: true,
    placeName: 'E2E Academy',
    rating: 4.9,
    totalReviews: 42,
    mapsUrl: 'https://maps.google.com/?cid=e2e',
    reviews: [
      {
        author: 'E2E Reviewer',
        authorUrl: 'https://www.google.com/maps/contrib/e2e',
        authorPhoto: null,
        rating: 5,
        text: 'Synthetic Google review for end-to-end tests.',
        relativeTime: 'a week ago',
        publishTime: null,
      },
    ],
  },
}
