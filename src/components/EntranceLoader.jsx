import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EntranceLoader.module.css';

// Three lines in ~1.4s. The old four-line, 2.8s sequence gated the site
// behind a load screen twice as long as the page took to render — and
// announced the redaction the dossier is supposed to keep.
const lines = [
  { text: 'INITIALISING SIGNAL...',   zh: null,      delay: 0    },
  { text: 'FREQUENCY: 174.0 bpm',      zh: null,      delay: 0.18 },
  { text: 'SIGNAL DETECTED.',          zh: '訊號已捕獲', delay: 0.4  },
];

export default function EntranceLoader({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Only show on first visit per session
    const seen = sessionStorage.getItem('skixo_loaded');
    if (seen) {
      setVisible(false);
      onComplete();
      return;
    }
    sessionStorage.setItem('skixo_loaded', '1');

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.loader}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Scanlines */}
          <div className={styles.scanlines} />

          {/* Corner brackets */}
          <div className={`${styles.bracket} ${styles.tl}`} />
          <div className={`${styles.bracket} ${styles.tr}`} />
          <div className={`${styles.bracket} ${styles.bl}`} />
          <div className={`${styles.bracket} ${styles.br}`} />

          {/* Centre content */}
          <div className={styles.centre}>
            <motion.img
              src="/wordmark-cut-bone.svg"
              alt="skixO"
              className={styles.logo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />

            <div className={styles.lines}>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  className={`${styles.line} ${i === lines.length - 1 ? styles.lineFinal : ''}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: line.delay + 0.12, duration: 0.28 }}
                >
                  <span className={styles.linePrompt}>▸</span>
                  <span className={styles.lineText}>{line.text}</span>
                  {line.zh && (
                    <span className={styles.lineZh}>{line.zh}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressFill}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.1, duration: 1.1, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* The coordinate is shown once, in the hero, unexplained. */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
