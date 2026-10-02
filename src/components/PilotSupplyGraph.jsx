import {
  COUNT_TICKS,
  FRAME,
  LAST_YEAR,
  PILOT_SUPPLY,
  SERIES,
  SHARE_TICKS,
  formatValue,
  pointFor,
  seriesPath,
  xForYear,
  yForCount,
  yForShare,
} from '@/lib/pilotSupplyData'

const AXIS_TEXT = { fill: 'rgba(0,39,76,0.5)', fontSize: 10, fontWeight: 500 }

/* ─────────────────────────────────────
   TRIPLE LINE GRAPH (PILOT SUPPLY IN INDIA)
   Counts use the left axis, the share line uses the right (%) axis.
───────────────────────────────────── */
export default function PilotSupplyGraph() {
  const last = PILOT_SUPPLY[PILOT_SUPPLY.length - 1]
  return (
    <div
      data-testid="pilot-supply-chart"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0, 39, 76, 0.08)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,39,76,0.04)',
        marginTop: '3rem',
        marginBottom: '4rem',
        fontFamily: 'var(--font-b)'
      }}
    >
      <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
        <span>Indian Airline Pilot Supply & Airborne Share (2015-2025)</span>
      </h4>
      <p style={{ fontSize: '0.82rem', color: 'rgba(33,33,33,0.65)', lineHeight: 1.6, marginBottom: '2rem' }}>
        Historical expansion of active commercial pilots in Indian airlines compared to Airborne graduates. Airborne Aviation supplies approximately 10% of new pilot placements (1,500 active pilots).
      </p>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} role="img" aria-label="Line chart of active airline pilots in India, Airborne alumni and Airborne share, 2015 to 2025" style={{ width: '100%', minWidth: '600px', display: 'block' }}>
          {/* Grid lines on the count ticks */}
          {COUNT_TICKS.map((v) => (
            <line key={`g${v}`} x1={FRAME.left} y1={yForCount(v)} x2={FRAME.right} y2={yForCount(v)} stroke="#f1f5f9" strokeWidth="1" />
          ))}

          {/* Axes */}
          <line x1={FRAME.left} y1={FRAME.bottom} x2={FRAME.right} y2={FRAME.bottom} stroke="rgba(0,39,76,0.15)" strokeWidth="2" />
          <line x1={FRAME.left} y1={FRAME.top} x2={FRAME.left} y2={FRAME.bottom} stroke="rgba(0,39,76,0.15)" strokeWidth="2" />
          <line x1={FRAME.right} y1={FRAME.top} x2={FRAME.right} y2={FRAME.bottom} stroke="rgba(216,160,39,0.35)" strokeWidth="1.5" />

          {/* Left axis: pilots */}
          <g data-testid="supply-axis-count">
            {COUNT_TICKS.map((v) => (
              <text key={v} x={FRAME.left - 10} y={yForCount(v) + 4} textAnchor="end" {...AXIS_TEXT}>{v.toLocaleString('en-IN')}</text>
            ))}
            <text x={18} y={(FRAME.top + FRAME.bottom) / 2} transform={`rotate(-90 18 ${(FRAME.top + FRAME.bottom) / 2})`} textAnchor="middle" fill="rgba(0,39,76,0.55)" fontSize="10" fontWeight="700">PILOTS</text>
          </g>

          {/* Right axis: share */}
          <g data-testid="supply-axis-share">
            {SHARE_TICKS.map((p) => (
              <text key={p} x={FRAME.right + 8} y={yForShare(p) + 4} textAnchor="start" fill="var(--gold)" fontSize="10" fontWeight="600">{p}%</text>
            ))}
            <text x={FRAME.width - 14} y={(FRAME.top + FRAME.bottom) / 2} transform={`rotate(90 ${FRAME.width - 14} ${(FRAME.top + FRAME.bottom) / 2})`} textAnchor="middle" fill="var(--gold)" fontSize="10" fontWeight="700">AIRBORNE SHARE</text>
          </g>

          {/* X axis: every year */}
          <g data-testid="supply-axis-years">
            {PILOT_SUPPLY.map(({ year }) => (
              <text key={year} data-year={year} x={xForYear(year)} y={FRAME.bottom + 22} textAnchor="middle" fill="rgba(0,39,76,0.6)" fontSize="10.5" fontWeight="600">{year}</text>
            ))}
          </g>

          {SERIES.map((s) => (
            <g key={s.key} data-testid="supply-series" data-series={s.key}>
              <path d={seriesPath(s)} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dashed ? '5 5' : undefined} />
              {PILOT_SUPPLY.map((row) => {
                const { x, y, value } = pointFor(s, row)
                return (
                  <circle
                    key={row.year}
                    data-testid="supply-point"
                    data-series={s.key}
                    data-year={row.year}
                    data-value={value}
                    data-indicative={row.indicative ? 'true' : 'false'}
                    cx={x}
                    cy={y}
                    r={row.indicative ? 3.5 : 4.5}
                    fill={row.indicative ? '#ffffff' : s.color}
                    stroke={s.color}
                    strokeWidth="2"
                  >
                    <title>{`${row.year} · ${s.label}: ${formatValue(s, value)}${row.indicative ? ' (indicative)' : ''}`}</title>
                  </circle>
                )
              })}
            </g>
          ))}

          {/* 2025 values (stated in the copy above) */}
          {SERIES.map((s) => {
            const { x, y, value } = pointFor(s, last)
            return (
              <text key={s.key} data-testid="supply-end-label" data-series={s.key} x={x} y={y - 10} fill={s.color} fontSize="11" fontWeight="700" textAnchor="middle">
                {formatValue(s, value)}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div data-testid="supply-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {SERIES.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '20px', height: 0, borderTop: `3px ${s.dashed ? 'dashed' : 'solid'} ${s.color}` }} />
            <span style={{ color: s.color }}>{s.label}{s.axis === 'share' ? ' — right axis' : ''}</span>
          </div>
        ))}
      </div>
      <p data-testid="supply-note" style={{ fontSize: '0.72rem', color: 'rgba(33,33,33,0.55)', lineHeight: 1.6, marginTop: '1rem', textAlign: 'center' }}>
        Solid points: {LAST_YEAR} figures stated above. Hollow points ({PILOT_SUPPLY[0].year}–{LAST_YEAR - 1}) are indicative straight-line estimates, not published yearly statistics.
      </p>
    </div>
  )
}
