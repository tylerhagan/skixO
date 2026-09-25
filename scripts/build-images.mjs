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
//
// The mascot target is an allow-list, not every PNG in the folder: most
// masters are consumed below instead (the seated frames and the nod by the
// hero composite, the peek pair by the cutout pass), and a straight .webp
// of those is a byproduct nothing loads — which still ships, because it's
// in public/. Add a frame here only when the site references it as-is.
const TARGETS = [
  {
    srcDir: 'image-src/mascot', outDir: 'public/mascot', opts: { quality: 92, effort: 6 },
    only: ['lean-down.png', 'lean-up.png', 'studio.png', 'studio-nod.png'],
  },
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
// mirror it, and place it on a wider ink canvas. CSS object-fit: cover
// then only ever does minor, harmless cropping around an already-correct
// composition — the framing is baked in, not fought for at runtime.
//
// The figure sits between two constraints that don't leave much room:
// the hero copy on the left (max-width 640px + padding, so clear of
// roughly the first 30% of frame) and the featured-release card on the
// right (~68%-95% at ≥1400px). At the figure's natural size there's no
// fraction that clears both entirely, so this favours clean separation
// from the copy -- overlapping text reads as broken, overlapping a
// blurred glass panel reads as a deliberate "peeking through the HUD"
// layer. The pose's own face sits in roughly the left 35-40% of the
// figure's own bounding box (chin-on-fist, legs trailing right), so
// even with the figure's right edge well into the card's footprint the
// face itself stays clear of it — verified against the actual composite
// with the real card/copy zones overlaid, not just this arithmetic.
const HERO_CANVAS = { width: 2400, height: 1350 };     // 16:9 authoring frame
const HERO_FIGURE_RIGHT = 0.84;  // figure's right edge, as a fraction of canvas width
const HERO_FIGURE_HEIGHT = 0.86; // figure height, as a fraction of canvas height
const HERO_BOTTOM_MARGIN = 0.06; // seated pose reads grounded, not centred

const HERO_FRAMES = [
  { key: 'idle',           src: 'image-src/mascot/seated-idle.png',      out: 'public/hero-desktop-idle.webp' },
  { key: 'listening',      src: 'image-src/mascot/seated-listening.png', out: 'public/hero-desktop-listening.webp' },
  // Half-time nod, alternated with the frame above while a track plays
  // (Hero.jsx). shareCropWith reuses 'listening's exact trim rectangle
  // instead of finding its own: independently trimming each frame left
  // them ~5px apart in both height and vertical offset (the nod pose's
  // headphones reach slightly less far up than the base pose's), which
  // scaled and re-anchored the whole figure a few pixels differently per
  // frame -- the body visibly shifted on every swap, not just the head.
  // idle never rhythmically alternates with anything, so it's unaffected
  // and keeps its own independent trim.
  { key: 'listening-nod',  src: 'image-src/mascot/listening-nod.png',    out: 'public/hero-desktop-listening-nod.webp', shareCropWith: 'listening' },
];

const heroCropBoxes = {}; // key -> { left, top, width, height } in flopped-source space
// Frames another frame depends on for its crop box must still have that
// box computed even when their own output is already up to date — only
// the (skippable) final webp write can be short-circuited for them.
const heroDependedOn = new Set(HERO_FRAMES.filter(f => f.shareCropWith).map(f => f.shareCropWith));

for (const { key, src, out, shareCropWith } of HERO_FRAMES) {
  const srcPath = path.join(ROOT, src);
  const outPath = path.join(ROOT, out);
  if (!existsSync(srcPath)) continue; // no masters checked out — committed .webp stands

  let upToDate = false;
  if (!force && existsSync(outPath)) {
    const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
    upToDate = o.mtimeMs >= s.mtimeMs;
  }

  if (upToDate && !(key && heroDependedOn.has(key))) {
    console.log(`  · ${path.basename(out)} — up to date, skipping`);
    continue;
  }

  let cropBuf, cropBox;

  if (shareCropWith && heroCropBoxes[shareCropWith]) {
    // Reuse the reference frame's exact rectangle rather than trimming
    // this one independently -- guarantees identical scale and canvas
    // placement, so only the pixels that actually differ (the head) move.
    cropBox = heroCropBoxes[shareCropWith];
    cropBuf = await sharp(srcPath).flop().extract(cropBox).toBuffer();
  } else {
    // Trim the surrounding margin to get the figure's true silhouette box,
    // then mirror it. No explicit background: the art's "black" is actually
    // ~#0D0E10, near enough ink that specifying #000000 here made nothing
    // trim at all — auto-sampling the corner pixel gets the real value.
    //
    // .metadata() on a pending pipeline reports the *source* image's
    // dimensions, not the result after trim/flop — only toBuffer() with
    // resolveWithObject actually runs the pipeline and reports the true
    // output size. Using .metadata() here silently trimmed nothing.
    const { data, info } = await sharp(srcPath)
      .flop()
      .trim({ threshold: 24 })
      .toBuffer({ resolveWithObject: true });
    // trimOffsetLeft/Top come back negative (pixels removed from that
    // edge) — negate them to get an extract()-able rectangle. Verified
    // against sharp's own auto-trim output byte-for-byte before relying
    // on this rather than trusting the sign from memory.
    cropBox = { left: -info.trimOffsetLeft, top: -info.trimOffsetTop, width: info.width, height: info.height };
    cropBuf = data;
  }

  if (key) heroCropBoxes[key] = cropBox;

  if (upToDate) {
    console.log(`  · ${path.basename(out)} — up to date, skipping (crop box computed for a dependent)`);
    continue;
  }

  const { width: tw, height: th } = cropBox;
  const figureH = Math.round(HERO_CANVAS.height * HERO_FIGURE_HEIGHT);
  const figureW = Math.round(tw * (figureH / th));
  const figureBuf = await sharp(cropBuf).resize(figureW, figureH).toBuffer();

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

// ── Transparent cutouts ──────────────────────
// The hero/about frames are composited onto a known canvas colour by this
// same script, so a baked-in background is fine there — but wherever the
// mascot is dropped into a smaller masked shape (a circular avatar, a
// footer/404 crop) sitting on a container that ISN'T exactly the art's own
// background tone (--black-2 is visibly lighter than the art's ~#0D0E10),
// the crop reads as a mismatched rectangle/circle rather than a clean cutout.
//
// A flat per-pixel colour-distance key doesn't work here: the character's
// own black jacket is close enough to the background colour that it gets
// keyed out too (checked against an actual render — visible as orange
// bleeding through the sleeve on a stress-test background). Instead this
// flood-fills inward from the four edges through background-coloured
// pixels only, stopping at the art's own consistent bright outline stroke
// — the same principle as a "magic wand" selection, not a chroma key. A
// pixel enclosed by that outline stays fully opaque regardless of its own
// colour, so the jacket survives intact.
function floodFillAlpha(data, width, height, bgR, bgG, bgB, threshold) {
  const total = width * height;
  const visited = new Uint8Array(total); // 0 unseen, 1 background, 2 boundary/kept
  const isBg = i => {
    const p = i * 4;
    const dr = data[p] - bgR, dg = data[p + 1] - bgG, db = data[p + 2] - bgB;
    return dr * dr + dg * dg + db * db <= threshold * threshold;
  };
  const stack = [];
  const seed = (x, y) => {
    const i = y * width + x;
    if (!visited[i] && isBg(i)) { visited[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < width; x++) { seed(x, 0); seed(x, height - 1); }
  for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y); }

  const visit = ni => {
    if (visited[ni]) return;
    if (isBg(ni)) { visited[ni] = 1; stack.push(ni); } else visited[ni] = 2;
  };
  while (stack.length) {
    const i = stack.pop();
    const x = i % width, y = (i / width) | 0;
    if (x > 0) visit(i - 1);
    if (x < width - 1) visit(i + 1);
    if (y > 0) visit(i - width);
    if (y < height - 1) visit(i + width);
  }
  for (let i = 0; i < total; i++) {
    if (visited[i] === 1) data[i * 4 + 3] = 0;
  }
}

const CUTOUT_FRAMES = [
  { src: 'image-src/mascot/peek-still.png', out: 'public/mascot/cutout-peek-still.webp' },
  { src: 'image-src/mascot/peek-wave.png',  out: 'public/mascot/cutout-peek-wave.webp' },
];

for (const { src, out } of CUTOUT_FRAMES) {
  const srcPath = path.join(ROOT, src);
  const outPath = path.join(ROOT, out);
  if (!existsSync(srcPath)) continue;

  if (!force && existsSync(outPath)) {
    const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
    if (o.mtimeMs >= s.mtimeMs) {
      console.log(`  · ${path.basename(out)} — up to date, skipping`);
      continue;
    }
  }

  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  // Sampled corner pixel, not a hardcoded value — the art's "black" varies
  // by a pixel or two between generations.
  floodFillAlpha(data, width, height, data[0], data[1], data[2], 22);

  await sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 92, effort: 6 })
    .toFile(outPath);

  const size = (await stat(outPath)).size;
  console.log(`  ✓ ${path.basename(out).padEnd(28)} ${width}×${height}, ${kb(size)}`);
}
console.log('');

// ── Artist portrait ───────────────────────────
// A dedicated square crop of the (now transparent) peek-still cutout,
// centred on the face — the full frame is a wide arms-resting pose, not
// naturally square, so a plain object-fit:cover circle would either show
// a lot of empty transparent space above the head or crop the face off.
// Baked once here rather than fought with CSS object-position, same
// reasoning as the hero composite.
const PORTRAIT_SRC = path.join(ROOT, 'public/mascot/cutout-peek-still.webp');
const PORTRAIT_OUT = path.join(ROOT, 'public/portrait.webp');
if (existsSync(PORTRAIT_SRC)) {
  await sharp(PORTRAIT_SRC)
    .extract({ left: 325, top: 460, width: 750, height: 750 })
    .webp({ quality: 92, effort: 6 })
    .toFile(PORTRAIT_OUT);
  const size = (await stat(PORTRAIT_OUT)).size;
  console.log(`portrait.webp — 750×750 face-centred crop, ${kb(size)}\n`);
}
