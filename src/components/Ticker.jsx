import { tickerItems } from '../data/siteData';
import styles from './Ticker.module.css';

// Scrolling "now broadcasting" strip. The reel is two identical halves
// and scrolls by exactly -50%, so the seam is invisible. Each half is
// its own element with min-width:100% and space-around, which is what
// keeps a short list spread across the full strip instead of packing
// left and leaving a dead zone. The copy is decorative, so it's one
// list for screen readers.
export default function Ticker() {
  const half = (
    <div className={styles.half}>
      {tickerItems.map((item, i) => (
        <span key={i} className={styles.item}>
          {item}
          <span className={styles.sep}>✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.ticker} aria-label={tickerItems.join(' — ')}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        LIVE
      </div>
      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.reel}>
          {half}
          {half}
        </div>
      </div>
    </div>
  );
}
