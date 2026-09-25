import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
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
  const reducedMotion = useReducedMotion();

  const featuredActive = track?.id === 'featured';
  const featuredPlaying = featuredActive && playing;

  // The head-nod. Started tempo-locked to 174 BPM half-time (690ms/cycle,
  // see the coords bar below) but that read too fast in practice — 430ms
  // per half (25% slower than the tempo-locked 345ms) gives a ~860ms
  // cycle, the one that actually looked right. A hard swap, not a
  // crossfade, same as every other mascot frame change on the site.
  //
  // `nodding` only ever means "which half of the alternation is the
  // interval currently on" — whether that's actually shown is decided
  // below by `showNod`, so stopping playback never needs an effect to
  // reset state back to false, just a render-time guard.
  const [nodding, setNodding] = useState(false);
  const showNod = featuredPlaying && !reducedMotion && nodding;
  useEffect(() => {
    if (!featuredPlaying || reducedMotion) return;
    const id = setInterval(() => setNodding(n => !n), 430);
    return () => clearInterval(id);
  }, [featuredPlaying, reducedMotion]);

  // Warm every frame the hero can cut to, once the page is idle. The nod
  // frame used to be fetched at play-start and the headphones-on frame
  // not at all — so the very first cut, the one the whole play button is
  // built around, waited on a network round-trip while the audio had
  // already started. A hard cut only reads as a cut if it lands on the
  // beat. Only this viewport's pair: the other never displays here.
  useEffect(() => {
    const frames = window.matchMedia('(min-width: 769px)').matches
      ? ['/hero-desktop-listening.webp', '/hero-desktop-listening-nod.webp']
      : ['/mascot/lean-up.webp'];
    const warm = () => frames.forEach(src => { new Image().src = src; });
    const idle = window.requestIdleCallback ?? (fn => setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(warm);
    return () => cancel(handle);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY       = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY     = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity   = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className={styles.section} id="home">
      {/* Parallax background — the mascot, not footage.
          Desktop: a pre-composed frame (scripts/build-images.mjs), mirrored
          and placed with the figure's right edge stopping well short of
          where the featured-release glass panel floats — baked once rather
          than fought for at runtime, since the source art's aspect is too
          close to a typical viewport's for object-position to create any
          real crop slack. Swaps to the headphones-on frame the instant
          playback starts, then nods on the half-time (see `showNod` above)
          — a hard cut every time, no crossfade, same as every other mascot
          swap on the site.
          Mobile: the lean pair, which has no listening frame of its own
          (headphones stay slung round the neck); it swaps pose instead,
          head down at rest and up once something's playing. */}
      <motion.div className={styles.bg} style={{ y: bgY }}>
        <img
          className={`${styles.bgImg} ${styles.bgImgDesktop}`}
          src={
            !featuredPlaying
              ? '/hero-desktop-idle.webp'
              : showNod
                ? '/hero-desktop-listening-nod.webp'
                : '/hero-desktop-listening.webp'
          }
          alt=""
          aria-hidden="true"
        />
        <img
          className={`${styles.bgImg} ${styles.bgImgMobile}`}
          src={featuredPlaying ? '/mascot/lean-up.webp' : '/mascot/lean-down.webp'}
          alt=""
          aria-hidden="true"
        />
        <div className={styles.bgOverlay} />
        <div className={styles.bgScanlines} />
      </motion.div>

      {/* The receiver — audio-reactive oscilloscope, glowing across the
          character via screen-blend rather than competing with it */}
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
          skixO
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
        <span className={styles.coordsDivider}>✦</span>
        <span>FREQ: 174.0 bpm</span>
        <span className={styles.coordsDivider}>✦</span>
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
