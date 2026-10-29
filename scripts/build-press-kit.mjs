// Generates public/press/skixO-press-kit.pdf: one A4 page, ink ground, bone
// type, in the site's dossier style. Copy comes from `press` and `channels`
// in src/data/siteData.js, so the page and the PDF cannot drift apart.
//
// Fonts (scripts/art/fonts/):
//   bebas-neue.ttf, jetbrains-mono-500.ttf
//       decompressed from the site's woff2 files:
//       python -m fontTools.ttLib.woff2 decompress -o x.ttf x.woff2
//   noto-sans-tc-subset.otf
//       Noto Sans TC Regular, subset to the characters the PDF needs (the
//       full face is 5.6MB). Rebuild when the Chinese copy changes:
//       pyftsubset NotoSansTC-Regular.otf --text-file=chars.txt \
//         --output-file=noto-sans-tc-subset.otf --layout-features='*'
//       where chars.txt holds every character in siteData.js and this file.
//       Source: the notofonts/noto-cjk repo, Sans/SubsetOTF/TC.
//   If the CJK subset is absent the script still runs: the Chinese bio is
//   replaced by a "see website" line, and a hint is printed.
//
// No Chrome and no image masters needed: sharp rasterises the SVG and WebP
// (pdfkit takes neither).

import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { press, channels } from '../src/data/siteData.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const FONTS = path.join(ROOT, 'scripts/art/fonts');
const OUT = path.join(ROOT, 'public/press/skixO-press-kit.pdf');

const INK = '#0D0F12';
const BONE = '#EDE6D6';
const DIM = '#948F80';
const RULE = '#4A4C4F'; // bone at ~25% over ink, flattened
const PANEL = '#1B1D20';

const fontPaths = {
  display: path.join(FONTS, 'bebas-neue.ttf'),
  mono: path.join(FONTS, 'jetbrains-mono-500.ttf'),
  zh: path.join(FONTS, 'noto-sans-tc-subset.otf'),
};

if (!existsSync(fontPaths.display) || !existsSync(fontPaths.mono)) {
  console.log('press-kit: Latin TTFs missing in scripts/art/fonts (see script header); skipping.');
  process.exit(0);
}
const hasZh = existsSync(fontPaths.zh);
if (!hasZh) {
  console.log('press-kit: noto-sans-tc-subset.otf not found; Chinese bio replaced by a "see website" line.');
}

const M = 44; // page margin
const W = 595.28;
const H = 841.89;
const NON_LATIN = /[^\u0000-ɏ‐-―]/;

const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
  info: {
    Title: 'skixO press kit',
    Author: 'skixO',
    // Fixed, so a rebuild with unchanged copy produces an unchanged file.
    CreationDate: new Date('2026-10-29T00:00:00Z'),
  },
});
await mkdir(path.dirname(OUT), { recursive: true });
doc.pipe(createWriteStream(OUT));

doc.registerFont('display', fontPaths.display);
doc.registerFont('mono', fontPaths.mono);
if (hasZh) doc.registerFont('zh', fontPaths.zh);

const raster = async (file, width) =>
  sharp(await readFile(path.join(ROOT, 'public', file)), { density: 300 })
    .resize({ width })
    .png()
    .toBuffer();

// ── Ground ──
doc.rect(0, 0, W, H).fill(INK);

// ── Header strip ──
let y = M;
doc.font('mono').fontSize(7).fillColor(BONE)
  .text('FILE // PRESS', M, y, { characterSpacing: 2.2, lineBreak: false });
doc.fillColor(DIM)
  .text('PRESS KIT', M, y, { width: W - 2 * M, align: 'right', characterSpacing: 2.2, lineBreak: false });
y += 16;
doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.6).strokeColor(RULE).stroke();
doc.moveTo(M, y).lineTo(M + 72, y).lineWidth(1.4).strokeColor(BONE).stroke();

// ── Wordmark + title ──
y += 26;
const wmW = 230;
const wmH = wmW * (159 / 501.8);
doc.image(await raster('wordmark-cut-bone.svg', 900), M, y, { width: wmW });
doc.font('display').fontSize(26).fillColor(BONE)
  .text('PRESS KIT', M + wmW + 28, y + wmH - 25, { characterSpacing: 3, lineBreak: false });
if (hasZh) {
  doc.font('zh').fontSize(9).fillColor(DIM)
    .text('媒體資料', M + wmW + 28 + 112, y + wmH - 13, { lineBreak: false });
}
y += wmH + 26;

// ── Portrait + facts ──
const PS = 168;
const portrait = await sharp(await readFile(path.join(ROOT, 'public/portrait.webp')))
  .resize(PS * 3, PS * 3)
  .png()
  .toBuffer();
doc.image(portrait, M, y, { width: PS, height: PS });
doc.rect(M, y, PS, PS).lineWidth(0.6).strokeColor(RULE).stroke();

