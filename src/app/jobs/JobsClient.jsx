'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function formatSalary(min, max, currency = 'INR') {
  if (!min && !max) return null
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)} / Month`
  if (min) return `From ${fmt(min)} / Month`
  return `Up to ${fmt(max)} / Month`
}

// Map DB job to display shape expected by UI
function mapJob(j) {
  const meta = j.metadata ?? {}
  return {
    id: j.id,
    slug: j.slug,
    airline: meta.airline ?? j.title,
    role: meta.role ?? j.title,
    experience: meta.experience ?? (j.experienceYears != null ? `${j.experienceYears}+ years` : 'See description'),
    type: meta.type ?? j.jobType ?? 'Full Time',
    location: j.location ?? meta.location ?? 'India',
    salary: meta.salary ?? formatSalary(j.salaryMin, j.salaryMax, j.currency) ?? 'Competitive',
    eligibility: j.requirements ?? meta.eligibility ?? '',
    description: j.description ?? '',
    applyUrl: meta.applyUrl ?? `/contact?reason=job-${j.id}`,
  }
}

export default function JobsClient() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedAirline, setSelectedAirline] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedExperience, setSelectedExperience] = useState('All')
  const [activeJob, setActiveJob] = useState(null)

  useEffect(() => {
    fetch('/api/public-proxy/jobs')
      .then((r) => r.json())
      .then((d) => { setJobs((d.data ?? []).map(mapJob)); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const airlines = useMemo(() => ['All', ...new Set(jobs.map((j) => j.airline))], [jobs])
  const types = useMemo(() => ['All', ...new Set(jobs.map((j) => j.type))], [jobs])
  const experiences = useMemo(() => ['All', ...new Set(jobs.map((j) => j.experience))], [jobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchAirline = selectedAirline === 'All' || job.airline === selectedAirline
      const matchType = selectedType === 'All' || job.type === selectedType
      const matchExp = selectedExperience === 'All' || job.experience === selectedExperience
      return matchAirline && matchType && matchExp
    })
  }, [jobs, selectedAirline, selectedType, selectedExperience])

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        <div style={{ maxWidth: '800px', marginBottom: '3.5rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Airline Placements</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Pilot Job Portal &amp;
            <em style={{ color: '#D8A027', fontStyle: 'normal' }}> Recruitment.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.02rem', lineHeight: '1.6', maxWidth: '100%' }}>
            Active recruitment programs, airline cadet intakes, and vacancy requirements. Airborne ground students receive priority training modules mapped to these listings.
          </p>
        </div>

        {/* Filters */}
        {!loading && jobs.length > 0 && (
          <div style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #DB241E', padding: '2rem', marginBottom: '3rem', borderRadius: '1px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            {[
              { label: 'Airline Carrier', opts: airlines, val: selectedAirline, set: setSelectedAirline },
              { label: 'Program Type', opts: types, val: selectedType, set: setSelectedType },
              { label: 'Experience Level', opts: experiences, val: selectedExperience, set: setSelectedExperience },
            ].map(({ label, opts, val, set }) => (
              <div key={label}>
                <label style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
                  {label}
                </label>
                <select value={val} onChange={(e) => set(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#000f1e', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', outline: 'none' }}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.06)', padding: '2rem', borderRadius: '1px', height: '100px', opacity: 0.5 + i * 0.1 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#000f1e', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Could not load job listings. Please try again or call us at <a href="tel:+919953777320" style={{ color: '#D8A027' }}>+91 9953 777 320</a>.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#000f1e', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              No active recruitment listings at this time.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
              Check back soon or contact us directly for placement guidance.
            </p>
          </div>
        )}

        {/* Count */}
        {!loading && filteredJobs.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontWeight: 500 }}>
            Displaying {filteredJobs.length} active {filteredJobs.length === 1 ? 'vacancy' : 'vacancies'}
          </p>
        )}

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              style={{ background: '#000f1e', border: '1px solid rgba(255,255,255,0.06)', padding: '2rem', borderRadius: '1px', display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center', gap: '2rem', boxShadow: '0 4px 18px rgba(0,0,0,0.2)' }}
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

          {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#000f1e', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                No active recruitment routes match the selected filters. Clear filters to see all openings.
              </p>
            </div>
          )}
        </div>

        {/* Job Detail Modal */}
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

                {activeJob.eligibility && (
                  <div className="modal-body-dark">
                    <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 700 }}>
                      Eligibility Criteria
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#D8A027', lineHeight: '1.6', fontWeight: 600 }}>
                      {activeJob.eligibility}
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                  {activeJob.salary && (
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Compensation Scale</span>
                      <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>{activeJob.salary}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Experience Class</span>
                    <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>{activeJob.experience}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link
                  href={activeJob.applyUrl}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', textAlign: 'center' }}
                  onClick={() => setActiveJob(null)}
                >
                  📅 Request Placement Prep
                </Link>
                <button onClick={() => setActiveJob(null)} className="btn btn-ghost" style={{ padding: '0.95rem 1.5rem' }}>
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
