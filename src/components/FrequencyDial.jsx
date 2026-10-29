import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { releases, featured, displayTitle, toTrack } from '../data/releases';
import { secretTransmission } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import { audioEngine } from '../lib/audioEngine';
import { scrollToId } from '../lib/scroll';
import styles from './FrequencyDial.module.css';

const MIN = 170;
const MAX = 180;
const SNAP = 0.2; // how close a release must be to lock a station

// ── Stations ─────────────────────────────────
// Fixed: ARCHIVE (scrolls to the catalogue), the live signal (the
// featured release) and the hidden BACK CHANNEL (/console), plus the
// unlisted station, which only exists once it has been found.
//
// Every other release with a hosted excerpt (audioSrc) gets a station
// of its own, spread across the free band deterministically from its
// catalogue index, so a release keeps its frequency between visits and
// only moves if the catalogue order does. With no other excerpts yet the
// band is exactly the three fixed stations.
const ARCHIVE = { freq: 171.2, id: 'archive', label: { en: 'ARCHIVE', zh: '檔案庫' } };
const SIGNAL = {
  freq: 174.0,
  id: 'signal',
  label: {
    en: `${displayTitle(featured, 'en')} — LIVE SIGNAL`,
    zh: `${displayTitle(featured, 'zh')} — 即時訊號`,
  },
};
const BACKCHANNEL = { freq: 177.7, id: 'backchannel', label: { en: '…BACK CHANNEL FOUND', zh: '…發現後方頻道' }, hidden: true };
// zh: draft, needs native check
const UNLISTED = { freq: 179.3, id: 'unlisted', label: { en: '…UNLISTED', zh: '…未公開' } };

const BAND_LO = 170.4;
const BAND_HI = 179.6;
const KEEP_CLEAR = 0.4;
const RESERVED = [ARCHIVE.freq, SIGNAL.freq, BACKCHANNEL.freq, UNLISTED.freq];
const PHI = 0.6180339887;
const round1 = f => Math.round(f * 10) / 10;

function releaseStations() {
  const taken = [...RESERVED];
  const free = f => taken.every(x => Math.abs(x - f) >= KEEP_CLEAR - 1e-6);
  const slots = Math.round((BAND_HI - BAND_LO) * 10) + 1;
  const out = [];
  releases.forEach((r, i) => {
    if (!r.audioSrc || r === featured) return;
    // Golden-ratio scatter: neighbours in the catalogue land far apart.
    const start = Math.round(((i * PHI) % 1) * (slots - 1));
    for (let k = 0; k < slots; k++) {
      const f = round1(BAND_LO + ((start + k) % slots) / 10);
      if (!free(f)) continue;
      taken.push(f);
      out.push({
        freq: f,
        id: `release-${r.slug}`,
        release: r,
        label: { en: displayTitle(r, 'en'), zh: displayTitle(r, 'zh') },
      });
      return;
    }
    // Band full: the release simply has no station (still in the queue).
  });
  return out;
}
const RELEASE_STATIONS = releaseStations();

// ── Easter egg ───────────────────────────────
// Lock 171.2 → 177.7 → 174.0 (archive, back channel, live signal), in
// that order, within 20 seconds, by drag or keyboard. That opens the
// unlisted station at 179.3. Remembered per browser.
const SEQUENCE = ['archive', 'backchannel', 'signal'];
const SEQUENCE_WINDOW = 20000;
const UNLOCK_KEY = 'skixo:unlisted';
const STATIC_KEY = 'skixo:static';

// Departure stations (archive scrolls away, the back channel leaves the
// page) wait out a short dwell before acting, cancelled if the needle
// moves on. Without it, arrowing across 171.2 yanked the page to the
// catalogue mid-tune, and the sequence above could never get past 177.7.
const DWELL = 900;
const DWELL_PRIMED = 2500; // back channel, right after archive: time to move on

const readFlag = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
};
const writeFlag = (key, on) => {
  try { localStorage.setItem(key, on ? '1' : '0'); } catch { /* private mode */ }
};

