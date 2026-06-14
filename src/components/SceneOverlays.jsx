import { useState, useEffect, useRef } from 'react'

/* ────────────────────────────────────────────────────────────────
   Overlay visibility wrapper
──────────────────────────────────────────────────────────────── */
function Overlay({ visible, children, style = {} }) {
  return (
    <div
      className="scene-overlay"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: visible ? 'auto' : 'none',
        ...style,
      }}
      aria-hidden={!visible}
    >
      {children}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 1: DREAM
──────────────────────────────────────────────────────────────── */
export function DreamOverlay({ visible, onDemo, onApply }) {
  return (
    <Overlay visible={visible}>
      <div className="dream-content">
        <p className="dream-eyebrow">Airborne Aviation Academy</p>
        <h1 className="dream-title">
          FROM DREAM<br/>
          <span className="line-red">TO COCKPIT</span>
        </h1>
      </div>
      <div className="scroll-hint" style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)' }}>
        <span className="scroll-hint-text">Scroll to begin your journey</span>
        <div className="scroll-hint-line" />
      </div>
    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 2: MENTOR
──────────────────────────────────────────────────────────────── */
export function MentorOverlay({ visible }) {
  return (
    <Overlay visible={visible}>
      <div className="mentor-overlay" style={{ padding: '4rem var(--margin)' }}>
        <p className="overlay-eyebrow">Act 02 · The Mentor</p>
        <h2 className="overlay-h2" style={{ maxWidth: '600px' }}>
          Guided by <span style={{color:'var(--gold)'}}>Capt. Navrang Singh</span>
        </h2>
        <p className="overlay-body" style={{ maxWidth: '500px' }}>
          With 15+ years of teaching excellence, you are not just learning to fly. 
          You are learning to command. "Concept Clarity" is our absolute standard.
        </p>
      </div>
    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 3: TRAINING
──────────────────────────────────────────────────────────────── */
export function TrainingOverlay({ visible }) {
  return (
    <Overlay visible={visible}>
      <div className="training-overlay-content">
        <div className="cockpit-phase-badge"><span>Act 03 · Training Crucible</span></div>
        <h2 className="cockpit-headline">Where Pilots<br /><em>Are Forged</em></h2>
        <p className="cockpit-subtitle">
          Not memorized. Understood. Capt. Navrang Singh's Concept Clarity method 
          means you walk into the DGCA examination knowing — not guessing.
        </p>
        <div className="subject-tags" style={{ marginTop: '1.5rem' }}>
          {['Air Navigation', 'Meteorology', 'Air Regulations', 'Technical General', 'RTR (A)', 'DGCA CPL'].map(s => (
            <span key={s} className={`subject-tag ${s === 'DGCA CPL' ? 'featured' : ''}`}>{s}</span>
          ))}
        </div>
      </div>
    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 4: SIMULATOR
──────────────────────────────────────────────────────────────── */
export function SimulatorOverlay({ visible }) {
  return (
    <Overlay visible={visible}>
      <div className="simulator-overlay-content">
        <div className="data-cards-row">
          <div className="data-card">
            <span className="data-card-label">Simulator Type</span>
            <span className="data-card-value">FTD Lv.5</span>
          </div>
          <div className="data-card">
            <span className="data-card-label">Session Hours</span>
            <span className="data-card-value">40+ HRS</span>
          </div>
          <div className="data-card">
            <span className="data-card-label">Aircraft Type</span>
            <span className="data-card-value">A320 CEF</span>
          </div>
        </div>
        <div className="cockpit-phase-badge"><span>Act 04 · Flight Simulator</span></div>
        <h2 className="cockpit-headline">Your First<br /><em>Flight Begins Here</em></h2>
        <p className="cockpit-subtitle">
          Before you touch a real aircraft, you master it. Airborne's full-motion 
          simulator gives you the feel, the instruments, and the confidence 
          you need on Day One.
        </p>
      </div>
    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 5: AIRCRAFT REVEAL
──────────────────────────────────────────────────────────────── */
export function AircraftOverlay({ visible }) {
  return (
    <Overlay visible={visible}>
      <div style={{ position: 'absolute', bottom: '3rem', right: 'var(--margin)', textAlign: 'right' }}>
        <p className="overlay-eyebrow">Act 05 · The Aircraft</p>
        <h2 className="overlay-h2">Your Machine Awaits</h2>
        <div className="badge badge-gold" style={{ display: 'inline-flex', marginTop: '1rem' }}>
          Airbus A320 NEO
        </div>
      </div>
    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 6: COCKPIT (real footage — 3 sub-phases)
──────────────────────────────────────────────────────────────── */
/* ── Startup sequence phase definitions ── */
const STARTUP_PHASES = [
  {
    threshold: 0.00,
    proc:    'PRE-FLIGHT',
    callout: 'COLD + DARK',
    color:   '#888899',
    hudStatus: 'COLD + DARK',
    hudPhase:  'PRE-FLIGHT',
    headline:  (<>The Cockpit<br /><em>Awaits</em></>),
    subtitle:  'Two seats. One mission. The cockpit is not a room — it is a command.',
  },
  {
    threshold: 0.18,
    proc:    'BATTERY',
    callout: '1 + 2  ·  ON',
    color:   '#d8a030',
    hudStatus: 'BATT ON',
    hudPhase:  'ELEC PWR',
    headline:  (<>Power On<br /><em>Pre-Flight Begins</em></>),
    subtitle:  'Battery 1 and 2 selected. The aircraft stirs for the first time.',
  },
  {
    threshold: 0.35,
    proc:    'APU MASTER',
    callout: 'START  ·  AVAIL',
    color:   '#d8a030',
    hudStatus: 'APU AVAIL',
    hudPhase:  'APU START',
    headline:  (<>APU Running<br /><em>Systems Online</em></>),
    subtitle:  'Auxiliary power unit online. Engine start is now possible.',
  },
  {
    threshold: 0.50,
    proc:    'AVIONICS',
    callout: 'POWERED  ·  ON',
    color:   '#4488ff',
    hudStatus: 'AVIONICS',
    hudPhase:  'BOOT SEQ',
    headline:  (<>Glass Cockpit<br /><em>Active</em></>),
    subtitle:  'Flight management, PFD, ND, ECAM — your digital co-pilot is awake.',
  },
  {
    threshold: 0.65,
    proc:    'ENGINE 1',
    callout: 'N2 RISE  ·  RUN',
    color:   '#22cc66',
    hudStatus: 'ENG 1 RUN',
    hudPhase:  'ENG START',
    headline:  (<>Engine 1<br /><em>Running</em></>),
    subtitle:  'CFM LEAP-1A spooling up. N1 rising. Thrust available.',
  },
  {
    threshold: 0.78,
    proc:    'ENGINE 2',
    callout: 'N2 RISE  ·  RUN',
    color:   '#22cc66',
    hudStatus: 'ENG 2 RUN',
    hudPhase:  'ALL ENG',
    headline:  (<>Both Engines<br /><em>Online</em></>),
    subtitle:  'Full power available. Before-taxi checklist in progress.',
  },
  {
    threshold: 0.90,
    proc:    'BEFORE TAXI',
    callout: 'COMPLETE',
    color:   '#22cc66',
    hudStatus: 'TAXI READY',
    hudPhase:  'COMPLETE',
    headline:  (<>You Are<br /><em>The Captain</em></>),
    subtitle:  'All systems nominal. You are cleared to taxi. This is what Airborne trained you for.',
  },
]

function getPhase(p) {
  let phase = STARTUP_PHASES[0]
  for (const ph of STARTUP_PHASES) {
    if (p >= ph.threshold) phase = ph
    else break
  }
  return phase
}

function getPhaseIndex(p) {
  let idx = 0
  for (let i = 0; i < STARTUP_PHASES.length; i++) {
    if (p >= STARTUP_PHASES[i].threshold) idx = i
    else break
  }
  return idx
}

export function CockpitOverlay({ visible, sceneProgress = 0 }) {
  const phase = getPhase(sceneProgress)
  const phaseIndex = getPhaseIndex(sceneProgress)
  const prevPhaseRef = useRef(phaseIndex)

  // Track previous phase index for animation trigger
  useEffect(() => { prevPhaseRef.current = phaseIndex }, [phaseIndex])

  const completedPhases = STARTUP_PHASES.slice(0, phaseIndex)
  const isApproach = sceneProgress < 0.18

  return (
    <Overlay visible={visible}>

      {/* ── TOP HUD — dynamic per startup phase ── */}
      <div className="hud-row" style={{ position: 'absolute', top: '5rem', left: 0, right: 0, padding: '0 var(--margin)' }}>
        {[
          { label: 'Status',   value: phase.hudStatus },
          { label: 'Aircraft', value: 'A320 CEF' },
          { label: 'Phase',    value: phase.hudPhase },
        ].map((item) => (
          <div key={item.label} className="hud-panel">
            <div className="hud-label">{item.label}</div>
            <div
              className="hud-value"
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                color: phaseIndex >= 5 ? 'var(--gold)' : phaseIndex >= 3 ? '#4488ff' : 'var(--gold)',
                transition: 'color 0.6s ease',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── STARTUP CALLOUT — aviation procedure callout ── */}
      {!isApproach && (
        <div
          style={{
            position: 'absolute',
            top: '9rem',
            left: 'var(--margin)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Current callout — re-mounts on phase change, triggering fade-in */}
          <div
            key={phaseIndex}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              animation: 'cockpitCalloutIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: phase.color,
                boxShadow: `0 0 10px ${phase.color}`,
                animation: 'calloutDot 1.5s ease-in-out infinite',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.55rem',
                fontWeight: 700,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
              }}>
                {phase.proc}
              </span>
              <span style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: phase.color,
                textShadow: `0 0 20px ${phase.color}60`,
              }}>
                {phase.callout}
              </span>
            </div>
          </div>

          {/* Completed phases — green dots */}
          {completedPhases.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', paddingLeft: '1.1rem' }}>
              {completedPhases.map((ph, i) => (
                <div
                  key={i}
                  title={ph.proc}
                  style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#22cc66', opacity: 0.6,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM NARRATIVE PANEL ── */}
      <div className="cockpit-text-panel">
        <div className="cockpit-phase-badge"><span>Act 06 · The Cockpit</span></div>
        <h2 className="cockpit-headline" key={phaseIndex + '-headline'} style={{ animation: 'cockpitCalloutIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards' }}>
          {phase.headline}
        </h2>
        <p className="cockpit-subtitle">{phase.subtitle}</p>
      </div>

    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 7: SUCCESS STORIES
──────────────────────────────────────────────────────────────── */
export function SuccessOverlay({ visible }) {
  const ticker = [
    'Ruzal Dhral · IndiGo Cadet',
    'Capt. Nipun Singh · Air India',
    'Capt. Himanish Sagwal · Emirates',
    'Batch 2023 · 100% Pass Rate',
    'Batch 2024 · 100% Pass Rate',
    'Max 25 Students Per Batch',
    'DGCA CPL Ground School',
    'Dwarka, New Delhi',
  ]
  return (
    <Overlay visible={visible}>
      <div className="clouds-center" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p className="clouds-eyebrow">Act 07 · Airline Careers</p>
        <h2 className="clouds-title" style={{ textAlign: 'center' }}>Where Careers Take Flight</h2>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gold)' }}>2,100+</div>
            <div>Alumni Placed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gold)' }}>40+</div>
            <div>Partner Airlines</div>
          </div>
        </div>
      </div>
      <div className="ticker-wrap" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 15 }}>
        <div className="ticker-inner">
          {[...ticker, ...ticker].map((item, i) => (
            <div key={i} className="ticker-item">
              <span className="ticker-sep">✦</span>
              <span><strong>{item.split(' · ')[0]}</strong>
                {item.includes(' · ') ? ` · ${item.split(' · ')[1]}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  )
}

/* ────────────────────────────────────────────────────────────────
   ACT 8: DESTINATION (FINAL CTA)
──────────────────────────────────────────────────────────────── */
export function CTAOverlay({ visible, onDemo, onApply }) {
  return (
    <Overlay visible={visible}>
      <div className="cta-overlay" style={{ padding: '6rem var(--margin)' }}>
        <p className="cta-eyebrow">Act 08 · Destination</p>
        <h1 className="cta-title">
          READY FOR<br />
          <span style={{ color: 'var(--red)' }}>TAKEOFF?</span>
        </h1>
        <p className="cta-body" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          Join India's most trusted DGCA ground school. 
          Led by Capt. Navrang Singh. Small batches of 25. 
          Real pilots. Real results.
        </p>
        <div className="cta-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button id="cta-book-demo-final" className="btn btn-primary btn-lg" onClick={onDemo} style={{ pointerEvents: 'all' }}>
            📅 Book Free Demo Class
          </button>
          <button id="cta-apply-final" className="btn btn-outline btn-lg" onClick={onApply} style={{ pointerEvents: 'all' }}>
            Apply for June 2026 Batch →
          </button>
        </div>
      </div>
    </Overlay>
  )
}
