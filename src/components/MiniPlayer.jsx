import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';
import { useLang } from '../hooks/useLang';
import styles from './MiniPlayer.module.css';

const BAR_COUNT = 24;
const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
  duration: `${0.35 + (i % 6) * 0.08}s`,
  delay:    `${(i * 0.06) % 0.6}s`,
  max:      `${18 + (i % 5) * 7}px`,
}));

export default function MiniPlayer() {
  const { track, setTrack } = usePlayer();
  const { t } = useLang();
  const [stopped, setStopped] = useState(false);

  // Reset stopped state whenever a new track is loaded
  useEffect(() => {
    if (track) setStopped(false);
  }, [track?.url]);

  const iframeSrc = useMemo(() => {
    if (!track) return null;
    const encoded = encodeURIComponent(track.url);
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23cc0000&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
  }, [track?.url]);

  const displayTitle = track
    ? (track.titleZh && track.title !== track.titleZh
        ? `${track.title} ${track.titleZh}`
        : track.title)
    : '';

  return (
    <>
      {/* Hidden iframe — removed when stopped, restores auto-play on resume */}
      {track && !stopped && (
        <iframe
          key={track.url}
          className={styles.iframe}
          src={iframeSrc}
          allow="autoplay"
          title="sc-player"
        />
      )}

      <AnimatePresence>
        {track && (
          <motion.div
            className={styles.player}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className={styles.topEdge} />

            <div className={styles.inner}>
              {/* Track info */}
              <div className={styles.info}>
                <span className={`${styles.playDot} ${stopped ? styles.playDotStopped : ''}`}>
                  {stopped ? '◼' : '▓'}
                </span>
                <div className={styles.text}>
                  <span className={styles.title}>{displayTitle}</span>
                  <span className={styles.sub}>{track.subtitle}</span>
                </div>
              </div>

              {/* Animated waveform — freezes when stopped */}
              <div className={styles.wave} aria-hidden="true">
                {bars.map((b, i) => (
                  <span
                    key={i}
                    className={`${styles.bar} ${stopped ? styles.barStopped : ''}`}
                    style={{
                      '--max-h': b.max,
                      animationDuration: b.duration,
                      animationDelay: b.delay,
                    }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.scLink}
                >
                  {t('OPEN IN SOUNDCLOUD ↗', '在 SOUNDCLOUD 收聽 ↗')}
                </a>

                <button
                  className={styles.stopBtn}
                  onClick={() => setStopped(s => !s)}
                  aria-label={stopped ? 'Resume' : 'Stop'}
                >
                  {stopped ? '▶' : '■'}
                </button>

                <button
                  className={styles.close}
                  onClick={() => setTrack(null)}
                  aria-label="Close player"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
