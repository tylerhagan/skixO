import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import { PlatformIcons } from './PlatformIcons';
import styles from './BerlinCard.module.css';

const infoVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function BerlinCard() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [phase, setPhase] = useState('idle');
  const timers = useRef([]);

  const runSequence = () => {
    timers.current.forEach(clearTimeout);
    setPhase('searching');
    timers.current = [
      setTimeout(() => setPhase('locking'), 1800),
      setTimeout(() => setPhase('locked'),  2200),
    ];
  };

  useEffect(() => {
    if (!inView) return;
    runSequence();
    return () => timers.current.forEach(clearTimeout);
  }, [inView]);

  const isLocked = phase === 'locked';

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header bar */}
      <div className={styles.label}>
        {isLocked ? (
          <>
            <span className={styles.labelDot}>◆</span>
            {t('FEATURING', '特别收录')}
          </>
        ) : (
          <>
            <span className={styles.labelBlink}>▓</span>
            ACQUIRING SIGNAL
            <span className={styles.labelEllipsis}>...</span>
          </>
        )}

        <button
          className={`${styles.replayBtn} ${isLocked ? styles.replayActive : ''}`}
          onClick={runSequence}
          tabIndex={isLocked ? 0 : -1}
          aria-label="Replay signal acquisition"
        >
          ↻
        </button>
      </div>

      <div className={styles.inner}>
        {/* Photo column */}
        <div className={styles.imgWrap}>
          <img
            src="/berlinthecorner.jpg"
            alt="Berlin the Corner"
            className={`${styles.img} ${!isLocked ? styles.imgSearching : ''}`}
          />
          <div className={styles.imgOverlay} />

          {/* Scanlines texture over photo */}
          <div className={styles.imgScanlines} />

          {/* Sweeping scan bar */}
          {phase === 'searching' && <div className={styles.scanBar} />}

          {/* Progress bar along bottom of photo */}
          {phase === 'searching' && <div className={styles.scanProgress} />}

          {/* Red flash on lock */}
          {phase === 'locking' && <div className={styles.lockFlash} />}

          {/* Scanning overlay text */}
          <AnimatePresence>
            {!isLocked && (
              <motion.div
                className={styles.scanOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className={styles.scanLabel}>SCANNING</span>
                <span className={styles.scanId}>// BTC-TW</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info column */}
        <div className={styles.infoWrap}>
          {/* Placeholder shimmer while searching */}
          <AnimatePresence>
            {!isLocked && (
              <motion.div
                className={styles.placeholder}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <div className={styles.plLine} />
                <div className={`${styles.plLine} ${styles.plShort}`} />
                <div className={`${styles.plLine} ${styles.plMedium}`} />
                <div className={`${styles.plLine} ${styles.plMedium}`} />
                <div className={`${styles.plLine} ${styles.plShorter}`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actual content — stagger-reveals on lock */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                className={styles.info}
                variants={infoVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div className={styles.name} variants={itemVariants}>
                  Berlin the Corner
                </motion.div>
                <motion.div className={styles.origin} variants={itemVariants}>
                  {t('Taipei, Taiwan', '台北，台湾')}
                </motion.div>
                <motion.p className={styles.bio} variants={itemVariants}>
                  {t(
                    'A voice found in the static between cities. Rapper. Writer. Signal.',
                    '在城市之间的静默中找到的声音。说唱歌手。作家。信号。'
                  )}
                </motion.p>
                <motion.div className={styles.links} variants={itemVariants}>
                  <a href="https://www.youtube.com/@BerlinTheCorner" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="YouTube">{PlatformIcons.youtube}</a>
                  <a href="https://soundcloud.com/berlinthecorner" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="SoundCloud">{PlatformIcons.soundcloud}</a>
                  <a href="https://www.instagram.com/berlinthecorner" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="Instagram">{PlatformIcons.instagram}</a>
                  <a href="https://open.spotify.com/artist/6Ml3hNstpLnUEG0ZK5jUzp" target="_blank" rel="noopener noreferrer" className={styles.link} aria-label="Spotify">{PlatformIcons.spotify}</a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
