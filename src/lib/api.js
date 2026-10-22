/**
 * Client API utility for lead submission, downloads, and data fetching
 */

export class ApiClientError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

/**
 * Direct client-side file download trigger
 */
export function triggerClientDownload(fileUrl, fileName = 'download.pdf') {
  if (typeof window === 'undefined') return
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Submit lead to CRM via internal proxy
 */
export async function submitLead(payload) {
  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  // 409 = lead already exists in CRM, treated as success
  if (!res.ok && res.status !== 409) {
    const data = await res.json().catch(() => ({}))
    throw new ApiClientError(data.error || 'Lead submit failed', undefined, res.status)
  }

  return res.json().catch(() => ({ ok: true }))
}

/**
 * Standard fetch helper
 */
export async function apiFetch(path, init) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiClientError(err?.error?.message || err?.error || `HTTP ${res.status}`, err?.error?.code, res.status)
  }

  return res.json().catch(() => ({}))
}
