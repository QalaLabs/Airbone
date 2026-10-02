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

/** Airborne Aviation Academy, Ramphal Chowk, Dwarka (same point as the footer map link). */
export const HUB = { id: 'del', iata: 'DEL', city: 'DWARKA · DELHI', country: 'INDIA', lat: 28.5845678, lon: 77.0716207 }

export const REGION_COLORS = {
  'North America': '#DB241E',
  Europe: '#fb923c',
  'Middle East': '#D8A027',
  India: '#facc15',
  'SE Asia': '#a855f7',
}

// label: offset of the label anchor from the marker in viewBox units. Clustered
// airports (India, Gulf, Europe, SE Asia) use callouts with a leader line so the
// markers can stay at their true positions.
const AIRPORTS = [
  // India (domestic)
  { id: 'bom', iata: 'BOM', city: 'MUMBAI', region: 'India', lat: 19.0896, lon: 72.8656, airline: 'IndiGo', pos: 'First Officer', alumni: 'Ruzal Dhral', year: '2024', label: { dx: -12, dy: 3, anchor: 'end' } },
  { id: 'goi', iata: 'GOI', city: 'GOA', region: 'India', lat: 15.3808, lon: 73.8314, airline: 'GoFirst', pos: 'Cadet', alumni: 'Naveen Kumar', year: '2023', label: { dx: -11, dy: 18, anchor: 'end' } },
  { id: 'blr', iata: 'BLR', city: 'BENGALURU', region: 'India', lat: 13.1986, lon: 77.7066, airline: 'Air India', pos: 'First Officer', alumni: 'Nipun Singh', year: '2023', label: { dx: -7, dy: 23, anchor: 'start' } },
  { id: 'hyd', iata: 'HYD', city: 'HYDERABAD', region: 'India', lat: 17.2403, lon: 78.4294, airline: 'Akasa', pos: 'Cadet', alumni: 'Adesh Yadav', year: '2024', label: { dx: 24, dy: -4, anchor: 'start' } },
  { id: 'maa', iata: 'MAA', city: 'CHENNAI', region: 'India', lat: 12.9941, lon: 80.1709, airline: 'IndiGo', pos: 'Cadet', alumni: 'Priyanshi K.', year: '2024', label: { dx: 21, dy: 8, anchor: 'start' } },

  // Middle East
  { id: 'ruh', iata: 'RUH', city: 'RIYADH', country: 'SAUDI ARABIA', region: 'Middle East', lat: 24.9576, lon: 46.6988, airline: 'Saudia', pos: 'Cadet', alumni: 'Arjun Mehta', year: '2024', label: { dx: -14, dy: 17, anchor: 'end' } },
  { id: 'doh', iata: 'DOH', city: 'DOHA', country: 'QATAR', region: 'Middle East', lat: 25.2731, lon: 51.6081, airline: 'Qatar Airways', pos: 'Cadet', alumni: 'Kartik Juneja', year: '2023', label: { dx: -9, dy: -18, anchor: 'end' } },
  { id: 'auh', iata: 'AUH', city: 'ABU DHABI', country: 'UAE', region: 'Middle East', lat: 24.433, lon: 54.6511, airline: 'Etihad', pos: 'First Officer', alumni: 'Nabansh Sardana', year: '2023', label: { dx: -4, dy: 28, anchor: 'end' } },
  { id: 'dxb', iata: 'DXB', city: 'DUBAI', country: 'UAE', region: 'Middle East', lat: 25.2532, lon: 55.3657, airline: 'Emirates', label: { dx: -6, dy: -32, anchor: 'start' } },
  { id: 'mct', iata: 'MCT', city: 'MUSCAT', country: 'OMAN', region: 'Middle East', lat: 23.5933, lon: 58.2844, airline: 'Oman Air', pos: 'First Officer', alumni: 'Deepak Mohan', year: '2023', label: { dx: 8, dy: -18, anchor: 'start' } },

  // Europe
  { id: 'lhr', iata: 'LHR', city: 'LONDON', country: 'UK', region: 'Europe', lat: 51.47, lon: -0.4543, airline: 'Air India', pos: 'First Officer', alumni: 'Nipun Singh', year: '2023', label: { dx: -12, dy: 2, anchor: 'end' } },
  { id: 'ams', iata: 'AMS', city: 'AMSTERDAM', country: 'NETHERLANDS', region: 'Europe', lat: 52.3105, lon: 4.7683, airline: 'KLM', pos: 'First Officer', alumni: 'Vikram Pandey', year: '2022', label: { dx: 6, dy: -16, anchor: 'start' } },
  { id: 'fra', iata: 'FRA', city: 'FRANKFURT', country: 'GERMANY', region: 'Europe', lat: 50.0379, lon: 8.5622, airline: 'Lufthansa', pos: 'Cadet', alumni: 'Shreya Kapoor', year: '2024', label: { dx: 12, dy: 12, anchor: 'start' } },

  // North America
  { id: 'yvr', iata: 'YVR', city: 'VANCOUVER', country: 'CANADA', region: 'North America', lat: 49.1967, lon: -123.1815, airline: 'Air India', pos: 'First Officer', alumni: 'Naman Gupta', year: '2024', label: { dx: 10, dy: 0, anchor: 'start' } },
  { id: 'jfk', iata: 'JFK', city: 'NEW YORK', country: 'USA', region: 'North America', lat: 40.6413, lon: -73.7781, airline: 'Air India', pos: 'First Officer', alumni: 'Rahul Sethi', year: '2023', label: { dx: 10, dy: 0, anchor: 'start' } },

  // SE Asia
  { id: 'bkk', iata: 'BKK', city: 'BANGKOK', country: 'THAILAND', region: 'SE Asia', lat: 13.69, lon: 100.7501, airline: 'Thai Airways', pos: 'Cadet', alumni: 'Rohit Verma', year: '2024', label: { dx: 12, dy: -6, anchor: 'start' } },
  { id: 'kul', iata: 'KUL', city: 'KUALA LUMPUR', country: 'MALAYSIA', region: 'SE Asia', lat: 2.7456, lon: 101.7099, airline: 'AirAsia', pos: 'First Officer', alumni: 'Priya Madan', year: '2023', label: { dx: -12, dy: 6, anchor: 'end' } },
  { id: 'sin', iata: 'SIN', city: 'SINGAPORE', country: 'SINGAPORE', region: 'SE Asia', lat: 1.3644, lon: 103.9915, airline: 'Singapore Airlines', pos: 'First Officer', alumni: 'Ankit Sharma', year: '2022', label: { dx: 12, dy: 10, anchor: 'start' } },
]

