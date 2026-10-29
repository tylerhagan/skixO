// ─────────────────────────────────────────────
// skixO — per-release share meta (postbuild)
// ─────────────────────────────────────────────
// The site is an SPA, so a crawler fetching /release/nocturne gets the
// homepage's <head> and every shared link previews as the homepage.
//
// After `vite build`, this writes dist/release/<slug>/index.html for each
// entry in src/data/releases.js: the built dist/index.html with title,
// description, canonical, og:* and twitter:* swapped for that release.
// The body is untouched, so the SPA boots exactly as before.
//
// Vercel serves files before applying rewrites, so /release/<slug>
// resolves to this file and the catch-all rewrite in vercel.json only
// catches what has no file. No config change needed.
// ─────────────────────────────────────────────

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  releases, displayTitle, releaseUrl, releaseDescription, SITE_URL,
} from '../src/data/releases.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SHELL = path.join(DIST, 'index.html');

const attr = s => String(s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Replace the content of one tag, failing loudly if index.html drifts
// and the tag is no longer there (a silent miss would ship homepage meta).
function swap(html, re, replacement, name) {
  if (!re.test(html)) throw new Error(`index.html: ${name} not found`);
  return html.replace(re, () => replacement);
}

const metaRe = (key, value) =>
  new RegExp(`<meta\\s+${key}="${value}"\\s+content="[^"]*"\\s*/?>`);

function pageFor(shell, r) {
  const title = `${displayTitle(r)} — skixO`;
  const desc = releaseDescription(r);
  const url = releaseUrl(r);
  const image = existsSync(path.join(ROOT, 'public/og', `${r.slug}.png`))
    ? `${SITE_URL}/og/${r.slug}.png`
    : `${SITE_URL}/og.png`;

  let html = shell;
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`, '<title>');
  html = swap(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical');

  const metas = [
    ['name', 'description', desc],
    ['property', 'og:type', 'music.song'],
    ['property', 'og:url', url],
    ['property', 'og:title', title],
    ['property', 'og:description', desc],
    ['property', 'og:image', image],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', desc],
    ['name', 'twitter:image', image],
  ];
  for (const [key, value, content] of metas) {
    html = swap(html, metaRe(key, value), `<meta ${key}="${value}" content="${attr(content)}" />`, `${key}=${value}`);
  }
  return html;
}

async function main() {
  if (!existsSync(SHELL)) {
    console.log('release meta: no dist/index.html — run `vite build` first');
    return;
  }
  const shell = await readFile(SHELL, 'utf8');
  for (const r of releases) {
    const dir = path.join(DIST, 'release', r.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), pageFor(shell, r));
  }
  console.log(`release meta: ${releases.length} pages prerendered`);
}

main().catch(err => {
  console.error(`release meta: ${err.message}`);
  process.exit(1);
});
