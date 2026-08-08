import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
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
      {/* Background */}
      <div className={styles.bg}>
        <img src="/redbanner.png" alt="" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
        <div className={styles.bgScanlines} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <SectionTag en="SUBJECT PROFILE" zh="檔案主題" />

        <motion.div
          className={styles.classifiedRow}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className={styles.classifiedDot}>◆</span>
          {t('skixO // ACTIVE', 'skixO // 活躍中')}
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
