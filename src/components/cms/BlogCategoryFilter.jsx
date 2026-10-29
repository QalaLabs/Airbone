'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BlogCategoryFilter({ categories, initialCategory = 'All', posts }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Category filter pills */}
      <div
        role="tablist"
        aria-label="Filter blog articles by category"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                borderRadius: '9999px',
                border: isSelected ? '1px solid var(--navy, #00274C)' : '1px solid rgba(0,39,76,0.15)',
                background: isSelected ? 'var(--navy, #00274C)' : '#fff',
                color: isSelected ? '#fff' : 'rgba(33,33,33,0.75)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Article listing */}
      {filteredPosts.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#fff', borderRadius: '6px', border: '1px solid rgba(0,39,76,0.08)' }}>
          <p style={{ margin: 0, color: 'rgba(33,33,33,0.6)', fontSize: '0.95rem' }}>
            No articles found in this category yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filteredPosts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : null

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  display: 'block',
                  background: '#fff',
                  border: '1px solid rgba(0,39,76,0.08)',
                  borderRadius: '6px',
                  padding: '1.75rem 2rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(0,39,76,0.04)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                }}
                className="blog-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--red, #DB241E)',
                      background: 'rgba(219,36,30,0.06)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    {post.category}
                  </span>
                  {formattedDate && (
                    <span style={{ fontSize: '0.78rem', color: 'rgba(33,33,33,0.5)' }}>
                      {formattedDate}
                    </span>
                  )}
                  {post.readTime && (
                    <span style={{ fontSize: '0.78rem', color: 'rgba(33,33,33,0.45)' }}>
                      • {post.readTime}
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-h)',
                    fontSize: '1.25rem',
                    color: 'var(--navy, #00274C)',
                    fontWeight: 800,
                    lineHeight: 1.35,
                  }}
                >
                  {post.title}
                </h2>

                <p style={{ margin: '0.65rem 0 0', color: 'rgba(33,33,33,0.7)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {post.excerpt}
                </p>

                {post.author && (
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(33,33,33,0.6)' }}>
                    <span>By {post.author}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
