import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { dossierFile } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import styles from './DossierSection.module.css';

export default function DossierSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} id="dossier" ref={ref}>
      <SectionTag en="DOSSIER" zh="档案" />

      <div className={styles.grid}>
        {/* Classified file card */}
        <motion.div
          className={styles.file}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className={styles.fileHeader}>
            <span className={styles.fileLabel}>CLASSIFIED</span>
            <span className={styles.fileId}>FILE // SKX-001</span>
          </div>
          <table className={styles.fileTable}>
            <tbody>
              {dossierFile.map(({ key, value, redact, active }) => (
                <tr key={key} className={styles.fileRow}>
                  <td className={styles.fileKey}>{key}</td>
                  <td className={`${styles.fileVal} ${redact ? styles.redact : ''} ${active ? styles.active : ''}`}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Narrative */}
        <div className={styles.narrative}>
          {[
            {
              en: 'Somewhere between a rain-soaked studio in the UK and the neon-lit night markets of Taipei, a frequency emerged. Not born from a scene. Intercepted from one.',
              zh: '在英国雨水浸透的录音室与台北霓虹闪烁的夜市之间，某个频率出现了。不是从一个场景中诞生，而是从中截取的。',
            },
            {
              en: "skixO learned to speak through other people\u2019s songs \u2014 dissecting the melodic architecture of Chinese and Taiwanese artists, rewiring it through liquid drum & bass and glitch. Each remix a transmission. Each drop a decoded signal.",
              zh: 'skixO通过他人的歌曲学会了表达——解构中文和台湾艺术家的旋律架构，通过液态鼓打贝斯和故障音效重新接线。每一首混音都是一次传输。每一次落拍都是一个解码信号。',
            },
            {
              en: 'Now with PRØVE, the signal becomes his own.',
              zh: '现在随着《PRØVE》的发布，这个信号成为了他自己的。',
            },
          ].map((p, i) => (
            <motion.p
              key={i}
              className={styles.para}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.2 + i * 0.12 }}
            >
              {t(p.en, p.zh)}
            </motion.p>
          ))}

          {/* Icarus quote */}
          <motion.blockquote
            className={styles.quote}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <div className={styles.quoteZh}>披荆斩棘</div>
            <div className={styles.quoteEn}>
              Fly on these second-hand wings —<br />
              I'm willing to find out what impossible means.<br />
              I'll climb through the heavens on feathers and dreams,<br />
              'cause the melting point of wax means nothing to me.
            </div>
          </motion.blockquote>

          {/* Welcome message */}
          <motion.div
            className={styles.welcome}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <span className={styles.welcomeZh}>欢迎来自台湾和中国的听众</span>
            <span className={styles.welcomeEn}>
              {t('Welcome, listeners from Taiwan and China.', '欢迎远道而来的听众。')}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
