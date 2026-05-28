import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { channels } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import { PlatformIcons as icons } from './PlatformIcons';
import styles from './TuneInSection.module.css';

export default function TuneInSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} id="tune-in" ref={ref}>
      <SectionTag en="TUNE IN" zh="收听" />

      <motion.p
        className={styles.intro}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {t('Pick your frequency.', '选择你的频率。')}
      </motion.p>

      <div className={styles.grid}>
        {channels.map((ch, i) => (
          <motion.a
            key={ch.id}
            href={ch.url}
            target={ch.url.startsWith('mailto') ? undefined : '_blank'}
            rel={ch.url.startsWith('mailto') ? undefined : 'noopener noreferrer'}
            className={styles.card}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15 + i * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{icons[ch.icon]}</div>
              <span className={styles.cardFreq}>{ch.id}</span>
            </div>
            <div className={styles.cardLabel}>{t(ch.label, ch.label)}</div>
            <div className={styles.cardPlatform}>{ch.platform}</div>
            <span className={styles.cardArrow}>↗</span>
            <div className={styles.cardBorder} />
          </motion.a>
        ))}
      </div>

      <motion.p
        className={styles.welcomeNote}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7 }}
      >
        <span className={styles.welcomeZh}>欢迎来自台湾和中国的听众</span>
      </motion.p>
    </section>
  );
}
