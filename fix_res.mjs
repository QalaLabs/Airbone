import fs from 'fs';
const p = 'src/app/resources/ResourcesClient.jsx';
let c = fs.readFileSync(p, 'utf8');
const old = 'Access requires verification profile inputs to block bots and raw scrapers';
if (c.includes(old)) {
  c = c.split(old).join('Enter your name and phone to download free guides');
  fs.writeFileSync(p, c);
  console.log('ok');
} else {
  console.log('no');
}
