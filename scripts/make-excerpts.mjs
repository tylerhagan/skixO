// ─────────────────────────────────────────────
// skixO — release excerpts
// ─────────────────────────────────────────────
// Cuts the hosted 45s excerpts that the mini player, the queue and the
// tuner's stations play through the Web Audio engine.
//
//   audio-src/<slug>.wav   →   public/audio/<slug>.mp3
//
// For every release in src/data/releases.js with a WAV bounce in
// audio-src/ (gitignored, local only) and no MP3 yet (or --force):
//   - 45s from an offset: 25% into the track by default, or the
//     release's `excerpt: { start: seconds }` when set
//   - fade in 0.5s, fade out 1.5s
//   - loudness-normalised to about -14 LUFS (two-pass ffmpeg loudnorm)
//   - MP3, 128k, stereo (-ac 2 keeps mono bounces playable everywhere)
//
// Data stays explicit: the site never guesses that a file exists. After
// a run, the script prints the exact `audioSrc` lines to paste into
// releases.js.
//
// No ffmpeg, or no audio-src/ (Vercel, the cloud): skips with a one-line
// hint and exits 0, so it can never fail a build.
//
// Usage:  npm run audio:excerpts [-- --force] [-- --only=<slug>]
// Env:    AUDIO_SRC_DIR / AUDIO_OUT_DIR override the two folders
//         (used for testing the pipeline against a generated WAV).
// ─────────────────────────────────────────────

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { releases } from '../src/data/releases.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.resolve(process.env.AUDIO_SRC_DIR || path.join(ROOT, 'audio-src'));
const OUT = path.resolve(process.env.AUDIO_OUT_DIR || path.join(ROOT, 'public/audio'));
const force = process.argv.includes('--force');
const only = process.argv.find(a => a.startsWith('--only='))?.slice(7);

const LENGTH = 45;       // seconds
const FADE_IN = 0.5;
const FADE_OUT = 1.5;
const DEFAULT_OFFSET = 0.25; // fraction of the track
const LOUDNORM = 'I=-14:TP=-1.5:LRA=11';

const hasFfmpeg = () => {
  try {
    return spawnSync('ffmpeg', ['-hide_banner', '-version'], { stdio: 'ignore' }).status === 0;
  } catch {
    return false;
  }
};

if (!hasFfmpeg()) {
  console.log('audio:excerpts — ffmpeg not found on PATH, skipping (install it: winget install ffmpeg)');
  process.exit(0);
}
if (!existsSync(SRC)) {
  console.log(`audio:excerpts — no ${path.relative(ROOT, SRC) || SRC}/ folder, skipping (drop <slug>.wav bounces there)`);
  process.exit(0);
}

const run = args => new Promise((resolve, reject) => {
  const p = spawn('ffmpeg', ['-hide_banner', '-nostdin', ...args], { stdio: ['ignore', 'ignore', 'pipe'] });
  let err = '';
  p.stderr.on('data', d => { err += d; });
  p.on('error', reject);
  p.on('close', code => (code === 0 ? resolve(err) : reject(new Error(err.split('\n').slice(-6).join('\n')))));
});

// Duration from ffmpeg's own banner, so ffprobe isn't a second dependency.
const durationOf = async file => {
  const err = await run(['-i', file, '-f', 'null', '-t', '0', '-']);
  const m = err.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) throw new Error(`could not read the duration of ${file}`);
  return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
};

const cut = async (r, wav, mp3) => {
  const total = await durationOf(wav);
  const len = Math.min(LENGTH, total);
  const wanted = r.excerpt?.start ?? total * DEFAULT_OFFSET;
  const start = Math.max(0, Math.min(wanted, total - len));
  const trim = ['-ss', start.toFixed(3), '-t', len.toFixed(3), '-i', wav];

  // Pass 1: measure. Pass 2: linear gain from the measurement, so the
  // excerpt keeps its dynamics instead of being ridden by a compressor.
  const measure = await run([...trim, '-af', `loudnorm=${LOUDNORM}:print_format=json`, '-f', 'null', '-']);
  const json = measure.slice(measure.lastIndexOf('{'), measure.lastIndexOf('}') + 1);
  let m;
  try { m = JSON.parse(json); } catch { m = null; }
  const norm = m
    ? `loudnorm=${LOUDNORM}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`
    : `loudnorm=${LOUDNORM}`;
  // Fades after the gain stage, so the ends really reach silence.
  const fades = `afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${(len - FADE_OUT).toFixed(3)}:d=${FADE_OUT}`;

  await run([
    '-y', ...trim,
    '-af', `${norm},${fades}`,
    '-ar', '44100', '-ac', '2',
    '-codec:a', 'libmp3lame', '-b:a', '128k',
    '-map_metadata', '-1',
    mp3,
  ]);
  return { start, len, total };
};

mkdirSync(OUT, { recursive: true });

const made = [];
let skipped = 0;
let missing = 0;
for (const r of releases) {
  if (only && r.slug !== only) continue;
  const wav = path.join(SRC, `${r.slug}.wav`);
  const mp3 = path.join(OUT, `${r.slug}.mp3`);
  if (!existsSync(wav)) { missing++; continue; }
  if (existsSync(mp3) && !force) { skipped++; continue; }
  try {
    const { start, len } = await cut(r, wav, mp3);
    const kb = (statSync(mp3).size / 1024).toFixed(0);
    console.log(`  ✓ ${r.slug}.mp3  ${len.toFixed(0)}s from ${start.toFixed(1)}s  ${kb}KB`);
    made.push(r);
  } catch (e) {
    console.error(`  ✗ ${r.slug}: ${e.message}`);
  }
}

console.log(`audio:excerpts — ${made.length} cut, ${skipped} already there (--force to redo), ${missing} without a WAV`);

const toSet = made.filter(r => r.audioSrc !== `/audio/${r.slug}.mp3`);
if (toSet.length) {
  console.log('\nNow set these in src/data/releases.js (the site only plays what the data names):');
  for (const r of toSet) {
    console.log(`  ${r.slug.padEnd(22)} audioSrc: '/audio/${r.slug}.mp3',`);
  }
}
