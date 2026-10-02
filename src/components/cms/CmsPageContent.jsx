import { createElement } from 'react'
import { parseRichText, safeHref, safeMediaSrc, videoEmbedUrl } from '@/lib/cms/safeContent'

const ALIGN = { left: 'left', center: 'center', right: 'right' }
const BODY = { margin: 0, color: 'rgba(33,33,33,0.8)', lineHeight: 1.75 }

function RichNodes({ nodes }) {
  return nodes.map((node, i) => {
    if (node.t === 'text') return node.v
    const children = node.children.length ? <RichNodes nodes={node.children} /> : undefined
    if (node.tag === 'a') {
      if (!node.href) return <span key={i}>{children}</span>
      return (
        <a key={i} href={node.href} {...(node.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={{ color: 'var(--red, #DB241E)' }}>
          {children}
        </a>
      )
    }
    return createElement(node.tag, { key: i }, children)
  })
}

function Block({ block }) {
  const props = block.props && typeof block.props === 'object' ? block.props : {}
  const align = ALIGN[String(props.align ?? 'left')] ?? 'left'

  switch (block.blockType?.type) {
    case 'heading': {
      const level = Math.min(Math.max(Number(props.level ?? 2), 2), 4)
      return createElement(`h${level}`, { style: { textAlign: align, color: 'var(--navy)', margin: 0 } }, String(props.content ?? ''))
    }
    case 'text':
      return <p style={{ ...BODY, textAlign: align, whiteSpace: 'pre-line' }}>{String(props.content ?? '')}</p>
    case 'rich_text':
      return (
        <div className="cms-rich-text" style={BODY}>
          <RichNodes nodes={parseRichText(props.content)} />
        </div>
      )
    case 'image': {
      const src = safeMediaSrc(props.src)
      if (!src) return null
      return (
        <figure style={{ margin: 0 }}>
          <img src={src} alt={String(props.alt ?? '')} loading="lazy" style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: props.objectFit === 'contain' ? 'contain' : 'cover' }} />
          {props.caption ? <figcaption style={{ marginTop: 8, fontSize: '0.85rem', color: 'rgba(33,33,33,0.6)' }}>{String(props.caption)}</figcaption> : null}
        </figure>
      )
    }
    case 'video': {
      const embed = videoEmbedUrl(props.src)
      const file = embed ? null : safeMediaSrc(props.src)
      if (!embed && !file) return null
      const [w, h] = String(props.aspectRatio ?? '16/9').split('/').map(Number)
      const pad = w > 0 && h > 0 ? `${(h / w) * 100}%` : '56.25%'
      return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: pad, overflow: 'hidden', borderRadius: 8, background: '#000' }}>
          {embed ? (
            <iframe
              src={embed}
              title={String(props.title ?? 'Embedded video')}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <video src={file} controls style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          )}
        </div>
      )
    }
    case 'button': {
      const href = safeHref(props.href)
      const label = String(props.label ?? '')
      if (!href || !label) return null
      const newTab = props.target === '_blank'
      return (
        <p style={{ margin: 0 }}>
          <a href={href} className="btn btn-primary" {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {label}
          </a>
        </p>
      )
    }
    case 'spacer': {
      const height = Number(props.height ?? 48)
      return <div aria-hidden="true" style={{ height: Number.isFinite(height) ? Math.min(Math.max(height, 0), 400) : 48 }} />
    }
    default:
      return null
  }
}

/** Public rendering of a published CMS page (sections and blocks arrive pre-filtered and ordered). */
export default function CmsPageContent({ page }) {
  const sections = Array.isArray(page.sections) ? page.sections : []
  return (
    <div style={{ display: 'grid', gap: '2.5rem', marginTop: '2rem' }}>
      {sections.map((section) => (
        <section key={section.id} style={{ display: 'grid', gap: '1rem' }} data-testid="cms-section">
          {section.name ? <h2 style={{ margin: 0, color: 'var(--navy)' }}>{section.name}</h2> : null}
          {(section.blocks ?? []).map((block) => (
            <Block key={block.id} block={block} />
          ))}
        </section>
      ))}
    </div>
  )
}
