/**
 * Course Video Registry & YouTube Embed Helpers.
 * Configured for YouTube Shorts (9:16 portrait) and Playlists/Lectures (16:9 widescreen).
 * Client video links can be added directly to the COURSE_VIDEOS registry below or passed via props.
 */

import { videoEmbedUrl } from '@/lib/cms/safeContent'

export const YOUTUBE_CHANNEL_URL = 'https://youtube.com/@airborneaviationacademy'

/**
 * Registry of YouTube Shorts and Playlists per course slug.
 * Once client provides links, slot them into the respective course's `shorts` or `playlists` array.
 */
export const COURSE_VIDEOS = {
  'commercial-pilot-license-cpl': {
    title: 'CPL Video Lectures & Flight Shorts',
    subtitle: 'Capt. Navrang Singh breaks down navigation plots, meteorology charts, and airline cockpit procedures.',
    shorts: [
      // Client YouTube Shorts links go here:
      // { title: 'Crosswind Landing Physics in 60s', url: 'https://youtube.com/shorts/...' }
    ],
    playlists: [
      // Client YouTube Playlist links go here:
      // { title: 'DGCA CPL Ground Theory Lectures', url: 'https://www.youtube.com/playlist?list=...' }
    ],
  },
  'ground-school': {
    title: 'DGCA Ground School Masterclasses',
    subtitle: 'Concept-clarity video lectures covering Air Regulations, Navigation, Meteorology, and Technical subjects.',
    shorts: [],
    playlists: [],
  },
  'airline-preparation': {
    title: 'Airline Preparation & Sim Briefings',
    subtitle: 'Cockpit orientation, A320 workflows, psychometric screening tips, and airline panel interview guidance.',
    shorts: [],
    playlists: [],
  },
  'a320-simulator': {
    title: 'A320 Simulator FBS Session Highlights',
    subtitle: 'Live session cockpit walk-throughs, PFD/ND interaction, and type rating familiarisation.',
    shorts: [],
    playlists: [],
  },
  'cadet-preparation': {
    title: 'Cadet Pilot Screening & Aptitude Prep',
    subtitle: 'ADAPT test preparation, psychomotor screening drills, and airline cadet intake advice.',
    shorts: [],
    playlists: [],
  },
  'cabin-crew-training': {
    title: 'Cabin Crew Training & Grooming Masterclass',
    subtitle: 'Mock cabin emergency drills, grooming guidelines, and airline interview prep with senior instructors.',
    shorts: [],
    playlists: [],
  },
  'cas-compass-adapt': {
    title: 'CASS Compass & ADAPT Test Prep',
    subtitle: 'Aptitude screening breakdowns, spatial orientation tips, and fast mental math strategies.',
    shorts: [],
    playlists: [],
  },
  'flying-training-india-abroad': {
    title: 'CPL Flying Training: India vs Abroad',
    subtitle: 'Hour-building comparisons, DGCA license conversion checklists, and flight school walk-throughs.',
    shorts: [],
    playlists: [],
  },
  'gd-pi': {
    title: 'GD & Airline Personal Interview Coaching',
    subtitle: 'Mock GD panels, personality grooming, and situational answers with aviation industry veterans.',
    shorts: [],
    playlists: [],
  },
  'atpl': {
    title: 'ATPL Theory & Operational Procedures',
    subtitle: 'Advanced airline transport pilot license theory papers and multi-crew cooperation concepts.',
    shorts: [],
    playlists: [],
  },
  'private-pilot-license': {
    title: 'Private Pilot Licence Flying Briefings',
    subtitle: 'First solo flight prep, cockpit pre-flight inspections, and recreational flying fundamentals.',
    shorts: [],
    playlists: [],
  },
  'securing-your-childs-future-in-aviation': {
    title: 'Parent Aviation Guidance Series',
    subtitle: 'Transparent budget analysis, safety considerations, and commercial pilot career trajectories.',
    shorts: [],
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
