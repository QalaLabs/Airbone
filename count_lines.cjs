const fs = require('fs');
const s = fs.readFileSync('src/components/GlobalRouteMap.jsx','utf8');
console.log(s.split(/\n/).length);
