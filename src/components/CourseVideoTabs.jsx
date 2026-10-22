'use client'

import { useState } from 'react'
import { getCourseVideos, YOUTUBE_CHANNEL_URL } from '@/lib/courseVideos'

export default function CourseVideoTabs({ slug, courseName, customVideos }) {
  const data = customVideos || getCourseVideos(slug)
  const [activeTab, setActiveTab] = useState(
    data.shorts.length > 0 ? 'shorts' : data.playlists.length > 0 ? 'playlists' : 'shorts'
  )

  const displayName = courseName || data.title || 'Course'

  return (
    <div className="course-video-tabs-wrap" style={{ marginTop: '0.5rem' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="course-section-title" style={{ marginBottom: '0.5rem' }}>
          {data.title || `${displayName} - Video Briefings & Shorts`}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(0, 39, 76, 0.65)', lineHeight: '1.6', margin: 0 }}>
          {data.subtitle || 'Watch practical concept walk-throughs, cockpit orientation, and simulator demonstrations.'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Course Video Categories"
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(0, 39, 76, 0.1)',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'shorts'}
          onClick={() => setActiveTab('shorts')}
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '0.55rem 1.1rem',
            borderRadius: '6px',
            border: activeTab === 'shorts' ? '1px solid var(--red)' : '1px solid rgba(0, 39, 76, 0.1)',
            background: activeTab === 'shorts' ? 'var(--red)' : '#ffffff',
            color: activeTab === 'shorts' ? '#ffffff' : 'var(--navy)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 8.92a3.3 3.3 0 0 0-4.37-4.37l-6.7 3.86a3.3 3.3 0 0 0-.25 5.76s.46.2.98.41l-1.45.83a3.3 3.3 0 0 0 4.37 4.37l6.7-3.86a3.3 3.3 0 0 0 .49-5.67z" />
          </svg>
          YouTube Shorts
          {data.shorts.length > 0 ? (
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                background: activeTab === 'shorts' ? 'rgba(255,255,255,0.25)' : 'rgba(219,36,30,0.1)',
                color: activeTab === 'shorts' ? '#ffffff' : 'var(--red)',
              }}
            >
              {data.shorts.length}
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: activeTab === 'shorts' ? 'rgba(255,255,255,0.25)' : 'rgba(0,39,76,0.06)',
                color: activeTab === 'shorts' ? '#ffffff' : 'rgba(0,39,76,0.5)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Coming Soon
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'playlists'}
          onClick={() => setActiveTab('playlists')}
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '0.55rem 1.1rem',
            borderRadius: '6px',
            border: activeTab === 'playlists' ? '1px solid var(--navy)' : '1px solid rgba(0, 39, 76, 0.1)',
            background: activeTab === 'playlists' ? 'var(--navy)' : '#ffffff',
            color: activeTab === 'playlists' ? '#ffffff' : 'var(--navy)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <polygon points="3 6 3 18 6 12 3 6" fill="currentColor" />
          </svg>
          Lecture Playlists
          {data.playlists.length > 0 ? (
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                background: activeTab === 'playlists' ? 'rgba(255,255,255,0.2)' : 'rgba(0,39,76,0.1)',
                color: activeTab === 'playlists' ? '#ffffff' : 'var(--navy)',
              }}
            >
              {data.playlists.length}
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: activeTab === 'playlists' ? 'rgba(255,255,255,0.2)' : 'rgba(0,39,76,0.06)',
                color: activeTab === 'playlists' ? '#ffffff' : 'rgba(0,39,76,0.5)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Coming Soon
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'channel'}
          onClick={() => setActiveTab('channel')}
          style={{
            fontFamily: 'var(--font-h)',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '0.55rem 1.1rem',
            borderRadius: '6px',
            border: activeTab === 'channel' ? '1px solid var(--navy)' : '1px solid rgba(0, 39, 76, 0.1)',
            background: activeTab === 'channel' ? 'var(--navy)' : '#ffffff',
            color: activeTab === 'channel' ? '#ffffff' : 'var(--navy)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: activeTab === 'channel' ? 'var(--gold)' : 'var(--red)' }}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          Academy Channel
        </button>
      </div>

      {/* Tab Panels */}

      {/* 1. YouTube Shorts Tab */}
      {activeTab === 'shorts' && (
        <div>
          {data.shorts.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 320px))',
                gap: '1.5rem',
                justifyContent: 'start',
              }}
            >
              {data.shorts.map((short, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0, 39, 76, 0.08)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 39, 76, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '177.77%', // 9:16 aspect ratio for vertical shorts
                      background: '#000000',
                    }}
                  >
                    <iframe
                      src={short.embedUrl}
                      title={short.title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem', fontFamily: 'var(--font-h)' }}>
                      Airborne Short #{idx + 1}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-h)', lineHeight: '1.3' }}>
                      {short.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(219,36,30,0.03) 0%, rgba(0,39,76,0.02) 100%)',
                border: '1px dashed rgba(219, 36, 30, 0.25)',
                borderRadius: '12px',
                padding: '2.5rem 1.75rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(219,36,30,0.08)',
                  color: 'var(--red)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 8.92a3.3 3.3 0 0 0-4.37-4.37l-6.7 3.86a3.3 3.3 0 0 0-.25 5.76s.46.2.98.41l-1.45.83a3.3 3.3 0 0 0 4.37 4.37l6.7-3.86a3.3 3.3 0 0 0 .49-5.67z" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.04em',
                }}
              >
                YouTube Shorts Coming Soon
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 39, 76, 0.65)',
                  maxWidth: '520px',
                  margin: '0 auto 1.5rem auto',
                  lineHeight: '1.6',
                }}
              >
                High-yield conceptual shorts for <strong>{displayName}</strong> are being recorded by Capt. Navrang Singh and our flight instructors. Embedded shorts will appear here as links are published.
              </p>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--red)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 700,
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(219,36,30,0.25)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Watch Latest Shorts on YouTube
              </a>
            </div>
          )}
        </div>
      )}

      {/* 2. YouTube Playlists Tab */}
      {activeTab === 'playlists' && (
        <div>
          {data.playlists.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {data.playlists.map((pl, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0, 39, 76, 0.08)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 39, 76, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      background: '#000000',
                    }}
                  >
                    <iframe
                      src={pl.embedUrl}
                      title={pl.title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem', fontFamily: 'var(--font-h)' }}>
                      Full Playlist Module #{idx + 1}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-h)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                      {pl.title}
                    </div>
                    {pl.description && (
                      <p style={{ fontSize: '0.82rem', color: 'rgba(0,39,76,0.65)', lineHeight: '1.5', margin: 0 }}>
                        {pl.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0,39,76,0.02) 0%, rgba(212,175,55,0.04) 100%)',
                border: '1px dashed rgba(0, 39, 76, 0.2)',
                borderRadius: '12px',
                padding: '2.5rem 1.75rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(0,39,76,0.06)',
                  color: 'var(--navy)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-h)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--navy)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.04em',
                }}
              >
                Lecture Playlists Coming Soon
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 39, 76, 0.65)',
                  maxWidth: '520px',
                  margin: '0 auto 1.5rem auto',
                  lineHeight: '1.6',
                }}
              >
                Full ground theory playlist modules, simulator checklists, and student Q&amp;A sessions for <strong>{displayName}</strong> are being curated. Video links will populate this player grid automatically.
              </p>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--navy)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-h)',
                  fontWeight: 700,
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,39,76,0.15)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--red)' }}>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Subscribe on YouTube
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. Academy Channel Tab */}
      {activeTab === 'channel' && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,39,76,0.03) 0%, rgba(219,36,30,0.03) 100%)',
            border: '1px solid rgba(0, 39, 76, 0.08)',
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--red)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>
                Airborne Aviation Academy Official Channel
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(0,39,76,0.6)', marginTop: '0.2rem' }}>
                @airborneaviationacademy · Ground school lectures, flight deck briefs &amp; student reviews
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'rgba(0,39,76,0.7)', lineHeight: '1.65', margin: 0 }}>
            Subscribe to stay updated with Capt. Navrang Singh&apos;s latest aviation deep dives, CPL exam preparation strategies, cockpit walk-throughs, and real student experiences.
          </p>

          <div>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--red)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-h)',
                fontWeight: 700,
                padding: '0.65rem 1.4rem',
                borderRadius: '6px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(219,36,30,0.25)',
              }}
            >
              Open YouTube Channel
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
