'use client'

import { useEffect, useState } from 'react'

function Stars({ value, size = '0.95rem' }) {
  const full = Math.round(value)
  return (
    <span aria-label={`${value} out of 5 stars`} style={{ color: '#FBBC04', fontSize: size, letterSpacing: '0.1em' }}>
      {'★'.repeat(full)}
      <span style={{ color: 'rgba(0,39,76,0.15)' }}>{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  )
}

export default function GoogleReviewsSection() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/public-proxy/google-reviews')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d?.data) setData(d.data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!data?.configured || !data.reviews?.length) return null

  return (
    <section
      id="google-reviews"
      data-testid="google-reviews"
      style={{ padding: 'clamp(3rem,6vw,6rem) clamp(1.5rem,5vw,4rem)', background: '#fff' }}
    >
      <div className="container-xl">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div>
            <div className="chapter-num" style={{ color: 'var(--red)', marginBottom: '0.75rem' }}>Google Reviews</div>
            <h2 className="display-xl" style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)', color: 'var(--navy)' }}>
              What students say on Google
            </h2>
            {data.rating != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
                <strong style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--navy)' }}>{data.rating.toFixed(1)}</strong>
                <Stars value={data.rating} size="1.1rem" />
                {data.totalReviews != null && (
                  <span style={{ fontSize: '0.8rem', color: 'rgba(0,39,76,0.6)' }}>{data.totalReviews} reviews</span>
                )}
              </div>
            )}
          </div>
          {data.mapsUrl && (
            <a href={data.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>
              See all reviews on Google →
            </a>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {data.reviews.map((r, i) => (
            <figure
              key={`${r.author}-${i}`}
              style={{ margin: 0, padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,39,76,0.08)', background: '#fff', boxShadow: '0 10px 30px rgba(0,39,76,0.05)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {r.authorPhoto ? (
                  <img src={r.authorPhoto} alt="" referrerPolicy="no-referrer" loading="lazy" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--navy)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  {r.authorUrl ? (
                    <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--navy)', textDecoration: 'none' }}>{r.author}</a>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{r.author}</span>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'rgba(0,39,76,0.55)' }}>
                    <Stars value={r.rating} size="0.8rem" /> {r.relativeTime ? `· ${r.relativeTime}` : ''}
                  </div>
                </div>
              </div>
              <blockquote style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(0,39,76,0.8)' }}>
                {r.text.length > 320 ? `${r.text.slice(0, 320)}…` : r.text}
              </blockquote>
            </figure>
          ))}
        </div>
        <p style={{ marginTop: '1.25rem', fontSize: '0.7rem', color: 'rgba(0,39,76,0.5)' }}>Reviews from Google</p>
      </div>
    </section>
  )
}
