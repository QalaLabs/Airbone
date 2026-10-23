/**
 * Course Video Registry & YouTube Embed Helpers.
 * Configured for YouTube Shorts (9:16 portrait) and Playlists/Lectures (16:9 widescreen).
 * Populated from official YouTube Channel: https://youtube.com/@airborneaviationacademy
 */

import { videoEmbedUrl } from '@/lib/cms/safeContent'

export const YOUTUBE_CHANNEL_URL = 'https://youtube.com/@airborneaviationacademy'

/**
 * Registry of YouTube Shorts and Playlists per course slug.
 */
export const COURSE_VIDEOS = {
  'commercial-pilot-license-cpl': {
    title: 'CPL Video Lectures & Flight Shorts',
    subtitle: 'Capt. Navrang Singh and instructors break down CPL roadmaps, DGCA exam strategies, and airline cockpit procedures.',
    shorts: [
      { title: 'Dreaming of Becoming a Pilot by 2027? 4-Month CPL Preparation Roadmap', url: 'https://youtube.com/shorts/s0MOPrCRYgA' },
      { title: 'Commercial Pilot After 12th – DGCA CPL Ground Classes at Airborne', url: 'https://youtube.com/shorts/C3KAdg3UD3A' },
      { title: 'DGCA CPL Ground Classes in Dwarka, Delhi – Pilot Journey', url: 'https://youtube.com/shorts/rx4xX6pv8tQ' },
      { title: 'What Happens If You Fail in DGCA Exams? Truth for Aspiring Pilots', url: 'https://youtube.com/shorts/5qZH90y0DYw' },
      { title: 'Can a Pilot with CPL Fly Helicopters? Aviation Fact Explained', url: 'https://youtube.com/shorts/Fl9LPSV9eMY' },
    ],
    playlists: [
      { title: 'Airborne Aviation Academy – Pilot Ground School & Cockpit Orientation', url: 'https://youtube.com/watch?v=ibV9KU22fAc' },
    ],
  },
  'ground-school': {
    title: 'DGCA Ground School Masterclasses',
    subtitle: 'Concept-clarity video lectures covering Air Regulations, Navigation, Meteorology, and Technical subjects.',
    shorts: [
      { title: 'What is TAF in Aviation? Terminal Aerodrome Forecast by Capt. Navrang', url: 'https://youtube.com/shorts/BFP7TBvH8BI' },
      { title: 'What is METAR? Decoded for DGCA Aviation Meteorology', url: 'https://youtube.com/shorts/KUiDZcISjF0' },
      { title: 'What is Ground Effect? Explained by Capt. Navrang Singh', url: 'https://youtube.com/shorts/LB-IbI94NJ0' },
      { title: 'VOR Navigation Explained in 45 Seconds', url: 'https://youtube.com/shorts/pPJk-o7wScc' },
      { title: 'Marine vs Air Navigation – What Every Aspiring Pilot Should Know', url: 'https://youtube.com/shorts/GfgPnfT6s3I' },
      { title: 'Cumulonimbus Cloud (CB) Formation & Flight Hazards', url: 'https://youtube.com/shorts/7HbTWy_cwEY' },
    ],
    playlists: [
      { title: 'DGCA Ground Classes & Aviation Training Overview', url: 'https://youtube.com/watch?v=ibV9KU22fAc' },
    ],
  },
  'airline-preparation': {
    title: 'Airline Preparation & Sim Briefings',
    subtitle: 'Cockpit orientation, A320 workflows, psychometric screening tips, and airline panel interview guidance.',
    shorts: [
      { title: 'Akasa Air Hiring CPL Holders! Get Airline-Ready with Airborne', url: 'https://youtube.com/shorts/LSz4XQ6fprQ' },
      { title: 'Akasa Air Actively Hiring CPL Holders Right Now', url: 'https://youtube.com/shorts/lnS2h8tKVpQ' },
      { title: 'India Needs 30,000 Pilots – Why Are CPL Holders Still Jobless?', url: 'https://youtube.com/shorts/btl6VmvXDjw' },
      { title: 'Pilot Interview Question Breakdown – Part 1', url: 'https://youtube.com/shorts/x9-OURMk4ug' },
      { title: 'Pilot Interview Question Breakdown – Part 2', url: 'https://youtube.com/shorts/Jva2xCFELCI' },
      { title: 'Pilot Interview Question Breakdown – Part 3', url: 'https://youtube.com/shorts/8u48YxwXEWI' },
      { title: 'How Are Airline Pilots Hired in Commercial Carriers?', url: 'https://youtube.com/shorts/73bQoQuPQXc' },
    ],
    playlists: [
      { title: 'Airborne Aviation Academy – Airline Pilot Mentorship', url: 'https://youtube.com/watch?v=ibV9KU22fAc' },
    ],
  },
  'a320-simulator': {
    title: 'A320 Simulator FBS Session Highlights',
    subtitle: 'Live session cockpit walk-throughs, PFD/ND interaction, and type rating familiarisation.',
    shorts: [
      { title: 'Airbus A320 Flight Simulator Tour at Dwarka Campus', url: 'https://youtube.com/shorts/iFriPiwoBPY' },
      { title: 'What is Fly-By-Wire (FBW) in Modern Commercial Jetliners?', url: 'https://youtube.com/shorts/CFJpM8-8Ck8' },
      { title: 'What Happens If Pilots Apply Opposite Controls on Sidestick?', url: 'https://youtube.com/shorts/mSd6c-0Hoq8' },
      { title: 'Which Jet Engine Type Is Used in Modern Commercial Aircraft?', url: 'https://youtube.com/shorts/2HFRkJfhO8c' },
    ],
    playlists: [
      { title: 'Airborne Aviation Academy Simulator & Flight Deck Briefing', url: 'https://youtube.com/watch?v=ibV9KU22fAc' },
    ],
  },
  'cadet-preparation': {
    title: 'Cadet Pilot Screening & Aptitude Prep',
    subtitle: 'ADAPT test preparation, psychomotor screening drills, and airline cadet intake advice.',
    shorts: [
      { title: 'What is Ground Proximity Warning System (GPWS)?', url: 'https://youtube.com/shorts/n21aYNCAZWA' },
      { title: 'What Happens If a Pilot Gets Incapacitated in Flight?', url: 'https://youtube.com/shorts/Kww-nm1LKJY' },
      { title: 'Aviation Science: What Are Jet Contrails in 30 Seconds?', url: 'https://youtube.com/shorts/5tMQPcLV-iQ' },
      { title: 'Which Aircraft Component Generates Lift to Fly?', url: 'https://youtube.com/shorts/3faDVHMRWpY' },
    ],
    playlists: [],
  },
  'cabin-crew-training': {
    title: 'Cabin Crew Training & Grooming Masterclass',
    subtitle: 'Mock cabin emergency drills, grooming guidelines, and airline interview prep with senior instructors.',
    shorts: [
      { title: 'From a Classroom in Dwarka to Flying with Emirates!', url: 'https://youtube.com/shorts/uxJqZ98xfIk' },
      { title: 'From Classroom to Cockpit: My Aviation Career Starts Here', url: 'https://youtube.com/shorts/rNkfrAXNNF4' },
      { title: 'What Happens When an Aircraft Loses Cabin Air Pressure?', url: 'https://youtube.com/shorts/NO-3TyH1HKM' },
    ],
    playlists: [],
  },
  'cas-compass-adapt': {
    title: 'CASS Compass & ADAPT Test Prep',
    subtitle: 'Aptitude screening breakdowns, spatial orientation tips, and fast mental math strategies.',
    shorts: [
      { title: 'Steps to Stay Current & Proficient in Flying Skills & Knowledge', url: 'https://youtube.com/shorts/8rmp_6Ucxb4' },
      { title: 'Cockpit Decision-Making & Handling Challenging Situations', url: 'https://youtube.com/shorts/YedPORO40WU' },
      { title: 'Information Contained in a Standard Flight Plan', url: 'https://youtube.com/shorts/jIysDIFNIRc' },
    ],
    playlists: [],
  },
  'flying-training-india-abroad': {
    title: 'CPL Flying Training: India vs Abroad',
    subtitle: 'Hour-building comparisons, DGCA license conversion checklists, and flight school walk-throughs.',
    shorts: [
      { title: 'Flying in India vs Flying Abroad – Pilot Training Reality', url: 'https://youtube.com/shorts/mb8VDrYW9-U' },
      { title: 'Cost of CPL in India vs Abroad – How Much Does It Really Cost?', url: 'https://youtube.com/shorts/ws6Q8LZsLuA' },
      { title: 'Can You Train in India Safely, Affordably, and On Time?', url: 'https://youtube.com/shorts/0y0mlK3VT54' },
    ],
    playlists: [],
  },
  'gd-pi': {
    title: 'GD & Airline Personal Interview Coaching',
    subtitle: 'Mock GD panels, personality grooming, and situational answers with aviation industry veterans.',
    shorts: [
      { title: 'Airline Pilot Interview Question Breakdown – Part 1', url: 'https://youtube.com/shorts/x9-OURMk4ug' },
      { title: 'Airline Pilot Interview Question Breakdown – Part 2', url: 'https://youtube.com/shorts/Jva2xCFELCI' },
      { title: 'Airline Pilot Interview Question Breakdown – Part 3', url: 'https://youtube.com/shorts/8u48YxwXEWI' },
      { title: 'Most Challenging Cockpit Situations & Panel Responses', url: 'https://youtube.com/shorts/YedPORO40WU' },
      { title: 'How Airline Pilots Are Screened and Hired', url: 'https://youtube.com/shorts/73bQoQuPQXc' },
    ],
    playlists: [],
  },
  'atpl': {
    title: 'ATPL Theory & Operational Procedures',
    subtitle: 'Advanced airline transport pilot license theory papers and multi-crew cooperation concepts.',
    shorts: [
      { title: 'DGCA Admit Cards Out: ATPL & FIR/AFIR Oral Exams Update', url: 'https://youtube.com/shorts/FTU24PkqcB4' },
      { title: 'PPL vs CPL vs ATPL – Which Pilot License Do You Need?', url: 'https://youtube.com/shorts/yl4QWrAoWa8' },
      { title: 'DGCA FIR/AFIR Oral Exam Session Application Guidelines', url: 'https://youtube.com/shorts/fXNc8xUTAkU' },
    ],
    playlists: [],
  },
  'private-pilot-license': {
    title: 'Private Pilot Licence Flying Briefings',
    subtitle: 'First solo flight prep, cockpit pre-flight inspections, and recreational flying fundamentals.',
    shorts: [
      { title: 'PPL vs CPL vs ATPL – License Scope & Flying Objectives', url: 'https://youtube.com/shorts/yl4QWrAoWa8' },
      { title: 'Why Do Aircraft Have Red & Green Navigation Lights?', url: 'https://youtube.com/shorts/W4O3yWIVOmM' },
      { title: 'General Aviation Flight Plan Information Explained', url: 'https://youtube.com/shorts/jIysDIFNIRc' },
    ],
    playlists: [],
  },
  'securing-your-childs-future-in-aviation': {
    title: 'Parent Aviation Guidance Series',
    subtitle: 'Transparent budget analysis, safety considerations, and commercial pilot career trajectories.',
    shorts: [
      { title: 'Pilot Training Loan in India | CPL Education Loan Eligibility & Limits', url: 'https://youtube.com/shorts/QXujrk3BjLQ' },
      { title: 'Become a Commercial Pilot After Class 12th – Complete Roadmap', url: 'https://youtube.com/shorts/6gZnFxKkVZ4' },
      { title: 'Can You Be a Pilot with Glasses? Reality by Capt. Navrang', url: 'https://youtube.com/shorts/i2zm_sr0wsM' },
      { title: 'How Many Holidays Does an Airline Pilot Really Get? Pilot Lifestyle', url: 'https://youtube.com/shorts/6XCf3z3yV10' },
    ],
    playlists: [],
  },
}

