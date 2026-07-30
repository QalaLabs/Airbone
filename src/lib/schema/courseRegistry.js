/**
 * Verified course schema registry — prices/durations from live course pages.
 * Descriptions avoid unverifiable superlatives (handled further by sanitizeSchemaText).
 */

export const COURSE_SCHEMA = {
  'ground-school': {
    slug: 'ground-school',
    name: 'DGCA Complied Ground School',
    description:
      'DGCA-aligned ground school in Dwarka, Delhi covering CPL and ATPL theory subjects, taught with concept-focused instruction by Capt. Navrang Singh. Duration typically 3–6 months. Batches capped at 25 students.',
    path: '/courses/ground-school',
    price: '270000',
    duration: 'P3M',
    courseMode: 'onsite',
    maximumAttendeeCapacity: 25,
    imagePath: '/footage/classroom.jpg',
    teaches: [
      'Air Navigation',
      'Aviation Meteorology',
      'Air Regulations',
      'Technical General',
      'Technical Specific',
      'RTR',
    ],
    coursePrerequisites: 'Class 12 with Physics and Mathematics; DGCA Class 2 Medical eligibility recommended',
    faqs: [
      {
        q: 'How long does DGCA Ground School take?',
        a: 'Approximately 3 months for DGCA CPL theory subjects including RTR. Batches are capped at 25 students. Weekend and weekday batches available.',
      },
      {
        q: 'Is Capt. Navrang Singh in every class?',
        a: 'Yes. Every core class is taught directly by Capt. Navrang Singh. No junior staff or subcontracted instructors handle any paper.',
      },
      {
        q: 'What is the DGCA Ground School fee at Airborne?',
        a: '₹2,70,000 covering DGCA CPL theory subjects including RTR. All study material provided and kept by students. No hidden charges.',
      },
      {
        q: 'Can I join DGCA Ground School without a CPL in progress?',
        a: 'Yes. Students pursuing any aviation path - CPL, ATPL, or general DGCA exam preparation - can join ground school. Minimum eligibility is Class 12 with Physics and Mathematics.',
      },
    ],
  },
  'commercial-pilot-license-cpl': {
    slug: 'commercial-pilot-license-cpl',
    name: 'DGCA Complied CPL Ground School',
    description:
      'DGCA CPL theory preparation: Air Navigation, Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. DGCA-aligned training by Capt. Navrang Singh at Airborne Aviation Academy, Dwarka.',
    path: '/courses/commercial-pilot-license-cpl',
    price: '270000',
    duration: 'P3M',
    courseMode: 'onsite',
    maximumAttendeeCapacity: 25,
    imagePath: '/campus/classroom_navrang.jpg',
    teaches: [
      'Air Navigation',
      'Aviation Meteorology',
      'Air Regulations',
      'Technical General',
      'Technical Specific',
      'RTR',
    ],
    coursePrerequisites: 'Class 12 with Physics and Mathematics',
    faqs: [
      {
        q: 'What DGCA exams are required for CPL?',
        a: 'Six DGCA examinations: Air Navigation, Aviation Meteorology, Air Regulations, Technical General, Technical Specific, and RTR. Each paper requires minimum 70% to pass.',
      },
      {
        q: 'How much does CPL cost in India?',
        a: 'CPL training in India costs ₹55–65 lakh at DGCA-approved FTOs, covering 200 flying hours, ground school, DGCA exam fees, and medical. Education loans available via SBI, Bank of Baroda, PNB.',
      },
      {
        q: 'What is the DGCA CPL Ground School fee at Airborne?',
        a: 'The tuition fee is ₹2,70,000 covering DGCA CPL theory subjects including RTR, taught directly by Capt. Navrang Singh.',
      },
      {
        q: 'How long does CPL Ground School take?',
        a: 'Approximately 3 months. Batches are capped at 25 students. Contact admissions for the next batch start date.',
      },
      {
        q: 'Is CPL ground school taught by Capt. Navrang Singh directly?',
        a: 'Yes. Every core class is taught directly by Capt. Navrang Singh. No subcontracted instructors.',
      },
    ],
  },
  atpl: {
    slug: 'atpl',
    name: 'ATPL Ground School',
    description:
      'Airline Transport Pilot License ground school in Dwarka, Delhi - DGCA ATPL theory subjects with onsite and online training support at Airborne Aviation Academy.',
    path: '/courses/atpl',
    price: '150000',
    duration: 'P2M',
    courseMode: 'blended',
    imagePath: '/footage/classroom.jpg',
    teaches: ['ATPL Air Navigation', 'ATPL Meteorology', 'ATPL Air Regulations', 'ATPL Technical'],
    coursePrerequisites: 'Typically pursued alongside or after CPL theory; eligibility age 21+',
  },
  'cabin-crew-training': {
    slug: 'cabin-crew-training',
    name: 'Cabin Crew Training',
    description:
      'Cabin crew training in Dwarka, Delhi led by airline-experienced trainers. Structured pathways covering safety, soft skills, and airline interview readiness.',
    path: '/courses/cabin-crew-training',
    price: '59000',
    duration: 'P1M',
    courseMode: 'onsite',
    includeInstructor: false,
    imagePath: '/footage/cabin-crew.jpg',
  },
  'cadet-preparation': {
    slug: 'cadet-preparation',
    name: 'Cadet Pilot Program Preparation',
    description:
      'Preparation for IndiGo, Air India, Akasa and other cadet pilot selection processes - aptitude, GD/PI, and simulator familiarisation support.',
    path: '/courses/cadet-preparation',
    courseMode: 'onsite',
    imagePath: '/footage/pilot-portrait.jpg',
  },
  'a320-simulator': {
    slug: 'a320-simulator',
    name: 'Airbus A320 Simulator FBS',
    description:
      'A320 FTD Level 5 simulator sessions at Airborne Aviation Academy, Dwarka - airline interview prep, type-rating familiarisation, and cadet selection practice.',
    path: '/courses/a320-simulator',
    courseMode: 'onsite',
    imagePath: '/footage/cockpit_instruments_closeup.jpg',
    includeInstructor: false,
  },
  'cas-compass-adapt': {
    slug: 'cas-compass-adapt',
    name: 'CAS / Compass / ADAPT Prep',
    description:
      'Structured preparation for DGCA CAS Compass and ADAPT pilot aptitude screening tests at Airborne Aviation Academy, Dwarka.',
    path: '/courses/cas-compass-adapt',
    courseMode: 'onsite',
  },
  'airline-preparation': {
    slug: 'airline-preparation',
    name: 'Comprehensive Airline Preparation Program',
    description:
      'Transition from CPL holder to First Officer. 2.5-month airline preparation program at Airborne, Dwarka covering DGCA Ground Refresher, ADAPT Screening, A320 Systems & Sim Prep, and GD/PI. 4 hours/day. ₹1,50,000.',
    path: '/courses/airline-preparation',
    courseMode: 'onsite',
    includeInstructor: false,
  },
  'gd-pi': {
    slug: 'gd-pi',
    name: 'GD & PI Course',
    description:
      'Group Discussion and Personal Interview preparation for aviation and airline selection processes at Airborne Aviation Academy.',
    path: '/courses/gd-pi',
    courseMode: 'onsite',
    includeInstructor: false,
  },
  'private-pilot-license': {
    slug: 'private-pilot-license',
    name: 'Private Pilot License (PPL) Guidance',
    description:
      'Guidance and ground preparation support for Private Pilot License aspirants at Airborne Aviation Academy, Dwarka.',
    path: '/courses/private-pilot-license',
    courseMode: 'onsite',
  },
  'instrument-rating': {
    slug: 'instrument-rating',
    name: 'Instrument Rating Preparation',
    description:
      'Instrument Rating theory and procedure familiarisation support at Airborne Aviation Academy, Dwarka.',
    path: '/courses/instrument-rating',
    courseMode: 'onsite',
  },
  'multi-engine-rating': {
    slug: 'multi-engine-rating',
    name: 'Multi-Engine Rating Preparation',
    description:
      'Multi-engine rating familiarisation and theory support at Airborne Aviation Academy, Dwarka.',
    path: '/courses/multi-engine-rating',
    courseMode: 'onsite',
  },
  'aviation-english-icao': {
    slug: 'aviation-english-icao',
    name: 'Aviation English (ICAO)',
    description:
      'ICAO Aviation English training for pilots and aviation professionals at Airborne Aviation Academy, Dwarka.',
    path: '/courses/aviation-english-icao',
    courseMode: 'onsite',
    includeInstructor: false,
  },
  'flight-dispatcher': {
    slug: 'flight-dispatcher',
    name: 'Flight Dispatcher Training',
    description:
      'Flight dispatcher / flight operations officer preparation support at Airborne Aviation Academy, Dwarka.',
    path: '/courses/flight-dispatcher',
    courseMode: 'onsite',
    includeInstructor: false,
  },
}

