import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EntranceLoader.module.css';

const lines = [
  { text: 'INITIALISING SIGNAL...',   zh: null,      delay: 0    },
  { text: 'ORIGIN: [REDACTED]',        zh: null,      delay: 0.35 },
  { text: 'FREQUENCY: 174.0 bpm',      zh: null,      delay: 0.65 },
  { text: 'SIGNAL DETECTED.',          zh: '信号已捕获', delay: 1.0  },
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
      setTimeout(onComplete, 700);
    }, 2800);

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
            <motion.div
              className={styles.logo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              sk<span className={styles.logoI}>i</span>x<span>O</span>
            </motion.div>

            <div className={styles.lines}>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  className={`${styles.line} ${i === lines.length - 1 ? styles.lineFinal : ''}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: line.delay + 0.3, duration: 0.4 }}
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
                transition={{ delay: 0.2, duration: 2.2, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Coords */}
          <div className={styles.coords}>
            <span>51.5°N</span>
            <span className={styles.coordsDot}>◆</span>
            <span>121.4°E</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
