// ─────────────────────────────────────────────
// Waveform peaks extractor
//
// Reads WAV files from audio-src/ (gitignored — drop full-length
// DAW bounces here; they are analysed locally, never deployed)
// and writes normalized peak data to src/data/peaks.json, keyed by
// filename slug. Track cards look themselves up by their `slug`
// field in src/data/siteData.js, so name files to match:
//
//   audio-src/lights-in-your-eyes.wav  →  peaks["lights-in-your-eyes"]
//
// Supports PCM 16/24/32-bit and 32-bit float, mono or multi-channel.
// If audio-src/ is empty or missing, the committed peaks.json is
// left untouched (important: CI/Vercel has no audio-src/).
//
// Usage: node scripts/build-peaks.mjs
// ─────────────────────────────────────────────
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT, 'audio-src');
const OUT = join(ROOT, 'src', 'data', 'peaks.json');
const BUCKETS = 96;

if (!existsSync(SRC_DIR)) {
  console.log('audio-src/ not found — keeping existing peaks.json');
  process.exit(0);
}
const files = readdirSync(SRC_DIR).filter(f => extname(f).toLowerCase() === '.wav');
if (files.length === 0) {
  console.log('no .wav files in audio-src/ — keeping existing peaks.json');
  process.exit(0);
}

function parseWav(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('not a RIFF/WAVE file');
  }
  let fmt = null, dataOffset = -1, dataSize = 0;
  let pos = 12;
  while (pos + 8 <= buffer.length) {
    const id = buffer.toString('ascii', pos, pos + 4);
    const size = buffer.readUInt32LE(pos + 4);
    if (id === 'fmt ') {
      fmt = {
        format: buffer.readUInt16LE(pos + 8),
        channels: buffer.readUInt16LE(pos + 10),
        bits: buffer.readUInt16LE(pos + 22),
      };
    } else if (id === 'data') {
      dataOffset = pos + 8;
      dataSize = size;
    }
    pos += 8 + size + (size % 2); // chunks are word-aligned
  }
  if (!fmt || dataOffset < 0) throw new Error('missing fmt/data chunk');
  return { ...fmt, dataOffset, dataSize };
}

function samplePeaks(buffer, wav) {
  const bytesPer = wav.bits / 8;
  const frameSize = bytesPer * wav.channels;
  const frames = Math.floor(wav.dataSize / frameSize);
  const peaks = new Array(BUCKETS).fill(0);
  const perBucket = frames / BUCKETS;
  // WAVE_FORMAT_EXTENSIBLE (65534) wraps PCM/float; bit depth disambiguates
  const isFloat = wav.format === 3 || (wav.format === 65534 && wav.bits === 32);

  for (let f = 0; f < frames; f++) {
    let maxCh = 0;
    for (let c = 0; c < wav.channels; c++) {
      const o = wav.dataOffset + f * frameSize + c * bytesPer;
      let v;
      if (isFloat) v = buffer.readFloatLE(o);
      else if (wav.bits === 16) v = buffer.readInt16LE(o) / 32768;
      else if (wav.bits === 24) v = ((buffer.readUInt8(o) | (buffer.readUInt8(o + 1) << 8) | (buffer.readInt8(o + 2) << 16))) / 8388608;
      else if (wav.bits === 32) v = buffer.readInt32LE(o) / 2147483648;
      else throw new Error(`unsupported bit depth: ${wav.bits}`);
      maxCh = Math.max(maxCh, Math.abs(v));
    }
    const bucket = Math.min(BUCKETS - 1, Math.floor(f / perBucket));
    peaks[bucket] = Math.max(peaks[bucket], maxCh);
  }
  const top = Math.max(...peaks, 1e-9);
  return peaks.map(p => Math.round((p / top) * 100) / 100);
}

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const result = { ...existing };

for (const file of files) {
  const slug = basename(file, extname(file)).toLowerCase();
  try {
    const buffer = readFileSync(join(SRC_DIR, file));
    const wav = parseWav(buffer);
    result[slug] = samplePeaks(buffer, wav);
    console.log(`✓ ${slug} (${wav.bits}-bit, ${wav.channels}ch)`);
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

writeFileSync(OUT, JSON.stringify(result) + '\n');
console.log(`wrote ${Object.keys(result).length} track(s) → src/data/peaks.json`);
