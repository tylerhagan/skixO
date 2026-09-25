// ─────────────────────────────────────────────
// skixO — image pipeline
// ─────────────────────────────────────────────
// The mascot frames and banners arrive as flat-shaded PNGs at 1–1.9 MB each.
// They are vector-style art — large areas of solid ink, bone and graphite —
// so WebP takes them down by an order of magnitude with no visible loss.
//
// Masters live in image-src/ (gitignored, same pattern as audio-src/) and
// are NEVER placed under public/ directly — Vite copies public/ verbatim
// into dist/ on every build regardless of .gitignore, so a master sitting
// there ships to production even though nothing references it. Only the
// derived .webp/.png files below are written into public/, committed, and
// deployed. Re-run with `npm run images` after dropping new masters in
// image-src/, or let `prebuild` handle it.
//
// Quality 92 for the mascot frames, which carry soft cel shading; the OG
// card uses palette PNG since a few social scrapers still refuse WebP.
// ─────────────────────────────────────────────

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const force = process.argv.includes('--force');

// srcDir (image-src/…) → outDir (public/…), same filenames, .png → .webp
const TARGETS = [
  { srcDir: 'image-src/mascot', outDir: 'public/mascot', opts: { quality: 92, effort: 6 } },
  { srcDir: 'image-src',        outDir: 'public',        opts: { quality: 92, effort: 6 }, only: ['bramble.png'] },
];

const kb = n => `${(n / 1024).toFixed(0)}KB`;

async function convert(srcDir, outDir, file, opts) {
  const src = path.join(ROOT, srcDir, file);
  const out = path.join(ROOT, outDir, file.replace(/\.png$/i, '.webp'));

  if (!force && existsSync(out)) {
    const [s, o] = await Promise.all([stat(src), stat(out)]);
    if (o.mtimeMs >= s.mtimeMs) {
      console.log(`  · ${file} — up to date, skipping`);
      return { before: s.size, after: o.size };
    }
  }

  const before = (await stat(src)).size;
  await sharp(src).webp(opts).toFile(out);
  const after = (await stat(out)).size;

  const saved = (100 - (after / before) * 100).toFixed(0);
  console.log(`  ✓ ${file.padEnd(24)} ${kb(before).padStart(7)} → ${kb(after).padStart(6)}  (−${saved}%)`);
  return { before, after };
}

let totalBefore = 0;
let totalAfter = 0;

for (const { srcDir, outDir, opts, only } of TARGETS) {
  const absSrc = path.join(ROOT, srcDir);
  const absOut = path.join(ROOT, outDir);
  if (!existsSync(absOut)) await mkdir(absOut, { recursive: true });
  if (!existsSync(absSrc)) continue; // no masters checked out — fine, committed .webp stand

  let files = (await readdir(absSrc)).filter(f => f.toLowerCase().endsWith('.png'));
  if (only) files = files.filter(f => only.includes(f));
  if (!files.length) continue;

  console.log(`\n${srcDir} → ${outDir}`);
  for (const file of files.sort()) {
    const { before, after } = await convert(srcDir, outDir, file, opts);
    totalBefore += before;
    totalAfter += after;
  }
}

if (totalBefore) {
  const saved = (100 - (totalAfter / totalBefore) * 100).toFixed(0);
  console.log(
    `\n${kb(totalBefore)} → ${kb(totalAfter)} across all images (−${saved}%)\n`
  );
}

// ── Open Graph card ──────────────────────────
// og-source.png is 3:2; link previews want 1.91:1. Crop rather than squash,
// biased upward so the figure sits centred rather than the bramble below it.
// Emitted as PNG: a few social scrapers still refuse WebP.
const OG_SRC = path.join(ROOT, 'image-src/og-source.png');
if (existsSync(OG_SRC)) {
  const { width, height } = await sharp(OG_SRC).metadata();
  const cropH = Math.round(width / (1200 / 630));
  const top = Math.max(0, Math.min(height - cropH, Math.round(height * 0.44 - cropH / 2)));

  await sharp(OG_SRC)
    .extract({ left: 0, top, width, height: cropH })
    .resize(1200, 630)
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(ROOT, 'public/og.png'));

  const size = (await stat(path.join(ROOT, 'public/og.png'))).size;
  console.log(`og.png — 1200×630 from ${width}×${height} (crop top ${top}), ${kb(size)}\n`);
}

