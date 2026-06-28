'use client'

export default function SubmitButton({
  children,
  loading = false,
  disabled = false,
  loadingText = 'Sending...',
  className = '',
  style = {},
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={className}
      style={{
        opacity: disabled || loading ? 0.65 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        position: 'relative',
        ...style,
      }}
    >
      {loading ? (
        <>
          <span style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            marginRight: '0.5rem',
            verticalAlign: 'middle',
          }} />
          {loadingText}
        </>
      ) : children}
    </button>
  )
}
