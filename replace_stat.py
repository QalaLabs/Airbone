import sys

with open('src/components/AirborneFX.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """/* =====================================================================
 * StatReveal — Count-up animated number + label
 * ===================================================================*/
export function StatReveal({ value, label, prefix = '', suffix = '', decimals = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: 1600, bounce: 0 })
  const finalStatic = prefix + (typeof value === 'number' ? (value >= 1000 ? value.toLocaleString('en-IN') : value.toFixed(decimals)) : value) + suffix
  const [display, setDisplay] = useState(finalStatic)

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, mv, value])

  useEffect(() => {
    return spring.on('change', (v) => {
      const formatted = v >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(decimals)
      setDisplay(prefix + formatted + suffix)
    })
  }, [spring, prefix, suffix, decimals])

  return (
    <div ref={ref} style={style}>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.6rem,3vw,2.25rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
        {display}
      </div>
      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'rgba(0,39,76,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  )
}"""

new = """/* =====================================================================
 * StatReveal — Count-up animated number + label
 * ===================================================================*/
export function StatReveal({ value, label, prefix = '', suffix = '', decimals = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const isNumeric = typeof value === 'number'
  const mv = useMotionValue(isNumeric ? value : 0)
  const spring = useSpring(mv, { duration: 1600, bounce: 0 })
  const finalStatic = prefix + (isNumeric ? (value >= 1000 ? value.toLocaleString('en-IN') : value.toFixed(decimals)) : value) + suffix
  const [display, setDisplay] = useState(finalStatic)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (inView && !hasAnimated && isNumeric) {
      setDisplay(finalStatic)
      if (typeof mv.jump === 'function') {
        mv.jump(value)
      } else {
        mv.set(value)
      }
      setHasAnimated(true)
    }
  }, [inView, mv, value, hasAnimated, isNumeric, finalStatic])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (!hasAnimated) return
      const formatted = v >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(decimals)
      setDisplay(prefix + formatted + suffix)
    })
  }, [spring, prefix, suffix, decimals, hasAnimated])

  return (
    <div ref={ref} style={style}>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(1.6rem,3vw,2.25rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
        {display}
      </div>
      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'rgba(0,39,76,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  )
}"""

if old not in content:
    print('NOT FOUND')
    sys.exit(1)
content = content.replace(old, new)
with open('src/components/AirborneFX.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
