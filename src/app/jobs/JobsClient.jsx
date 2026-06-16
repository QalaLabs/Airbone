'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { JOBS } from '@/utils/jobsData'

export default function JobsClient() {
  // Filter states
  const [selectedAirline, setSelectedAirline] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedExperience, setSelectedExperience] = useState('All')

  // Detailed Modal state
  const [activeJob, setActiveJob] = useState(null)

  // Unique lists for filters
  const airlines = useMemo(() => ['All', ...new Set(JOBS.map(j => j.airline))], [])
  const types = useMemo(() => ['All', ...new Set(JOBS.map(j => j.type))], [])
  const experiences = useMemo(() => ['All', ...new Set(JOBS.map(j => j.experience))], [])

  // Filter logic
  const filteredJobs = useMemo(() => {
    return JOBS.filter(job => {
      const matchAirline = selectedAirline === 'All' || job.airline === selectedAirline
      const matchType = selectedType === 'All' || job.type === selectedType
      const matchExp = selectedExperience === 'All' || job.experience === selectedExperience
      return matchAirline && matchType && matchExp
    })
  }, [selectedAirline, selectedType, selectedExperience])

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Header section */}
        <div style={{ maxWidth: '800px', marginBottom: '3.5rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Airline Placements</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Aviation Jobs in India 2026 —
            <em style={{ color: '#D8A027', fontStyle: 'normal' }}> Pilot &amp; Cabin Crew.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.02rem', lineHeight: '1.6', maxWidth: '100%' }}>
            Aviation jobs in India are expanding in 2026 as IndiGo, Air India, Akasa Air, and new carriers add aircraft. Pilot roles (Junior First Officer, First Officer, Captain), cabin crew positions, and ground staff openings are available. Airborne Aviation Academy graduates have active placement support and airline connections.
          </p>
        </div>

        {/* Filters Panel */}
        <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #DB241E', padding: '2rem', marginBottom: '3rem', borderRadius: '1px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

          <div>
            <label style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
              Airline Carrier
            </label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', background: '#000f1e', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
            >
              {airlines.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
              Program Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', background: '#000f1e', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
              Experience Level
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', background: '#000f1e', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}
            >
              {experiences.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>

        </div>

        {/* Listings Count */}
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontWeight: 500 }}>
          Displaying {filteredJobs.length} active vacancies
        </p>

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredJobs.map(job => (
            <div
              key={job.id}
              style={{
                background: '#000f1e',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '2rem',
                borderRadius: '1px',
                display: 'grid',
                gridTemplateColumns: '1fr',
                mdGridTemplateColumns: '1.5fr 1fr auto',
                alignItems: 'center',
                gap: '2rem',
                boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.82rem', color: '#DB241E', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {job.airline}
                  </span>
                  <span style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                    {job.type}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', margin: 0 }}>
                  {job.role}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Experience</span>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 600 }}>{job.experience}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Location</span>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 600 }}>{job.location}</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setActiveJob(job)}
                  className="btn btn-ghost"
                  style={{ padding: '0.7rem 1.5rem', fontSize: '0.62rem' }}
                >
                  View Eligibility →
                </button>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#000f1e', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                No active recruitment routes match the selected filters. Clear filters to see all openings.
              </p>
            </div>
          )}
        </div>

        {/* FAQ — AEO/schema injected from server component via JSON-LD */}
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '2rem' }}>
            Frequently Asked Questions — Aviation Jobs India
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
            {[
              { q: 'Which airlines are hiring pilots in India in 2026?', a: 'In 2026, major Indian airlines actively hiring pilots include IndiGo, Air India, Akasa Air, SpiceJet, and Star Air. IndiGo is the largest recruiter, hiring Junior First Officers (JFOs) with a minimum of 250 flying hours and a valid DGCA CPL.' },
              { q: 'What is the salary of a First Officer in India in 2026?', a: 'A Junior First Officer (JFO) at IndiGo earns approximately ₹1.5 to ₹2 lakh per month. First Officer salary increases with hours, seniority, and aircraft type. On wide-body aircraft at Air India, First Officers earn ₹2.5 to ₹4 lakh per month.' },
              { q: 'Can a fresh CPL holder get a pilot job in India?', a: 'Yes. IndiGo and Akasa Air hire fresh CPL holders as Junior First Officers, provided they have 250+ hours and a clean DGCA record. Airborne Aviation Academy\'s placement team assists graduates with applications and interview preparation.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '1px' }}>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 700, color: '#D8A027', marginBottom: '0.75rem' }}>{q}</h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Detail Modal */}
        {activeJob && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,5,18,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setActiveJob(null)}
          >
            <div className="modal-box modal-box-dark" style={{ maxWidth: '580px' }}>
              <button onClick={() => setActiveJob(null)} className="modal-close" style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>

              <p className="modal-eyebrow" style={{ color: '#D8A027', margin: 0 }}>{activeJob.airline} Recruitment</p>
              <h2 className="modal-h modal-h-dark" style={{ fontSize: '1.3rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                {activeJob.role}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="modal-body-dark">
                  <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 700 }}>
                    Overview
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                    {activeJob.description}
                  </p>
                </div>

                <div className="modal-body-dark">
                  <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 700 }}>
                    Eligibility Criteria
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#D8A027', lineHeight: '1.6', fontWeight: 600 }}>
                    {activeJob.eligibility}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Compensation Scale</span>
                    <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>{activeJob.salary}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Experience Class</span>
                    <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>{activeJob.experience}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link
                  href={`/contact?reason=job-${activeJob.id}`}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', textAlign: 'center' }}
                  onClick={() => setActiveJob(null)}
                >
                  Request Placement Prep
                </Link>
                <button
                  onClick={() => setActiveJob(null)}
                  className="btn btn-ghost"
                  style={{ padding: '0.95rem 1.5rem' }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}
