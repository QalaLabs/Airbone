'use client'

import { useState } from 'react'
import LeadForm from './LeadForm'

export default function CabinCrewEligibilityQuiz() {
  const [isOpen, setIsOpen] = useState(false)
  const [answers, setAnswers] = useState({ age: null, height: null, education: null })
  const [step, setStep] = useState(1) // 1: Questions, 2: Result eligible, 3: Result not eligible

  const handleAnswer = (field, val) => {
    const nextAnswers = { ...answers, [field]: val }
    setAnswers(nextAnswers)

    // Automatically check when all 3 answered
    if (field === 'education') {
      if (nextAnswers.age === 'yes' && nextAnswers.height === 'yes' && val === 'yes') {
        setStep(2)
      } else {
        setStep(3)
      }
    }
  }

  const resetQuiz = () => {
    setAnswers({ age: null, height: null, education: null })
    setStep(1)
  }

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setStep(1); }}
        style={{
          background: 'var(--red)',
          color: '#ffffff',
          border: 'none',
          padding: '0.8rem 1.8rem',
          borderRadius: '4px',
          fontFamily: 'var(--font-h)',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-dark)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--red)'}
      >
        Check Eligibility & Scholarships
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 8, 22, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1.5rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0, 8, 22, 0.3)',
            position: 'relative',
            fontFamily: 'var(--font-b)',
            color: 'var(--navy)',
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'rgba(0, 39, 76, 0.4)',
              }}
            >
              ✕
            </button>

            {step === 1 && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,39,76,0.08)', paddingBottom: '0.75rem' }}>
                  Cabin Crew Eligibility Quiz
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Q1: Age */}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>1. Is your age between 18 and 27 years?</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => handleAnswer('age', 'yes')}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 600,
                          background: answers.age === 'yes' ? 'var(--navy)' : '#fff',
                          color: answers.age === 'yes' ? '#fff' : 'var(--navy)'
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer('age', 'no')}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 600,
                          background: answers.age === 'no' ? 'var(--navy)' : '#fff',
                          color: answers.age === 'no' ? '#fff' : 'var(--navy)'
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Q2: Height */}
                  {answers.age && (
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>2. Is your height at least 157 cm (Females) or 170 cm (Males)?</p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => handleAnswer('height', 'yes')}
                          style={{
                            flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 600,
                            background: answers.height === 'yes' ? 'var(--navy)' : '#fff',
                            color: answers.height === 'yes' ? '#fff' : 'var(--navy)'
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleAnswer('height', 'no')}
                          style={{
                            flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 600,
                            background: answers.height === 'no' ? 'var(--navy)' : '#fff',
                            color: answers.height === 'no' ? '#fff' : 'var(--navy)'
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Q3: Education */}
                  {answers.height && (
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>3. Have you completed Class 12th (10+2) or equivalent?</p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => handleAnswer('education', 'yes')}
                          style={{
                            flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 600,
                            background: answers.education === 'yes' ? 'var(--navy)' : '#fff',
                            color: answers.education === 'yes' ? '#fff' : 'var(--navy)'
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleAnswer('education', 'no')}
                          style={{
                            flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 600,
                            background: answers.education === 'no' ? 'var(--navy)' : '#fff',
                            color: answers.education === 'no' ? '#fff' : 'var(--navy)'
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a', marginBottom: '1.25rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                    You Are Eligible!
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Congratulations! You meet all airline-standard qualifications and are eligible for our <strong>Batch 1 100% Scholarship Pathway</strong>. Submit your details to book your official counseling session.
                </p>

                <LeadForm
                  courseName="Cabin Crew Training (Eligible)"
                  source="Cabin Crew Eligibility Quiz"
                  successMessage="Thank you! Your eligibility details have been submitted. An Admissions officer will contact you within 24 hours to schedule your assessment."
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--red)', marginBottom: '1.25rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
                    Ineligible Criteria
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.7)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Aviation guidelines require specific medical, age, and height parameters. Although you may not meet standard cabin crew eligibility rules, you can still consult with us for ground crew/operations pathways.
                </p>

                <button
                  onClick={resetQuiz}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(0,39,76,0.15)', cursor: 'pointer', fontWeight: 700,
                    background: 'rgba(0,39,76,0.04)', color: 'var(--navy)', fontFamily: 'var(--font-h)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase'
                  }}
                >
                  Restart Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
