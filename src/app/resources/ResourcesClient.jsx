'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getFAQSchema } from '@/utils/seo'

function mapResource(r) {
  const meta = r.metadata ?? {}
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    fileName: meta.fileName ?? r.slug ?? `${r.id}.pdf`,
    size: meta.size ?? null,
    type: r.type ?? meta.type ?? 'Document',
    fileUrl: r.fileUrl ?? null,
    isGated: r.isGated !== false,
  }
}

export default function ResourcesClient() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [unlocked, setUnlocked] = useState(false)
  const [gateToken, setGateToken] = useState(null)
  const [showGateModal, setShowGateModal] = useState(false)
  const [targetResource, setTargetResource] = useState(null)
  const [formStatus, setFormStatus] = useState('idle') // idle, loading, success

  useEffect(() => {
    const token = sessionStorage.getItem('resource_gate_token')
    if (token) { setGateToken(token); setUnlocked(true) }
  }, [])

  useEffect(() => {
    fetch('/api/public-proxy/resources')
      .then((r) => r.json())
      .then((d) => { setResources((d.data ?? []).map(mapResource)); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const triggerFileDownload = (url, fileName) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchGatedUrl = async (resourceId, token) => {
    try {
      const res = await fetch('/api/public-proxy/resource-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, resourceId }),
      })
      if (!res.ok) return null
      const json = await res.json()
      return json.url ?? null
    } catch { return null }
  }

  const handleDownloadClick = async (resource) => {
    if (!resource.isGated) {
      if (resource.fileUrl) triggerFileDownload(resource.fileUrl, resource.fileName)
      return
    }
    const token = gateToken ?? sessionStorage.getItem('resource_gate_token')
    if (!unlocked || !token) {
      setTargetResource(resource)
      setShowGateModal(true)
      return
    }
    const url = await fetchGatedUrl(resource.id, token)
    if (url) triggerFileDownload(url, resource.fileName)
  }

  const handleGateSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('loading')

    const name = e.target.elements['gate-name'].value
    const phone = e.target.elements['gate-phone'].value
    const email = e.target.elements['gate-email'].value
    const course = e.target.elements['gate-course'].value

    let token = null
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          course,
          source: `Resource Gate: ${targetResource?.title || 'Unknown'}`
        })
      })
      const json = await res.json().catch(() => ({}))
      token = json.gateToken ?? null
      if (token) {
        sessionStorage.setItem('resource_gate_token', token)
        setGateToken(token)
      }
    } catch {
      // Suppress network errors — unlock regardless
    }

    setUnlocked(true)
    setFormStatus('success')

    setTimeout(async () => {
      setShowGateModal(false)
      if (targetResource && token) {
        const url = await fetchGatedUrl(targetResource.id, token)
        if (url) triggerFileDownload(url, targetResource.fileName)
      }
    }, 1500)
  }

  const faqSchema = getFAQSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>

        {/* Title */}
        <div style={{ maxWidth: '800px', marginBottom: '4rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Gated Library</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Resource &amp;
            <em style={{ color: '#D8A027', fontStyle: 'normal' }}> E-Book Library.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.02rem', lineHeight: '1.6', maxWidth: '100%' }}>
            Download professional aviation ground guides compiled by Capt. Navrang Singh. Access requires verification profile inputs to block bots and raw scrapers.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: '#00162e', border: '1px solid rgba(255,255,255,0.06)', padding: '2rem', borderRadius: '1px', height: '200px', opacity: 0.4 + i * 0.08 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#000f1e', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Could not load resources. Please try again or contact us at <a href="tel:+919953777320" style={{ color: '#D8A027' }}>+91 9953 777 320</a>.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && resources.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#000f1e', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              No resources published yet.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
              Check back soon — guides and handbooks are being uploaded.
            </p>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && resources.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {resources.map((res) => (
              <div
                key={res.id}
                style={{
                  background: '#00162e',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '2rem',
                  borderRadius: '1px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D8A027', fontWeight: 700 }}>
                    <span>{res.type}</span>
                    {res.size && <span>{res.size}</span>}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.8rem', lineHeight: '1.3' }}>
                    {res.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {res.description}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => handleDownloadClick(res)}
                    className={(unlocked || !res.isGated) ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem' }}
                  >
                    {(unlocked || !res.isGated) ? '⬇️ Download PDF' : '🔒 Unlock Document'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gating Modal */}
        {showGateModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,5,18,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowGateModal(false)}
          >
            <div className="modal-box modal-box-dark" style={{ maxWidth: '500px' }}>
              <button onClick={() => setShowGateModal(false)} className="modal-close" style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>

              <p className="modal-eyebrow" style={{ color: '#D8A027', margin: 0 }}>Instant Verification Required</p>
              <h2 className="modal-h modal-h-dark" style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                Unlock Academy Library
              </h2>
              <p className="modal-body modal-body-dark" style={{ fontSize: '0.82rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Verify your student profile. Submitting unlocks all publications in this browser session.
              </p>

              {formStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <h3 style={{ color: '#D8A027', fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-h)', textTransform: 'uppercase', fontWeight: 800 }}>Access Granted</h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Your file is downloading automatically...</p>
                </div>
              ) : (
                <form className="modal-form" onSubmit={handleGateSubmit}>
                  <input
                    id="gate-name"
                    className="modal-input modal-input-dark"
                    type="text"
                    placeholder="Full Name"
                    required
                  />

                  <input
                    id="gate-phone"
                    className="modal-input modal-input-dark"
                    type="tel"
                    placeholder="Mobile Number (e.g. +91...)"
                    required
                  />

                  <input
                    id="gate-email"
                    className="modal-input modal-input-dark"
                    type="email"
                    placeholder="Email Address"
                    required
                  />

                  <select
                    id="gate-course"
                    className="modal-input modal-input-dark"
                    defaultValue=""
                    required
                    style={{ borderRadius: '1px' }}
                  >
                    <option value="" disabled>Select Targeted Course</option>
                    <option>DGCA CPL Ground School</option>
                    <option>Cadet Pilot Prep Program</option>
                    <option>Airbus A320 SIM Hours</option>
                    <option>ATPL Ground School</option>
                  </select>

                  <button
                    id="gate-submit-btn"
                    className="btn btn-primary"
                    type="submit"
                    disabled={formStatus === 'loading'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {formStatus === 'loading' ? 'Verifying...' : 'Unlock & Download →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}
