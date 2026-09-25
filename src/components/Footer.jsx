import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { footerQuotes } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import { scrollToTop } from '../lib/scroll';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLang();
  const [idx, setIdx] = useState(0);
  // A reward for reaching the bottom of the page — resting on the footer's
  // own top edge like a ledge. Mostly still; every few seconds it throws
  // up a peace sign for a moment, unprompted, then settles back. Also
  // waves immediately on hover — the timer will just pick back up on its
  // next tick, no real conflict. A hard swap, no crossfade, same as every
  // other mascot frame change on the site.
  const [waving, setWaving] = useState(false);
  const reducedMotion = useReducedMotion();
  const hoveringRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % footerQuotes.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let timer = 0;

    const cycle = () => {
      const gap = 3000 + Math.random() * 2000; // every 3-5s
      timer = window.setTimeout(() => {
        if (cancelled || hoveringRef.current) { cycle(); return; }
        setWaving(true);
        timer = window.setTimeout(() => {
          if (cancelled) return;
          if (!hoveringRef.current) setWaving(false);
          cycle();
        }, 900);
      }, gap);
    };

    cycle();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  const quote = footerQuotes[idx];

  return (
    <footer className={styles.footer}>
      <div
        className={styles.mascotWrap}
        onMouseEnter={() => { hoveringRef.current = true; setWaving(true); }}
        onMouseLeave={() => { hoveringRef.current = false; setWaving(false); }}
      >
        <img
          src={waving ? '/mascot/cutout-peek-wave.webp' : '/mascot/cutout-peek-still.webp'}
          alt=""
          aria-hidden="true"
          className={styles.mascot}
        />
      </div>

      <div className={styles.inner}>
        <button
          className={styles.logo}
          // Through Lenis, like the nav's lockup. A native smooth
          // scrollTo fights Lenis's own animation (see lib/scroll.js).
          onClick={scrollToTop}
          aria-label={t('Back to top', '回到頂部')}
        >
          <img src="/emblem.svg" alt="" aria-hidden="true" className={styles.logoEmblem} />
          <img src="/wordmark-cut-bone.svg" alt="skixO" className={styles.logoWordmark} />
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
          <span className={styles.dot}>✦</span>
          <a href="https://www.youtube.com/@skixo13" target="_blank" rel="noopener noreferrer" className={styles.link}>YouTube</a>
          <span className={styles.dot}>✦</span>
          <a href="https://open.spotify.com/artist/0bV3hLbjIx6fpRszSI0q5t" target="_blank" rel="noopener noreferrer" className={styles.link}>Spotify</a>
          <span className={styles.dot}>✦</span>
          <a href="https://www.instagram.com/skixo/" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>© 2026 skixO. {t('All rights reserved.', '版權所有。')}</span>
        </div>
      </div>
    </footer>
  );
}
