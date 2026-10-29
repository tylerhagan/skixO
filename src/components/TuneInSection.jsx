import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useReveal } from '../hooks/useReveal';
import Newsletter from './Newsletter';
import { channels } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import FrequencyDial from './FrequencyDial';
import { PlatformIcons as icons } from './PlatformIcons';
import styles from './TuneInSection.module.css';

export default function TuneInSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const { shown: inView, from } = useReveal(ref);

  return (
    <section className={styles.section} id="tune-in" ref={ref}>
      <SectionTag en="TUNE IN" zh="收聽" />

      <motion.p
        className={styles.intro}
        initial={from({ opacity: 0, y: 20 })}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {t('Pick your frequency.', '選擇你的頻率。')}
      </motion.p>

      <motion.div
        initial={from({ opacity: 0, y: 24 })}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <FrequencyDial />
      </motion.div>

      <div className={styles.grid}>
        {channels.map((ch, i) => (
          <motion.a
            key={ch.id}
            href={ch.url}
            target={/^(mailto:|\/)/.test(ch.url) ? undefined : '_blank'}
            rel={/^(mailto:|\/)/.test(ch.url) ? undefined : 'noopener noreferrer'}
            className={styles.card}
            initial={from({ opacity: 0, y: 32 })}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15 + i * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{icons[ch.icon]}</div>
              <span className={styles.cardFreq}>{ch.id}</span>
            </div>
            <div className={styles.cardLabel}>{t(ch.label, ch.labelZh)}</div>
            <div className={styles.cardPlatform}>{ch.platform}</div>
            <span className={styles.cardArrow}>↗</span>
            <div className={styles.cardBorder} />
          </motion.a>
        ))}
      </div>
      <Newsletter />
      {/* 訊號傳向東方 is said once, in the dossier. Repeating it here spent it. */}
    </section>
  );
}
