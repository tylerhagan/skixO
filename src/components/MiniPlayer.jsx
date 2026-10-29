import { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  // Embed-mode stop state lives in PlayerContext (reset there by setTrack)
  // so the rest of the site can tell a stopped embed from a playing one.
  const {
    track, setTrack, playing, toggle, embedStopped: stopped, setEmbedStopped: setStopped,
    next, prev, hasNext, hasPrev, progress, duration, seek,
  } = usePlayer();
  const { t } = useLang();
  const reduced = useReducedMotion();
  const isLocal = !!track?.audioSrc;

  // Keep the page's last content (the Tune In channel cards, the footer)
  // reachable above the fixed bar: MiniPlayer.module.css pads <body> by
  // --mini-player-h while this class is on <html>.
  const visible = !!track;
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('has-mini-player', visible);
    return () => root.classList.remove('has-mini-player');
  }, [visible]);

  const iframeSrc = useMemo(() => {
    if (!track || isLocal) return null;
    const encoded = encodeURIComponent(track.url);
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23E8612C&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
  }, [track, isLocal]);

  const displayTitle = track
    ? (track.titleZh && track.title !== track.titleZh
        ? `${track.title} ${track.titleZh}`
        : track.title)
    : '';

  const paused = isLocal ? !playing : stopped;
  const linkIsSoundcloud = !!track?.url?.includes('soundcloud.com');

  // Clickable + keyboard seek on the progress bar (local excerpts only;
  // an embed reports no position across the iframe boundary).
  const barRef = useRef(null);
  const seekFromPointer = e => {
    const rect = barRef.current.getBoundingClientRect();
    seek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };
  const onSeekKey = e => {
    const step = { ArrowLeft: -0.05, ArrowDown: -0.05, ArrowRight: 0.05, ArrowUp: 0.05, Home: -1, End: 1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    seek(e.key === 'Home' ? 0 : e.key === 'End' ? 0.999 : progress + step);
  };
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

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
            className={`${styles.player} ${paused ? styles.playerPaused : ''}`}
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={reduced ? { duration: 0.15 } : { type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className={styles.topEdge} />

            {isLocal && (
              <div
                ref={barRef}
                className={styles.progress}
                role="slider"
                tabIndex={0}
                aria-label={t('Seek', '跳轉')}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(progress * duration)}
                aria-valuetext={`${fmt(progress * duration)} / ${fmt(duration)}`}
                onPointerDown={seekFromPointer}
                onKeyDown={onSeekKey}
              >
                <span className={styles.progressFill} style={{ transform: `scaleX(${progress})` }} />
              </div>
            )}

            <div className={styles.inner}>
              {/* Track info */}
              <div className={styles.info}>
                {track.artwork ? (
                  <img className={styles.cover} src={track.artwork} alt="" width="40" height="40" />
                ) : (
                  <span className={`${styles.playDot} ${paused ? styles.playDotStopped : ''}`}>
                    {paused ? '◼' : '▓'}
                  </span>
                )}
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
                    {linkIsSoundcloud
                      ? t('OPEN IN SOUNDCLOUD ↗', '在 SOUNDCLOUD 收聽 ↗')
                      : t('OPEN ON YOUTUBE ↗', '在 YOUTUBE 觀看 ↗')}
                  </a>
                )}

                <div className={styles.transport}>
                  <button
                    className={styles.stopBtn}
                    onClick={prev}
                    disabled={!hasPrev}
                    aria-label={t('Previous track', '上一首')}
                  >
                    <span aria-hidden="true">|◀</span>
                  </button>
                  <button
                    className={styles.stopBtn}
                    onClick={() => (isLocal ? toggle() : setStopped(s => !s))}
                    aria-label={paused ? t('Play', '播放') : (isLocal ? t('Pause', '暫停') : t('Stop', '停止'))}
                  >
                    {paused ? '▶' : (isLocal ? '❚❚' : '■')}
                  </button>
                  <button
                    className={styles.stopBtn}
                    onClick={next}
                    disabled={!hasNext}
                    aria-label={t('Next track', '下一首')}
                  >
                    <span aria-hidden="true">▶|</span>
                  </button>
                </div>

                <button
                  className={styles.close}
                  onClick={() => setTrack(null)}
                  aria-label={t('Close player', '關閉播放器')}
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
