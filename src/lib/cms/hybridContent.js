import fs from 'fs'
import path from 'path'

/**
 * Clean and robust indentation-aware YAML parser for frontmatter.
 */
export function parseFrontmatter(raw) {
  if (typeof raw !== 'string') return { data: {}, body: '' }
  const trimmed = raw.trimStart()
  if (!trimmed.startsWith('---')) return { data: {}, body: raw }

  const endIdx = trimmed.indexOf('\n---', 3)
  if (endIdx === -1) return { data: {}, body: raw }

  const yamlStr = trimmed.slice(3, endIdx).trim()
  const body = trimmed.slice(endIdx + 4).trim()

  const data = {}
  const lines = yamlStr.split(/\r?\n/)

  const stack = [{ indent: -1, container: data }]

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue

    const indent = rawLine.search(/\S/)
    const text = rawLine.trim()

    // Pop from stack if current line has less or equal indent than top container
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const current = stack[stack.length - 1].container

    if (text.startsWith('- ')) {
      // It's a list item
      const itemContent = text.slice(2).trim()
      if (!Array.isArray(current)) continue

      if (itemContent.includes(':')) {
        const colon = itemContent.indexOf(':')
        const k = itemContent.slice(0, colon).trim()
        const v = cleanVal(itemContent.slice(colon + 1).trim())
        const newObj = { [k]: v }
        current.push(newObj)
        stack.push({ indent, container: newObj })
      } else {
        current.push(cleanVal(itemContent))
      }
    } else if (text.includes(':')) {
      const colon = text.indexOf(':')
      const k = text.slice(0, colon).trim()
      const valStr = text.slice(colon + 1).trim()

      if (valStr.length > 0) {
        if (Array.isArray(current)) {
          // If current container is an array, we shouldn't directly set k unless in an object
        } else {
          current[k] = cleanVal(valStr)
        }
      } else {
        // Empty value means nested list or object coming next
        // Peek at next non-empty line to see if it starts with '- '
        let isNextList = false
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim()
          if (!nextTrimmed || nextTrimmed.startsWith('#')) continue
          isNextList = nextTrimmed.startsWith('- ')
          break
        }

        const newContainer = isNextList ? [] : {}
        if (!Array.isArray(current)) {
          current[k] = newContainer
        }
        stack.push({ indent, container: newContainer })
      }
    }
  }

  return { data, body }
}

function cleanVal(str) {
  if (typeof str !== 'string') return str
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1)
  }
  return str
}

/**
 * Loads a page by checking Git (Pages CMS content/pages/) first,
 * then falling back to the operational database / Payload API.
 */
export async function loadHybridPage(slug, { dbFetcher = null } = {}) {
  if (!slug || typeof slug !== 'string') return null
  const cleanSlug = slug.toLowerCase().trim()

  // 1. Check Git-based Pages CMS repository files (Zero DB latency)
  try {
    const contentDir = path.join(process.cwd(), 'content', 'pages')
    const mdPath = path.join(contentDir, `${cleanSlug}.md`)

    if (fs.existsSync(mdPath)) {
      const raw = fs.readFileSync(mdPath, 'utf8')
      const { data, body } = parseFrontmatter(raw)

      return {
        source: 'git',
        title: data.title || cleanSlug,
        slug: data.slug || cleanSlug,
        description: data.description || '',
        ogImage: data.ogImage || null,
        sections: Array.isArray(data.sections) ? data.sections : [],
        body,
      }
    }
  } catch {
    // If running in environment without filesystem access, proceed to database
  }

  // 2. Fall back to Operational Database / Payload CMS API
  if (typeof dbFetcher === 'function') {
    try {
      const dbResult = await dbFetcher(cleanSlug)
      if (dbResult) return { source: 'database', ...dbResult }
    } catch {
      // Upstream DB error
    }
  } else {
    try {
      const { fetchPublicWithStatus } = await import('../adminApi.js').catch(() => ({}))
      if (fetchPublicWithStatus) {
        const { data, status } = await fetchPublicWithStatus('/pages', { slug: cleanSlug })
        if (status === 200 && data && typeof data === 'object' && !Array.isArray(data)) {
          return { source: 'database', ...data }
        }
      }
    } catch {
      // Upstream unavailable
    }
  }

  return null
}

/**
 * Blends static Pages CMS sections with live operational Payload / Database data
 * (e.g. injects canonical tuition fees and active batch information).
 */
export function blendPageWithOperationalData(page, { feeResolver = null } = {}) {
  if (!page || typeof page !== 'object') return page

  // If sections exist (from Pages CMS), hydrate any dynamic course references
  if (Array.isArray(page.sections)) {
    const hydratedSections = page.sections.map((section) => {
      const s = { ...section }
      // Blend course fees if referenced
      if (s.courseSlug && typeof feeResolver === 'function') {
        const resolved = feeResolver(s.courseSlug)
        if (resolved) {
          s.canonicalFee = resolved.displayFee
          s.priceNumeric = resolved.numericFee
        }
      }
      return s
    })
    return { ...page, sections: hydratedSections }
  }

  return page
}
