const {execSync}=require('child_process');
const out=execSync('node C:/Users/pc/Desktop/Airbone/check-slugs.cjs').toString();
const lines=out.split(/\r?\n/).filter(l=>l.trim() && !l.includes('COUNT'));
console.log(lines.length);
console.log(lines.join('\n'));
