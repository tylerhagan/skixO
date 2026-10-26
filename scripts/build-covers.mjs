// ─────────────────────────────────────────────
// skixO — catalogue covers
// ─────────────────────────────────────────────
// Every card in the catalogue gets two images in public/covers/:
//   <id>.webp      — shown on hover
//   <id>-duo.webp  — shown at rest, in the site's two tones (ink → bone)
//
// Two sources, chosen per entry in src/data/catalogue.js:
//
// 1. Entries with a `cover` spec are DESIGNED here: a scene from
//    image-src/scenes/ is set under the title and credit by the template
//    in scripts/art/cover.html, rendered in headless Edge/Chrome. Each
//    also gets a 3000×3000 master in release-art/ — the size the stores
//    ask for — so release artwork and the site come from one source.
//      cover: { scene: 'wistful-night-coastline', treatment: 'duotone' }
//    treatment 'duotone' renders the scene in ink/bone everywhere;
//    'scene' keeps its own colours for the master and the hover image
//    (the duotone stays the at-rest card, so the grid still reads as one).
//    `feat` on the entry (e.g. 'Taer') adds the "ft." line.
//
// 2. Everything else is the video's YouTube thumbnail, baked to the same
//    duotone. The catalogue used to hotlink these: seventeen other
//    people's artworks in seventeen palettes, as the most colourful block
//    on the page.
//
// Outputs are committed, same as the image pipeline, so a build with no
// network, no browser, or no scene masters (Vercel) still ships the last
// good covers. A designed cover re-renders when its spec, its scene or
// the template changes (tracked in scripts/art/rendered.json);
// YouTube covers are fetched once. --force redoes everything.
// ─────────────────────────────────────────────

import sharp from 'sharp';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { VIDEOS } from '../src/data/catalogue.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/covers');
const MASTERS = path.join(ROOT, 'release-art');
const SCENES = path.join(ROOT, 'image-src/scenes');
const TEMPLATE = path.join(ROOT, 'scripts/art/cover.html');
// Not under public/: Vite would ship it.
const STAMPS = path.join(ROOT, 'scripts/art/rendered.json');
const force = process.argv.includes('--force');

const W = 640, H = 360;

// Endpoints of the duotone, from src/styles/globals.css — --ink and --bone.
const INK  = [0x0D, 0x0F, 0x12];
const BONE = [0xED, 0xE6, 0xD6];

const kb = n => `${(n / 1024).toFixed(0)}KB`;
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Luminance → a point between ink and bone. The gamma pushes midtones
// toward ink, so the covers sit back in the grid instead of glowing —
// the colour on hover is the reveal, the duotone shouldn't compete with it.
async function duotone(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const t = Math.pow(l, 1.35);
    data[i]     = INK[0] + (BONE[0] - INK[0]) * t;
    data[i + 1] = INK[1] + (BONE[1] - INK[1]) * t;
    data[i + 2] = INK[2] + (BONE[2] - INK[2]) * t;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
}

// ── YouTube thumbnails ───────────────────────

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

async function youtubeCover({ id, title }) {
  const colourOut = path.join(OUT, `${id}.webp`);
  const duoOut = path.join(OUT, `${id}-duo.webp`);
  if (!force && existsSync(colourOut) && existsSync(duoOut)) {
    console.log(`  · ${id} — up to date, skipping`);
    return;
  }
  const frame = await (await fetchThumb(id)).resize(W, H, { fit: 'cover' }).removeAlpha().png().toBuffer();
  await sharp(frame).webp({ quality: 80, effort: 6 }).toFile(colourOut);
  await (await duotone(frame)).webp({ quality: 82, effort: 6 }).toFile(duoOut);
  const [c, d] = await Promise.all([stat(colourOut), stat(duoOut)]);
  console.log(`  ✓ ${id}  ${kb(c.size)} + ${kb(d.size)}  ${title}`);
}

// ── Designed covers ──────────────────────────

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

// A minimal DevTools-protocol client — enough to load the template at a
// given size and screenshot it. Node's built-in fetch/WebSocket, so no
// Puppeteer download in a build that only needs this locally.
async function launchBrowser() {
  const exe = BROWSERS.find(p => existsSync(p));
  if (!exe) throw new Error('no Edge/Chrome found — set CHROME_PATH');
  const profile = await mkdtemp(path.join(tmpdir(), 'skixo-covers-'));
  const port = 9400 + Math.floor(Math.random() * 400);
  const proc = spawn(exe, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  let targets;
  for (let i = 0; i < 60 && !targets?.length; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); }
    catch { await new Promise(r => setTimeout(r, 250)); }
  }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let seq = 0;
  const pending = new Map();
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, msg => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable');
  let renders = 0;

  return {
    // Renders the template at width×height CSS px, `scale` device pixels each.
    async render(params, width, height, scale) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
      // A unique query per render: a hash-only change would keep the old
      // document, and the readiness check below would answer for it.
      const url = `${pathToFileURL(TEMPLATE).href}?n=${++renders}#${encodeURIComponent(JSON.stringify(params))}`;
      await send('Page.navigate', { url });
      let ready = false;
      for (let i = 0; i < 150 && !ready; i++) {
        const { result } = await send('Runtime.evaluate', {
          expression: `location.href === ${JSON.stringify(url)} && window.coverReady`,
          awaitPromise: true, returnByValue: true,
        });
        ready = result.value === true;
        if (!ready) await new Promise(r => setTimeout(r, 100));
      }
      if (!ready) throw new Error('template never became ready');
      const { data } = await send('Page.captureScreenshot', {
        format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 },
      });
      return Buffer.from(data, 'base64');
    },
    async close() {
      ws.close();
      proc.kill();
      await rm(profile, { recursive: true, force: true }).catch(() => {});
    },
  };
}

