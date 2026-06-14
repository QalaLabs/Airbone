'use client'

import { useState, useEffect } from 'react'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleShowToast = (e) => {
      const { title, body, duration = 4000 } = e.detail
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((prev) => [...prev, { id, title, body }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    window.addEventListener('show-toast', handleShowToast)
    return () => window.removeEventListener('show-toast', handleShowToast)
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast-notification" role="alert" aria-live="assertive">
          <div className="toast-title">{t.title}</div>
          <div className="toast-body">{t.body}</div>
        </div>
      ))}
    </div>
  )
}

export function triggerToast(title, body, duration = 4500) {
  if (typeof window === 'undefined') return
  const event = new CustomEvent('show-toast', {
    detail: { title, body, duration }
  })
  window.dispatchEvent(event)
}
