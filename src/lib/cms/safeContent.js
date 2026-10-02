// Safe rendering helpers for admin-authored CMS content.
//
// Rich text is never injected as HTML. It is parsed into a small tree of
// allow-listed elements (rendered by React, which escapes all text), unknown
// tags are unwrapped, dangerous containers are dropped with their content, and
// the only attribute that survives is a scheme-checked link href.

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** Link target allowed on the public site, or null. Relative paths and #anchors are allowed; protocol-relative is not. */
export function safeHref(value) {
  if (typeof value !== 'string') return null
  // Browsers drop tab/newline anywhere and trim C0/space at the ends ("java\nscript:").
  // eslint-disable-next-line no-control-regex
  const url = value.replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '')
  // eslint-disable-next-line no-control-regex
  if (!url || /[\u0000-\u001f\u007f]/.test(url)) return null
  if (url.startsWith('#')) return url
  if (url.startsWith('/')) return url.startsWith('//') || url.startsWith('/\\') ? null : url
  try {
    const parsed = new URL(url)
    return SAFE_SCHEMES.has(parsed.protocol) ? url : null
  } catch {
    return null
  }
}

/** Image / video source: https, http or a site-relative path. */
export function safeMediaSrc(value) {
  const href = safeHref(value)
  if (!href || href.startsWith('#') || /^(mailto|tel):/i.test(href)) return null
  return href
}

export function isExternalHref(href) {
  return /^https?:\/\//i.test(href ?? '')
}

/** YouTube / Vimeo watch URL -> embed URL on the provider's own host, else null. */
export function videoEmbedUrl(src) {
  try {
    const url = new URL(String(src ?? '').trim())
    if (url.protocol !== 'https:') return null
    const host = url.hostname.replace(/^www\./, '')
    let id = null
    if ((host === 'youtube.com' || host === 'm.youtube.com') && url.pathname === '/watch') id = url.searchParams.get('v')
    else if (host === 'youtu.be') id = url.pathname.slice(1)
    if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`
    if (host === 'vimeo.com') {
      const v = url.pathname.slice(1).split('/')[0]
      if (/^\d{3,15}$/.test(v)) return `https://player.vimeo.com/video/${v}`
    }
  } catch {
    // not a URL
  }
  return null
}

// ─── Rich text ───────────────────────────────────────────────────────────────

const ALLOWED = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'a', 'hr', 'span', 'div'])
const RENAME = { h1: 'h2', h5: 'h4', h6: 'h4' }
const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'col', 'embed', 'param', 'track'])
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math', 'textarea', 'title', 'select', 'frameset', 'frame', 'applet', 'head'])
const MAX_DEPTH = 32
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' }

export function decodeEntities(text) {
  return String(text).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (m, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      if (!Number.isFinite(cp) || cp <= 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return '\ufffd'
      return String.fromCodePoint(cp)
    }
    const named = NAMED[body.toLowerCase()]
    return named ?? m
  })
}

function readAttrs(raw) {
  const attrs = {}
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let m
  while ((m = re.exec(raw))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
  return attrs
}

/**
 * Parse admin HTML into `{ t: 'el', tag, children, href?, newTab? } | { t: 'text', v }`
 * nodes. Pure; safe on arbitrary input.
 */
export function parseRichText(html) {
  const root = { t: 'el', tag: 'root', children: [] }
  const stack = [root]
  const tokens = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|</g
  const src = String(html ?? '')
  let dropping = null
  let dropDepth = 0
  let m
  while ((m = tokens.exec(src))) {
    const [whole, closing, rawName, rawAttrs, text] = m
    const top = stack[stack.length - 1]
    if (whole.startsWith('<!--')) continue
    if (dropping) {
      if (rawName && rawName.toLowerCase() === dropping) dropDepth += closing ? -1 : whole.endsWith('/>') ? 0 : 1
      if (dropDepth === 0) dropping = null
      continue
    }
    if (text !== undefined || !rawName) {
      top.children.push({ t: 'text', v: decodeEntities(text ?? whole) })
      continue
    }
    const name = rawName.toLowerCase()
    if (DROP_WITH_CONTENT.has(name)) {
      if (!closing && !whole.endsWith('/>') && !VOID.has(name)) {
        dropping = name
        dropDepth = 1
      }
      continue
    }
    const tag = RENAME[name] ?? name
    if (closing) {
      const idx = stack.map((n) => n.tag).lastIndexOf(tag)
      if (idx > 0) stack.length = idx
      continue
    }
    if (!ALLOWED.has(tag)) continue // unwrap: children attach to the current parent
    const node = { t: 'el', tag, children: [] }
    if (tag === 'a') {
      const attrs = readAttrs(rawAttrs ?? '')
      const href = safeHref(attrs.href)
      if (href) node.href = href
      if (href && attrs.target === '_blank') node.newTab = true
    }
    top.children.push(node)
    if (!VOID.has(tag) && !whole.endsWith('/>') && stack.length < MAX_DEPTH) stack.push(node)
  }
  return root.children
}

/** Header nav items from the CMS menu, made safe: visible only, safe URL, one submenu level. */
export function normalizeNavItems(items) {
  if (!Array.isArray(items)) return []
  const toLink = (item, depth) => {
    if (!item || typeof item !== 'object' || item.isVisible === false) return null
    const label = typeof item.label === 'string' ? item.label.trim() : ''
    const href = safeHref(item.url)
    if (!label || !href) return null
    const children = depth === 0 && Array.isArray(item.children) ? item.children.map((c) => toLink(c, 1)).filter(Boolean) : []
    return { id: String(item.id ?? `${label}|${href}`), name: label, path: href, newTab: item.target === '_blank', children }
  }
  return items.map((i) => toLink(i, 0)).filter(Boolean)
}
