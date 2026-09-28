import TestimonialSubmitClient from './TestimonialSubmitClient'

export async function generateMetadata() {
  return {
    title: 'Share Your Airborne Story | Airborne Aviation',
    description: 'Trained with Airborne Aviation? Share your experience. Testimonials are reviewed before they are published.',
    alternates: { canonical: '/share-your-story' },
    robots: { index: false, follow: true },
  }
}

export default function ShareYourStoryPage() {
  return <TestimonialSubmitClient />
}
