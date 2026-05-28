import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
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
          <div className={styles.playerLabel}>▶ VISUAL CHANNEL</div>
          <div className={styles.ytWrap}>
            <iframe
              src="https://www.youtube.com/embed/q2PAD9txKlE?rel=0&color=white&modestbranding=1"
              title="skixO - PRØVE feat. Berlin the Corner"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className={styles.playerLabel} style={{ marginTop: '24px' }}>◈ PRIMARY FEED</div>
          <div className={styles.scWrap}>
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2325710012&color=%23060609&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
