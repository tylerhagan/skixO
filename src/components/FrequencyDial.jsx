import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuredRelease } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import { scrollToId } from '../lib/scroll';
import styles from './FrequencyDial.module.css';

const MIN = 170;
const MAX = 180;
const SNAP = 0.2; // how close a release must be to lock a station

// Stations on the band. `hidden` ones get no label — they're found by ear.
const STATIONS = [
  { freq: 171.2, id: 'archive', label: { en: 'ARCHIVE', zh: '檔案庫' } },
  { freq: 174.0, id: 'signal', label: { en: 'PRØVE — LIVE SIGNAL', zh: 'PRØVE — 即時訊號' } },
  { freq: 177.7, id: 'backchannel', label: { en: '…BACK CHANNEL FOUND', zh: '…發現後方頻道' }, hidden: true },
];

export default function FrequencyDial() {
  const { t } = useLang();
  const { setTrack, live } = usePlayer();
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const lastActivated = useRef(null);
  const [freq, setFreq] = useState(172.4);
  const [dragging, setDragging] = useState(false);

  const locked = STATIONS.find(s => Math.abs(s.freq - freq) < 0.001);

  const activate = useCallback(station => {
    if (lastActivated.current === station.id) return;
    lastActivated.current = station.id;
    if (station.id === 'signal') {
      setTrack({
        id: 'featured',
        title: featuredRelease.title,
        subtitle: `feat. ${featuredRelease.feat}`,
        url: featuredRelease.soundcloudUrl,
        audioSrc: featuredRelease.audioSrc,
      });
    } else if (station.id === 'archive') {
      scrollToId('catalogue');
    } else if (station.id === 'backchannel') {
      setTimeout(() => navigate('/console'), 900);
    }
  }, [setTrack, navigate]);

  const settle = useCallback(f => {
    const near = STATIONS.find(s => Math.abs(s.freq - f) <= SNAP);
    if (near) {
      setFreq(near.freq);
      activate(near);
    } else {
      setFreq(f);
      lastActivated.current = null;
    }
  }, [activate]);

  const freqFromEvent = e => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    return Math.round((MIN + pct * (MAX - MIN)) * 10) / 10;
  };

  const onPointerDown = e => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setFreq(freqFromEvent(e));
  };
  const onPointerMove = e => { if (dragging) setFreq(freqFromEvent(e)); };
  const onPointerUp = e => {
    setDragging(false);
    settle(freqFromEvent(e));
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
    const f = Math.round(Math.min(MAX, Math.max(MIN, freq + step)) * 10) / 10;
    setFreq(f);
    const exact = STATIONS.find(s => Math.abs(s.freq - f) < 0.001);
    if (exact) activate(exact);
    else lastActivated.current = null;
  };

  const pct = ((freq - MIN) / (MAX - MIN)) * 100;
  const ticks = Array.from({ length: (MAX - MIN) * 2 + 1 }, (_, i) => MIN + i * 0.5);

  return (
    <div className={styles.dial}>
      {/* Readout */}
      <div className={styles.readout}>
        <span className={`${styles.freq} ${!locked ? styles.freqDrifting : ''}`}>
          {freq.toFixed(1)}
        </span>
        <span className={styles.unit}>MHz</span>
        <span className={`${styles.status} ${locked ? styles.statusLocked : ''}`}>
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
        {STATIONS.filter(s => !s.hidden).map(s => (
          <span
            key={s.id}
            className={styles.stationDot}
            style={{ left: `${((s.freq - MIN) / (MAX - MIN)) * 100}%` }}
          />
        ))}
        <span className={`${styles.needle} ${live ? styles.needleLive : ''}`} style={{ left: `${pct}%` }} />
      </div>

      <div className={styles.hint}>
        {t('DRAG TO TUNE — SOMETHING IS BROADCASTING', '拖曳調頻 — 有東西正在廣播')}
      </div>
    </div>
  );
}
