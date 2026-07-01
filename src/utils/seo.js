// SEO Schema structured data helpers

export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Airborne Aviation Academy',
    'image': 'https://www.airborneaviation.in/campus/og_image.jpg',
    'url': 'https://www.airborneaviation.in',
    'telephone': '+91 9953 777 320',
    'priceRange': '₹₹₹',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'E-549, 2nd Floor, Ramphal Chowk Road, Sector 7 Dwarka',
      'addressLocality': 'New Delhi',
      'addressRegion': 'Delhi',
      'postalCode': '110075',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 28.5899268,
      'longitude': 77.0682224
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      'opens': '09:30',
      'closes': '18:00'
    }
  }
}

export function getEducationalOrgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': 'Airborne Aviation Academy',
    'url': 'https://www.airborneaviation.in',
    'logo': 'https://www.airborneaviation.in/logo-primary.png',
    'description': 'India\'s most trusted DGCA CPL ground school. Led by Capt. Navrang Singh with 15+ years of teaching excellence.',
    'founder': {
      '@type': 'Person',
      'name': 'Capt. Navrang Singh'
    }
  }
}

export function getCourseSchema(course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': course.title,
    'description': course.tagline,
    'provider': {
      '@type': 'EducationalOrganization',
      'name': 'Airborne Aviation Academy',
      'sameAs': 'https://www.airborneaviation.in'
    },
    'hasCourseInstance': {
      '@type': 'CourseInstance',
      'courseMode': 'blended',
      'courseWorkload': course.duration,
      'startDate': '2026-07-01',
      'offers': {
        '@type': 'Offer',
        'price': course.price.replace(/[^\d]/g, ''),
        'priceCurrency': 'INR',
        'category': 'Tuition'
      }
    }
  }
}

export function getBreadcrumbSchema(links) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': links.map((link, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': link.name,
      'item': `https://www.airborneaviation.in${link.path}`
    }))
  }
}

export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is the pass rate of Airborne Aviation Academy ground classes?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We maintain a 100% DGCA exam pass rate, focusing on concept clarity under the personal guidance of Capt. Navrang Singh.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How many students are allowed per batch?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'To ensure individual focus, we cap each batch at a maximum of 25 students.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Do you offer simulator training in Delhi?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, we have an in-house Airbus A320 FTD Level 5 Flight Trainer located at our Dwarka center in New Delhi.'
        }
      }
    ]
  }
}
