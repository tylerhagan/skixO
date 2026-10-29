import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import GlitchMask from '../components/GlitchMask';
import styles from './SignalLost.module.css';

// 404 — a transmission that never arrives. Used as the router catch-all
// and by Release for unknown slugs.
export default function SignalLost() {
  const { t } = useLang();

  useEffect(() => {
    document.title = 'SIGNAL LOST — skixO';
    return () => { document.title = 'skixO'; };
  }, []);

  return (
    <main className={styles.lost}>
      {/* Waiting, not searching — the same rest pose from the footer. */}
      <img src="/mascot/cutout-peek-still.webp" alt="" aria-hidden="true" className={styles.mascot} />

      {/* The tuner's readout with nothing locked: same face, same scale
          as FrequencyDial, so a dead link reads as a dead station. */}
      <div className={styles.readout} aria-hidden="true">
        <span className={styles.freq}>404.0</span>
        <span className={styles.unit}>MHz</span>
        <span className={styles.status}>
          <GlitchMask size={18} />
          {/* zh: draft, needs native check */}
          {t('NO CARRIER', '無載波')}
        </span>
      </div>

      <h1 className={styles.title}>{t('SIGNAL LOST', '訊號遺失')}</h1>
      <p className={styles.text}>
        {t('No transmission found on this frequency.', '此頻率上找不到任何傳輸。')}
      </p>
      {/* zh: draft, needs native check */}
      <Link to="/" className={styles.back}>
        {t('RETUNE ↗', '重新調頻 ↗')}
      </Link>
    </main>
  );
}