/**
 * Determine video type, embed URL, and appropriate responsive aspect ratio.
 */
export function resolveVideoItem(item) {
  if (!item) return null
  const url = typeof item === 'string' ? item : item.url
  const title = typeof item === 'object' && item.title ? item.title : 'Course Video Briefing'
  const description = typeof item === 'object' && item.description ? item.description : ''

  if (!url) return null

  const isShort = url.includes('/shorts/')
  const isPlaylist = url.includes('/playlist') || url.includes('list=')
  const embedUrl = videoEmbedUrl(url)

  return {
    title,
    description,
    url,
    embedUrl: embedUrl || url,
    isShort,
    isPlaylist,
    aspectRatio: isShort ? '9/16' : '16/9',
  }
}

/**
 * Retrieve videos for a specific course slug with fallback defaults.
 */
export function getCourseVideos(slug) {
  const entry = COURSE_VIDEOS[slug] || {}
  const shorts = (entry.shorts || []).map(resolveVideoItem).filter(Boolean)
  const playlists = (entry.playlists || []).map(resolveVideoItem).filter(Boolean)

  return {
    title: entry.title || 'Course Video Briefings & Shorts',
    subtitle: entry.subtitle || 'Explore video explanations, instructor briefings, and practical aviation insights.',
    shorts,
    playlists,
    hasVideos: shorts.length > 0 || playlists.length > 0,
  }
}
