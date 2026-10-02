import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DESTINATIONS,
  HUB_POINT,
  MOBILE_VIEWBOX,
  PANEL_GROUPS,
  labelBox,
  project,
  routeArc,
  unproject,
} from './routeMap.js'
import { WORLD_LAND_PATH } from './worldLand.js'

const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps

test('equirectangular projection maps the frame corners and centre', () => {
  assert.deepEqual(project(0, 0), { x: 500, y: 250 })
  assert.deepEqual(project(90, -180), { x: 0, y: 0 })
  assert.deepEqual(project(-90, 180), { x: 1000, y: 500 })
  for (const [lat, lon] of [[28.58, 77.07], [-33.9, 151.2], [51.47, -0.45]]) {
    const { x, y } = project(lat, lon)
    const back = unproject(x, y)
    assert.ok(close(back.lat, lat) && close(back.lon, lon))
  }
})

test('hub is the Dwarka academy and lands where the old design placed Delhi', () => {
  assert.ok(Math.abs(HUB_POINT.x - 714) < 1, `hub x ${HUB_POINT.x}`)
  assert.ok(Math.abs(HUB_POINT.y - 170) < 1, `hub y ${HUB_POINT.y}`)
})

test('every marker is drawn at the projection of its real coordinates', () => {
  const seen = new Set()
  for (const d of DESTINATIONS) {
    assert.ok(!seen.has(d.iata), `duplicate ${d.iata}`)
    seen.add(d.iata)
    assert.ok(d.lat >= -90 && d.lat <= 90 && d.lon >= -180 && d.lon <= 180, d.iata)
    const p = project(d.lat, d.lon)
    assert.equal(d.x, p.x, `${d.iata} x`)
    assert.equal(d.y, p.y, `${d.iata} y`)
  }
})

test('relative geography is right (catches swapped or shifted coordinates)', () => {
  const at = Object.fromEntries(DESTINATIONS.map((d) => [d.iata, d]))
  const west = (a, b) => assert.ok(at[a].x < at[b].x, `${a} west of ${b}`)
  const north = (a, b) => assert.ok(at[a].y < at[b].y, `${a} north of ${b}`)
  west('BOM', 'HYD'); west('HYD', 'MAA'); north('HYD', 'BLR'); north('BOM', 'GOI')
  assert.ok(at.BOM.x < HUB_POINT.x && at.BOM.y > HUB_POINT.y, 'Mumbai is south-west of Delhi')
  west('RUH', 'DOH'); west('DOH', 'AUH'); west('AUH', 'DXB'); west('DXB', 'MCT')
  west('LHR', 'AMS'); west('AMS', 'FRA'); north('AMS', 'LHR'); north('LHR', 'FRA')
  west('YVR', 'JFK'); north('YVR', 'JFK'); west('JFK', 'LHR')
  north('BKK', 'KUL'); north('KUL', 'SIN'); west('KUL', 'SIN')
  // Known airport positions (to 0.1 viewBox unit).
  assert.ok(Math.abs(at.LHR.x - 498.7) < 0.1 && Math.abs(at.LHR.y - 107.0) < 0.1)
  assert.ok(Math.abs(at.SIN.x - 788.9) < 0.1 && Math.abs(at.SIN.y - 246.2) < 0.1)
})

test('panel routes and map markers agree', () => {
  const iatas = new Set(DESTINATIONS.map((d) => d.iata))
  for (const group of PANEL_GROUPS) {
    for (const item of group.items) {
      const [from, ...to] = item.route.split('•').map((s) => s.trim())
      assert.equal(from, 'DEL', item.route)
      for (const code of to) assert.ok(iatas.has(code), `${item.airline}: ${code} has no marker`)
    }
  }
})

function landRings() {
  return WORLD_LAND_PATH.split('M').filter(Boolean).map((s) =>
    s.replace('Z', '').split('L').map((p) => p.split(',').map(Number)),
  )
}

function insideLand(rings, x, y) {
  let inside = false
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}

function distanceToCoast(rings, x, y) {
  let best = Infinity
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x1, y1] = ring[j]
      const [x2, y2] = ring[i]
      const len2 = (x2 - x1) ** 2 + (y2 - y1) ** 2
      const t = len2 ? Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / len2)) : 0
      best = Math.min(best, Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1))))
    }
  }
  return best
}

test('hub and every airport sit on land (coastal airports within 1:110m coastline tolerance)', () => {
  const rings = landRings()
  assert.ok(rings.length > 50, 'land outline present')
  for (const p of [HUB_POINT, ...DESTINATIONS]) {
    const ok = insideLand(rings, p.x, p.y) || distanceToCoast(rings, p.x, p.y) < 2
    assert.ok(ok, `${p.iata} (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) is in the sea`)
  }
  // Sanity: mid-ocean points are not land.
  assert.equal(insideLand(rings, ...Object.values(project(0, -30))), false, 'mid Atlantic')
  assert.equal(insideLand(rings, ...Object.values(project(-10, 75))), false, 'Indian Ocean')
  assert.equal(insideLand(rings, ...Object.values(project(23, 79))), true, 'central India')
})

test('route arcs start at the hub, end at the airport and bow north', () => {
  for (const d of DESTINATIONS) {
    const m = /^M ([\d.]+) ([\d.]+) Q ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)$/.exec(routeArc(HUB_POINT, d))
    assert.ok(m, d.iata)
    const [x0, y0, cx, cy, x1, y1] = m.slice(1).map(Number)
    assert.ok(Math.abs(x0 - HUB_POINT.x) < 0.06 && Math.abs(y0 - HUB_POINT.y) < 0.06, `${d.iata} start`)
    assert.ok(Math.abs(x1 - d.x) < 0.06 && Math.abs(y1 - d.y) < 0.06, `${d.iata} end`)
    assert.ok(cy <= (y0 + y1) / 2 + 1e-6, `${d.iata} bows north`)
    assert.ok(Number.isFinite(cx))
  }
})

test('labels do not overlap each other or cover another airport', () => {
  const boxes = DESTINATIONS.map((d) => ({ d, b: labelBox(d) }))
  const overlap = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      assert.ok(!overlap(boxes[i].b, boxes[j].b), `${boxes[i].d.iata} label overlaps ${boxes[j].d.iata} label`)
    }
    for (const other of [HUB_POINT, ...DESTINATIONS]) {
      if (other.iata === boxes[i].d.iata) continue
      const { x0, x1, y0, y1 } = boxes[i].b
      const covers = other.x > x0 - 2 && other.x < x1 + 2 && other.y > y0 - 2 && other.y < y1 + 2
      assert.ok(!covers, `${boxes[i].d.iata} label covers ${other.iata}`)
    }
  }
})

test('mobile frame contains every non-American marker and its label anchor', () => {
  const [vx, vy, vw, vh] = MOBILE_VIEWBOX.split(' ').map(Number)
  const inFrame = (x, y) => x >= vx && x <= vx + vw && y >= vy && y <= vy + vh
  assert.ok(inFrame(HUB_POINT.x, HUB_POINT.y))
  for (const d of DESTINATIONS.filter((d) => d.region !== 'North America')) {
    assert.ok(inFrame(d.x, d.y), `${d.iata} marker`)
    assert.ok(inFrame(d.x + d.label.dx, d.y + d.label.dy), `${d.iata} label`)
  }
})