async function designedCover(video, browser, stamps, templateHash) {
  const { id, title, feat, cover } = video;
  const scenePath = path.join(SCENES, `${cover.scene}.png`);
  const colourOut = path.join(OUT, `${id}.webp`);
  const duoOut = path.join(OUT, `${id}-duo.webp`);
  const masterOut = path.join(MASTERS, `${slug(title)}-3000.jpg`);

  const sceneStamp = existsSync(scenePath) ? (await stat(scenePath)).mtimeMs : 'missing';
  const hash = createHash('sha1')
    .update(JSON.stringify({ title, feat, cover, sceneStamp, templateHash }))
    .digest('hex').slice(0, 12);

  const outputsExist = existsSync(colourOut) && existsSync(duoOut);
  if (!force && outputsExist && stamps[id] === hash) {
    console.log(`  · ${title} — up to date, skipping`);
    return;
  }
  if (!existsSync(scenePath)) {
    // Fine on Vercel: masters are local-only, the committed covers stand.
    console.log(`  · ${title} — scene ${cover.scene}.png not in image-src/scenes, keeping committed cover`);
    return;
  }

  // The template takes its background as a file, so write both versions
  // of the scene to temp PNGs first.
  const tmp = await mkdtemp(path.join(tmpdir(), 'skixo-scene-'));
  const duoBg = path.join(tmp, 'duo.png');
  const colourBg = path.join(tmp, 'colour.png');
  await (await duotone(scenePath)).png().toFile(duoBg);
  await sharp(scenePath).removeAlpha().png().toFile(colourBg);
  const colourBgForCover = cover.treatment === 'scene' ? colourBg : duoBg;

  const base = { title, feat };
  const asUrl = p => pathToFileURL(p).href;

  // Store master: 1000 CSS px at 3× = 3000×3000.
  const master = await browser.render({ ...base, bg: asUrl(colourBgForCover), aspect: 'square' }, 1000, 1000, 3);
  await sharp(master).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(masterOut);

  // Catalogue card: 16:9, rendered at 2× and downsampled for crisp type.
  const wide = async bg => sharp(await browser.render({ ...base, bg: asUrl(bg), aspect: 'wide' }, W, H, 2))
    .resize(W, H);
  await (await wide(colourBgForCover)).webp({ quality: 82, effort: 6 }).toFile(colourOut);
  await (await wide(duoBg)).webp({ quality: 82, effort: 6 }).toFile(duoOut);

  await rm(tmp, { recursive: true, force: true });
  stamps[id] = hash;

  const [c, d, m] = await Promise.all([stat(colourOut), stat(duoOut), stat(masterOut)]);
  console.log(`  ✓ ${title.padEnd(10)} ${kb(c.size)} + ${kb(d.size)}, master ${path.relative(ROOT, masterOut)} ${kb(m.size)}`);
}

// ── Run ──────────────────────────────────────

await mkdir(OUT, { recursive: true });
await mkdir(MASTERS, { recursive: true });

const stamps = existsSync(STAMPS) ? JSON.parse(await readFile(STAMPS, 'utf8')) : {};
const templateHash = createHash('sha1').update(await readFile(TEMPLATE)).digest('hex');

let browser = null;
let failed = 0;

for (const video of VIDEOS) {
  try {
    if (video.cover) {
      if (!browser) {
        try { browser = await launchBrowser(); }
        catch (err) { browser = { render: () => { throw err; }, close: async () => {} }; }
      }
      await designedCover(video, browser, stamps, templateHash);
    } else {
      await youtubeCover(video);
    }
  } catch (err) {
    // Not fatal: a committed cover from an earlier run still stands, and
    // a deploy shouldn't fail because YouTube or a browser was unavailable.
    failed++;
    console.warn(`  ✗ ${video.title} — ${err.message}`);
  }
}

if (browser) await browser.close();
await writeFile(STAMPS, JSON.stringify(stamps, null, 2) + '\n');
console.log(failed ? `\n${failed} cover(s) not built\n` : '');
