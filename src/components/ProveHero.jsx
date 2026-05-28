import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import BerlinCard from './BerlinCard';
import styles from './ProveHero.module.css';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25,0.46,0.45,0.94] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1 } },
};

export default function ProveHero() {
  const { t } = useLang();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY       = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY     = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity   = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className={styles.section} id="prove">
      {/* Parallax background — PRØVE square art */}
      <motion.div className={styles.bg} style={{ y: bgY }}>
        <video
          className={styles.bgVideo}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/web-bg.webm" type="video/webm" />
          <source src="/web-bg.mp4" type="video/mp4" />
        </video>
        <div className={styles.bgOverlay} />
        <div className={styles.bgScanlines} />
      </motion.div>

      {/* Content */}
      <motion.div
        className={styles.content}
        style={{ y: textY, opacity }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Tag */}
        <motion.div className={styles.tag} variants={fadeIn}>
          <span className={styles.blink}>▓</span>
          {t('INCOMING TRANSMISSION', '傳入訊號')}
          <span className={styles.tagZh}>
            {t('', '新單曲')}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 className={styles.title} variants={fadeUp}>
          PR<span className={styles.titleO}>Ø</span>VE
        </motion.h1>

        {/* OUT NOW badge */}
        <motion.div className={styles.badge} variants={fadeUp}>
          <span className={styles.badgeDot} />
          {t('OUT NOW — 30 MAY 2026', '立即發佈 — 2026年5月30日')}
        </motion.div>

        {/* Tagline */}
        <motion.p className={styles.tagline} variants={fadeUp}>
          {t('East meets underground. A statement.', '東方遇上地下。一個宣言。')}
        </motion.p>

        {/* CTAs */}
        <motion.div className={styles.ctaRow} variants={fadeUp}>
          <a
            href="https://www.youtube.com/watch?v=q2PAD9txKlE"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaPrimary}
          >
            <span className={styles.ctaPulse} />
            {t('WATCH NOW', '立即觀看')}
          </a>
          <a
            href="https://soundcloud.com/skixo/prove-s"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
          >
            {t('STREAM', '收聽')}
          </a>
          <a
            href="https://open.spotify.com/artist/0bV3hLbjIx6fpRszSI0q5t"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
          >
            Spotify
          </a>
        </motion.div>
      </motion.div>

      {/* Berlin callout — floats on right */}
      <div className={styles.cardSlot}>
        <BerlinCard />
      </div>

      {/* Bottom coords bar */}
      <motion.div
        className={styles.coords}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span>51.5°N // 121.4°E</span>
        <span className={styles.coordsDivider}>◆</span>
        <span>FREQ: 174.0 bpm</span>
        <span className={styles.coordsDivider}>◆</span>
        <span>skixO</span>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className={styles.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        {t('SCROLL ↓', '滾動 ↓')}
      </motion.div>
    </section>
  );
}
