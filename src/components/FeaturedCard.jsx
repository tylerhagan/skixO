import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { featuredRelease } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import styles from './FeaturedCard.module.css';

const infoVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Tuning in, not acquiring a target. The card finds the release the way
// the rest of the site finds a signal: a dial needle hunting across the
// same 170–180 band as the Tune In dial, overshooting, and settling on
// 174.0 — the frequency Hero's coords bar shows and the console's
// `tune 174.0` locks to ("174.0 — LOCKED").
const BAND_MIN = 170;
const BAND_MAX = 180;
const TARGET = 174.0;
const SEARCH_MS = 1800;
const LOCK_MS = 2200;

// The needle's hunt, as (time, band position) stops: sweep high, swing
// back past the station, land on it exactly as the search phase ends.
const HUNT = [
  [0.00, 0.04],
  [0.50, 0.86],
  [0.78, 0.28],
  [1.00, (TARGET - BAND_MIN) / (BAND_MAX - BAND_MIN)],
];

const ease = x => x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;

function huntAt(t) {
  if (t >= 1) return HUNT[HUNT.length - 1][1];
  let i = 0;
  while (t > HUNT[i + 1][0]) i++;
  const [t0, p0] = HUNT[i];
  const [t1, p1] = HUNT[i + 1];
  return p0 + (p1 - p0) * ease((t - t0) / (t1 - t0));
}

const LOCKED_POS = HUNT[HUNT.length - 1][1];

export default function FeaturedCard() {
  const { t } = useLang();
  const { track, live } = usePlayer();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [phase, setPhase] = useState('idle');
  const [pos, setPos] = useState(HUNT[0][1]);
  const timers = useRef([]);
  const raf = useRef(0);

  // Signal colour only while this release is actually on air — finding
  // the station isn't the same as it playing.
  const onAir = live && track?.id === 'featured';

  const runSequence = () => {
    timers.current.forEach(clearTimeout);
    cancelAnimationFrame(raf.current);
    setPhase('searching');
    setPos(HUNT[0][1]);

    const start = performance.now();
    const step = now => {
      const k = Math.min((now - start) / SEARCH_MS, 1);
      setPos(huntAt(k));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);

    timers.current = [
      setTimeout(() => setPhase('locking'), SEARCH_MS),
      setTimeout(() => setPhase('locked'),  LOCK_MS),
    ];
  };

  useEffect(() => {
    if (!inView) return;
    const start = setTimeout(runSequence, 0);
    return () => {
      clearTimeout(start);
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    };
  }, [inView]);

  const isLocked = phase === 'locked';
  const tuning = phase === 'searching' || phase === 'locking';
  const needlePos = phase === 'searching' ? pos : LOCKED_POS;
  const readout = (BAND_MIN + needlePos * (BAND_MAX - BAND_MIN)).toFixed(1);

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
        {/* Header bar — a tuner readout */}
        <div className={styles.label}>
          {isLocked ? (
            <>
              <span
                className={`${styles.reception} ${onAir ? styles.receptionLive : ''}`}
                aria-hidden="true"
              >
                <span /><span /><span />
              </span>
              <span className={styles.freqLocked}>{TARGET.toFixed(1)}</span>
              <span className={styles.labelSep} aria-hidden="true">—</span>
              {t('LOCKED', '已鎖定')}
            </>
          ) : (
            <>
              {t('TUNING', '調頻中')}
              <span
                className={`${styles.freq} ${phase === 'searching' ? styles.freqDrifting : ''}`}
                aria-hidden="true"
              >
                {readout}
              </span>
            </>
          )}

          <button
            className={`${styles.replayBtn} ${isLocked ? styles.replayActive : ''}`}
            onClick={runSequence}
            tabIndex={isLocked ? 0 : -1}
            aria-label={t('Retune', '重新調頻')}
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

            {/* The dial: a tick band along the bottom, a needle hunting
                across it. Gone once the release is in. */}
            {tuning && <div className={styles.band} aria-hidden="true" />}
            {tuning && (
              <div
                className={styles.needle}
                style={{ left: `${needlePos * 100}%` }}
                aria-hidden="true"
              />
            )}
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
                  <span className={styles.scanLabel}>
                    {phase === 'locking'
                      ? t('SIGNAL FOUND', '找到訊號')
                      : t('NO SIGNAL', '無訊號')}
                  </span>
                  <span className={styles.scanId}>{BAND_MIN} — {BAND_MAX} bpm</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info column */}
          <div className={styles.infoWrap}>
            {/* Placeholder shimmer while tuning */}
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
