// Frontline Pest Control demo site — build.js
// Assembles source HTML pages + _partials into dist/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const header = fs.readFileSync(path.join(ROOT, '_partials', 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(ROOT, '_partials', 'footer.html'), 'utf8');

// Wipe dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Copy static asset dirs
copyDir(path.join(ROOT, 'css'), path.join(DIST, 'css'));
copyDir(path.join(ROOT, 'js'), path.join(DIST, 'js'));
copyDir(path.join(ROOT, 'images'), path.join(DIST, 'images'));

// Copy root-level static files (robots.txt, _redirects, favicon, etc.)
const rootStaticFiles = ['robots.txt', '_redirects', 'favicon.ico'];
for (const f of rootStaticFiles) {
  const srcFile = path.join(ROOT, f);
  if (fs.existsSync(srcFile)) fs.copyFileSync(srcFile, path.join(DIST, f));
}

// Find all source .html files (exclude _partials and dist)
function findPages(dir, base = '') {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_partials' || entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findPages(full, rel));
    } else if (entry.name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

const pages = findPages(ROOT);
let builtCount = 0;

for (const rel of pages) {
  const srcPath = path.join(ROOT, rel);
  let html = fs.readFileSync(srcPath, 'utf8');

  html = html.replace('<!-- HEADER -->', header);
  html = html.replace('<!-- FOOTER -->', footer);

  // Determine output path: foo.html -> foo/index.html (except index.html, 404.html stay as-is)
  let outRel;
  const baseName = path.basename(rel, '.html');
  const dirName = path.dirname(rel);

  if (baseName === 'index' || baseName === '404') {
    outRel = rel;
  } else {
    outRel = path.join(dirName === '.' ? '' : dirName, baseName, 'index.html');
  }

  const outPath = path.join(DIST, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  builtCount++;
}

console.log(`Built ${builtCount} pages into dist/`);
