import fs from 'fs';
const s = fs.readFileSync('src/index.css','utf8');
const idx = s.indexOf('sticky-mobile-cta');
if (idx >= 0) {
  console.log(s.slice(Math.max(0,idx-40), idx+400));
}
