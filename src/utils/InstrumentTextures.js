import * as THREE from 'three'

/**
 * Creates a canvas-based PFD (Primary Flight Display) texture.
 * Features: artificial horizon, speed tape, altitude tape, heading arc.
 */
export function createPFDTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Background — dark blue-black
  ctx.fillStyle = '#0a0f1a'
  ctx.fillRect(0, 0, width, height)

  // ── ARTIFICIAL HORIZON ──
  const cx = width / 2
  const cy = height / 2
  const hRadius = Math.min(width, height) * 0.35

  // Sky half
  ctx.save()
  ctx.beginPath()
  ctx.rect(cx - hRadius, cy - hRadius, hRadius * 2, hRadius * 2)
  ctx.clip()
  ctx.fillStyle = '#1a4a8a'
  ctx.fillRect(cx - hRadius, cy - hRadius, hRadius * 2, hRadius)
  // Ground half
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(cx - hRadius, cy, hRadius * 2, hRadius)
  // Horizon line
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - hRadius, cy)
  ctx.lineTo(cx + hRadius, cy)
  ctx.stroke()
  ctx.restore()

  // Pitch ladder
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 1.5
  ctx.font = 'bold 14px Courier New'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  for (let pitch = -20; pitch <= 20; pitch += 5) {
    if (pitch === 0) continue
    const y = cy + pitch * 4
    const lineW = pitch % 10 === 0 ? 50 : 30
    ctx.beginPath()
    ctx.moveTo(cx - lineW, y)
    ctx.lineTo(cx + lineW, y)
    ctx.stroke()
    if (pitch % 10 === 0) {
      ctx.fillText(Math.abs(pitch).toString(), cx + lineW + 5, y + 4)
      ctx.fillText(Math.abs(pitch).toString(), cx - lineW - 25, y + 4)
    }
  }
  ctx.restore()

  // Aircraft symbol
  ctx.save()
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  // Wings
  ctx.beginPath()
  ctx.moveTo(cx - 40, cy)
  ctx.lineTo(cx - 15, cy)
  ctx.lineTo(cx - 15, cy + 8)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 40, cy)
  ctx.lineTo(cx + 15, cy)
  ctx.lineTo(cx + 15, cy + 8)
  ctx.stroke()
  // Center dot
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // ── SPEED TAPE (LEFT) ──
  const speedTapeX = 20
  const speedTapeW = 55
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(speedTapeX, cy - 80, speedTapeW, 160)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.strokeRect(speedTapeX, cy - 80, speedTapeW, 160)

  // Speed values
  ctx.font = 'bold 13px Courier New'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'right'
  const currentSpeed = 250
  for (let s = currentSpeed - 20; s <= currentSpeed + 20; s += 5) {
    const y = cy + (currentSpeed - s) * 4
    if (y < cy - 75 || y > cy + 75) continue
    ctx.fillText(s.toString(), speedTapeX + speedTapeW - 4, y + 4)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath()
    ctx.moveTo(speedTapeX + speedTapeW - 20, y)
    ctx.lineTo(speedTapeX + speedTapeW, y)
    ctx.stroke()
  }
  // Current speed box
  ctx.fillStyle = '#001040'
  ctx.fillRect(speedTapeX, cy - 14, speedTapeW, 28)
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1.5
  ctx.strokeRect(speedTapeX, cy - 14, speedTapeW, 28)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 17px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(currentSpeed.toString(), speedTapeX + speedTapeW / 2, cy + 6)
  ctx.textAlign = 'left'

  // ── ALTITUDE TAPE (RIGHT) ──
  const altTapeX = width - 80
  const altTapeW = 60
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(altTapeX, cy - 80, altTapeW, 160)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.strokeRect(altTapeX, cy - 80, altTapeW, 160)

  ctx.font = 'bold 11px Courier New'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'left'
  const currentAlt = 35000
  for (let a = currentAlt - 500; a <= currentAlt + 500; a += 100) {
    const y = cy + (currentAlt - a) * 0.08
    if (y < cy - 75 || y > cy + 75) continue
    ctx.fillText(a.toString(), altTapeX + 4, y + 4)
  }
  ctx.fillStyle = '#001040'
  ctx.fillRect(altTapeX, cy - 14, altTapeW, 28)
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1.5
  ctx.strokeRect(altTapeX, cy - 14, altTapeW, 28)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 12px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText('35000', altTapeX + altTapeW / 2, cy + 6)
  ctx.textAlign = 'left'

  // ── HEADING INDICATOR (BOTTOM) ──
  const hdgY = height - 55
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(cx - 100, hdgY, 200, 45)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.strokeRect(cx - 100, hdgY, 200, 45)

  ctx.font = 'bold 12px Courier New'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  const currentHdg = 270
  for (let h = currentHdg - 20; h <= currentHdg + 20; h += 5) {
    const x = cx + (h - currentHdg) * 5
    if (x < cx - 95 || x > cx + 95) continue
    ctx.fillText(h.toString(), x, hdgY + 28)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.moveTo(x, hdgY + 4)
    ctx.lineTo(x, hdgY + 14)
    ctx.stroke()
  }
  // Heading bug
  ctx.fillStyle = '#00E5FF'
  ctx.beginPath()
  ctx.moveTo(cx, hdgY - 3)
  ctx.lineTo(cx - 6, hdgY + 4)
  ctx.lineTo(cx + 6, hdgY + 4)
  ctx.fill()

  // ── MODE ANNUNCIATORS ──
  ctx.font = 'bold 10px Courier New'
  const modes = [
    { x: 30, y: 22, color: '#00FF40', text: 'AP' },
    { x: 65, y: 22, color: '#00FF40', text: 'A/T' },
    { x: 115, y: 22, color: '#00E5FF', text: 'ALT CRZ' },
    { x: 220, y: 22, color: '#00E5FF', text: 'HDG SEL' },
    { x: 340, y: 22, color: '#00E5FF', text: 'VNAV SPD' },
  ]
  modes.forEach(m => {
    ctx.fillStyle = m.color
    ctx.textAlign = 'left'
    ctx.fillText(m.text, m.x, m.y)
  })

  // ── VERTICAL SPEED ──
  ctx.font = 'bold 11px Courier New'
  ctx.fillStyle = '#00E5FF'
  ctx.textAlign = 'right'
  ctx.fillText('+1200', width - 4, cy - 85)
  ctx.font = '9px Courier New'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('FPM', width - 4, cy - 74)

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(1, 1, width - 2, height - 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Navigation Display (ND) texture
 */
export function createNDTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#050c1a'
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2 + 30

  // Compass arc
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 180, -Math.PI * 1.1, Math.PI * 0.1)
  ctx.stroke()

  // Compass ticks and labels
  ctx.font = 'bold 14px Courier New'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  const hdgLabels = [
    { a: 270, l: 'W' }, { a: 315, l: 'NW' }, { a: 0, l: 'N' },
    { a: 45, l: 'NE' }, { a: 90, l: 'E' }, { a: 135, l: 'SE' },
    { a: 180, l: 'S' }, { a: 225, l: 'SW' }
  ]
  const currentHdg = 270
  hdgLabels.forEach(({ a, l }) => {
    const angle = (a - currentHdg - 90) * Math.PI / 180
    const tx = cx + Math.cos(angle) * 165
    const ty = cy + Math.sin(angle) * 165
    ctx.fillStyle = l === 'N' ? '#DB241E' : '#FFFFFF'
    ctx.fillText(l, tx, ty + 5)
  })

  // Degree ticks
  for (let deg = 0; deg < 360; deg += 5) {
    const angle = (deg - currentHdg - 90) * Math.PI / 180
    const isMajor = deg % 30 === 0
    const r1 = 180
    const r2 = isMajor ? 165 : 172
    const x1 = cx + Math.cos(angle) * r1
    const y1 = cy + Math.sin(angle) * r1
    const x2 = cx + Math.cos(angle) * r2
    const y2 = cy + Math.sin(angle) * r2
    ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'
    ctx.lineWidth = isMajor ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Track line (current track)
  ctx.strokeStyle = '#00FF40'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx, cy - 150)
  ctx.stroke()

  // Aircraft symbol
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, cy - 18)
  ctx.lineTo(cx, cy + 8)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - 18, cy)
  ctx.lineTo(cx + 18, cy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - 8, cy + 8)
  ctx.lineTo(cx + 8, cy + 8)
  ctx.stroke()

  // Range rings
  ctx.strokeStyle = 'rgba(0,150,255,0.25)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, 90, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Waypoints
  const waypoints = [
    { x: cx + 60, y: cy - 120, name: 'DEVGA', dist: '128', color: '#00E5FF' },
    { x: cx - 40, y: cy - 80, name: 'KESAR', dist: '86', color: '#00E5FF' },
  ]
  waypoints.forEach(wp => {
    ctx.fillStyle = wp.color
    ctx.beginPath()
    ctx.moveTo(wp.x, wp.y - 8)
    ctx.lineTo(wp.x - 6, wp.y + 4)
    ctx.lineTo(wp.x + 6, wp.y + 4)
    ctx.fill()
    ctx.font = '11px Courier New'
    ctx.textAlign = 'left'
    ctx.fillText(wp.name, wp.x + 10, wp.y)
    ctx.fillStyle = 'rgba(0,229,255,0.6)'
    ctx.fillText(wp.dist + 'nm', wp.x + 10, wp.y + 12)
    // Magenta route line
    ctx.strokeStyle = 'rgba(255,0,220,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(wp.x, wp.y)
    ctx.stroke()
  })

  // Mode box top
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(10, 10, 200, 30)
  ctx.font = 'bold 11px Courier New'
  ctx.fillStyle = '#00E5FF'
  ctx.textAlign = 'left'
  ctx.fillText('APP  40nm  HDG270', 16, 30)

  // Groundspeed / Wind box
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(10, height - 50, 120, 40)
  ctx.font = 'bold 11px Courier New'
  ctx.fillStyle = '#00FF40'
  ctx.fillText('GS  452kt', 16, height - 32)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('W 012° / 18kt', 16, height - 18)

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.strokeRect(1, 1, width - 2, height - 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * ECAM Engine Display texture
 */
export function createECAMTexture(width = 512, height = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#050c1a'
  ctx.fillRect(0, 0, width, height)

  const drawGauge = (cx, cy, r, value, max, label, unit, color) => {
    // Arc background
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25)
    ctx.stroke()
    // Value arc
    const pct = Math.min(value / max, 1)
    ctx.strokeStyle = color
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 0.75 + pct * Math.PI * 1.5)
    ctx.stroke()
    ctx.lineCap = 'butt'
    // Value text
    ctx.font = 'bold 20px Courier New'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(value.toString(), cx, cy + 6)
    // Unit
    ctx.font = '9px Courier New'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(unit, cx, cy + 18)
    // Label
    ctx.font = 'bold 10px Courier New'
    ctx.fillStyle = color
    ctx.fillText(label, cx, cy - r - 6)
  }

  // N1 gauges
  drawGauge(90, 100, 55, 87, 100, 'N1', '%', '#00FF40')
  drawGauge(260, 100, 55, 87, 100, 'N1', '%', '#00FF40')

  // EGT
  ctx.font = 'bold 11px Courier New'
  ctx.fillStyle = '#FF8C00'
  ctx.textAlign = 'left'
  ctx.fillText('EGT  1: 634°C', 360, 60)
  ctx.fillText('EGT  2: 631°C', 360, 78)
  ctx.fillStyle = '#00E5FF'
  ctx.fillText('FF   1: 3240kg/h', 360, 100)
  ctx.fillText('FF   2: 3218kg/h', 360, 118)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('OIL  1: 82psi', 360, 140)
  ctx.fillText('OIL  2: 84psi', 360, 158)

  // Fuel
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(10, height - 40, width - 20, 1)
  ctx.font = 'bold 11px Courier New'
  ctx.fillStyle = '#00E5FF'
  ctx.textAlign = 'left'
  ctx.fillText('FOB: 14.2t', 10, height - 20)
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'right'
  ctx.fillText('TAT: -42°C  |  SAT: -56°C  |  TIME: 02h14m', width - 10, height - 20)

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.strokeRect(1, 1, width - 2, height - 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * FCU/MCP (Flight Control Unit) panel texture
 */
export function createFCUTexture(width = 768, height = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0d0d16'
  ctx.fillRect(0, 0, width, height)

  // Panel border
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(2, 2, width - 4, height - 4)

  const drawSelector = (x, label, value, unit, color = '#00E5FF') => {
    // Selector knob circle
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, 55, 28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#1a1a28'
    ctx.fill()

    // Tick marks
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = x + Math.cos(angle) * 28
      const y1 = 55 + Math.sin(angle) * 28
      const x2 = x + Math.cos(angle) * 22
      const y2 = 55 + Math.sin(angle) * 22
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Indicator dot
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, 27, 3, 0, Math.PI * 2)
    ctx.fill()

    // Value display
    ctx.font = 'bold 16px Courier New'
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.fillText(value, x, 102)
    ctx.font = '9px Courier New'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText(unit, x, 114)

    // Label
    ctx.font = 'bold 8px Courier New'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(label, x, 14)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + 55, 10)
    ctx.lineTo(x + 55, height - 10)
    ctx.stroke()
  }

  drawSelector(80, 'SPEED', '250', 'KT', '#00E5FF')
  drawSelector(220, 'MACH', '.82', 'M', '#00E5FF')
  drawSelector(360, 'HDG / TRACK', '270', '°', '#00E5FF')
  drawSelector(500, 'ALT', '35000', 'FT', '#00E5FF')
  drawSelector(640, 'V/S - FPA', '+1200', 'FT/MIN', '#00E5FF')

  // Push/Pull annotations
  ctx.font = '7px Courier New'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.textAlign = 'center'
  ;[80, 220, 360, 500, 640].forEach(x => {
    ctx.fillText('PULL → MAN', x, 42)
    ctx.fillText('PUSH → AUTO', x, 52)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}
