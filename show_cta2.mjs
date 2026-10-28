import fs from 'fs';
const s = fs.readFileSync('src/index.css','utf8');
const idx = s.indexOf('#32');
if (idx >= 0) {
  console.log(s.slice(idx, idx+80));
}
