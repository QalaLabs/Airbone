import fs from 'fs';
const p = 'src/index.css';
let c = fs.readFileSync(p, 'utf8');
const re = /\.whatsapp-float[^\{]*\{[^\}]*z-index:[^;]+;/s;
const m = c.match(re);
if (m) {
  const old = m[0];
  const neu = old.replace(/z-index:\s*\d+;/, 'z-index: 1000;');
  c = c.split(old).join(neu);
  fs.writeFileSync(p, c);
  console.log('ok');
} else {
  console.log('no');
}
