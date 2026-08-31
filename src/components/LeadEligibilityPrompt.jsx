'use client'

import { useState } from 'react'

/**
 * Post-submission eligibility self-check shown after a lead enquiry is
 * submitted. Asks lightweight, advisory airline-standard screening questions
 * and returns an eligible / counsellor-review recommendation. Advisor-only:
 * results never block the applicant, they just guide the next counselling call.
 *
 * courseCategory: 'cabin-crew' or 'pilot' default.
 */
export default function LeadEligibilityPrompt({ courseCategory = 'pilot', onRestart }) {
  const [step, setStep] = useState(1) // 1 questions, 2 positive, 3 needs-review
  const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null })

  const questions =
    courseCategory === 'cabin-crew'
      ? [
          { key: 'q1', label: 'Is your age between 18 and 27 years?' },
          { key: 'q2', label: 'Is your height at least 157 cm (Females) or 170 cm (Males)?' },
          { key: 'q3', label: 'Have you completed Class 12th (10+2) or equivalent?' },
        ]
      : [
          { key: 'q1', label: 'Are you at least 17 years old?' },
          { key: 'q2', label: 'Have you passed Class 12th (10+2) with Physics & Mathematics?' },
          { key: 'q3', label: 'Is your eyesight correctable to 6/6 (you can wear glasses/contacts)?' },
        ]

  const handleAnswer = (key, val) => {
    const next = { ...answers, [key]: val }
    setAnswers(next)
    if (key === 'q3') {
      const eligible = questions.every((q) => next[q.key] === 'yes')
      setStep(eligible ? 2 : 3)
    }
  }

  const reset = () => {
    setAnswers({ q1: null, q2: null, q3: null })
    setStep(1)
  }

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
      <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.85rem', color: '#D8A027', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
        Quick Eligibility Check
      </h4>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', marginBottom: '1rem' }}>
        While you wait, answer 3 quick questions so our counsellor can tailor your session. This never blocks your application.
      </p>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, i) => (
            <div key={q.key}>
              <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.4rem' }}>
                {i + 1}. {q.label}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(q.key, opt === 'Yes' ? 'yes' : 'no')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '3px',
                      border: answers[q.key] ? '1px solid #D8A027' : '1px solid rgba(255,255,255,0.15)',
                      background: answers[q.key] ? 'rgba(216,160,39,0.15)' : 'transparent',
                      color: answers[q.key] ? '#D8A027' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontFamily: 'var(--font-h)',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: '4px', padding: '1rem', color: '#25D366' }}>
          <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.4rem' }}>✓ You look eligible!</p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
            Based on your answers you meet standard airline-entry guidelines. An admissions counsellor will confirm the details and
            guide your next steps shortly.
          </p>
          {onRestart ? (
            <button type="button" onClick={() => { reset(); onRestart && onRestart(); }} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#D8A027', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>
              ← Back to start
            </button>
          ) : null}
        </div>
      )}

      {step === 3 && (
        <div style={{ background: 'rgba(216,160,39,0.1)', border: '1px solid rgba(216,160,39,0.4)', borderRadius: '4px', padding: '1rem' }}>
          <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#D8A027', marginBottom: '0.4rem' }}>Some criteria may need review</p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
            Aviation guidelines include specific age, medical and education parameters. Our counsellor will discuss suitable pathways
            (including alternate roles) with you — this does not affect your enquiry.
          </p>
          {onRestart ? (
            <button type="button" onClick={() => { reset(); onRestart && onRestart(); }} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#D8A027', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>
              ← Back to start
            </button>
          ) : null}
        </div>
      )}
      <p style={{ marginTop: '1rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>Advisory only — a counsellor makes the final eligibility assessment.</p>
    </div>
  )
}