export const HUB_POINT = { ...HUB, ...project(HUB.lat, HUB.lon) }

export const DESTINATIONS = AIRPORTS.map((a) => {
  const { x, y } = project(a.lat, a.lon)
  return { ...a, x, y }
})

/** Label typography (viewBox units) and the text baselines relative to the label anchor. */
export const LABEL_FONT = { iata: 6.6, city: 4.3, country: 3.7, pad: 1.5, iataY: -2, cityY: 4.6, countryY: 9.6 }

/** Approximate box covered by an airport's label (~0.62em per uppercase glyph). */
export function labelBox(d) {
  const lx = d.x + d.label.dx
  const ly = d.y + d.label.dy
  const width = Math.max(
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
export function routeArc(from, to, bow = 0.22) {
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
  const k = dist * bow
  const r = (n) => Math.round(n * 10) / 10
  return `M ${r(from.x)} ${r(from.y)} Q ${r(mx + nx * k)} ${r(my + ny * k)} ${r(to.x)} ${r(to.y)}`
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
  { label: 'India', color: '#facc15', items: [
    { airline: 'IndiGo', route: 'DEL • BOM • MAA' },
    { airline: 'Air India', route: 'DEL • BLR' },
    { airline: 'Akasa Air', route: 'DEL • HYD' },
  ] },
  { label: 'Middle East', color: '#D8A027', items: [
    { airline: 'Emirates', route: 'DEL • DXB' },
    { airline: 'Qatar Airways', route: 'DEL • DOH' },
    { airline: 'Etihad Airways', route: 'DEL • AUH' },
    { airline: 'Saudia', route: 'DEL • RUH' },
    { airline: 'Oman Air', route: 'DEL • MCT' },
  ] },
  { label: 'SE Asia', color: '#a855f7', items: [
    { airline: 'Singapore Airlines', route: 'DEL • SIN' },
    { airline: 'AirAsia', route: 'DEL • KUL' },
    { airline: 'Thai Airways', route: 'DEL • BKK' },
  ] },
  { label: 'Europe', color: '#fb923c', items: [
    { airline: 'Air India', route: 'DEL • LHR' },
    { airline: 'Lufthansa', route: 'DEL • FRA' },
    { airline: 'KLM', route: 'DEL • AMS' },
  ] },
]

/** 30° graticule in viewBox units. */
export const GRATICULE = {
  parallels: [60, 30, 0, -30, -60].map((lat) => project(lat, 0).y),
  meridians: [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => project(0, lon).x),
}
