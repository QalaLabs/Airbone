import fs from 'fs';
import path from 'path';
function walk(dir) {
  const res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (p.includes('node_modules')) continue;
      res.push(...walk(p));
    } else {
      if (/(Enquir|Lead|Form|enquir|lead)/.test(f)) res.push(p);
    }
  }
  return res;
}
const files = walk('src');
files.slice(0,80).forEach(x=>console.log(x));
console.log('COUNT:'+files.length);
