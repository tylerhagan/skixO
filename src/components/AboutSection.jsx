import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import styles from './AboutSection.module.css';

const BIO = [
  'London-born. Berlin-based. Twenty-five years of production, an eighteen-year silence, and three years back at the desk. skixO came of age in the era of UK drum and bass — the smooth, melodic, emotionally-charged strand that filtered through pirate radio and late-night sets in the late nineties. The music never left. It waited.',
  'Liquid DnB is the primary frequency — hooky, restless, built for movement. Running underneath it is a reggae inheritance from his parents: UB40 and Toots & The Maytals live in the bounce of his basslines as much as Aphex Twin and Squarepusher live in the architecture of his breaks. But it is The Postal Service that shapes how a track is built — the careful layering, the small melodic details, the flourishes that make something feel considered rather than constructed. Chase & Status, The Prodigy, Radiohead fill out the range. The sound of someone who grew up listening to everything, and who remembers all of it.',
  'The Eastern Remixes started with something more personal than craft. A partner from Taiwan. Travel across Asia. Friendships built in Taipei and beyond. Most of skixO\'s closest people today are Taiwanese or Chinese, and their music has become part of his. The remixes were never a project — they were just what happened next.',
];

const STATS = [
  { label: 'ORIGIN',   labelZh: '出身',  value: 'LONDON, UK'  },
  { label: 'BASE',     labelZh: '基地',  value: 'BERLIN, DE'  },
  { label: 'GENRE',    labelZh: '风格',  value: 'LIQUID DnB'  },
  { label: 'RELEASES', labelZh: '作品',  value: '17 TRACKS'   },
];

export default function AboutSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} id="artist" ref={ref}>
      {/* Background */}
      <div className={styles.bg}>
        <img src="/redbanner.png" alt="" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
        <div className={styles.bgScanlines} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <SectionTag en="SUBJECT PROFILE" zh="档案主题" />

        <motion.div
          className={styles.classifiedRow}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className={styles.classifiedDot}>◆</span>
          {t('skixO // ACTIVE', 'skixO // 活跃中')}
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
      </div>
    </section>
  );
}
