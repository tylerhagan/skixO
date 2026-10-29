// ─────────────────────────────────────────────
// skixO — per-release Open Graph cards
// ─────────────────────────────────────────────
// public/og/<slug>.png, 1200×630, one per entry in src/data/releases.js:
// the cover square on the left (630×630), title, credit line and the
// skixO wordmark on the right, on ink.
//
// Text is set by sharp's own Pango renderer (`text` input) with the
// site's fonts loaded straight from scripts/art/fonts/*.ttf, so no
// fontconfig setup is needed. Han characters fall back to whatever CJK
// font the system has (Noto Sans CJK here); a machine without one would
// render tofu, so the script refuses to render a Han title there and
// keeps the committed card instead.
//
// Outputs are committed, like the covers. A card re-renders only when
// its inputs change (tracked in scripts/art/og-rendered.json), so a
// Vercel build normally renders nothing. --force redoes everything.
// ─────────────────────────────────────────────

import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { releases, displayTitle, creditLine } from '../src/data/releases.js';

// The designed artwork when there is one, else the baked cover in colour.
const coverSrc = r => r.artwork || `/covers/${r.youtubeId}.webp`;

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(PUBLIC, 'og');
const FONTS = path.join(ROOT, 'scripts/art/fonts');
const STAMPS = path.join(ROOT, 'scripts/art/og-rendered.json');
const WORDMARK = path.join(PUBLIC, 'wordmark-cut-bone.svg');
const force = process.argv.includes('--force');

// Bump when the layout changes, to re-render every card.
const LAYOUT = 2;

const W = 1200, H = 630, SQ = 630;
const PAD = 56;
const TEXT_X = SQ + PAD;
const TEXT_W = W - TEXT_X - PAD;

// From src/styles/globals.css
const INK = '#0D0F12', BONE = '#EDE6D6', STONE = '#A9A59C', GRAPHITE = '#2A2D31';

const BEBAS = path.join(FONTS, 'bebas-neue.ttf');
const MONO = path.join(FONTS, 'jetbrains-mono-500.ttf');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hasHan = s => /\p{Script=Han}/u.test(s);

let cjkOk;
function systemHasCjk() {
  if (cjkOk !== undefined) return cjkOk;
  try {
    cjkOk = execFileSync('fc-list', [':lang=zh-tw', 'family'], { encoding: 'utf8' }).trim().length > 0;
  } catch {
    cjkOk = false;
  }
  return cjkOk;
}

// One block of text as a transparent PNG buffer (Pango markup).
async function textLayer({ text, font, fontfile, size, color, width, maxHeight, spacing = 0 }) {
  const markup = `<span foreground="${color}" letter_spacing="${Math.round(spacing * 1024)}">${esc(text)}</span>`;
  const render = opts => sharp({ text: { text: markup, fontfile, width, rgba: true, wrap: 'word', ...opts } })
    .png().toBuffer({ resolveWithObject: true });
  // At 72 dpi a point is a pixel. Long titles that would overflow the
  // block are refit into it instead.
  let out = await render({ font: `${font} ${size}`, dpi: 72 });
  if (maxHeight && out.info.height > maxHeight) {
    out = await render({ font, height: maxHeight });
  }
  return out;
}

async function coverSquare(r) {
  const file = path.join(PUBLIC, coverSrc(r));
  if (!existsSync(file)) return null;
  return sharp(file).resize(SQ, SQ, { fit: 'cover', position: 'centre' }).png().toBuffer();
}

async function renderCard(r) {
  const cover = await coverSquare(r);
  if (!cover) return { skipped: `no cover at public${coverSrc(r)}` };

  const title = displayTitle(r);
  const credit = creditLine(r);

  const label = await textLayer({
    text: `FILE // ${r.catalogue}`, font: 'JetBrains Mono', fontfile: MONO,
    size: 18, color: STONE, width: TEXT_W, spacing: 4,
  });
  const titleImg = await textLayer({
    text: title, font: 'Bebas Neue', fontfile: BEBAS,
    size: 112, color: BONE, width: TEXT_W, maxHeight: 250,
  });
  const creditImg = await textLayer({
    text: credit, font: 'JetBrains Mono', fontfile: MONO,
    size: 22, color: STONE, width: TEXT_W, maxHeight: 64, spacing: 1,
  });

  const wmW = 220;
  const wordmark = await sharp(WORDMARK, { density: 300 }).resize({ width: wmW }).png().toBuffer({ resolveWithObject: true });

  // Rules and frame as SVG: a bone rule over the label, a graphite seam
  // between cover and text, scanlines over the cover (as on the site).
  const scan = Array.from({ length: SQ / 4 }, (_, i) => `<rect x="0" y="${i * 4 + 2}" width="${SQ}" height="2"/>`).join('');
  const chrome = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <g fill="#000" fill-opacity="0.07">${scan}</g>
    <rect x="${SQ}" y="0" width="1" height="${H}" fill="${GRAPHITE}"/>
    <rect x="${TEXT_X}" y="${PAD}" width="48" height="2" fill="${BONE}"/>
  </svg>`);

  const titleTop = PAD + 26 + label.info.height + 28;
  const creditTop = titleTop + titleImg.info.height + 18;

  const png = await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
    .composite([
      { input: cover, left: 0, top: 0 },
      { input: chrome, left: 0, top: 0 },
      { input: label.data, left: TEXT_X, top: PAD + 22 },
      { input: titleImg.data, left: TEXT_X, top: titleTop },
      { input: creditImg.data, left: TEXT_X, top: creditTop },
      { input: wordmark.data, left: TEXT_X, top: H - PAD - wordmark.info.height },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
    .toBuffer();

  return { png };
}

async function inputsHash(r) {
  const h = createHash('sha1');
  h.update(JSON.stringify({ LAYOUT, t: displayTitle(r), c: creditLine(r), cat: r.catalogue, src: coverSrc(r) }));
  const cover = path.join(PUBLIC, coverSrc(r));
  if (existsSync(cover)) h.update(await readFile(cover));
  return h.digest('hex').slice(0, 16);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const stamps = existsSync(STAMPS) ? JSON.parse(await readFile(STAMPS, 'utf8')) : {};
  let made = 0, kept = 0;

  for (const r of releases) {
    const out = path.join(OUT, `${r.slug}.png`);
    const hash = await inputsHash(r);
    if (!force && existsSync(out) && stamps[r.slug] === hash) { kept++; continue; }

    if (hasHan(displayTitle(r) + creditLine(r)) && !systemHasCjk()) {
      console.log(`  og: ${r.slug} — no CJK font on this machine, keeping the committed card`);
      continue;
    }

    const res = await renderCard(r);
    if (res.skipped) {
      console.log(`  og: ${r.slug} — skipped (${res.skipped}); run \`npm run covers\` first`);
      continue;
    }
    await writeFile(out, res.png);
    stamps[r.slug] = hash;
    made++;
    console.log(`  og: ${r.slug}.png (${(res.png.length / 1024).toFixed(0)}KB)`);
  }

  await writeFile(STAMPS, JSON.stringify(stamps, null, 2) + '\n');
  console.log(`og cards: ${made} rendered, ${kept} unchanged`);
}

main().catch(err => {
  // Never fail the build over share cards: the committed ones still ship.
  console.warn(`og cards: skipped (${err.message})`);
});
