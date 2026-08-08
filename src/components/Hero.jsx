import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import { featuredRelease } from '../data/siteData';
import Magnetic from './Magnetic';
import FeaturedCard from './FeaturedCard';
import HeroVisual from './HeroVisual';
import styles from './Hero.module.css';

// The featured release as a playable track for the audio engine / mini player
const featuredTrack = {
  id: 'featured',
  title: featuredRelease.title,
  subtitle: `feat. ${featuredRelease.feat}`,
  url: featuredRelease.soundcloudUrl,
  audioSrc: featuredRelease.audioSrc,
};

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

export default function Hero() {
  const { t } = useLang();
  const { track, setTrack, playing, toggle } = usePlayer();
  const sectionRef = useRef(null);

  const featuredActive = track?.id === 'featured';
  const featuredPlaying = featuredActive && playing;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY       = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY     = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity   = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className={styles.section} id="home">
      {/* Parallax video background */}
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

      {/* The receiver — audio-reactive oscilloscope */}
      <HeroVisual />

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
          {t('ACTIVE', '活躍中')}
        </motion.div>

        {/* Title */}
        <motion.h1 className={styles.title} variants={fadeUp}>
          skix<span className={styles.titleO}>O</span>
        </motion.h1>

        {/* Genre line */}
        <motion.div className={styles.genre} variants={fadeUp}>
          {t('LIQUID DRUM & BASS · GLITCH ARCHITECTURE', '液態鼓打貝斯 · 故障建築')}
        </motion.div>

        {/* Tagline */}
        <motion.p className={styles.tagline} variants={fadeUp}>
          {t(
            'A frequency between East and West.',
            '在東方與西方之間的頻率。'
          )}
        </motion.p>

        {/* CTA — one door. The platform links live in TUNE IN and the footer. */}
        <motion.div className={styles.ctaRow} variants={fadeUp}>
          <Magnetic>
            {featuredRelease.audioSrc ? (
              <button
                className={styles.ctaPrimary}
                onClick={() => (featuredActive ? toggle() : setTrack(featuredTrack))}
              >
                <span className={`${styles.ctaPulse} ${featuredPlaying ? styles.ctaPulseLive : ''}`} />
                {featuredPlaying
                  ? t('PAUSE', '暫停')
                  : t('PLAY THE SIGNAL', '播放訊號')}
              </button>
            ) : (
              <a
                href="https://soundcloud.com/skixo"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                <span className={styles.ctaPulse} />
                {t('LISTEN', '收聽')}
              </a>
            )}
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Latest release card — floats on right */}
      <div className={styles.cardSlot}>
        <FeaturedCard />
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
