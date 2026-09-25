import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { featuredRelease } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import styles from './FeaturedCard.module.css';

const infoVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function FeaturedCard() {
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
    const start = setTimeout(runSequence, 0);
    return () => {
      clearTimeout(start);
      timers.current.forEach(clearTimeout);
    };
  }, [inView]);

  const isLocked = phase === 'locked';

  return (
    <div ref={ref} className={styles.cardWrap}>
      {/* Label — outside and above the card */}
      <motion.div
        className={styles.featLabel}
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className={styles.featLabelDot}>✦</span>
        {t('LATEST', '最新')}
        <span className={styles.featLabelRule} />
      </motion.div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Header bar */}
        <div className={styles.label}>
          {isLocked ? (
            <>
              <span className={styles.labelDot}>✦</span>
              LOCKED
            </>
          ) : (
            <>
              <span className={styles.labelBlink}>▓</span>
              ACQUIRING
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
          {/* Artwork column */}
          <div className={styles.imgWrap}>
            <img
              src={featuredRelease.artwork}
              alt={`${featuredRelease.title} artwork`}
              className={`${styles.img} ${!isLocked ? styles.imgSearching : ''}`}
            />
            <div className={styles.imgOverlay} />
            <div className={styles.imgScanlines} />

            {phase === 'searching' && <div className={styles.scanBar} />}
            {phase === 'searching' && <div className={styles.scanProgress} />}
            {phase === 'locking' && <div className={styles.lockFlash} />}

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
                  <span className={styles.scanId}>// SKX-LTX</span>
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
                    {featuredRelease.title}
                  </motion.div>
                  <motion.div className={styles.feat} variants={itemVariants}>
                    {t('feat.', '特別收錄')} {featuredRelease.feat}
                  </motion.div>
                  <motion.div className={styles.date} variants={itemVariants}>
                    {featuredRelease.date}
                  </motion.div>
                  {/* One way in — the release page carries watch/stream/credits */}
                  <motion.div className={styles.links} variants={itemVariants}>
                    <Link to={`/release/${featuredRelease.slug}`} className={styles.linkBtn}>
                      {t('OPEN FILE ↗', '開啟檔案 ↗')}
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
