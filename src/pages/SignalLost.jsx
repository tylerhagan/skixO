import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import GlitchMask from '../components/GlitchMask';
import styles from './Release.module.css';

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
      <img src="/mascot/cutout-peek-still.webp" alt="" aria-hidden="true" className={styles.lostMascot} />
      <div className={styles.lostCode}>
        <GlitchMask size={26} className={styles.lostGlitch} /> 404
      </div>
      <h1 className={styles.lostTitle}>{t('SIGNAL LOST', '訊號遺失')}</h1>
      <p className={styles.lostText}>
        {t('No transmission found on this frequency.', '此頻率上找不到任何傳輸。')}
      </p>
      <Link to="/" className={styles.backBtn}>
        {t('← RETURN TO SIGNAL', '← 返回訊號')}
      </Link>
    </main>
  );
}
