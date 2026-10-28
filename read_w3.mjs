import fs from 'fs';
const c = fs.readFileSync('src/index.css','utf8');
const i = c.indexOf('z-index');
const i2 = c.indexOf('.whatsapp-float');
if (i2 >= 0) {
  const j = c.indexOf('z-index', i2);
  if (j >= 0 && j < i2 + 200) {
    console.log(c.slice(j, j+20));
  }
}
