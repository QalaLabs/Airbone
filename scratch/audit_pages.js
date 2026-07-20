const fs = require('fs');
const path = require('path');

function inspectPages(dir, baseRoute = '') {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item === 'api') continue;
      inspectPages(fullPath, baseRoute + '/' + item);
    } else if (item.startsWith('page.')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasMetadata = content.includes('generateMetadata') || content.includes('export const metadata');
      const hasSchema = content.includes('application/ld+json') || content.includes('Schema');
      const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
      console.log(JSON.stringify({
        route: baseRoute || '/',
        hasMetadata,
        hasSchema,
        title: titleMatch ? titleMatch[1] : 'N/A',
        fileSize: stat.size
      }));
    }
  }
}

inspectPages('./src/app');
