// Geography for the homepage "A World of Cockpits" route map.
// Equirectangular (plate carrée) projection onto the SVG viewBox 0 0 1000 500:
//   x = (lon + 180) / 360 * 1000,  y = (90 - lat) / 180 * 500
// Airport coordinates are the published aerodrome reference points (WGS84).

export const MAP_WIDTH = 1000
export const MAP_HEIGHT = 500

export function project(lat, lon) {
  return {
    x: ((lon + 180) / 360) * MAP_WIDTH,
    y: ((90 - lat) / 180) * MAP_HEIGHT,
  }
}

export function unproject(x, y) {
  return { lat: 90 - (y / MAP_HEIGHT) * 180, lon: (x / MAP_WIDTH) * 360 - 180 }
}

/** Great-circle distance and flight telemetry calculation. */
export function calculateFlightTelemetry(fromLat, fromLon, toLat, toLon) {
  const R_NM = 3440.065 // Earth radius in nautical miles
  const dLat = ((toLat - fromLat) * Math.PI) / 180
  const dLon = ((toLon - fromLon) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const distanceNM = Math.round(2 * R_NM * Math.asin(Math.sqrt(a)))
  const distanceKM = Math.round(distanceNM * 1.852)

  // Cruising speed estimate (~440 kts ground speed + 24m taxi/climb/descent)
  const flightHoursDecimal = distanceNM / 440 + 0.4
  const hrs = Math.floor(flightHoursDecimal)
  const mins = Math.round((flightHoursDecimal - hrs) * 60)
  const durationStr = `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`
  const flightLevel = distanceNM < 800 ? 'FL340' : distanceNM < 2500 ? 'FL380' : 'FL410'

  return { distanceNM, distanceKM, durationStr, flightLevel }
}

export const ROUTE_CATEGORIES = [
  { id: 'all', label: 'All Global Sectors', count: 18, color: '#DB241E' },
  { id: 'India', label: 'Domestic India', count: 5, color: '#facc15' },
  { id: 'Middle East', label: 'Middle East & Gulf', count: 5, color: '#D8A027' },
  { id: 'Europe', label: 'Europe Corridors', count: 3, color: '#fb923c' },
  { id: 'North America', label: 'North America Non-Stop', count: 2, color: '#DB241E' },
  { id: 'SE Asia', label: 'Southeast Asia', count: 3, color: '#a855f7' },
]

/** Airborne Aviation Academy, Ramphal Chowk, Dwarka (same point as the footer map link). */
export const HUB = {
  id: 'del',
  iata: 'DEL',
  city: 'DWARKA · DELHI',
  country: 'INDIA',
  lat: 28.5845678,
  lon: 77.0716207,
}

export const REGION_COLORS = {
  'North America': '#DB241E',
  Europe: '#fb923c',
  'Middle East': '#D8A027',
  India: '#facc15',
  'SE Asia': '#a855f7',
}

// label: offset of the label anchor from the marker in viewBox units.
const AIRPORTS = [
  // India (domestic)
  {
    id: 'bom',
    iata: 'BOM',
    city: 'MUMBAI',
    region: 'India',
    lat: 19.0896,
    lon: 72.8656,
    airline: 'IndiGo',
    flightNo: '6E 2024',
    aircraft: 'Airbus A320neo',
    pos: 'First Officer',
    alumni: 'Ruzal Dhral',
    year: '2024',
    hours: '1,450+ hrs',
    quote: 'The rigorous simulator training and aerodynamics ground school at Airborne Dwarka made my airline line-check transition completely second nature.',
    label: { dx: -8, dy: -3, anchor: 'end' },
  },
  {
    id: 'goi',
    iata: 'GOI',
    city: 'GOA',
    region: 'India',
    lat: 15.3808,
    lon: 73.8314,
    airline: 'GoFirst',
    flightNo: 'G8 334',
    aircraft: 'Airbus A320neo',
    pos: 'Cadet Pilot',
    alumni: 'Naveen Kumar',
    year: '2023',
    hours: '850+ hrs',
    quote: 'From clearing DGCA Nav and Met on my first attempt to landing my cadet contract, Airborne was with me at every single flight hour checkpoint.',
    label: { dx: -8, dy: 4, anchor: 'end' },
  },
  {
    id: 'blr',
    iata: 'BLR',
    city: 'BENGALURU',
    region: 'India',
    lat: 13.1986,
    lon: 77.7066,
    airline: 'Air India',
    flightNo: 'AI 506',
    aircraft: 'Airbus A321neo',
    pos: 'First Officer',
    alumni: 'Nipun Singh',
    year: '2023',
    hours: '1,800+ hrs',
    quote: 'Commercial airline standards are practiced from day one in the academy classroom. The cockpit discipline I learned at Airborne reflects in every flight.',
    label: { dx: -8, dy: 11, anchor: 'end' },
  },
  {
    id: 'hyd',
    iata: 'HYD',
    city: 'HYDERABAD',
    region: 'India',
    lat: 17.2403,
    lon: 78.4294,
    airline: 'Akasa Air',
    flightNo: 'QP 1421',
    aircraft: 'Boeing 737 MAX 8',
    pos: 'Cadet Pilot',
    alumni: 'Adesh Yadav',
    year: '2024',
    hours: '920+ hrs',
    quote: 'Airborne’s airline interview preparation and technical mock evaluations gave me absolute confidence in securing my Boeing 737 fleet placement.',
    label: { dx: 8, dy: -5, anchor: 'start' },
  },
  {
    id: 'maa',
    iata: 'MAA',
    city: 'CHENNAI',
    region: 'India',
    lat: 12.9941,
    lon: 80.1709,
    origin: 'bom',
    airline: 'IndiGo',
    flightNo: '6E 6112',
    aircraft: 'Airbus A320neo',
    pos: 'Cadet Pilot',
    alumni: 'Priyanshi K.',
    year: '2024',
    hours: '1,100+ hrs',
    quote: 'Flying the coastal corridors for IndiGo is a dream come true. Airborne provided the mentorship, RT license training, and DGCA guidance that made it reality.',
    label: { dx: 8, dy: 0, anchor: 'start' },
  },

  // Middle East
  {
    id: 'ruh',
    iata: 'RUH',
    city: 'RIYADH',
    country: 'SAUDI ARABIA',
    region: 'Middle East',
    lat: 24.9576,
    lon: 46.6988,
    airline: 'Saudia',
    flightNo: 'SV 761',
    aircraft: 'Boeing 787-9 Dreamliner',
    pos: 'Cadet Pilot',
    alumni: 'Arjun Mehta',
    year: '2024',
    hours: '1,200+ hrs',
    quote: 'Airborne instilled global standards in our flight planning and meteorology classes. Handling Middle Eastern wide-body operations started right here in Delhi.',
    label: { dx: -10, dy: 12, anchor: 'end' },
  },
  {
    id: 'doh',
    iata: 'DOH',
    city: 'DOHA',
    country: 'QATAR',
    region: 'Middle East',
    lat: 25.2731,
    lon: 51.6081,
    airline: 'Qatar Airways',
    flightNo: 'QR 571',
    aircraft: 'Boeing 777-300ER',
    pos: 'Cadet Pilot',
    alumni: 'Kartik Juneja',
    year: '2023',
    hours: '1,350+ hrs',
    quote: 'Securing an airline seat at a world-tier 5-star carrier like Qatar Airways requires perfection in regulations and avionics theory. Airborne delivered that.',
    label: { dx: -7, dy: -14, anchor: 'end' },
  },
  {
    id: 'auh',
    iata: 'AUH',
    city: 'ABU DHABI',
    country: 'UAE',
    region: 'Middle East',
    lat: 24.433,
    lon: 54.6511,
    airline: 'Etihad Airways',
    flightNo: 'EY 211',
    aircraft: 'Airbus A350-1000',
    pos: 'First Officer',
    alumni: 'Nabansh Sardana',
    year: '2023',
    hours: '2,100+ hrs',
    quote: 'The personalized guidance from senior airline captains at Airborne helped me stand out in international carrier screening and simulator tests.',
    label: { dx: -6, dy: 14, anchor: 'end' },
  },
  {
    id: 'dxb',
    iata: 'DXB',
    city: 'DUBAI',
    country: 'UAE',
    region: 'Middle East',
    lat: 25.2532,
    lon: 55.3657,
    airline: 'Emirates',
    flightNo: 'EK 511',
    aircraft: 'Boeing 777-300ER',
    pos: 'First Officer',
    alumni: 'Zaid Al-Mansoor',
    year: '2023',
    hours: '2,400+ hrs',
    quote: 'Commanding international routes into Dubai started with structured instrument rating and ground theory mastery at the Dwarka academy campus.',
    label: { dx: -6, dy: -12, anchor: 'start' },
  },
  {
    id: 'mct',
    iata: 'MCT',
    city: 'MUSCAT',
    country: 'OMAN',
    region: 'Middle East',
    lat: 23.5933,
    lon: 58.2844,
    airline: 'Oman Air',
    flightNo: 'WY 242',
    aircraft: 'Boeing 737 MAX 8',
    pos: 'First Officer',
    alumni: 'Deepak Mohan',
    year: '2023',
    hours: '1,950+ hrs',
    quote: 'The instrument navigation procedures taught at Airborne are second to none. Flying complex international sectors feels natural and disciplined.',
    label: { dx: 8, dy: -14, anchor: 'start' },
  },

  // Europe
  {
    id: 'lhr',
    iata: 'LHR',
    city: 'LONDON',
    country: 'UK',
    region: 'Europe',
    lat: 51.47,
    lon: -0.4543,
    airline: 'Air India',
    flightNo: 'AI 161',
    aircraft: 'Boeing 777-300ER',
    pos: 'First Officer',
    alumni: 'Nipun Singh',
    year: '2023',
    hours: '2,800+ hrs',
    quote: 'Operating long-haul London Heathrow wide-body flights requires unshakeable ground foundation. Airborne Dwarka built that foundation for me.',
    label: { dx: -12, dy: 2, anchor: 'end' },
  },
  {
    id: 'ams',
    iata: 'AMS',
    city: 'AMSTERDAM',
    country: 'NETHERLANDS',
    region: 'Europe',
    lat: 52.3105,
    lon: 4.7683,
    airline: 'KLM',
    flightNo: 'KL 872',
    aircraft: 'Boeing 787-9 Dreamliner',
    pos: 'First Officer',
    alumni: 'Vikram Pandey',
    year: '2022',
    hours: '3,200+ hrs',
    quote: 'From cadet ground school in New Delhi to European airspace operations with KLM, the discipline instilled by Airborne faculty remains my compass.',
    label: { dx: 6, dy: -16, anchor: 'start' },
  },
  {
    id: 'fra',
    iata: 'FRA',
    city: 'FRANKFURT',
    country: 'GERMANY',
    region: 'Europe',
    lat: 50.0379,
    lon: 8.5622,
    airline: 'Lufthansa',
    flightNo: 'LH 761',
    aircraft: 'Airbus A350-900',
    pos: 'Cadet Pilot',
    alumni: 'Shreya Kapoor',
    year: '2024',
    hours: '1,150+ hrs',
    quote: 'Airborne’s structured DGCA syllabus coverage and technical precision gave me the competitive edge during Lufthansa cadet evaluations.',
    label: { dx: 12, dy: 12, anchor: 'start' },
  },

  // North America
  {
    id: 'yvr',
    iata: 'YVR',
    city: 'VANCOUVER',
    country: 'CANADA',
    region: 'North America',
    lat: 49.1967,
    lon: -123.1815,
    airline: 'Air India',
    flightNo: 'AI 185',
    aircraft: 'Boeing 777-200LR',
    pos: 'First Officer',
    alumni: 'Naman Gupta',
    year: '2024',
    hours: '2,600+ hrs',
    quote: 'Transpacific long-haul flights demand deep understanding of polar navigation and high-altitude weather. Everything started with Airborne’s classes.',
    label: { dx: 10, dy: 0, anchor: 'start' },
  },
  {
    id: 'jfk',
    iata: 'JFK',
    city: 'NEW YORK',
    country: 'USA',
    region: 'North America',
    lat: 40.6413,
    lon: -73.7781,
    airline: 'Air India',
    flightNo: 'AI 101',
    aircraft: 'Boeing 777-300ER',
    pos: 'First Officer',
    alumni: 'Rahul Sethi',
    year: '2023',
    hours: '3,100+ hrs',
    quote: 'Flying the flagship non-stop Delhi to New York route is the pinnacle of my career. The seed was planted right here at Airborne Aviation Academy.',
    label: { dx: 10, dy: 0, anchor: 'start' },
  },

  // SE Asia
  {
    id: 'bkk',
    iata: 'BKK',
    city: 'BANGKOK',
    country: 'THAILAND',
    region: 'SE Asia',
    lat: 13.69,
    lon: 100.7501,
    airline: 'Thai Airways',
    flightNo: 'TG 316',
    aircraft: 'Airbus A350-900',
    pos: 'Cadet Pilot',
    alumni: 'Rohit Verma',
    year: '2024',
    hours: '950+ hrs',
    quote: 'Clear communication, aviation English, and deep systems knowledge made airline cadet intake smooth and straightforward.',
    label: { dx: 12, dy: -6, anchor: 'start' },
  },
  {
    id: 'kul',
    iata: 'KUL',
    city: 'KUALA LUMPUR',
    country: 'MALAYSIA',
    region: 'SE Asia',
    lat: 2.7456,
    lon: 101.7099,
    airline: 'AirAsia',
    flightNo: 'AK 12',
    aircraft: 'Airbus A320neo',
    pos: 'First Officer',
    alumni: 'Priya Madan',
    year: '2023',
    hours: '1,750+ hrs',
    quote: 'The faculty at Airborne doesn’t just teach you to pass exams—they train you to think like an airline pilot from your first ground lesson.',
    label: { dx: -12, dy: 6, anchor: 'end' },
  },
  {
    id: 'sin',
    iata: 'SIN',
    city: 'SINGAPORE',
    country: 'SINGAPORE',
    region: 'SE Asia',
    lat: 1.3644,
    lon: 103.9915,
    airline: 'Singapore Airlines',
    flightNo: 'SQ 403',
    aircraft: 'Airbus A350-900',
    pos: 'First Officer',
    alumni: 'Ankit Sharma',
    year: '2022',
    hours: '3,400+ hrs',
    quote: 'From zero flight hours to commanding cockpits with Singapore Airlines—Airborne Aviation gave me the technical wings and career roadmap.',
    label: { dx: 12, dy: 10, anchor: 'start' },
  },
]

export const HUB_POINT = { ...HUB, ...project(HUB.lat, HUB.lon) }

export const DESTINATIONS = AIRPORTS.map((a) => {
  const { x, y } = project(a.lat, a.lon)
  const origin = a.origin ? AIRPORTS.find((o) => o.id === a.origin) || HUB : HUB
  const telemetry = calculateFlightTelemetry(origin.lat, origin.lon, a.lat, a.lon)
  return { ...a, x, y, telemetry }
})

/** Label typography (viewBox units) and the text baselines relative to the label anchor. */
export const LABEL_FONT = {
  iata: 6.6,
  city: 4.3,
  country: 3.7,
  pad: 1.5,
  iataY: -2,
  cityY: 4.6,
  countryY: 9.6,
}

/** Approximate box covered by an airport's label (~0.62em per uppercase glyph). */
export function labelBox(d) {
  const lx = d.x + d.label.dx
  const ly = d.y + d.label.dy
  const width =
    Math.max(
      d.iata.length * LABEL_FONT.iata * 0.62,
      d.city.length * LABEL_FONT.city * 0.62,
      (d.country ?? '').length * LABEL_FONT.country * 0.62,
    ) + LABEL_FONT.pad
  const x0 = d.label.anchor === 'end' ? lx - width : lx
  return { x0, x1: x0 + width, y0: ly - 7, y1: ly + (d.country ? 10.5 : 5.5) }
}

/**
 * Quadratic route arc from the hub to (x, y). The control point sits on the
 * perpendicular bisector, bowed poleward like a great-circle route on this
 * projection; longer routes bow proportionally more.
 */
export function routeArc(from, to, bow = 0.18) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  if (dist === 0) return `M ${from.x} ${from.y}`
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  // Unit normal; pick the side that points north (smaller y) on screen.
  let nx = -dy / dist
  let ny = dx / dist
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx
    ny = -ny
  }

  // Prevent north-south vertical routes (|dy| >> |dx|) from ballooning horizontally
  const aspect = Math.abs(dx) / (Math.abs(dy) + 1e-6)
  const hDamp = Math.min(1.0, Math.max(0.22, aspect * 1.15))

  // Short routes (domestic India, Gulf) use a tighter bow to prevent looping
  const effectiveBow = dist < 70 ? Math.min(bow, 0.12) : Math.min(bow, 0.2)
  const k = dist * effectiveBow

  const cx = mx + nx * k * hDamp
  let cy = my + ny * k

  // Invariant: cy must always be <= my (bows north) to satisfy great-circle feel and tests
  if (cy > my) cy = my - Math.abs(ny * k)

  const r = (n) => Math.round(n * 10) / 10
  return `M ${r(from.x)} ${r(from.y)} Q ${r(cx)} ${r(cy)} ${r(to.x)} ${r(to.y)}`
}

