import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';
import { useLang } from '../hooks/useLang';
import { audioEngine } from '../lib/audioEngine';
import styles from './MiniPlayer.module.css';

const BAR_COUNT = 24;
const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
  duration: `${0.35 + (i % 6) * 0.08}s`,
  delay:    `${(i * 0.06) % 0.6}s`,
  max:      `${18 + (i % 5) * 7}px`,
}));

// Real spectrum bars for local tracks — driven straight off the analyser
// via refs + rAF (no React re-renders at frame rate).
function LiveBars({ active }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let raf;
    const step = () => {
      const { bins } = audioEngine.sample();
      const spans = wrapRef.current?.children;
      if (spans) {
        for (let i = 0; i < spans.length; i++) {
          const v = bins[i] ?? 0;
          spans[i].style.transform = `scaleY(${0.08 + v * 0.92})`;
          spans[i].style.opacity = 0.25 + v * 0.65;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className={styles.wave} ref={wrapRef} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span key={i} className={styles.liveBar} />
      ))}
    </div>
  );
}

export default function MiniPlayer() {
  const { track, setTrack, playing, toggle } = usePlayer();
  const { t } = useLang();
  const [stopped, setStopped] = useState(false); // embed mode only
  const [lastTrack, setLastTrack] = useState(null);
  const isLocal = !!track?.audioSrc;

  // Reset stopped state whenever a new track is loaded
  if (track !== lastTrack) {
    setLastTrack(track);
    if (stopped) setStopped(false);
  }

  const iframeSrc = useMemo(() => {
    if (!track || isLocal) return null;
    const encoded = encodeURIComponent(track.url);
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23cc0000&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
  }, [track, isLocal]);

  const displayTitle = track
    ? (track.titleZh && track.title !== track.titleZh
        ? `${track.title} ${track.titleZh}`
        : track.title)
    : '';

  const paused = isLocal ? !playing : stopped;

  return (
    <>
      {/* Embed mode only: hidden iframe — removed when stopped, restores auto-play on resume */}
      {track && !isLocal && !stopped && (
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
                <span className={`${styles.playDot} ${paused ? styles.playDotStopped : ''}`}>
                  {paused ? '◼' : '▓'}
                </span>
                <div className={styles.text}>
                  <span className={styles.title}>{displayTitle}</span>
                  <span className={styles.sub}>
                    {track.subtitle}
                    {isLocal && <span className={styles.excerptTag}> · {t('EXCERPT', '節錄')}</span>}
                  </span>
                </div>
              </div>

              {/* Waveform — real analyser data for local tracks, CSS loop for embeds */}
              {isLocal ? (
                <LiveBars active={playing} />
              ) : (
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
              )}

              {/* Actions */}
              <div className={styles.actions}>
                {track.url && (
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.scLink}
                  >
                    {t('OPEN IN SOUNDCLOUD ↗', '在 SOUNDCLOUD 收聽 ↗')}
                  </a>
                )}

                <button
                  className={styles.stopBtn}
                  onClick={() => (isLocal ? toggle() : setStopped(s => !s))}
                  aria-label={paused ? 'Resume' : 'Stop'}
                >
                  {paused ? '▶' : '■'}
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