export const COURSES_INDEX_ITEMS = [
  { name: 'Flying Training India vs Abroad', path: '/courses/flying-training-india-abroad' },
  { name: 'DGCA CPL Ground School', path: '/courses/commercial-pilot-license-cpl', courseSlug: 'commercial-pilot-license-cpl' },
  { name: 'GD & PI Course', path: '/courses/gd-pi', courseSlug: 'gd-pi' },
  { name: 'Airline Interview Preparation', path: '/courses/airline-preparation', courseSlug: 'airline-preparation' },
  { name: 'ATPL Ground School', path: '/courses/atpl', courseSlug: 'atpl' },
  { name: 'Cadet Pilot Program Prep', path: '/courses/cadet-preparation', courseSlug: 'cadet-preparation' },
  { name: 'Airbus A320 Simulator FBS', path: '/courses/a320-simulator', courseSlug: 'a320-simulator' },
  { name: 'CAS / Compass / ADAPT Prep', path: '/courses/cas-compass-adapt', courseSlug: 'cas-compass-adapt' },
  { name: 'Cabin Crew Training', path: '/courses/cabin-crew-training', courseSlug: 'cabin-crew-training' },
  { name: 'DGCA Ground School', path: '/courses/ground-school', courseSlug: 'ground-school' },
]
