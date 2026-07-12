import { useState } from 'react';
import styles from './LazyFrame.module.css';

// Facade for third-party embeds: shows a lightweight thumbnail and only
// injects the (heavy) iframe once the user actually clicks play.
export default function LazyFrame({ src, title, thumb, height, aspect = '16 / 9' }) {
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

  return (
    <button
      type="button"
      className={styles.facade}
      style={style}
      onClick={() => setActive(true)}
      aria-label={`Play: ${title}`}
    >
      <img src={thumb} alt="" className={styles.thumb} loading="lazy" />
      <span className={styles.overlay} />
      <span className={styles.scanlines} />
      <span className={styles.playBtn}>▶</span>
      <span className={styles.hint}>TAP TO DECODE</span>
    </button>
  );
}
