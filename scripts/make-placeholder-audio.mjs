// ─────────────────────────────────────────────
// Placeholder signal — synthesizes a 174 BPM liquid-DnB-ish loop
// so the audio-reactive pipeline can be developed and demoed
// before real track excerpts are bounced from the DAW.
//
// Output: public/audio/placeholder-signal.wav (gitignored). Manual
// only — `npm run audio:placeholder`. It used to run on every build via
// prebuild, but featuredRelease now points at the real excerpt
// (prove-clip.mp3), so nothing references the placeholder, and since
// Vite copies public/ verbatim it was shipping 2.9 MB of unused WAV to
// production on every deploy. Delete the local copy once you're done
// with it for the same reason.
//
// Usage: node scripts/make-placeholder-audio.mjs [--force]
// ─────────────────────────────────────────────
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio', 'placeholder-signal.wav');

if (existsSync(OUT) && !process.argv.includes('--force')) {
  console.log('placeholder-signal.wav already exists — skipping (use --force to regenerate)');
  process.exit(0);
}

const SR = 44100;
const BPM = 174;
const STEP = 60 / BPM / 4;          // 16th note
const BARS = 24;
const LEN = Math.ceil(BARS * 16 * STEP * SR);
const buf = new Float32Array(LEN);

const TAU = Math.PI * 2;

// F minor-ish sub bassline, one note per half-bar, 4-bar phrase
const SUB_NOTES = [43.65, 43.65, 51.91, 38.89, 43.65, 43.65, 58.27, 51.91]; // F1 F1 Ab1 Eb1 F1 F1 Bb1 Ab1

function addKick(at) {
  const start = Math.floor(at * SR);
  let phase = 0;
  for (let n = 0; n < 0.28 * SR && start + n < LEN; n++) {
    const t = n / SR;
    const f = 42 + 120 * Math.exp(-t * 26);
    phase += (TAU * f) / SR;
    buf[start + n] += Math.sin(phase) * Math.exp(-t * 11) * 0.85;
  }
}

function addSnare(at) {
  const start = Math.floor(at * SR);
  let body = 0;
  for (let n = 0; n < 0.16 * SR && start + n < LEN; n++) {
    const t = n / SR;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 24) * 0.34;
    body += (TAU * 185) / SR;
    const tone = Math.sin(body) * Math.exp(-t * 30) * 0.25;
    buf[start + n] += noise + tone;
  }
}

function addHat(at, open) {
  const start = Math.floor(at * SR);
  const dur = open ? 0.08 : 0.03;
  let prev = 0, hp = 0;
  for (let n = 0; n < dur * SR && start + n < LEN; n++) {
    const t = n / SR;
    const x = Math.random() * 2 - 1;
    hp = x - prev + 0.92 * hp; // crude high-pass
    prev = x;
    buf[start + n] += hp * Math.exp(-t * (open ? 40 : 90)) * 0.09;
  }
}

// Drum pattern: 2-step — kick on 1, snares on 5 & 13, ghost kick at 11
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * 16 * STEP;
  const drumsIn = bar >= 4; // 4-bar pad intro before the beat drops
  if (drumsIn) {
    addKick(t0);
    addKick(t0 + 10 * STEP);
    addSnare(t0 + 4 * STEP);
    addSnare(t0 + 12 * STEP);
    for (let s = 1; s < 16; s += 2) addHat(t0 + s * STEP, s === 15);
  }
}

// Continuous sub with portamento + gentle LFO
{
  let phase = 0, freq = SUB_NOTES[0];
  for (let n = 0; n < LEN; n++) {
    const t = n / SR;
    const half = Math.floor(t / (8 * STEP));
    const target = SUB_NOTES[half % SUB_NOTES.length];
    freq += (target - freq) * 0.0004;
    phase += (TAU * freq) / SR;
    const inSection = t > 4 * 16 * STEP ? 1 : 0.4;
    buf[n] += Math.tanh(Math.sin(phase) * 1.6) * 0.2 * inSection * (0.9 + 0.1 * Math.sin(TAU * 0.6 * t));
  }
}

// Airy pad — Fm triad, slow AM shimmer
{
  const freqs = [174.61, 207.65, 261.63, 349.23]; // F3 Ab3 C4 F4
  const phases = freqs.map(() => Math.random() * TAU);
  for (let n = 0; n < LEN; n++) {
    const t = n / SR;
    let s = 0;
    for (let i = 0; i < freqs.length; i++) {
      phases[i] += (TAU * freqs[i] * (1 + 0.0012 * Math.sin(TAU * 0.11 * t + i))) / SR;
      s += Math.sin(phases[i]) * (0.5 + 0.5 * Math.sin(TAU * (0.07 + i * 0.03) * t));
    }
    buf[n] += s * 0.035;
  }
}

// Fade in/out + normalize
const FADE = Math.floor(0.8 * SR);
for (let n = 0; n < FADE; n++) {
  buf[n] *= n / FADE;
  buf[LEN - 1 - n] *= n / FADE;
}
let peak = 0;
for (let n = 0; n < LEN; n++) peak = Math.max(peak, Math.abs(buf[n]));
const norm = 0.89 / peak;

// Write 16-bit PCM mono WAV
const data = Buffer.alloc(44 + LEN * 2);
data.write('RIFF', 0); data.writeUInt32LE(36 + LEN * 2, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
data.writeUInt16LE(1, 22); data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28);
data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(LEN * 2, 40);
for (let n = 0; n < LEN; n++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[n] * norm)) * 32767), 44 + n * 2);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, data);
console.log(`wrote ${OUT} (${(data.length / 1024 / 1024).toFixed(1)} MB, ${(LEN / SR).toFixed(1)}s @ ${BPM} BPM)`);
