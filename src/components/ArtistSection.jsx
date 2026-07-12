import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { featuredRelease } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import LazyFrame from './LazyFrame';
import styles from './ArtistSection.module.css';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.25,0.46,0.45,0.94] } },
});

export default function ArtistSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className={styles.section} ref={ref}>
      <SectionTag en="THE ARTIST" zh="藝術家" />

      <div className={styles.grid}>
        {/* Left — artist identity */}
        <div className={styles.left}>
          <motion.div
            className={styles.avatarWrap}
            variants={fadeUp(0)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            <img src="/avatar-circle.png" alt="skixO" className={styles.avatar} />
            <div className={styles.avatarRing} />
          </motion.div>

          <motion.h2
            className={styles.name}
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            skixO
          </motion.h2>

          <motion.p
            className={styles.subtitle}
            variants={fadeUp(0.2)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            {t('Liquid Drum & Bass · Glitch Architecture', '液態鼓打貝斯 · 故障建築')}
          </motion.p>
        </div>

        {/* Right — players */}
        <motion.div
          className={styles.right}
          variants={fadeUp(0.15)}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          <div className={styles.playerLabel}>▶ VISUAL CHANNEL — {featuredRelease.title}</div>
          <LazyFrame
            src={`https://www.youtube.com/embed/${featuredRelease.youtubeId}?rel=0&color=white&modestbranding=1&autoplay=1`}
            title={`skixO - ${featuredRelease.title} feat. ${featuredRelease.feat}`}
            thumb={`https://img.youtube.com/vi/${featuredRelease.youtubeId}/hqdefault.jpg`}
          />

          <div className={styles.playerLabel} style={{ marginTop: '24px' }}>◈ PRIMARY FEED</div>
          <LazyFrame
            src={featuredRelease.soundcloudEmbed}
            title={`skixO - ${featuredRelease.title} on SoundCloud`}
            thumb={featuredRelease.artwork}
            height={166}
          />
        </motion.div>
      </div>
    </section>
  );
}
