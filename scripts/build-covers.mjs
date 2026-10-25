// ─────────────────────────────────────────────
// skixO — catalogue covers
// ─────────────────────────────────────────────
// The catalogue used to hotlink img.youtube.com thumbnails: seventeen
// other people's artworks, in seventeen palettes and typefaces, as the
// most colourful block on the page. None of it read as skixO.
//
// This bakes each thumbnail twice into public/covers/:
//   <id>.webp      — the original, in colour
//   <id>-duo.webp  — an ink → bone duotone, the site's own two tones
// The grid shows the duotone; hover reveals the colour underneath. One
// palette at rest, the source art one gesture away.
//
// Outputs are committed, same as the image pipeline, so a build with no
// network (or a video that's since gone private) still ships the last
// good covers. Existing files are skipped; --force refetches everything.
// ─────────────────────────────────────────────

import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { VIDEOS } from '../src/data/catalogue.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/covers');
const force = process.argv.includes('--force');

const W = 640, H = 360;

// Endpoints of the duotone, from src/styles/globals.css — --ink and --bone.
const INK  = [0x0D, 0x0F, 0x12];
const BONE = [0xED, 0xE6, 0xD6];

// maxresdefault is a true 16:9 frame but doesn't exist for every upload
// (YouTube answers 404, or a 120×90 grey placeholder). hqdefault always
// exists, but it's 4:3 with the 16:9 frame letterboxed inside it — so
// the fallback crops the bars off rather than shipping them.
async function fetchThumb(id) {
  for (const [name, letterboxed] of [['maxresdefault', false], ['hqdefault', true]]) {
    const res = await fetch(`https://img.youtube.com/vi/${id}/${name}.jpg`);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    const { width, height } = await sharp(buf).metadata();
    if (width < 320) continue; // the placeholder
    if (!letterboxed) return sharp(buf);
    const h = Math.round(width * 9 / 16);
    return sharp(buf).extract({ left: 0, top: Math.round((height - h) / 2), width, height: h });
  }
  throw new Error(`no thumbnail for ${id}`);
}

// Luminance → a point between ink and bone. The gamma pushes midtones
// toward ink, so the covers sit back in the grid instead of glowing —
// the colour on hover is the reveal, the duotone shouldn't compete with it.
function duotone(data) {
  const out = Buffer.alloc((data.length / 3) * 3);
  for (let i = 0; i < data.length; i += 3) {
    const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const t = Math.pow(l, 1.35);
    out[i]     = INK[0] + (BONE[0] - INK[0]) * t;
    out[i + 1] = INK[1] + (BONE[1] - INK[1]) * t;
    out[i + 2] = INK[2] + (BONE[2] - INK[2]) * t;
  }
  return out;
}

await mkdir(OUT, { recursive: true });
let failed = 0;

for (const { id, title } of VIDEOS) {
  const colourOut = path.join(OUT, `${id}.webp`);
  const duoOut = path.join(OUT, `${id}-duo.webp`);
  if (!force && existsSync(colourOut) && existsSync(duoOut)) {
    console.log(`  · ${id} — up to date, skipping`);
    continue;
  }

  try {
    const frame = (await fetchThumb(id)).resize(W, H, { fit: 'cover' }).removeAlpha();
    const { data } = await frame.clone().raw().toBuffer({ resolveWithObject: true });

    await frame.clone().webp({ quality: 80, effort: 6 }).toFile(colourOut);
    await sharp(duotone(data), { raw: { width: W, height: H, channels: 3 } })
      .webp({ quality: 82, effort: 6 })
      .toFile(duoOut);

    const [c, d] = await Promise.all([stat(colourOut), stat(duoOut)]);
    console.log(`  ✓ ${id}  ${(c.size / 1024).toFixed(0)}KB + ${(d.size / 1024).toFixed(0)}KB  ${title}`);
  } catch (err) {
    // Not fatal: a committed cover from an earlier run still stands, and
    // a deploy shouldn't fail because YouTube was briefly unreachable.
    failed++;
    console.warn(`  ✗ ${id} — ${err.message}`);
  }
}

console.log(failed ? `\n${failed} cover(s) not built\n` : '');
