// Frontline Pest Control demo site — gen-sitemap.js
// Generates sitemap.xml from the built dist/ directory.
// NOTE: Site is noindex/private (demo for prospect). Empty sitemap per SOP standard
// for all-noindex sites so the robots.txt reference doesn't 404.
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const today = new Date().toISOString().slice(0, 10);

function findIndexPages(dir, base = '') {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findIndexPages(full, rel));
    } else if (entry.name === 'index.html' || (entry.name.endsWith('.html') && entry.name !== '404.html')) {
      results.push(rel);
    }
  }
  return results;
}

const DOMAIN = 'https://frontline-pest.pages.dev';
const pages = fs.existsSync(DIST) ? findIndexPages(DIST) : [];

// All pages are currently noindex (private demo site) — emit empty urlset per SOP standard.
const urlset = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), urlset, 'utf8');
console.log(`Generated empty sitemap.xml (site is noindex/private). Found ${pages.length} pages in dist/ for reference.`);
