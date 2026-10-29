import { useState } from 'react';
import { useLang } from '../hooks/useLang';
import styles from './LazyFrame.module.css';

// Facade for third-party embeds: shows a lightweight placeholder and only
// injects the (heavy) iframe once the user actually clicks.
//
// With `thumb`, the placeholder is the artwork with a centred play button
// (YouTube). Without one it is a slim strip at the embed's own height,
// labelled with `label` (SoundCloud, Spotify), so the page does not jump
// when the real player swaps in.
export default function LazyFrame({ src, title, thumb, label, height, aspect = '16 / 9' }) {
  const { t } = useLang();
  const [active, setActive] = useState(false);

  const style = height
    ? { height: `${height}px` }
    : { aspectRatio: aspect };

  if (active) {
    return (
      <div className={styles.frame} style={style}>
        <iframe
          src={src}
          title={title}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (!thumb) {
    return (
      <button
        type="button"
        className={`${styles.facade} ${styles.strip}`}
        style={style}
        onClick={() => setActive(true)}
        aria-label={`${t('Load player', '載入播放器')}: ${label || ''} ${title}`.trim()}
      >
        <span className={styles.scanlines} />
        <span className={styles.stripPlay}>▶</span>
        <span className={styles.stripText}>
          {label && <span className={styles.stripLabel}>{label}</span>}
          <span className={styles.stripTitle}>{title}</span>
        </span>
        <span className={styles.stripHint}>{t('TAP TO DECODE', '點擊解碼')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.facade}
      style={style}
      onClick={() => setActive(true)}
      aria-label={`${t('Play', '播放')}: ${title}`}
    >
      <img src={thumb} alt="" className={styles.thumb} loading="lazy" />
      <span className={styles.overlay} />
      <span className={styles.scanlines} />
      <span className={styles.playBtn}>▶</span>
      <span className={styles.hint}>{t('TAP TO DECODE', '點擊解碼')}</span>
    </button>
  );
}
