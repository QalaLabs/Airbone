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
  h2: { margin: '2rem 0 1rem', color: 'var(--navy)', fontSize: '1.6rem', lineHeight: 1.25 },
  h3: { margin: '1.5rem 0 0.75rem', color: 'var(--navy)', fontSize: '1.3rem', lineHeight: 1.3 },
  h4: { margin: '1.25rem 0 0.5rem', color: 'var(--navy)', fontSize: '1.1rem', lineHeight: 1.35 },
  ul: { margin: '0 0 1rem', paddingLeft: '1.4rem', color: 'rgba(33,33,33,0.8)', lineHeight: 1.75 },
  ol: { margin: '0 0 1rem', paddingLeft: '1.4rem', color: 'rgba(33,33,33,0.8)', lineHeight: 1.75 },
  li: { marginBottom: '0.35rem' },
  blockquote: {
    margin: '0 0 1rem',
    paddingLeft: '1rem',
    borderLeft: '3px solid var(--red, #DB241E)',
    color: 'rgba(33,33,33,0.72)',
    lineHeight: 1.75,
  },
  strong: { color: 'inherit' },
  em: { color: 'inherit' },
  hr: { margin: '2rem 0', border: 0, borderTop: '1px solid rgba(0,0,0,0.12)' },
}

function RichNodes({ nodes }) {
  return nodes.map((node, i) => {
    if (node.t === 'text') return node.v
    const children = node.children.length ? <RichNodes nodes={node.children} /> : undefined
    if (node.tag === 'a') {
      if (!node.href) return <span key={i}>{children}</span>
      return (
        <a
          key={i}
          href={node.href}
          {...(node.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          style={{ color: 'var(--red, #DB241E)' }}
        >
          {children}
        </a>
      )
    }
    return createElement(node.tag, { key: i, style: STYLE[node.tag] }, children)
  })
}

export default function RichText({ html, fallback = null }) {
  const nodes = parseRichText(html)
  const hasContent = nodes.some((node) => (node.t === 'text' ? node.v.trim().length > 0 : true))
  if (!hasContent) return fallback
  return <div data-testid="rich-text">{<RichNodes nodes={nodes} />}</div>
}