// ── Hero desktop composite ───────────────────
// The seated mascot frames are ~16:9 with the figure already filling the
// right half — mirroring them live in CSS leaves almost no object-position
// slack at typical viewport ratios (source and viewport aspect are too
// close), so the figure lands directly under the featured-release card at
// ≥1400px instead of clearing it.
//
// Composed once here instead: trim each frame to its actual silhouette,
// mirror it, and place it on a wider ink canvas with the figure's right
// edge stopping well short of where the card sits. CSS object-fit: cover
// then only ever does minor, harmless cropping around an already-correct
// composition — the clearance is baked in, not fought for at runtime.
const HERO_CANVAS = { width: 2400, height: 1350 };     // 16:9 authoring frame
const HERO_FIGURE_RIGHT = 0.62;  // figure's right edge, as a fraction of canvas width
const HERO_FIGURE_HEIGHT = 0.86; // figure height, as a fraction of canvas height
const HERO_BOTTOM_MARGIN = 0.06; // seated pose reads grounded, not centred

const HERO_FRAMES = [
  { src: 'image-src/mascot/seated-idle.png',      out: 'public/hero-desktop-idle.webp' },
  { src: 'image-src/mascot/seated-listening.png', out: 'public/hero-desktop-listening.webp' },
];

for (const { src, out } of HERO_FRAMES) {
  const srcPath = path.join(ROOT, src);
  const outPath = path.join(ROOT, out);
  if (!existsSync(srcPath)) continue; // no masters checked out — committed .webp stands

  if (!force && existsSync(outPath)) {
    const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
    if (o.mtimeMs >= s.mtimeMs) {
      console.log(`  · ${path.basename(out)} — up to date, skipping`);
      continue;
    }
  }

  // Trim the surrounding margin to get the figure's true silhouette box,
  // then mirror it. No explicit background: the art's "black" is actually
  // ~#0D0E10, near enough ink that specifying #000000 here made nothing
  // trim at all — auto-sampling the corner pixel gets the real value.
  //
  // .metadata() on a pending pipeline reports the *source* image's
  // dimensions, not the result after trim/flop — only toBuffer() with
  // resolveWithObject actually runs the pipeline and reports the true
  // output size. Using .metadata() here silently trimmed nothing.
  const { data: trimmedBuf, info: trimmedInfo } = await sharp(srcPath)
    .flop()
    .trim({ threshold: 24 })
    .toBuffer({ resolveWithObject: true });
  const { width: tw, height: th } = trimmedInfo;

  const figureH = Math.round(HERO_CANVAS.height * HERO_FIGURE_HEIGHT);
  const figureW = Math.round(tw * (figureH / th));
  const figureBuf = await sharp(trimmedBuf).resize(figureW, figureH).toBuffer();

  const targetRightX = Math.round(HERO_CANVAS.width * HERO_FIGURE_RIGHT);
  const left = Math.max(0, targetRightX - figureW);
  const top = HERO_CANVAS.height - figureH - Math.round(HERO_CANVAS.height * HERO_BOTTOM_MARGIN);

  await sharp({
    create: {
      width: HERO_CANVAS.width,
      height: HERO_CANVAS.height,
      channels: 3,
      background: '#0D0F12',
    },
  })
    .composite([{ input: figureBuf, left, top }])
    .webp({ quality: 92, effort: 6 })
    .toFile(outPath);

  const size = (await stat(outPath)).size;
  console.log(
    `  ✓ ${path.basename(out).padEnd(28)} figure ${figureW}×${figureH} at (${left},${top}) on ${HERO_CANVAS.width}×${HERO_CANVAS.height}, ${kb(size)}`
  );
}
console.log('');
