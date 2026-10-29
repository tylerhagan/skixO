// ─────────────────────────────────────────────
// audioEngine — singleton Web Audio playback + analysis
//
// Plays locally-hosted track excerpts (tracks with an `audioSrc`)
// through an <audio> element wired into an AnalyserNode, and exposes
// per-frame levels for the reactive visuals. SoundCloud-embed tracks
// bypass this entirely (iframes are cross-origin, not analysable).
//
// The AudioContext is created lazily on the first play() call, which
// always happens inside a user gesture — required by autoplay policy.
//
// While audio plays, the global `--amp` CSS custom property on <html>
// tracks the smoothed signal amplitude (0–1) so plain CSS can react.
//
// Also: a throttled 'time' event ({ currentTime, duration }) for the mini
// player's progress bar, seek(), and static(on): quiet pink noise for the
// tuner, generated in the graph (never a file) and wired straight to the
// output, past the analyser, so tuning noise never drives the visuals.
// ─────────────────────────────────────────────

const FFT_SIZE = 2048;
const BIN_COUNT = 24; // log-ish spaced bands published for bar visuals
const TIME_EVERY_MS = 250; // 'time' event throttle — a 2px bar needs no more
const STATIC_GAIN = 0.08;
const STATIC_RAMP = 0.06; // seconds — no clicks in or out

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.el = null;
    this.analyser = null;
    this.freq = null;   // Uint8Array — frequency domain
    this.wave = null;   // Uint8Array — time domain
    this.bins = new Float32Array(BIN_COUNT);
    this.levels = { playing: false, amp: 0, bass: 0, mid: 0, high: 0, bins: this.bins, freq: null, wave: null };
    this.listeners = new Map();
    this.lastSample = -1;
    this.smoothedAmp = 0;
    this.ampRaf = 0;
    this.lastTime = 0;
    this.staticBuffer = null;
    this.staticVoice = null; // { src, gain } while static is sounding
    // Precompute log-spaced band edges over ~0–10kHz
    const maxBin = Math.floor((10000 / 22050) * (FFT_SIZE / 2));
    this.binEdges = Array.from({ length: BIN_COUNT + 1 }, (_, i) =>
      Math.max(i, Math.round(Math.pow(i / BIN_COUNT, 1.6) * maxBin))
    );
  }

  ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.el = new Audio();
    this.el.preload = 'auto';
    const source = this.ctx.createMediaElementSource(this.el);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = FFT_SIZE;
    this.analyser.smoothingTimeConstant = 0.82;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.9;
    source.connect(this.analyser);
    this.analyser.connect(gain);
    gain.connect(this.ctx.destination);
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.wave = new Uint8Array(this.analyser.fftSize);
    this.levels.freq = this.freq;
    this.levels.wave = this.wave;

    this.el.addEventListener('play', () => { this.levels.playing = true; this.emit('play'); this.runAmpLoop(); });
    this.el.addEventListener('pause', () => { this.levels.playing = false; this.emit('pause'); });
    this.el.addEventListener('ended', () => { this.levels.playing = false; this.emitTime(true); this.emit('ended'); });
    this.el.addEventListener('timeupdate', () => this.emitTime(false));
    this.el.addEventListener('durationchange', () => this.emitTime(true));
    this.el.addEventListener('emptied', () => this.emitTime(true));
  }

  emitTime(force) {
    const now = performance.now();
    if (!force && now - this.lastTime < TIME_EVERY_MS) return;
    this.lastTime = now;
    const d = this.el.duration;
    this.emit('time', { currentTime: this.el.currentTime || 0, duration: Number.isFinite(d) ? d : 0 });
  }

  // fraction 0–1 of the loaded excerpt
  seek(fraction) {
    const d = this.el?.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    this.el.currentTime = Math.min(d - 0.05, Math.max(0, fraction * d));
    this.emitTime(true);
  }

  // Pink noise (Paul Kellet's filter over white), two seconds, looped.
  makeStaticBuffer() {
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const out = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    return buf;
  }

  // Only ever called on from a pointer gesture (the tuner's pointerdown),
  // so creating/resuming the context here satisfies autoplay policy.
  static(on) {
    if (on) {
      if (this.staticVoice) return;
      this.ensure();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      if (!this.staticBuffer) this.staticBuffer = this.makeStaticBuffer();
      const src = this.ctx.createBufferSource();
      src.buffer = this.staticBuffer;
      src.loop = true;
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(STATIC_GAIN, t + STATIC_RAMP);
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(t, Math.random() * 2); // random phase: no audible loop seam on repeat drags
      this.staticVoice = { src, gain };
    } else {
      const v = this.staticVoice;
      if (!v) return;
      this.staticVoice = null;
      const t = this.ctx.currentTime;
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setValueAtTime(v.gain.gain.value, t);
      v.gain.gain.linearRampToValueAtTime(0, t + STATIC_RAMP);
      v.src.stop(t + STATIC_RAMP + 0.02);
      v.src.onended = () => { v.src.disconnect(); v.gain.disconnect(); };
    }
  }

  async play(src) {
    this.ensure();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (src) {
      const abs = new URL(src, window.location.href).href;
      if (this.el.src !== abs) this.el.src = abs;
    }
    await this.el.play();
  }

  pause() {
    this.el?.pause();
  }

  stop() {
    if (!this.el) return;
    this.el.pause();
    this.el.currentTime = 0;
  }

  get playing() {
    return this.levels.playing;
  }

  // Compute levels at most once per frame; safe to call from many rAF loops.
  sample() {
    if (!this.analyser) return this.levels;
    const now = performance.now();
    if (now - this.lastSample < 4) return this.levels;
    this.lastSample = now;

    this.analyser.getByteFrequencyData(this.freq);
    this.analyser.getByteTimeDomainData(this.wave);

    for (let b = 0; b < BIN_COUNT; b++) {
      let max = 0;
      for (let i = this.binEdges[b]; i <= this.binEdges[b + 1]; i++) {
        if (this.freq[i] > max) max = this.freq[i];
      }
      this.bins[b] = max / 255;
    }

    const band = (fromHz, toHz) => {
      const from = Math.floor((fromHz / 22050) * this.freq.length);
      const to = Math.min(this.freq.length, Math.ceil((toHz / 22050) * this.freq.length));
      let sum = 0;
      for (let i = from; i < to; i++) sum += this.freq[i];
      return sum / ((to - from) * 255) || 0;
    };

    this.levels.bass = band(20, 150);
    this.levels.mid = band(150, 2000);
    this.levels.high = band(2000, 9000);
    this.levels.amp = Math.min(1, this.levels.bass * 0.55 + this.levels.mid * 0.35 + this.levels.high * 0.25);
    return this.levels;
  }

  // Keeps --amp on <html> in sync while playing, decays it to 0 after.
  runAmpLoop() {
    if (this.ampRaf) return;
    const tick = () => {
      const { amp, playing } = this.sample();
      const target = playing ? amp : 0;
      this.smoothedAmp += (target - this.smoothedAmp) * 0.12;
      if (!playing && this.smoothedAmp < 0.005) {
        this.smoothedAmp = 0;
        document.documentElement.style.setProperty('--amp', '0');
        this.ampRaf = 0;
        return;
      }
      document.documentElement.style.setProperty('--amp', this.smoothedAmp.toFixed(3));
      this.ampRaf = requestAnimationFrame(tick);
    };
    this.ampRaf = requestAnimationFrame(tick);
  }

  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(cb);
    return () => this.listeners.get(event).delete(cb);
  }

  emit(event, detail) {
    this.listeners.get(event)?.forEach(cb => cb(detail));
  }
}

export const audioEngine = new AudioEngine();
