import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { footerQuotes } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import styles from './Footer.module.css';

export default function Footer() {
  const { lang } = useLang();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % footerQuotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const quote = footerQuotes[idx];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <button
          className={styles.logo}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <img src="/logo-min.png" alt="skixO" className={styles.logoImg} />
        </button>

        <div className={styles.quoteWrap}>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              className={styles.quote}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.quoteZh}>{quote.zh}</span>
              <span className={styles.quoteEn}>{quote.en}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.links}>
          <a href="https://soundcloud.com/skixo" target="_blank" rel="noopener noreferrer" className={styles.link}>SoundCloud</a>
          <span className={styles.dot}>◆</span>
          <a href="https://www.youtube.com/@skixo13" target="_blank" rel="noopener noreferrer" className={styles.link}>YouTube</a>
          <span className={styles.dot}>◆</span>
          <a href="https://open.spotify.com/artist/0bV3hLbjIx6fpRszSI0q5t" target="_blank" rel="noopener noreferrer" className={styles.link}>Spotify</a>
          <span className={styles.dot}>◆</span>
          <a href="https://www.instagram.com/skixo/" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>© 2026 skixO. All rights reserved.</span>
          <span className={styles.coords}>51.5°N ◆ 121.4°E ◆ TRANSMISSION ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}
