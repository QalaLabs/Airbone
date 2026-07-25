'use client'

import Link from 'next/link'

/**
 * Visible breadcrumb trail + optional JSON-LD via getBreadcrumbSchema elsewhere.
 * @param {{ items: { name: string, path?: string }[] }} props
 */
export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className="site-breadcrumb">
      <ol className="site-breadcrumb-list">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.name}-${i}`} className="site-breadcrumb-item">
              {!last && item.path ? (
                <Link href={item.path} className="site-breadcrumb-link">
                  {item.name}
                </Link>
              ) : (
                <span className="site-breadcrumb-current" aria-current={last ? 'page' : undefined}>
                  {item.name}
                </span>
              )}
              {!last && <span className="site-breadcrumb-sep" aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
