import test from 'node:test'
import assert from 'node:assert/strict'
import { safeHref, safeMediaSrc, videoEmbedUrl, parseRichText, decodeEntities, normalizeNavItems } from './safeContent.js'

const text = (nodes) => nodes.map((n) => (n.t === 'text' ? n.v : text(n.children))).join('')
const tags = (nodes) => nodes.flatMap((n) => (n.t === 'el' ? [n.tag, ...tags(n.children)] : []))

test('safeHref allows site paths, anchors, http(s), mailto, tel and rejects script-capable schemes', () => {
  for (const ok of ['/courses', '/courses?x=1#a', '#top', 'https://example.com/a', 'http://example.com', 'mailto:a@b.co', 'tel:+911234']) {
    assert.equal(safeHref(ok), ok, ok)
  }
  for (const bad of [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example/x',
    '/\\evil.example',
    'courses',
    '',
    null,
    42,
    'https://ok.example/a\u0000b',
  ]) {
    assert.equal(safeHref(bad), null, JSON.stringify(bad))
  }
})

test('safeMediaSrc only allows http(s) and site paths', () => {
  assert.equal(safeMediaSrc('https://cdn.example/a.webp'), 'https://cdn.example/a.webp')
  assert.equal(safeMediaSrc('/img/a.webp'), '/img/a.webp')
  assert.equal(safeMediaSrc('javascript:alert(1)'), null)
  assert.equal(safeMediaSrc('mailto:a@b.co'), null)
  assert.equal(safeMediaSrc('#x'), null)
})

test('videoEmbedUrl only produces provider embed URLs', () => {
  assert.equal(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  assert.equal(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  assert.equal(videoEmbedUrl('https://vimeo.com/123456'), 'https://player.vimeo.com/video/123456')
  assert.equal(videoEmbedUrl('https://evil-youtube.com/watch?v=dQw4w9WgXcQ'), null)
  assert.equal(videoEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), null)
  assert.equal(videoEmbedUrl('https://www.youtube.com/watch?v="><script>'), null)
  assert.equal(videoEmbedUrl('javascript:alert(1)'), null)
})

test('parseRichText keeps allowed formatting and safe links', () => {
  const nodes = parseRichText('<h2>Title</h2><p>Hello <strong>bold</strong> <a href="/courses" target="_blank">link</a></p><ul><li>One</li></ul>')
  assert.deepEqual(tags(nodes), ['h2', 'p', 'strong', 'a', 'ul', 'li'])
  const link = nodes[1].children.find((n) => n.tag === 'a')
  assert.deepEqual([link.href, link.newTab], ['/courses', true])
  assert.equal(text(nodes), 'TitleHello bold linkOne')
})

test('parseRichText drops scripts, iframes, styles and event handlers with their content', () => {
  const nodes = parseRichText(
    '<p onclick="alert(1)" style="x">ok</p><script>alert(1)</script><iframe src="https://evil"></iframe>' +
      '<style>body{}</style><img src=x onerror=alert(1)><svg><script>alert(2)</script></svg><object data="x">o</object>',
  )
  assert.deepEqual(tags(nodes), ['p'])
  assert.equal(text(nodes), 'ok')
  assert.deepEqual(Object.keys(nodes[0]).sort(), ['children', 't', 'tag'])
})

test('parseRichText neutralises javascript: links, including entity-encoded ones', () => {
  for (const html of [
    '<a href="javascript:alert(1)">x</a>',
    '<a href="&#106;avascript:alert(1)">x</a>',
    '<a href="&#x6A;avascript&colon;alert(1)">x</a>',
    "<a href='java\nscript:alert(1)'>x</a>",
    '<a href=javascript:alert(1)>x</a>',
  ]) {
    const [a] = parseRichText(html)
    assert.equal(a.tag, 'a')
    assert.equal(a.href, undefined, html)
  }
})

test('parseRichText treats broken markup as text and never throws', () => {
  assert.equal(text(parseRichText('a < b and <a href="x>broken')), 'a < b and <a href="x>broken')
  assert.equal(text(parseRichText('<!-- hidden <script>alert(1)</script> -->shown')), 'shown')
  assert.equal(text(parseRichText('<!-- unterminated <script>alert(1)</script>')), '')
  assert.equal(text(parseRichText('<custom-tag>kept text</custom-tag>')), 'kept text')
  assert.deepEqual(parseRichText(null), [])
  const deep = '<div>'.repeat(500) + 'deep' + '</div>'.repeat(500)
  assert.equal(text(parseRichText(deep)), 'deep')
})

test('decodeEntities handles named, numeric and invalid code points', () => {
  assert.equal(decodeEntities('&lt;b&gt; &amp; &quot;q&quot; &#39;s&#39; &#x41;'), '<b> & "q" \'s\' A')
  assert.equal(decodeEntities('&#0;&#xD800;&#99999999;'), '\ufffd\ufffd\ufffd')
  assert.equal(decodeEntities('&unknown;'), '&unknown;')
})

test('normalizeNavItems keeps visible safe items, targets and one submenu level', () => {
  const items = normalizeNavItems([
    { id: '1', label: 'Courses', url: '/courses', target: '_self', isVisible: true, children: [
      { id: '1a', label: 'CPL', url: '/courses/cpl', target: '_blank', children: [{ id: 'x', label: 'Too deep', url: '/x' }] },
      { id: '1b', label: 'Hidden', url: '/h', isVisible: false },
      { id: '1c', label: 'Bad', url: 'javascript:alert(1)' },
    ] },
    { id: '2', label: 'Partner', url: 'https://partner.example', target: '_blank' },
    { id: '3', label: 'Evil', url: 'javascript:alert(1)' },
    { id: '4', label: '', url: '/empty' },
    { id: '5', label: 'Off', url: '/off', isVisible: false },
  ])
  assert.deepEqual(items, [
    { id: '1', name: 'Courses', path: '/courses', newTab: false, children: [{ id: '1a', name: 'CPL', path: '/courses/cpl', newTab: true, children: [] }] },
    { id: '2', name: 'Partner', path: 'https://partner.example', newTab: true, children: [] },
  ])
  assert.deepEqual(normalizeNavItems(null), [])
})