const fx = M + PS + 26;
const fw = W - M - fx;
const facts = [
  ['SUBJECT', 'skixO'],
  ['GENRE', 'Liquid DnB, Glitch Architecture'],
  ['FREQ', `${press.bpm} bpm`],
  ['ORIGIN', press.origin],
  ['BASE', press.base],
  ['LANGUAGES', 'English, 中文'],
  ['RELEASES', String(press.releases)],
  ['SINGLE', 'PRØVE feat. Berlin the Corner'],
];
doc.rect(fx, y, fw, 18).fillColor(PANEL).fill();
doc.font('mono').fontSize(6.5).fillColor(BONE)
  .text('FILE // SKX-001', fx + 10, y + 6, { characterSpacing: 2, lineBreak: false });
let fy = y + 18;
const rowH = (PS - 18) / facts.length;
for (const [k, v] of facts) {
  doc.moveTo(fx, fy).lineTo(fx + fw, fy).lineWidth(0.4).strokeColor(RULE).stroke();
  doc.font('mono').fontSize(6.2).fillColor(DIM)
    .text(k, fx + 10, fy + rowH / 2 - 3, { characterSpacing: 1.6, lineBreak: false });
  const vy = fy + rowH / 2 - 3.6;
  if (NON_LATIN.test(v)) {
    // Mixed value: Latin in the mono face, Han in the CJK face (or a
    // Latin stand-in when that face is absent).
    let vx = fx + 86;
    for (const part of v.split(/([^\u0000-ɏ]+)/).filter(Boolean)) {
      const han = NON_LATIN.test(part);
      const text = han && !hasZh ? 'Mandarin' : part;
      doc.font(han && hasZh ? 'zh' : 'mono').fontSize(7.2).fillColor(BONE).text(text, vx, vy, { lineBreak: false });
      vx += doc.widthOfString(text);
    }
  } else {
    doc.font('mono').fontSize(7.2).fillColor(BONE).text(v, fx + 86, vy, { lineBreak: false });
  }
  fy += rowH;
}
doc.rect(fx, y, fw, PS).lineWidth(0.6).strokeColor(RULE).stroke();
doc.moveTo(fx, y).lineTo(fx + fw, y).lineWidth(1.4).strokeColor(BONE).stroke();
y += PS + 28;

// ── Bio ──
const bodyW = W - 2 * M;
const section = (label, yy, labelZh) => {
  doc.font('mono').fontSize(6.5).fillColor(DIM)
    .text(label, M, yy, { characterSpacing: 2.2, lineBreak: false });
  let end = M + doc.widthOfString(label) + label.length * 2.2;
  if (labelZh && hasZh) {
    doc.font('zh').fontSize(6.8).text(labelZh, end + 6, yy - 0.5, { lineBreak: false });
    end += 6 + doc.widthOfString(labelZh);
  }
  doc.moveTo(end + 10, yy + 3.5).lineTo(W - M, yy + 3.5).lineWidth(0.4).strokeColor(RULE).stroke();
  return yy + 16;
};

y = section('BIO // EN', y);
doc.font('mono').fontSize(8.4).fillColor(BONE)
  .text(press.bios.short.en, M, y, { width: bodyW, lineGap: 4.2 });
y = doc.y + 24;

y = section('BIO // ZH', y, hasZh ? '草稿，待母語校對' : undefined);
if (hasZh) {
  doc.font('zh').fontSize(8.8).fillColor(BONE)
    .text(press.bios.short.zh, M, y, { width: bodyW, lineGap: 5 });
} else {
  doc.font('mono').fontSize(8.4).fillColor(DIM)
    .text('Chinese bio: see the website press page.', M, y, { width: bodyW });
}
y = doc.y + 24;

// ── Links + contact ──
y = section('LINKS', y);
for (const platform of ['SoundCloud', 'YouTube', 'Spotify', 'Instagram']) {
  const url = channels.find(c => c.platform === platform).url;
  doc.font('mono').fontSize(6.2).fillColor(DIM)
    .text(platform.toUpperCase(), M, y + 1, { characterSpacing: 1.6, lineBreak: false });
  doc.font('mono').fontSize(7.6).fillColor(BONE)
    .text(url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), M + 86, y, { link: url, lineBreak: false });
  y += 17;
}
y += 10;

y = section('CONTACT', y);
doc.font('mono').fontSize(6.2).fillColor(DIM)
  .text('BOOKINGS', M, y + 1, { characterSpacing: 1.6, lineBreak: false });
doc.font('mono').fontSize(7.6).fillColor(BONE)
  .text(press.email, M + 86, y, { link: `mailto:${press.email}`, lineBreak: false });

// ── Footer ──
const footY = H - M - 10;
doc.moveTo(M, footY - 10).lineTo(W - M, footY - 10).lineWidth(0.4).strokeColor(RULE).stroke();
doc.font('mono').fontSize(6).fillColor(DIM)
  .text('© 2026 skixO', M, footY, { characterSpacing: 1.6, lineBreak: false });
doc.text('LONDON / BERLIN / TAIPEI', M, footY, { width: bodyW, align: 'right', characterSpacing: 1.6, lineBreak: false });

const done = new Promise(r => doc.on('end', r));
doc.end();
await done;
console.log(`press-kit: wrote ${path.relative(ROOT, OUT)}${hasZh ? '' : ' (no CJK font)'}`);
