const fs = require('fs');
const s = fs.readFileSync('C:/Users/pc/Desktop/Airbone/src/lib/courseVideos.js','utf8');
const keys=[...s.matchAll(/^\s*'([^']+)':\s*\{/gm)].map(m=>m[1]);
console.log(keys.join('\n'));
console.log('COUNT:'+keys.length);
