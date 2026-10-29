import { createElement } from 'react'
import { parseRichText } from '@/lib/cms/safeContent'

/**
 * Renders admin-authored rich text with the public site's allow-list parser.
 * HTML is never injected: parseRichText() drops scripts/iframes/styles,
 * unwraps unknown tags, and keeps only scheme-checked link hrefs, so React
 * escapes every text node.
 */
const STYLE = {
  p: { margin: '0 0 1rem', color: 'rgba(33,33,33,0.8)', lineHeight: 1.75 },
  h2: { margin: '2rem 0 1rem', color: 'var(--navy)', fontSize: '1.6rem', lineHeight: 1.25, fontWeight: 800, scrollMarginTop: '5rem' },
  h3: { margin: '1.5rem 0 0.75rem', color: 'var(--navy)', fontSize: '1.3rem', lineHeight: 1.3, fontWeight: 700, scrollMarginTop: '5rem' },
  h4: { margin: '1.25rem 0 0.5rem', color: 'var(--navy)', fontSize: '1.1rem', lineHeight: 1.35, fontWeight: 600, scrollMarginTop: '5rem' },
  ul: { margin: '0 0 1rem', paddingLeft: '1.4rem', color: 'rgba(33,33,33,0.8)', lineHeight: 1.75, listStyleType: 'disc' },
  ol: { margin: '0 0 1rem', paddingLeft: '1.4rem', color: 'rgba(33,33,33,0.8)', lineHeight: 1.75, listStyleType: 'decimal' },
  li: { marginBottom: '0.35rem' },
  blockquote: {
    margin: '1.5rem 0',
    padding: '0.75rem 1.25rem',
    borderLeft: '4px solid var(--red, #DB241E)',
    background: 'rgba(219,36,30,0.04)',
    color: 'rgba(33,33,33,0.85)',
    fontStyle: 'italic',
    lineHeight: 1.75,
    borderRadius: '0 6px 6px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '1.5rem 0',
    fontSize: '0.95rem',
    border: '1px solid rgba(0,39,76,0.12)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  thead: { background: 'rgba(0,39,76,0.06)' },
  tbody: {},
  tfoot: { background: 'rgba(0,39,76,0.03)', fontWeight: 600 },
  tr: { borderBottom: '1px solid rgba(0,39,76,0.1)' },
  th: {
    padding: '0.85rem 1rem',
    textAlign: 'left',
    fontWeight: 700,
    color: 'var(--navy)',
    borderBottom: '2px solid rgba(0,39,76,0.2)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.85rem 1rem',
    textAlign: 'left',
    color: 'rgba(33,33,33,0.85)',
    lineHeight: 1.6,
    verticalAlign: 'top',
  },
  caption: {
    padding: '0.5rem',
    fontStyle: 'italic',
    fontSize: '0.85rem',
    color: 'rgba(33,33,33,0.6)',
    textAlign: 'left',
  },
  strong: { color: 'inherit', fontWeight: 700 },
  em: { color: 'inherit', fontStyle: 'italic' },
  hr: { margin: '2rem 0', border: 0, borderTop: '1px solid rgba(0,0,0,0.12)' },
  code: {
    fontFamily: 'monospace',
    background: 'rgba(0,39,76,0.06)',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.88em',
  },
  pre: {
    fontFamily: 'monospace',
    background: '#0a192f',
    color: '#e6f1ff',
    padding: '1rem',
    borderRadius: '8px',
    overflowX: 'auto',
    margin: '1.5rem 0',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
}

function getNodeText(children) {
  if (!children) return ''
  return children
    .map((c) => (c.t === 'text' ? c.v : getNodeText(c.children)))
    .join('')
    .trim()
}

export function slugifyHeading(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function RichNodes({ nodes, headingCounts = new Map() }) {
  return nodes.map((node, i) => {
    if (node.t === 'text') return node.v
    const children = node.children.length ? <RichNodes nodes={node.children} headingCounts={headingCounts} /> : undefined

    if (node.tag === 'a') {
      if (!node.href) return <span key={i}>{children}</span>
      return (
        <a
          key={i}
          href={node.href}
          {...(node.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          style={{ color: 'var(--red, #DB241E)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          {children}
        </a>
      )
    }

    if (node.tag === 'table') {
      const tableEl = createElement(
        'table',
        {
          key: `table-${i}`,
          style: STYLE.table,
          className: 'cms-table',
        },
        children
      )
      return (
        <div
          key={`table-wrap-${i}`}
          className="table-responsive course-table-wrap"
          style={{
            width: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            margin: '1.5rem 0',
            border: '1px solid rgba(0,39,76,0.08)',
            borderRadius: '6px',
          }}
        >
          {tableEl}
        </div>
      )
    }

    if (node.tag === 'th' || node.tag === 'td') {
      return createElement(
        node.tag,
        {
          key: i,
          style: {
            ...STYLE[node.tag],
            ...(node.align ? { textAlign: node.align } : {}),
          },
          ...(node.colSpan ? { colSpan: node.colSpan } : {}),
          ...(node.rowSpan ? { rowSpan: node.rowSpan } : {}),
          ...(node.scope ? { scope: node.scope } : {}),
        },
        children
      )
    }

    if (node.tag === 'img' && node.src) {
      return (
        <figure key={i} style={{ margin: '1.75rem 0', width: '100%' }}>
          <img
            src={node.src}
            alt={node.alt || ''}
            title={node.title}
            loading="lazy"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', display: 'block', margin: '0 auto' }}
          />
          {node.alt && (
            <figcaption style={{ fontSize: '0.85rem', color: 'rgba(33,33,33,0.6)', marginTop: '0.5rem', textAlign: 'center', fontStyle: 'italic' }}>
              {node.alt}
            </figcaption>
          )}
        </figure>
      )
    }

    // Attach stable heading IDs for TOC anchor jumps
    if (['h2', 'h3', 'h4'].includes(node.tag)) {
      const rawText = getNodeText(node.children)
      let slug = slugifyHeading(rawText) || `heading-${i}`
      const count = headingCounts.get(slug) || 0
      headingCounts.set(slug, count + 1)
      if (count > 0) slug = `${slug}-${count}`

      return createElement(
        node.tag,
        {
          key: i,
          id: slug,
          style: STYLE[node.tag],
        },
        children
      )
    }

    return createElement(node.tag, { key: i, style: STYLE[node.tag] }, children)
  })
}

export default function RichText({ html, fallback = null }) {
  const nodes = parseRichText(html)
  const hasContent = nodes.some((node) => (node.t === 'text' ? node.v.trim().length > 0 : true))
  if (!hasContent) return fallback
  return <div data-testid="rich-text" className="cms-rich-text">{<RichNodes nodes={nodes} headingCounts={new Map()} />}</div>
}
