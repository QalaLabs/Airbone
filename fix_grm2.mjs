import fs from 'fs';
const p = 'src/components/GlobalRouteMap.jsx';
let c = fs.readFileSync(p, 'utf8');
const old = "/* Animated counter hook */\nfunction useCounter(rawValue, active) {\n  const str    = String(rawValue)\n  const num    = parseInt(str.replace(/\\D/g, ''))\n  const suffix = str.replace(/\\d/g, '')\n  const [display, setDisplay] = useState(num || 0)\n  useEffect(() => {\n    if (!active || isNaN(num)) return\n    let raf\n    const t0 = performance.now(), dur = 2000\n    const tick = now => {\n      const t = Math.min((now - t0) / dur, 1)\n      setDisplay(Math.round(num * (1 - Math.pow(1 - t, 3))))\n      if (t < 1) raf = requestAnimationFrame(tick)\n    }\n    raf = requestAnimationFrame(tick)\n    return () => cancelAnimationFrame(raf)\n  }, [active, num])\n  return isNaN(num) ? rawValue : `${display}${suffix}`\n}";
if (!c.includes(old)) {
  console.log('no');
  process.exit(1);
}
const neu = "/* Animated counter hook */\nfunction useCounter(rawValue, active) {\n  const str    = String(rawValue)\n  const num    = parseInt(str.replace(/\\D/g, ''))\n  const suffix = str.replace(/\\d/g, '')\n  const [display, setDisplay] = useState(isNaN(num) ? rawValue : (num || 0))\n  const [hasAnimated, setHasAnimated] = useState(false)\n  useEffect(() => {\n    if (!active || isNaN(num) || hasAnimated) return\n    let raf\n    const t0 = performance.now(), dur = 2000\n    const tick = now => {\n      const t = Math.min((now - t0) / dur, 1)\n      setDisplay(Math.round(num * (1 - Math.pow(1 - t, 3))))\n      if (t < 1) {\n        raf = requestAnimationFrame(tick)\n      } else {\n        setHasAnimated(true)\n      }\n    }\n    raf = requestAnimationFrame(tick)\n    return () => cancelAnimationFrame(raf)\n  }, [active, num, hasAnimated])\n  return isNaN(num) ? rawValue : `${display}${suffix}`\n}";
c = c.split(old).join(neu);
fs.writeFileSync(p, c);
console.log('ok');