/** Major population centres for the decorative city-light layer (real positions). */
const CITY_LIGHT_COORDS = [
  [40.71, -74.01], [34.05, -118.24], [41.88, -87.63], [29.76, -95.37], [43.65, -79.38], [45.5, -73.57],
  [19.43, -99.13], [25.76, -80.19], [47.61, -122.33], [39.74, -104.99], [33.75, -84.39], [37.77, -122.42],
  [-23.55, -46.63], [-22.91, -43.17], [-34.6, -58.38], [4.71, -74.07], [-12.05, -77.04], [-33.45, -70.67],
  [51.51, -0.13], [48.86, 2.35], [52.52, 13.4], [40.42, -3.7], [41.9, 12.5], [55.76, 37.62], [59.33, 18.07],
  [50.45, 30.52], [41.01, 28.98], [52.23, 21.01], [30.04, 31.24], [6.52, 3.38], [-1.29, 36.82], [-26.2, 28.05],
  [-33.92, 18.42], [33.57, -7.59], [9.03, 38.74], [24.71, 46.68], [25.2, 55.27], [35.69, 51.39], [33.31, 44.36],
  [31.55, 74.34], [24.86, 67.0], [28.61, 77.21], [19.08, 72.88], [22.57, 88.36], [12.97, 77.59], [13.08, 80.27],
  [17.39, 78.49], [23.02, 72.57], [26.85, 80.95], [23.81, 90.41], [39.9, 116.41], [31.23, 121.47], [22.32, 114.17],
  [35.68, 139.69], [37.57, 126.98], [13.76, 100.5], [3.14, 101.69], [1.35, 103.82], [-6.21, 106.85], [14.6, 120.98],
  [21.03, 105.85], [-33.87, 151.21], [-37.81, 144.96], [-27.47, 153.03], [-31.95, 115.86], [-36.85, 174.76],
]
export const CITY_LIGHTS = CITY_LIGHT_COORDS.map(([lat, lon]) => project(lat, lon))

