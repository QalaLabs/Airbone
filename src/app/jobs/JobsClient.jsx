'use client'

import { useState, useMemo, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import JobApplicationForm from '@/components/JobApplicationForm'
import { safeHttpUrl } from '@/lib/resources'

function formatSalary(min, max, currency = 'INR') {
  if (!min && !max) return null
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)} / Month`
  if (min) return `From ${fmt(min)} / Month`
  return `Up to ${fmt(max)} / Month`
}

// "full_time" / "FULL-TIME" -> "Full Time"
function humanize(value) {
  if (!value || typeof value !== 'string') return value
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatus(closesAt) {
  if (!closesAt) return { label: 'Open', color: 'rgba(34,197,94,0.12)', textColor: '#15803D', borderColor: 'rgba(34,197,94,0.35)' }
  const now = new Date()
  const close = new Date(closesAt)
  const days = Math.ceil((close - now) / (1000 * 60 * 60 * 24))
  if (close < now) return { label: 'Filled', color: 'rgba(100,116,139,0.1)', textColor: '#475569', borderColor: 'rgba(100,116,139,0.25)' }
  if (days <= 7) return { label: 'Closing Soon', color: 'rgba(234,179,8,0.14)', textColor: '#A16207', borderColor: 'rgba(234,179,8,0.35)' }
  return { label: 'Open', color: 'rgba(34,197,94,0.12)', textColor: '#15803D', borderColor: 'rgba(34,197,94,0.35)' }
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
    type: humanize(meta.type ?? j.jobType ?? 'Full Time'),
    location: j.location ?? meta.location ?? 'India',
    salary: meta.salary ?? formatSalary(j.salaryMin, j.salaryMax, j.currency) ?? 'Competitive',
    eligibility: j.requirements ?? meta.eligibility ?? '',
    description: j.description ?? '',
    externalApplyUrl: safeHttpUrl(meta.applyUrl),
    isFeatured: j.isFeatured ?? false,
    closesAt: j.closesAt ?? null,
    airlineLogo: safeHttpUrl(j.imageUrl) ?? safeHttpUrl(meta.airlineLogo),
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    currency: j.currency,
    publishedAt: j.publishedAt ?? null,
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Fact({ label, value }) {
  return (
    <div className="jobs-fact">
      <span className="jobs-fact-label">{label}</span>
      <span className="jobs-fact-value">{value}</span>
    </div>
  )
}

function AirlineLogo({ job }) {
  return job.airlineLogo ? (
    <img src={job.airlineLogo} alt={job.airline} className="jobs-airline-logo" />
  ) : (
    <div className="jobs-airline-logo" aria-hidden="true">✈</div>
  )
}

export default function JobsClient() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedAirline, setSelectedAirline] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedExperience, setSelectedExperience] = useState('All')
  const [activeJob, setActiveJobState] = useState(null)
  const [applying, setApplying] = useState(false)
  const setActiveJob = (job) => { setApplying(false); setActiveJobState(job) }

  useEffect(() => {
    fetch('/api/public-proxy/jobs')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => { setJobs((d.data ?? []).map(mapJob)); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!activeJob) return
    const onKey = (e) => { if (e.key === 'Escape') setActiveJobState(null) }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [activeJob])

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

  const hasSalary = (job) => job.salary && job.salary !== 'Competitive'

  return (
    <>
      <Header />
      <main
        className="course-main-wrapper"
        style={{ padding: '6rem var(--margin) 6rem var(--margin)' }}
      >
        <div className="container-xl">

        {/* ====== HERO SECTION ====== */}
        <div style={{ maxWidth: '800px', marginBottom: '3rem' }}>
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
              marginTop: '1.25rem',
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
          <article className="jobs-featured" data-testid="featured-job">
            <div className="cpl-badge-ribbon">Now Hiring</div>

            <div style={{ minWidth: 0 }}>
              <div className="jobs-airline">
                <AirlineLogo job={featuredJob} />
                <span className="jobs-airline-name">{featuredJob.airline}</span>
              </div>

              <h2 className="jobs-featured-title">{featuredJob.role}</h2>

              {(featuredJob.description || featuredJob.eligibility) && (
                <p className="jobs-featured-desc">{featuredJob.description || featuredJob.eligibility}</p>
              )}

              <div className="jobs-facts">
                <Fact label="Location" value={featuredJob.location} />
                <Fact label="Experience" value={featuredJob.experience} />
                <Fact label="Employment Type" value={featuredJob.type} />
              </div>

              <div className="jobs-cta-row">
                {hasSalary(featuredJob) && (
                  <div>
                    <span className="jobs-salary-label">Compensation</span>
                    <span className="jobs-salary">{featuredJob.salary}</span>
                  </div>
                )}
                <button type="button" onClick={() => setActiveJob(featuredJob)} className="btn btn-primary">
                  View Details &amp; Apply →
                </button>
              </div>
            </div>

            <div className="jobs-visual">
              {featuredJob.airlineLogo ? (
                <img src={featuredJob.airlineLogo} alt={featuredJob.role} data-testid="featured-job-image" />
              ) : (
                <>
                  <span className="jobs-visual-icon" aria-hidden="true">✈</span>
                  <span className="jobs-visual-airline">{featuredJob.airline}</span>
                  <span className="jobs-visual-meta">{featuredJob.type} · {featuredJob.location}</span>
                </>
              )}
            </div>
          </article>
        )}

        {/* ====== FILTERS ====== */}
        {!loading && jobs.length > 1 && (
          <div className="jobs-filters">
            {[
              { id: 'jobs-airline', label: 'Airline Carrier', opts: airlines, val: selectedAirline, set: setSelectedAirline },
              { id: 'jobs-type', label: 'Program Type', opts: types, val: selectedType, set: setSelectedType },
              { id: 'jobs-exp', label: 'Experience Level', opts: experiences, val: selectedExperience, set: setSelectedExperience },
            ].map(({ id, label, opts, val, set }) => (
              <div key={id}>
                <label htmlFor={id}>{label}</label>
                <select id={id} value={val} onChange={(e) => set(e.target.value)}>
                  {opts.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* ====== LOADING ====== */}
        {loading && (
          <div className="jobs-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="jobs-card" style={{ height: '220px', opacity: 0.5 + i * 0.1 }} />
            ))}
          </div>
        )}

        {/* ====== ERROR ====== */}
        {error && (
          <div className="jobs-empty">
            <p style={{ fontSize: '1rem', margin: 0 }}>
              Could not load job listings. Please try again or call us at{' '}
              <a href="tel:+919953777320" style={{ color: 'var(--red)', fontWeight: 700 }}>
                +91 9953 777 320
              </a>.
            </p>
          </div>
        )}

        {/* ====== EMPTY (no jobs at all) ====== */}
        {!loading && !error && jobs.length === 0 && (
          <div className="jobs-empty">
            <p style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>No active recruitment listings at this time.</p>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Check back soon or contact us directly for placement guidance.</p>
          </div>
        )}

        {/* ====== RESULT COUNT ====== */}
        {!loading && allJobs.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.6)', marginBottom: '1.25rem', fontWeight: 600 }}>
            {allJobs.length} more active {allJobs.length === 1 ? 'vacancy' : 'vacancies'}
          </p>
        )}

        {/* ====== JOB CARDS GRID ====== */}
        {!loading && !error && allJobs.length > 0 && (
          <div className="jobs-grid">
            {allJobs.map((job) => {
              const status = getStatus(job.closesAt)
              return (
                <article key={job.id} className="jobs-card" data-testid="job-card">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', marginBottom: '1rem' }}>
                      <AirlineLogo job={job} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className="jobs-airline-name" style={{ fontSize: '0.66rem' }}>{job.airline}</span>
                          <span
                            className="jobs-status"
                            style={{ background: status.color, color: status.textColor, border: `1px solid ${status.borderColor}` }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <h3 className="jobs-card-title">{job.role}</h3>
                      </div>
                    </div>

                    <p className="jobs-card-meta">📍 {job.location} · {job.type}</p>
                    <p className="jobs-card-meta"><strong>Experience:</strong> {job.experience}</p>
                    {job.eligibility && (
                      <p className="jobs-card-meta">
                        <strong>Eligibility:</strong>{' '}
                        {job.eligibility.length > 120 ? `${job.eligibility.substring(0, 120)}…` : job.eligibility}
                      </p>
                    )}
                  </div>

                  <div>
                    {hasSalary(job) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', borderTop: '1px solid rgba(0,39,76,0.1)', paddingTop: '1rem', marginBottom: '1rem' }}>
                        <span className="jobs-salary-label" style={{ margin: 0 }}>Compensation</span>
                        <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', textAlign: 'right' }}>{job.salary}</span>
                      </div>
                    )}
                    <button type="button" onClick={() => setActiveJob(job)} className="jobs-btn-secondary" style={{ width: '100%' }}>
                      View Details →
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* ====== NO RESULTS AFTER FILTER ====== */}
        {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
          <div className="jobs-empty">
            <p style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>No active recruitment routes match the selected filters.</p>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Clear filters to see all openings.</p>
          </div>
        )}

        </div>
      </main>

      {/* ====== JOB DETAIL MODAL ====== */}
      {activeJob && (
        <div
          className="jobs-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setActiveJob(null)}
        >
          <div className="jobs-modal" role="dialog" aria-modal="true" aria-labelledby="job-modal-title" data-testid="job-modal">
            <button type="button" onClick={() => setActiveJob(null)} className="jobs-modal-close" aria-label="Close">
              ×
            </button>

            <p className="jobs-modal-eyebrow">{activeJob.airline} Recruitment</p>
            <h2 id="job-modal-title" className="jobs-modal-title">{activeJob.role}</h2>

            {applying ? (
              <JobApplicationForm job={activeJob} onCancel={() => setApplying(false)} />
            ) : (
            <>
              <div className="jobs-modal-section">
                <h4>Overview</h4>
                <p>{activeJob.description || 'Details available on request.'}</p>
              </div>

              {activeJob.eligibility && (
                <div className="jobs-modal-section jobs-modal-eligibility">
                  <h4>Eligibility Criteria</h4>
                  <p>{activeJob.eligibility}</p>
                </div>
              )}

              <div className="jobs-modal-facts">
                {hasSalary(activeJob) && <Fact label="Compensation" value={activeJob.salary} />}
                <Fact label="Experience" value={activeJob.experience} />
                <Fact label="Location" value={activeJob.location} />
                <Fact label="Employment Type" value={activeJob.type} />
                {activeJob.closesAt && <Fact label="Last Date" value={formatDate(activeJob.closesAt)} />}
              </div>

              <div className="jobs-modal-actions">
                {activeJob.externalApplyUrl ? (
                  <a
                    href={activeJob.externalApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Apply on Partner Site →
                  </a>
                ) : (
                  <button
                    type="button"
                    data-testid="job-apply-button"
                    className="btn btn-primary"
                    onClick={() => setApplying(true)}
                  >
                    Apply Now →
                  </button>
                )}
                <button type="button" onClick={() => setActiveJob(null)} className="jobs-btn-secondary">
                  Close
                </button>
              </div>
            </>
            )}
          </div>
        </div>
      )}

      <Footer />

      {/* JobPosting structured data — canonical PUBLISHED jobs from Admin CMS */}
      {!loading && !error && jobs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': jobs
                .filter((j) => j.role && j.description)
                .map((j) => {
                  const posting = {
                    '@type': 'JobPosting',
                    title: j.role,
                    description: (j.description || '').slice(0, 4000),
                    datePosted: j.publishedAt,
                    hiringOrganization: {
                      '@type': 'Organization',
                      name: 'Airborne Aviation Academy',
                      sameAs: 'https://www.airborneaviation.in',
                    },
                    jobLocation: {
                      '@type': 'Place',
                      address: { '@type': 'PostalAddress', addressLocality: j.location || 'India' },
                    },
                    directApply: true,
                  }
                  if (j.closesAt) posting.validThrough = j.closesAt
                  if (j.type) posting.employmentType = j.type.toUpperCase().replace(/[\s/-]+/g, '_')
                  if (j.salaryMin || j.salaryMax) {
                    posting.baseSalary = {
                      '@type': 'MonetaryAmount',
                      currency: j.currency || 'INR',
                      value: {
                        '@type': 'QuantitativeValue',
                        minValue: j.salaryMin ? j.salaryMin * (j.salaryFrequency === 'yearly' ? 1 : 12) : undefined,
                        maxValue: j.salaryMax ? j.salaryMax * (j.salaryFrequency === 'yearly' ? 1 : 12) : undefined,
                        unitText: j.salaryFrequency === 'yearly' ? 'YEAR' : 'MONTH',
                      },
                    }
                  }
                  return posting
                }),
            }),
          }}
        />
      )}
    </>
  )
}
