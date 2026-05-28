import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { tracks } from '../data/siteData';
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
      <SectionTag en="THE SIGNAL" zh="訊號" />

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

      <div className={styles.list}>
        {tracks.map((track, i) => (
          <TrackCard key={track.id} track={track} index={i} inView={inView} />
        ))}
      </div>

      <motion.div
        className={styles.catalogueRow}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
      >
        <a
          href="https://soundcloud.com/skixo"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.catalogueBtn}
        >
          {t('VIEW FULL CATALOGUE ↗', '查看完整目錄 ↗')}
        </a>
      </motion.div>
    </section>
  );
}

// Deterministic bar heights from track id seed
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

function TrackCard({ track, index, inView }) {
  const { t } = useLang();
  const { track: playing, setTrack } = usePlayer();
  const [hovered, setHovered] = useState(false);
  const heights = waveBarHeights(track.id + track.title);
  const isPlaying = playing?.id === track.id;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      className={`${styles.card} ${isPlaying ? styles.cardPlaying : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.2 + index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => setTrack(isPlaying ? null : track)}
      onKeyDown={e => e.key === 'Enter' && setTrack(isPlaying ? null : track)}
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

      {/* Waveform — visible on hover */}
      <div className={styles.waveform} aria-hidden="true">
        {heights.map((h, i) => (
          <motion.span
            key={i}
            className={styles.waveBar}
            animate={hovered ? {
              scaleY: [1, (0.3 + (h / 100) * 0.7) * (0.6 + Math.sin(i * 0.8) * 0.4), 1],
              opacity: 1,
            } : {
              scaleY: h / 100 * 0.35,
              opacity: 0.25,
            }}
            transition={hovered ? {
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
        {isPlaying ? '▓ PLAYING' : `${t('LISTEN', '收聽')} ↗`}
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
