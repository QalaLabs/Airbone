"use client"

import { useState, useEffect } from 'react'

export default function StudentJourneyLimeTimeline() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const steps = [
    { title: 'CPL Ground school', desc: 'Clear all 5 DGCA papers + RTR prep under Capt. Navrang Singh (3–6 months).' },
    { title: 'Medicals & Admin', desc: 'Obtain DGCA Class 2 & Class 1 medicals and request your computer number.' },
    { title: 'Flying School', desc: 'Complete 200 flying hours at certified Flight Training Organizations (FTO).' },
    { title: 'A320 Sim Training', desc: 'Coaching on Airbus A320 cockpit systems and simulator profiles.' },
    { title: 'Airline Joining', desc: 'Crack airline written assessments and GD/PI to join as a First Officer.' },
  ]

  if (!isMobile) {
    return (
      <div style={{ background: 'rgba(132, 204, 22, 0.03)', border: '1px solid rgba(132, 204, 22, 0.1)', padding: '3.5rem 2rem', borderRadius: '8px', marginTop: '2rem', fontFamily: 'var(--font-b)' }}>
        <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '3.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#84cc16', display: 'inline-block' }} />
          <span>Your Stepped Path to the Cockpit</span>
        </h3>
        
        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          {/* Central Vertical Line */}
          <div style={{ position: 'absolute', top: '1rem', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', width: '2px', borderLeft: '2px dashed #84cc16', zIndex: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {steps.map((s, idx) => {
              const isLeft = idx % 2 === 0
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1, flexDirection: isLeft ? 'row' : 'row-reverse' }}>
                  {/* Left/Right Content Block */}
                  <div style={{ width: 'calc(50% - 2.5rem)', display: 'flex', justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      background: '#ffffff', border: '1px solid rgba(132, 204, 22, 0.12)', 
                      padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,39,76,0.01)',
                      maxWidth: '400px', textAlign: isLeft ? 'right' : 'left'
                    }}>
                      <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.04em' }}>
                        {s.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.65)', margin: 0, lineHeight: 1.5 }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  {/* Central Node Badge */}
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: '#84cc16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--navy)',
                    boxShadow: '0 4px 12px rgba(132, 204, 22, 0.3)',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                  }}>
                    {idx + 1}
                  </div>

                  {/* Empty Spacer Column */}
                  <div style={{ width: 'calc(50% - 2.5rem)' }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(132, 204, 22, 0.03)', border: '1px solid rgba(132, 204, 22, 0.1)', padding: '2.5rem 1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#84cc16', display: 'inline-block' }} />
        <span>Your Stepped Path to the Cockpit</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1.5rem', bottom: '1.5rem', left: '1rem', width: '2px', borderLeft: '2px dashed #84cc16', zIndex: 0 }} />
        {steps.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              flexShrink: 0,
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: '#84cc16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-h)',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--navy)',
              boxShadow: '0 2px 8px rgba(132, 204, 22, 0.2)'
            }}>
              {idx + 1}
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 0.2rem 0', letterSpacing: '0.02em' }}>
                {s.title}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'rgba(0,39,76,0.65)', margin: 0, lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
