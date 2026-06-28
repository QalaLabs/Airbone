'use client'

export default function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  required = false,
  dark = false,
  maxLength,
  className = '',
  as: asProp,
  children,
}) {
  const inputClass = [
    dark ? 'modal-input modal-input-dark' : 'modal-input',
    error ? 'input-error' : '',
    className,
  ].filter(Boolean).join(' ')

  const handleChange = (e) => {
    const raw = e.target.value
    if (type === 'tel' || type === 'text') {
      const digitsOnly = raw.replace(/[^0-9]/g, '')
      if (maxLength && digitsOnly.length > maxLength) return
      onChange(digitsOnly)
    } else {
      onChange(raw)
    }
  }

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {asProp === 'select' ? (
        <select
          id={id}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          style={{ background: dark ? '#000810' : undefined, color: dark ? '#fff' : undefined }}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          required={required}
          maxLength={maxLength}
          autoComplete="off"
        />
      )}
      {error && (
        <p style={{
          margin: '0.2rem 0 0 0',
          fontSize: '0.72rem',
          color: '#ff4444',
          fontFamily: 'var(--font-b)',
          lineHeight: 1.3,
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
