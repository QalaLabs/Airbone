const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/pc/Desktop/Airbone/src/app/courses';
const subdirs = fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir,d)).isDirectory() && d !== '[slug]');
let yes=0, no=0;
for (const s of subdirs){
  const p = path.join(dir,s,'page.jsx');
  if(!fs.existsSync(p)){ console.log(s+': NOPAGE'); continue; }
  const c = fs.readFileSync(p,'utf8');
  if(c.includes('CourseVideoTabs')){ yes++; console.log(s+': YES'); } else { no++; console.log(s+': NO'); }
}
console.log('TOTAL_DIRS=' + subdirs.length + ' YES=' + yes + ' NO=' + no);
