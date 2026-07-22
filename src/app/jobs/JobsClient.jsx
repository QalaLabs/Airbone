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

function getStatus(closesAt) {
  if (!closesAt) return { label: 'Open', color: 'rgba(34,197,94,0.12)', textColor: '#16A34A', borderColor: 'rgba(34,197,94,0.3)' }
  const now = new Date()
  const close = new Date(closesAt)
  const days = Math.ceil((close - now) / (1000 * 60 * 60 * 24))
  if (close < now) return { label: 'Filled', color: 'rgba(100,116,139,0.1)', textColor: '#64748B', borderColor: 'rgba(100,116,139,0.2)' }
  if (days <= 7) return { label: 'Closing Soon', color: 'rgba(234,179,8,0.12)', textColor: '#CA8A04', borderColor: 'rgba(234,179,8,0.3)' }
  return { label: 'Open', color: 'rgba(34,197,94,0.12)', textColor: '#16A34A', borderColor: 'rgba(34,197,94,0.3)' }
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
    isFeatured: j.isFeatured ?? false,
    closesAt: j.closesAt ?? null,
    airlineLogo: meta.airlineLogo ?? null,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    currency: j.currency,
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

  // Featured job: first featured job from filtered list, fallback to first job
  const featuredJob = useMemo(() => {
    const featured = filteredJobs.find((j) => j.isFeatured)
    return featured ?? filteredJobs[0] ?? null
  }, [filteredJobs])

  const allJobs = useMemo(() => {
    // Remove the featured job from the grid so it doesn't duplicate
    if (!featuredJob) return filteredJobs
    return filteredJobs.filter((j) => j.id !== featuredJob.id)
  }, [filteredJobs, featuredJob])

  return (
    <>
      <Header />
      <main
        className="course-main-wrapper"
        style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}
      >
        <div className="container-xl">

        {/* ====== HERO SECTION ====== */}
        <div style={{ maxWidth: '800px', marginBottom: '4rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start', color: 'var(--red)' }}>
            Airline Placements
          </p>
          <h1
            className="ov-h1"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginTop: '1rem',
              textTransform: 'uppercase',
              color: 'var(--navy)',
            }}
          >
            Pilot Job Portal &amp;
            <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}> Recruitment.</em>
          </h1>
          <p
            className="ov-body"
            style={{
              marginTop: '1.5rem',
              color: 'rgba(0,39,76,0.75)',
              fontSize: '1.02rem',
              lineHeight: '1.7',
              maxWidth: '100%',
            }}
          >
            Active recruitment programs, airline cadet intakes, and vacancy requirements.
            Airborne ground students receive priority training modules mapped to these listings.
          </p>
        </div>

        {/* ====== FEATURED RECRUITMENT ====== */}
        {!loading && !error && featuredJob && (
          <div
            className="cpl-hero-banner cpl-grid-layout"
            style={{ borderRadius: '12px', marginBottom: '5rem' }}
          >
            <div className="cpl-badge-ribbon">NOW HIRING</div>

            <div>
              {/* Airline + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {featuredJob.airlineLogo ? (
                  <img
                    src={featuredJob.airlineLogo}
                    alt={featuredJob.airline}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
                  />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    ✈
                  </div>
                )}
                <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.82rem', color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {featuredJob.airline}
                </span>
              </div>

              <h2
                className="ov-h1"
                style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: '1.1',
                }}
              >
                {featuredJob.role}
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)', lineHeight: '1.75', marginBottom: '2rem', marginTop: '1rem' }}>
                {featuredJob.description || featuredJob.eligibility || ''}
              </p>

              {/* Key details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Location', value: featuredJob.location },
                  { label: 'Experience', value: featuredJob.experience },
                  { label: 'Employment Type', value: featuredJob.type },
                ].map((d) => (
                  <div key={d.label} style={{ background: 'rgba(255,255,255,0.06)', borderLeft: '2px solid var(--gold)', padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem', letterSpacing: '0.12em' }}>
                      {d.label}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Salary + Apply */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {featuredJob.salary && featuredJob.salary !== 'Competitive' && (
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                      Compensation
                    </span>
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)' }}>
                      {featuredJob.salary}
                    </span>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => setActiveJob(featuredJob)}
                    className="btn btn-ghost"
                    style={{ padding: '0.9rem 2rem', textDecoration: 'none' }}
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: visual */}
            <div
              className="cpl-banner-image-wrap"
              style={{ borderRadius: '8px', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.8 }}>✈</div>
                <p style={{ fontFamily: 'var(--font-h)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  {featuredJob.airline}
                </p>
                <p style={{ fontFamily: 'var(--font-h)', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>
                  {featuredJob.type} · {featuredJob.location}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====== FILTERS ====== */}
        {!loading && jobs.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,39,76,0.08)',
              borderLeft: '3px solid var(--red)',
              padding: '2rem',
              marginBottom: '3rem',
              borderRadius: '6px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,39,76,0.02)',
            }}
          >
            {[
              { label: 'Airline Carrier', opts: airlines, val: selectedAirline, set: setSelectedAirline },
              { label: 'Program Type', opts: types, val: selectedType, set: setSelectedType },
              { label: 'Experience Level', opts: experiences, val: selectedExperience, set: setSelectedExperience },
            ].map(({ label, opts, val, set }) => (
              <div key={label}>
                <label
                  style={{
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--navy)',
                    display: 'block',
                    marginBottom: '0.6rem',
                    fontWeight: 700,
                  }}
                >
                  {label}
                </label>
                <select
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: 'rgba(0,39,76,0.03)',
                    border: '1px solid rgba(0,39,76,0.12)',
                    color: 'var(--navy)',
                    outline: 'none',
                    borderRadius: '2px',
                    fontFamily: 'var(--font-b)',
                    fontSize: '0.85rem',
                  }}
                >
                  {opts.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* ====== LOADING ====== */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,39,76,0.08)',
                  borderRadius: '12px',
                  padding: '3rem 2rem',
                  height: '220px',
                  opacity: 0.5 + i * 0.1,
                  boxShadow: '0 4px 20px rgba(0,39,76,0.02)',
                }}
              />
            ))}
          </div>
        )}

        {/* ====== ERROR ====== */}
        {error && (
          <div
            style={{
              padding: '6rem 2rem',
              textAlign: 'center',
              background: '#ffffff',
              border: '1px dashed rgba(0,39,76,0.18)',
              borderRadius: '6px',
              boxShadow: '0 4px 20px rgba(0,39,76,0.02)',
            }}
          >
            <p style={{ color: 'rgba(0,39,76,0.5)', fontSize: '1rem', marginBottom: '1rem' }}>
              Could not load job listings. Please try again or call us at{' '}
              <a href="tel:+919953777320" style={{ color: 'var(--gold)' }}>
                +91 9953 777 320
              </a>.
            </p>
          </div>
        )}

        {/* ====== EMPTY (no jobs at all) ====== */}
        {!loading && !error && jobs.length === 0 && (
          <div
            style={{
              padding: '6rem 2rem',
              textAlign: 'center',
              background: '#ffffff',
              border: '1px dashed rgba(0,39,76,0.18)',
              borderRadius: '6px',
              boxShadow: '0 4px 20px rgba(0,39,76,0.02)',
            }}
          >
            <p style={{ color: 'rgba(0,39,76,0.5)', fontSize: '1rem', marginBottom: '1rem' }}>
              No active recruitment listings at this time.
            </p>
            <p style={{ color: 'rgba(0,39,76,0.4)', fontSize: '0.875rem' }}>
              Check back soon or contact us directly for placement guidance.
            </p>
          </div>
        )}

        {/* ====== RESULT COUNT ====== */}
        {!loading && allJobs.length > 0 && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'rgba(0,39,76,0.45)',
              marginBottom: '1.5rem',
              fontWeight: 500,
              fontFamily: 'var(--font-b)',
            }}
          >
            Displaying {allJobs.length} active {allJobs.length === 1 ? 'vacancy' : 'vacancies'}
          </p>
        )}

        {/* ====== JOB CARDS GRID ====== */}
        {!loading && !error && allJobs.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {allJobs.map((job) => {
              const status = getStatus(job.closesAt)
              return (
                <div key={job.id} className="course-page-card">
                  <div
                    style={{
                      padding: '2rem',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {/* Airline logo + name row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        {job.airlineLogo ? (
                          <img
                            src={job.airlineLogo}
                            alt={job.airline}
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(216,160,39,0.3)',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              background: 'rgba(0,39,76,0.04)',
                              border: '2px solid rgba(216,160,39,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.3rem',
                              flexShrink: 0,
                            }}
                          >
                            ✈
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.35rem',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.625rem',
                                letterSpacing: '0.25em',
                                textTransform: 'uppercase',
                                color: 'var(--red)',
                                fontWeight: 800,
                                fontFamily: 'var(--font-h)',
                              }}
                            >
                              {job.airline}
                            </span>
                            <span
                              style={{
                                fontSize: '0.55rem',
                                padding: '0.25rem 0.6rem',
                                background: status.color,
                                color: status.textColor,
                                border: `1px solid ${status.borderColor}`,
                                borderRadius: '2px',
                                fontFamily: 'var(--font-h)',
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <h3
                            style={{
                              fontFamily: 'var(--font-h)',
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: 'var(--navy)',
                              textTransform: 'uppercase',
                              lineHeight: '1.3',
                              margin: 0,
                            }}
                          >
                            {job.role}
                          </h3>
                        </div>
                      </div>

                      {/* Meta row: location + type */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'center',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(0,39,76,0.55)',
                            fontFamily: 'var(--font-b)',
                            fontWeight: 500,
                          }}
                        >
                          📍 {job.location}
                        </span>
                        <span
                          style={{
                            width: '3px',
                            height: '3px',
                            background: 'rgba(0,39,76,0.2)',
                            borderRadius: '50%',
                            display: 'inline-block',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(0,39,76,0.55)',
                            fontFamily: 'var(--font-b)',
                            fontWeight: 500,
                          }}
                        >
                          {job.type}
                        </span>
                      </div>

                      {/* Experience + Eligibility */}
                      <p
                        style={{
                          fontSize: '0.78rem',
                          color: 'rgba(0,39,76,0.6)',
                          fontFamily: 'var(--font-b)',
                          lineHeight: '1.6',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <strong style={{ color: 'rgba(0,39,76,0.75)' }}>Experience:</strong>{' '}
                        {job.experience}
                      </p>
                      {job.eligibility && (
                        <p
                          style={{
                            fontSize: '0.78rem',
                            color: 'rgba(0,39,76,0.6)',
                            fontFamily: 'var(--font-b)',
                            lineHeight: '1.6',
                            marginBottom: '1rem',
                          }}
                        >
                          <strong style={{ color: 'rgba(0,39,76,0.75)' }}>Eligibility:</strong>{' '}
                          {typeof job.eligibility === 'string'
                            ? job.eligibility.substring(0, 120)
                            : ''}
                          {job.eligibility && job.eligibility.length > 120 ? '…' : ''}
                        </p>
                      )}
                    </div>

                    <div>
                      {/* Salary row */}
                      {(job.salary && job.salary !== 'Competitive') || (job.salaryMin || job.salaryMax) ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            borderTop: '1px solid rgba(0,39,76,0.08)',
                            paddingTop: '1.25rem',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'rgba(0,39,76,0.45)',
                              fontFamily: 'var(--font-b)',
                            }}
                          >
                            Compensation
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-h)',
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--navy)',
                            }}
                          >
                            {job.salary}
                          </span>
                        </div>
                      ) : null}

                      <button
                        onClick={() => setActiveJob(job)}
                        className="btn btn-ghost"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '0.75rem 1rem',
                          textDecoration: 'none',
                          textAlign: 'center',
                          display: 'block',
                          background: 'rgba(0,39,76,0.04)',
                          color: 'var(--navy)',
                          borderColor: 'rgba(0,39,76,0.15)',
                          fontSize: '0.68rem',
                        }}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ====== NO RESULTS AFTER FILTER ====== */}
        {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
          <div
            style={{
              padding: '6rem 2rem',
              textAlign: 'center',
              background: '#ffffff',
              border: '1px dashed rgba(0,39,76,0.18)',
              borderRadius: '6px',
              boxShadow: '0 4px 20px rgba(0,39,76,0.02)',
            }}
          >
            <p style={{ color: 'rgba(0,39,76,0.5)', fontSize: '1rem', marginBottom: '1rem' }}>
              No active recruitment routes match the selected filters.
            </p>
            <p style={{ color: 'rgba(0,39,76,0.4)', fontSize: '0.875rem' }}>
              Clear filters to see all openings.
            </p>
          </div>
        )}

        </div>
      </main>

      {/* ====== JOB DETAIL MODAL ====== */}
      {activeJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,5,18,0.85)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setActiveJob(null)}
        >
          <div className="modal-box modal-box-dark" style={{ maxWidth: '580px' }}>
            <button
              onClick={() => setActiveJob(null)}
              className="modal-close"
              style={{
                color: 'rgba(255,255,255,0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.6rem',
              }}
            >
              ×
            </button>

            <p className="modal-eyebrow" style={{ color: '#D8A027', margin: 0 }}>
              {activeJob.airline} Recruitment
            </p>
            <h2
              className="modal-h modal-h-dark"
              style={{ fontSize: '1.3rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}
            >
              {activeJob.role}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="modal-body-dark">
                <h4
                  style={{
                    fontFamily: 'var(--font-h)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.5rem',
                    fontWeight: 700,
                  }}
                >
                  Overview
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                  {activeJob.description || 'Details available on request.'}
                </p>
              </div>

              {activeJob.eligibility && (
                <div className="modal-body-dark">
                  <h4
                    style={{
                      fontFamily: 'var(--font-h)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)',
                      marginBottom: '0.5rem',
                      fontWeight: 700,
                    }}
                  >
                    Eligibility Criteria
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#D8A027', lineHeight: '1.6', fontWeight: 600 }}>
                    {activeJob.eligibility}
                  </p>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '1rem',
                }}
              >
                {activeJob.salary && (
                  <div>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '0.15rem',
                      }}
                    >
                      Compensation
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>
                      {activeJob.salary}
                    </span>
                  </div>
                )}
                <div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.15rem',
                    }}
                  >
                    Experience
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {activeJob.experience}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.15rem',
                    }}
                  >
                    Location
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {activeJob.location}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.15rem',
                    }}
                  >
                    Employment Type
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {activeJob.type}
                  </span>
                </div>
                {activeJob.closesAt && (
                  <div>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '0.15rem',
                      }}
                    >
                      Last Date
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#FFFFFF', fontWeight: 700 }}>
                      {new Date(activeJob.closesAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                href={activeJob.applyUrl}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
                onClick={() => setActiveJob(null)}
              >
                Apply Now →
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

      <Footer />
    </>
  )
}
