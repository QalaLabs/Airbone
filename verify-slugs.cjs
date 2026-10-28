const {execSync}=require('child_process');
const s=execSync('node C:/Users/pc/Desktop/Airbone/check-slugs.cjs',{encoding:'utf8'});
const m=s.match(/^[a-z][a-z0-9-]+$/gm);
console.log('COUNT:'+ (m?m.length:0));
if(m){ m.forEach(x=>console.log(x)); }
