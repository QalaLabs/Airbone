/* ─────────────────────────────────────
   STUDENT TRAINING TRACK RECORD
   Replaces legacy indicative pilot supply chart
───────────────────────────────────── */
export default function PilotSupplyGraph() {
  return (
    <div
      data-testid="pilot-supply-chart"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0, 39, 76, 0.08)',
        borderRadius: '16px',
        padding: '3rem 2rem',
        boxShadow: '0 10px 40px rgba(0,39,76,0.04)',
        marginTop: '3rem',
        marginBottom: '4rem',
        textAlign: 'center',
        fontFamily: 'var(--font-b)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-h)',
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 900,
          color: 'var(--navy)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ color: 'var(--red)' }}>2,500+</span> Students Trained Since 2009
      </div>
      <p
        style={{
          fontSize: '1rem',
          color: 'rgba(33,33,33,0.65)',
          maxWidth: '680px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}
      >
        Airborne Aviation Academy has been pioneering DGCA CPL ground training, airline preparation, and cadet mentoring since 2009 from our premier Dwarka, New Delhi campus.
      </p>
    </div>
  )
}

