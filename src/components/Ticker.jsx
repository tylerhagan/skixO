import { tickerItems } from '../data/siteData';
import styles from './Ticker.module.css';

// Scrolling "now broadcasting" strip. Content is duplicated so the
// marquee loops seamlessly; the copy is decorative, so it's one list
// for screen readers.
export default function Ticker() {
  const items = [...tickerItems, ...tickerItems];

  return (
    <div className={styles.ticker} aria-label={tickerItems.join(' — ')}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        LIVE
      </div>
      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.reel}>
          {items.map((item, i) => (
            <span key={i} className={styles.item}>
              {item}
              <span className={styles.sep}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
