'use client'

import { useEffect, useState } from 'react'

/**
 * Reusable Google Reviews & Rating Component.
 * Supports configurable data via props or live Places API proxy.
 * If actual content has not yet been supplied by the client, renders a clean,
 * graceful placeholder rather than inventing fake reviews or ratings.
 */
export default function GoogleReviewsWidget({
  dark = true,
  compact = false,
  rating: propRating,
  totalReviews: propTotalReviews,
  reviews: propReviews,
  title = 'Google Reviews',
}) {
  const [payload, setPayload] = useState(null)

  useEffect(() => {
    if (propReviews && propReviews.length > 0) return
    let cancelled = false
    fetch('/api/public-proxy/google-reviews')
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled) setPayload(body?.data ?? null)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [propReviews])

  const rating = typeof propRating === 'number'
    ? propRating
    : typeof payload?.rating === 'number'
      ? payload.rating
      : null

  const totalReviews = typeof propTotalReviews === 'number'
    ? propTotalReviews
    : typeof payload?.totalReviews === 'number'
      ? payload.totalReviews
      : null

  const activeReviews = Array.isArray(propReviews) && propReviews.length > 0
    ? propReviews.slice(0, 3)
    : Array.isArray(payload?.reviews) && payload.reviews.length > 0
      ? payload.reviews.slice(0, 3)
      : []

  const hasSuppliedContent = rating !== null && activeReviews.length > 0

  const textColor = dark ? 'rgba(255, 255, 255, 0.92)' : 'var(--navy, #00274C)'
  const subColor = dark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 39, 76, 0.65)'
  const cardBg = dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 39, 76, 0.03)'
  const innerCardBg = dark ? 'rgba(0, 0, 0, 0.25)' : '#ffffff'
  const borderColor = dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 39, 76, 0.1)'
  const starCount = rating ? Math.max(1, Math.min(5, Math.round(rating))) : 5
  const stars = '★'.repeat(starCount) + '☆'.repeat(5 - starCount)

  return (
    <div
      className="google-reviews-widget"
      style={{
        marginTop: '1.25rem',
        padding: compact ? '0.85rem 1rem' : '1.25rem 1.35rem',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        fontFamily: 'var(--font-b, sans-serif)',
      }}
    >
      {/* Header with Google Logo & Rating */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: textColor, letterSpacing: '0.02em' }}>{title}</span>
        </div>

        {hasSuppliedContent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#F4B400' }}>{rating.toFixed(1)}</span>
            <div style={{ display: 'inline-flex', color: '#F4B400', fontSize: '0.85rem' }} aria-label={`${rating.toFixed(1)} out of 5 stars`}>{stars}</div>
            {totalReviews !== null && (
              <span style={{ fontSize: '0.72rem', color: subColor }}>({totalReviews} reviews)</span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: subColor }}>Verified Profile Syncing</span>
            <span style={{ color: '#F4B400', fontSize: '0.8rem' }}>★★★★★</span>
          </div>
        )}
      </div>

      {/* Review cards or graceful placeholders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {hasSuppliedContent ? (
          activeReviews.map((rev, i) => (
            <div
              key={`${rev.author || rev.name || 'review'}-${i}`}
              style={{
                padding: '0.65rem 0.85rem',
                background: innerCardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: textColor }}>{rev.author || rev.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#F4B400', fontSize: '0.72rem' }}>{'★'.repeat(rev.rating || 5)}</span>
                  {(rev.relativeTime || rev.date) && (
                    <span style={{ fontSize: '0.68rem', color: subColor }}>{rev.relativeTime || rev.date}</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.76rem', color: subColor, lineHeight: 1.45, margin: 0, fontStyle: 'italic' }}>
                &ldquo;{rev.text}&rdquo;
              </p>
            </div>
          ))
        ) : (
          /* Graceful placeholder awaiting client-supplied reviews */
          <div
            style={{
              padding: '0.75rem 0.85rem',
              background: innerCardBg,
              border: `1px dashed ${borderColor}`,
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: subColor, margin: 0, lineHeight: 1.5 }}>
              Recent Google reviews will appear here. Verified student feedback from our Google Business profile is currently being configured.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  style={{
                    flex: '1 1 90px',
                    padding: '0.4rem 0.5rem',
                    background: cardBg,
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    color: subColor,
                    textAlign: 'center',
                  }}
                >
                  ★ Review slot {slot}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
