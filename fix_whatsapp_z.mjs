import fs from 'fs';
const p = 'src/index.css';
let c = fs.readFileSync(p, 'utf8');
const old = ".whatsapp-float {\n  position: fixed;\n  bottom: 1.25rem;\n  bottom: calc(1.25rem + env(safe-area-inset-bottom));\n  right: 1.25rem;\n  z-index: 40;";
const neu = ".whatsapp-float {\n  position: fixed;\n  bottom: 1.25rem;\n  bottom: calc(1.25rem + env(safe-area-inset-bottom));\n  right: 1.25rem;\n  z-index: 1000;";
if (c.includes(old)) {
  c = c.split(old).join(neu);
  fs.writeFileSync(p, c);
  console.log('ok1');
} else {
  // try different
  const old2 = ".whatsapp-float {\n  position: fixed;\n  bottom: 1.25rem;\n  bottom: calc(1.25rem + env(safe-area-inset-bottom));\n  right: 1.25rem;\n  z-index: 50;";
  if (c.includes(old2)) {
    c = c.split(old2).join(neu);
    fs.writeFileSync(p, c);
    console.log('ok2');
  } else {
    console.log('no');
  }
}
