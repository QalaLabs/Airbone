import fs from 'fs';
const s = fs.readFileSync('C:/Users/pc/Desktop/Airbone/leadlist.txt','utf8');
s.split(/\n/).slice(0,80).forEach((x,i)=>{if(x) console.log((i+1)+':'+x);});
