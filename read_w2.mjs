import fs from 'fs';
const c = fs.readFileSync('src/index.css','utf8');
const i = c.indexOf('.whatsapp-float');
console.log(c.slice(i,i+90));