export default function FrequencyDial() {
  const { t, lang } = useLang();
  const { setTrack, live } = usePlayer();
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const lastActivated = useRef(null);
  const pending = useRef(0);
  const history = useRef([]);
  const [freq, setFreq] = useState(172.4);
  const [dragging, setDragging] = useState(false);
  const [unlocked, setUnlocked] = useState(() => readFlag(UNLOCK_KEY, false));
  const [glitching, setGlitching] = useState(false);
  const [staticOn, setStaticOn] = useState(() => readFlag(STATIC_KEY, true));

  const stations = useMemo(
    () => [ARCHIVE, SIGNAL, BACKCHANNEL, ...RELEASE_STATIONS, ...(unlocked ? [UNLISTED] : [])],
    [unlocked],
  );

  const locked = stations.find(s => Math.abs(s.freq - freq) < 0.001);
  // For the static: the noise clears as soon as the needle is inside a
  // station's pull, a beat before it locks — hidden ones included, which
  // is how the back channel gets found by ear.
  const inPull = stations.some(s => Math.abs(s.freq - freq) <= SNAP);

  const cancelPending = () => {
    window.clearTimeout(pending.current);
    pending.current = 0;
  };

  const unlock = useCallback(() => {
    setUnlocked(true);
    writeFlag(UNLOCK_KEY, true);
    setGlitching(true);
    window.setTimeout(() => setGlitching(false), 1000);
  }, []);

  // Only the three sequence stations count: crossing a release station
  // on the way doesn't break it.
  const remember = useCallback(id => {
    if (!SEQUENCE.includes(id)) return false;
    const now = performance.now();
    const h = history.current;
    if (h[h.length - 1]?.id !== id) h.push({ id, at: now });
    if (h.length > 3) h.shift();
    const primed = h[h.length - 1].id === 'backchannel' && h[h.length - 2]?.id === 'archive';
    if (!unlocked && h.length === 3
      && h.every((x, i) => x.id === SEQUENCE[i])
      && h[2].at - h[0].at <= SEQUENCE_WINDOW) {
      unlock();
    }
    return primed;
  }, [unlocked, unlock]);

  const activate = useCallback(station => {
    if (lastActivated.current === station.id) return;
    lastActivated.current = station.id;
    cancelPending();
    const primed = remember(station.id);
    if (station.id === 'signal') {
      setTrack({ ...toTrack(featured, lang), id: 'featured' });
    } else if (station.id === 'archive') {
      pending.current = window.setTimeout(() => scrollToId('catalogue'), DWELL);
    } else if (station.id === 'backchannel') {
      pending.current = window.setTimeout(() => navigate('/console'), primed ? DWELL_PRIMED : DWELL);
    } else if (station.id === 'unlisted') {
      setTrack({
        id: 'unlisted',
        title: secretTransmission.title,
        subtitle: t('UNLISTED TRANSMISSION', '未公開傳輸'), // zh: draft, needs native check
        url: secretTransmission.url,
        audioSrc: secretTransmission.audioSrc,
      });
    } else if (station.release) {
      setTrack(toTrack(station.release, lang));
    }
  }, [setTrack, navigate, remember, lang, t]);

  const leave = () => {
    lastActivated.current = null;
    cancelPending();
  };

  const settle = useCallback(f => {
    const near = stations.find(s => Math.abs(s.freq - f) <= SNAP);
    if (near) {
      setFreq(near.freq);
      activate(near);
    } else {
      setFreq(f);
      lastActivated.current = null;
    }
  }, [activate, stations]);

  // Static between stations, while the needle is being dragged.
  const staticWanted = dragging && staticOn && !inPull;
  useEffect(() => {
    audioEngine.static(staticWanted);
  }, [staticWanted]);
  useEffect(() => () => {
    audioEngine.static(false);
    window.clearTimeout(pending.current);
  }, []);

  const freqFromEvent = e => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    return round1(MIN + pct * (MAX - MIN));
  };

  const onPointerDown = e => {
    e.currentTarget.setPointerCapture(e.pointerId);
    cancelPending();
    const f = freqFromEvent(e);
    setDragging(true);
    setFreq(f);
    // Start the noise inside the gesture itself: Safari only lets an
    // AudioContext start from within the handler, not an effect after it.
    if (staticOn && !stations.some(s => Math.abs(s.freq - f) <= SNAP)) audioEngine.static(true);
  };
  const onPointerMove = e => { if (dragging) setFreq(freqFromEvent(e)); };
  const onPointerUp = e => {
    setDragging(false);
    audioEngine.static(false);
    settle(freqFromEvent(e));
  };
  const onPointerCancel = () => {
    setDragging(false);
    audioEngine.static(false);
  };

  // Keyboard tuning is exact (no snap radius), otherwise ±0.1 steps
  // could never escape a station's pull.
  // The full ARIA slider key set — role="slider" tells screen-reader
  // users to expect Up/Down, Home/End and PageUp/Down, not just Left/Right.
  const KEY_STEP = {
    ArrowLeft: -0.1, ArrowDown: -0.1, ArrowRight: 0.1, ArrowUp: 0.1,
    PageDown: -1, PageUp: 1, Home: -Infinity, End: Infinity,
  };
  const onKeyDown = e => {
    const step = KEY_STEP[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const f = round1(Math.min(MAX, Math.max(MIN, freq + step)));
    setFreq(f);
    const exact = stations.find(s => Math.abs(s.freq - f) < 0.001);
    if (exact) activate(exact);
    else leave();
  };

  const toggleStatic = () => {
    setStaticOn(on => {
      writeFlag(STATIC_KEY, !on);
      return !on;
    });
  };

  const pct = ((freq - MIN) / (MAX - MIN)) * 100;
  const ticks = Array.from({ length: (MAX - MIN) * 2 + 1 }, (_, i) => MIN + i * 0.5);

  return (
    <div className={styles.dial}>
      {/* Readout */}
      <div className={`${styles.readout} ${glitching ? styles.readoutGlitch : ''}`}>
        <span className={`${styles.freq} ${!locked ? styles.freqDrifting : ''}`}>
          {freq.toFixed(1)}
        </span>
        <span className={styles.unit}>MHz</span>
        <span className={`${styles.status} ${locked ? styles.statusLocked : ''}`} aria-live="polite">
          {locked
            ? t(locked.label.en, locked.label.zh)
            : dragging
              ? t('SEARCHING…', '搜尋中…')
              : t('STATIC', '靜電噪音')}
        </span>
      </div>

      {/* Band */}
      <div
        ref={trackRef}
        className={styles.band}
        role="slider"
        tabIndex={0}
        aria-label={t('Frequency dial', '頻率轉盤')}
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={freq}
        aria-valuetext={`${freq.toFixed(1)} MHz`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
      >
        {ticks.map(f => (
          <span
            key={f}
            className={`${styles.tick} ${f % 2 === 0 ? styles.tickMajor : ''}`}
            style={{ left: `${((f - MIN) / (MAX - MIN)) * 100}%` }}
          >
            {f % 2 === 0 && <span className={styles.tickLabel}>{f.toFixed(0)}</span>}
          </span>
        ))}
        {stations.filter(s => !s.hidden).map(s => (
          <span
            key={s.id}
            className={`${styles.stationDot} ${s.id === 'unlisted' ? styles.stationDotNew : ''}`}
            style={{ left: `${((s.freq - MIN) / (MAX - MIN)) * 100}%` }}
          />
        ))}
        <span className={`${styles.needle} ${live ? styles.needleLive : ''}`} style={{ left: `${pct}%` }} />
      </div>

      <div className={styles.hint}>
        <span>{t('DRAG TO TUNE — SOMETHING IS BROADCASTING', '拖曳調頻 — 有東西正在廣播')}</span>
        <button
          type="button"
          className={styles.staticToggle}
          onClick={toggleStatic}
          aria-pressed={staticOn}
          aria-label={t('Static noise while tuning', '調頻時的靜電噪音')}
        >
          {staticOn ? t('STATIC ON', '雜訊 開') : t('STATIC OFF', '雜訊 關')}
        </button>
      </div>
    </div>
  );
}
