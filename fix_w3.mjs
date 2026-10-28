import fs from 'fs';
const p = 'src/index.css';
let c = fs.readFileSync(p, 'utf8');
const old = ".whatsapp-float {\n  position: fixed;\n  bottom: 1.25rem;\n  bottom: calc(1.25rem + env(safe-area-inset-bottom));\n  right: 1.25rem;\n  z-index: 40;";
if (c.includes(old)) {
  c = c.replace(old, ".whatsapp-float {\n  position: fixed;\n  bottom: 1.25rem;\n  bottom: calc(1.25rem + env(safe-area-inset-bottom));\n  right: 1.25rem;\n  z-index: 1000;");
  fs.writeFileSync(p, c);
  console.log('ok');
} else {
  console.log('no');
}
