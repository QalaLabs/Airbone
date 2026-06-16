// SEO Schema structured data helpers

export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'EducationalOrganization'],
    'name': 'Airborne Aviation Academy',
    'image': 'https://airborneaviation.in/footage/hero-cockpit.jpg',
    'url': 'https://airborneaviation.in',
    'telephone': '+91-9953777320',
    'email': 'admissions@airborneaviation.in',
    'priceRange': '₹₹₹',
    'description': 'DGCA-approved Flying Training Organisation (FTO) at Ramphal Chowk, Dwarka, New Delhi. Offering CPL, ATPL, PPL, and cabin crew training programs.',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Ramphal Chowk Road, Sector 7 Dwarka',
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
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'opens': '09:00',
      'closes': '19:00'
    },
    'sameAs': [
      'https://airborneaviation.in'
    ]
  }
}

export function getEducationalOrgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': 'Airborne Aviation Academy',
    'url': 'https://airborneaviation.in',
    'logo': 'https://airborneaviation.in/favicon.svg',
    'description': 'DGCA-approved Flying Training Organisation (FTO) in Dwarka, New Delhi. CPL, ATPL, PPL, cabin crew, and DGCA ground school programs led by Capt. Navrang Singh.',
    'foundingDate': '2010',
    'founder': {
      '@type': 'Person',
      'name': 'Capt. Navrang Singh',
      'jobTitle': 'Chief Flight Instructor & Founder'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Ramphal Chowk, Sector 7 Dwarka',
      'addressLocality': 'New Delhi',
      'postalCode': '110075',
      'addressCountry': 'IN'
    }
  }
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Airborne Aviation Academy',
    'url': 'https://airborneaviation.in',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://airborneaviation.in/courses/?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
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
      'sameAs': 'https://airborneaviation.in'
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
      'item': `https://airborneaviation.in${link.path}`
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
        'name': 'Is Airborne Aviation Academy DGCA approved?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Airborne Aviation Academy is a DGCA-approved Flying Training Organisation (FTO) located at Ramphal Chowk, Dwarka, New Delhi. Our FTO approval is issued under DGCA CAR-FTO regulations and is valid for CPL, PPL, and ratings training.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Which pilot training courses does Airborne Aviation Academy offer?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Airborne Aviation Academy offers CPL, ATPL, PPL, Type Rating, Instrument Rating, Multi-Engine Rating, DGCA Ground School, Cabin Crew Training, Aviation English, and Flight Dispatcher programs.'
        }
      },
      {
        '@type': 'Question',
        'name': 'What is the fee for pilot training at Airborne Aviation Academy?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'CPL training fees at Airborne Aviation Academy range from ₹45 lakh to ₹55 lakh, covering 200 flying hours, ground school, DGCA exam fees, and medical costs. Education loan assistance is available from SBI, Bank of Baroda, and Punjab National Bank.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Where is Airborne Aviation Academy located?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Airborne Aviation Academy is located at Ramphal Chowk, Sector 7, Dwarka, New Delhi — 110075. It is accessible from all parts of Delhi NCR and close to Ramphal Chowk Metro Station on the Blue Line.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Who is the instructor at Airborne Aviation Academy?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Airborne Aviation Academy is led by Capt. Navrang Singh, a DGCA CPL holder and active commercial airline captain with 15+ years of flight instruction experience. Capt. Navrang personally conducts DGCA ground school for all CPL students.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How many students are allowed per batch at Airborne?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Airborne Aviation Academy caps each batch at a maximum of 25 students to ensure individual attention from Capt. Navrang Singh throughout the training program.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Does Airborne Aviation Academy have a simulator?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Airborne Aviation Academy has an in-house Airbus A320 FTD Level 5 Flight Training Device at our Dwarka, New Delhi campus — one of very few ground schools in Delhi to offer in-house simulator access.'
        }
      }
    ]
  }
}
