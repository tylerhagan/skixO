import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { featuredRelease } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import LazyFrame from './LazyFrame';
import styles from './AboutSection.module.css';

// One paragraph, deliberately. The influence list and the origin story used
// to live here; the stats row below carries the facts, and the dossier
// carries the myth. Saying it three times cancelled all three out.
const BIO = [
  'Twenty-five years of production, an eighteen-year silence, and three years back at the desk. The music never left. It waited. What came back was liquid — hooky, restless, built for movement. The Eastern remixes started with something more personal than craft: a partner from Taiwan, travel across Asia, friendships built in Taipei. They were never a project. They were just what happened next.',
];

const STATS = [
  { label: 'ORIGIN',   labelZh: '出身',  value: 'LONDON, UK'  },
  { label: 'BASE',     labelZh: '基地',  value: 'BERLIN, DE'  },
  { label: 'GENRE',    labelZh: '風格',  value: 'LIQUID DnB'  },
  { label: 'RELEASES', labelZh: '作品',  value: '17 TRACKS'   },
];

export default function AboutSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} id="artist" ref={ref}>
      {/* Background — the desk, not a banner. "Three years back at the
          desk" in the bio below is this frame, not a figure of speech. */}
      <div className={styles.bg}>
        <img src="/mascot/studio.webp" alt="" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
        <div className={styles.bgScanlines} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <SectionTag en="THE ARTIST" zh="藝術家" />

        {/* Identity — portrait, name, sound. This used to be a whole
            second section (THE ARTIST, straight after this one's SUBJECT
            PROFILE) introducing the same person twice in a row. The name
            is the wordmark, not type: Bebas has no lowercase. */}
        <motion.div
          className={styles.identity}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className={styles.avatarWrap}>
            <img src="/portrait.webp" alt="" className={styles.avatar} />
            <div className={styles.avatarRing} />
          </div>
          <div className={styles.identityText}>
            <h3 className={styles.name}>
              <img src="/wordmark-cut-bone.svg" alt="skixO" className={styles.nameImg} />
            </h3>
            <p className={styles.subtitle}>
              {t('Liquid Drum & Bass · Glitch Architecture', '液態鼓打貝斯 · 故障建築')}
            </p>
          </div>
        </motion.div>

        <div className={styles.bioCol}>
          {BIO.map((para, i) => (
            <motion.p
              key={i}
              className={styles.bio}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.2 + i * 0.13, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.58 }}
        >
          {STATS.map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statLabel}>{t(s.label, s.labelZh)}</span>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </motion.div>

        {/* One embed. The SoundCloud player it used to sit above is
            reachable from TUNE IN and the release page. */}
        <motion.div
          className={styles.player}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.72, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className={styles.playerLabel}>▶ {featuredRelease.title}</div>
          <LazyFrame
            src={`https://www.youtube.com/embed/${featuredRelease.youtubeId}?rel=0&color=white&modestbranding=1&autoplay=1`}
            title={`skixO - ${featuredRelease.title} feat. ${featuredRelease.feat}`}
            thumb={`https://img.youtube.com/vi/${featuredRelease.youtubeId}/hqdefault.jpg`}
          />
        </motion.div>
      </div>
    </section>
  );
}
