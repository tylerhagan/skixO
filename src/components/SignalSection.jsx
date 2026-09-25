import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { tracks } from '../data/siteData';
import peaks from '../data/peaks.json';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import SectionTag from './SectionTag';
import styles from './SignalSection.module.css';

export default function SignalSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} id="signal" ref={ref}>
      <SectionTag en="SELECTED" zh="精選" />

      <motion.div
        className={styles.selectedNote}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.1 }}
      >
        04 / 17
      </motion.div>

      <motion.p
        className={styles.intro}
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        {t(
          'He arrived through the cracks in someone else\'s music.\u00a0Then he stopped asking permission.',
          '他從他人音樂的裂縫中出現。然後他不再征求許可。'
        )}
      </motion.p>

      {/* No catalogue link — the CATALOGUE section follows immediately below. */}
      <div className={styles.list}>
        {tracks.map((track, i) => (
          <TrackCard key={track.id} track={track} index={i} inView={inView} />
        ))}
      </div>
    </section>
  );
}

// Deterministic bar heights from track id seed — fallback for tracks
// without real peak data in src/data/peaks.json
function waveBarHeights(seed, count = 24) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Array.from({ length: count }, (_, i) => {
    h = (Math.imul(31, h) + i * 13) | 0;
    return 20 + (Math.abs(h) % 80); // 20–100% height
  });
}

// Real waveform shape from precomputed peaks (see scripts/build-peaks.mjs),
// downsampled to the card's bar count by taking the max of each group.
function peakBarHeights(slug, count = 24) {
  const data = peaks[slug];
  if (!data?.length) return null;
  const per = data.length / count;
  return Array.from({ length: count }, (_, i) => {
    let max = 0;
    for (let j = Math.floor(i * per); j < Math.floor((i + 1) * per); j++) {
      if (data[j] > max) max = data[j];
    }
    return 20 + max * 80; // same 20–100% range as the fallback
  });
}

function TrackCard({ track, index, inView }) {
  const { t } = useLang();
  const { track: current, setTrack, live } = usePlayer();
  const [hovered, setHovered] = useState(false);
  const heights = peakBarHeights(track.slug) ?? waveBarHeights(track.id + track.title);
  // Loaded vs actually playing: stopping from the mini player keeps the
  // track loaded, and used to leave this card claiming ▓ PLAYING.
  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && live;
  const choose = () => setTrack(isCurrent ? null : track);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-pressed={isCurrent}
      className={`${styles.card} ${isCurrent ? styles.cardPlaying : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.2 + index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={choose}
      onKeyDown={e => {
        // Space as well as Enter — native button behaviour, which
        // role="button" promises but doesn't provide on its own.
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
      }}
    >
      <span className={styles.cardNum}>{track.id}</span>

      <div className={styles.cardInfo}>
        <div className={styles.cardTitle}>
          {track.title}
          {track.titleZh && (
            <span className={styles.cardZh}> {track.titleZh}</span>
          )}
        </div>
        <div className={styles.cardSub}>{track.subtitle}</div>
      </div>

      {/* Waveform — animates on hover and while the track plays */}
      <div className={`${styles.waveform} ${isPlaying ? styles.waveformLive : ''}`} aria-hidden="true">
        {heights.map((h, i) => (
          <motion.span
            key={i}
            className={styles.waveBar}
            animate={hovered || isPlaying ? {
              scaleY: [1, (0.3 + (h / 100) * 0.7) * (0.6 + Math.sin(i * 0.8) * 0.4), 1],
              opacity: 1,
            } : {
              scaleY: h / 100 * 0.35,
              opacity: 0.25,
            }}
            transition={hovered || isPlaying ? {
              duration: 0.5 + (i % 4) * 0.1,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: i * 0.03,
            } : { duration: 0.3 }}
          />
        ))}
      </div>

      <span className={styles.cardDate}>{track.date}</span>

      <span className={`${styles.cardListen} ${isPlaying ? styles.cardListenActive : ''}`}>
        {isPlaying ? `▓ ${t('PLAYING', '播放中')}` : `${t('LISTEN', '收聽')} ↗`}
      </span>

      {/* Hover underline */}
      <motion.span
        className={styles.cardLine}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered || isPlaying ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
