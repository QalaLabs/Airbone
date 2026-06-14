'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getFAQSchema } from '@/utils/seo'

const RESOURCES = [
  {
    id: 'dgca-prep-handbook',
    title: 'DGCA Preparation Handbook',
    description: 'A complete structural guide to passing the Air Navigation & Meterology written tests on your first attempt.',
    fileName: 'dgca_prep_handbook.pdf',
    size: '4.8 MB',
    type: 'Study Guide'
  },
  {
    id: 'complete-cpl-guide',
    title: 'Complete CPL Guide 2026',
    description: 'Detailed roadmap from zero flying hours to a commercial cockpit rating. Covers license conversions, visa pathways, and medical criteria.',
    fileName: 'complete_cpl_guide.pdf',
    size: '5.2 MB',
    type: 'Career Roadmap'
  },
  {
    id: 'cabin-crew-blueprint',
    title: 'Cabin Crew Interview Blueprint',
    description: 'Grooming guidelines, behavioral responses, safety matrices, and placement tips to crack cabin crew selections.',
    fileName: 'cabin_crew_blueprint.pdf',
    size: '3.1 MB',
    type: 'Interview Prep'
  },
  {
    id: 'career-faqs-guide',
    title: 'Pilot Career FAQs Guide',
    description: 'Honest answers on training costs, financing options, airline cadet options, and job stability projections in India.',
    fileName: 'career_faqs_guide.pdf',
    size: '2.4 MB',
    type: 'FAQ Document'
  },
  {
    id: 'aviation-meteorology-notes',
    title: 'Aviation Meteorology Quick Revision Notes',
    description: 'Core concepts on high-altitude jet streams, cloud structures, and wind shear calculations for quick revisions.',
    fileName: 'aviation_meteorology_notes.pdf',
    size: '1.9 MB',
    type: 'Revision Sheet'
  }
]

export default function ResourcesPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [showGateModal, setShowGateModal] = useState(false)
  const [targetResource, setTargetResource] = useState(null)
  const [formStatus, setFormStatus] = useState('idle') // idle, loading, success

  // Check if user has unlocked resources in this session
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('resources_unlocked')
    if (isUnlocked === 'true') {
      setUnlocked(true)
    }
  }, [])

  const handleDownloadClick = (resource) => {
    if (unlocked) {
      // Direct download
      triggerFileDownload(resource.fileName)
    } else {
      setTargetResource(resource)
      setShowGateModal(true)
    }
  }

  const triggerFileDownload = (fileName) => {
    // Dynamically create a link to download the placeholder file
    const link = document.createElement('a')
    link.href = `/documents/${fileName}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGateSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('loading')

    const name = e.target.elements['gate-name'].value
    const phone = e.target.elements['gate-phone'].value
    const email = e.target.elements['gate-email'].value
    const course = e.target.elements['gate-course'].value

    // Submit lead details to CRM
    try {
      await fetch('/api/lead', {
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
    } catch (err) {
      // Suppress network errors and allow mock bypass
    }

    // Unlock resources
    sessionStorage.setItem('resources_unlocked', 'true')
    setUnlocked(true)
    setFormStatus('success')
    
    setTimeout(() => {
      setShowGateModal(false)
      if (targetResource) {
        triggerFileDownload(targetResource.fileName)
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

        {/* Resources Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {RESOURCES.map(res => (
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
                  <span>{res.size}</span>
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
                  className={unlocked ? "btn btn-primary" : "btn btn-ghost"} 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.72rem' }}
                >
                  {unlocked ? '⬇️ Download PDF' : '🔒 Unlock Document'}
                </button>
              </div>
            </div>
          ))}
        </div>

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
                Verify your student profile. Submitting unlocks **all 5 publications** in this browser session.
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
                    {formStatus === 'loading' ? 'Verifying...' : 'Unlock &amp; Download →'}
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
