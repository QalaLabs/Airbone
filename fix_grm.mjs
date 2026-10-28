import fs from 'fs';
const path = 'src/components/GlobalRouteMap.jsx';
let content = fs.readFileSync(path, 'utf8');
const old = `/* Animated counter hook */
function useCounter(rawValue, active) {
  const str    = String(rawValue)
  const num    = parseInt(str.replace(/\\D/g, ''))
  const suffix = str.replace(/\\d/g, '')
  const [display, setDisplay] = useState(num || 0)
  useEffect(() => {
    if (!active || isNaN(num)) return
    let raf
    const t0 = performance.now(), dur = 2000
    const tick = now => {
      const t = Math.min((now - t0) / dur, 1)
      setDisplay(Math.round(num * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, num])
  return isNaN(num) ? rawValue : \`\${display}\${suffix}\`
}`;
const neu = `/* Animated counter hook */
function useCounter(rawValue, active) {
  const str    = String(rawValue)
  const num    = parseInt(str.replace(/\\D/g, ''))
  const suffix = str.replace(/\\d/g, '')
  const [display, setDisplay] = useState(isNaN(num) ? rawValue : (num || 0))
  const [hasAnimated, setHasAnimated] = useState(false)
  useEffect(() => {
    if (!active || isNaN(num) || hasAnimated) return
    let raf
    const t0 = performance.now(), dur = 2000
    const tick = now => {
      const t = Math.min((now - t0) / dur, 1)
      setDisplay(Math.round(num * (1 - Math.pow(1 - t, 3))))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setHasAnimated(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, num, hasAnimated])
  return isNaN(num) ? rawValue : \`\${display}\${suffix}\`
}`;
if (!content.includes(old)) {
  console.log('not found');
  process.exit(1);
}
content = content.split(old).join(neu);
fs.writeFileSync(path, content);
console.log('done');