export const DESKTOP_VIEWBOX = '0 0 1000 500'
/** Small screens: Europe → SE Asia corridor (x, y, width, height). */
export const MOBILE_VIEWBOX = '455 62 380 220'

/** "Airborne alumni fly with" panel; every route code must have a marker. */
export const PANEL_GROUPS = [
  {
    label: 'India',
    color: '#facc15',
    items: [
      { airline: 'IndiGo', route: 'DEL • BOM • MAA' },
      { airline: 'Air India', route: 'DEL • BLR' },
      { airline: 'Akasa Air', route: 'DEL • HYD' },
    ],
  },
  {
    label: 'Middle East',
    color: '#D8A027',
    items: [
      { airline: 'Emirates', route: 'DEL • DXB' },
      { airline: 'Qatar Airways', route: 'DEL • DOH' },
      { airline: 'Etihad Airways', route: 'DEL • AUH' },
      { airline: 'Saudia', route: 'DEL • RUH' },
      { airline: 'Oman Air', route: 'DEL • MCT' },
    ],
  },
  {
    label: 'SE Asia',
    color: '#a855f7',
    items: [
      { airline: 'Singapore Airlines', route: 'DEL • SIN' },
      { airline: 'AirAsia', route: 'DEL • KUL' },
      { airline: 'Thai Airways', route: 'DEL • BKK' },
    ],
  },
  {
    label: 'Europe',
    color: '#fb923c',
    items: [
      { airline: 'Air India', route: 'DEL • LHR' },
      { airline: 'Lufthansa', route: 'DEL • FRA' },
      { airline: 'KLM', route: 'DEL • AMS' },
    ],
  },
  {
    label: 'North America',
    color: '#DB241E',
    items: [
      { airline: 'Air India', route: 'DEL • JFK' },
      { airline: 'Air India', route: 'DEL • YVR' },
    ],
  },
]

/** 30° graticule in viewBox units. */
export const GRATICULE = {
  parallels: [60, 30, 0, -30, -60].map((lat) => project(lat, 0).y),
  meridians: [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => project(0, lon).x),
}
