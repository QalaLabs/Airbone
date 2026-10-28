const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/pc/Desktop/Airbone/src/app/courses';
const entries = fs.readdirSync(dir,{withFileTypes:true});
let dirs=[];
for (const e of entries){ if(e.isDirectory()){ dirs.push(e.name); } }
dirs.sort();
console.log(dirs.join('\n'));
console.log('COUNT:'+dirs.length);
