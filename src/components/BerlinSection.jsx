import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import styles from './BerlinSection.module.css';

export default function BerlinSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} ref={ref}>
      <SectionTag en="KNOWN ASSOCIATE" zh="已知合作者" />

      <div className={styles.grid}>

        {/* Photo side */}
        <motion.div
          className={styles.photoCol}
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className={styles.photoWrap}>
            <img src="/berlinthecorner.jpg" alt="Berlin the Corner" className={styles.photo} />
            <div className={styles.photoOverlay} />
            {/* Corner brackets */}
            <div className={`${styles.bracket} ${styles.tl}`} />
            <div className={`${styles.bracket} ${styles.br}`} />
          </div>

          {/* File ID under photo */}
          <div className={styles.photoMeta}>
            <span className={styles.photoId}>ASSOCIATE // BTC-TW</span>
            <span className={styles.photoStatus}>● CONFIRMED</span>
          </div>
        </motion.div>

        {/* Text side */}
        <div className={styles.textCol}>
          <motion.div
            className={styles.fileHeader}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className={styles.fileLabel}>CLASSIFIED</span>
            <span className={styles.fileId}>FILE // BTC-001</span>
          </motion.div>

          <motion.h2
            className={styles.name}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Berlin<br />
            <span className={styles.nameCorner}>the Corner</span>
          </motion.h2>

          <motion.div
            className={styles.origin}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className={styles.originZh}>台北，台灣</span>
            <span className={styles.originEn}>{t('Taipei, Taiwan', '台北，台湾')}</span>
          </motion.div>

          {[
            {
              en: 'They said his name like a rumour. Berlin the Corner — found somewhere between the fluorescent hum of a Taipei convenience store at 3am and the silence that follows a crowd.',
              zh: '他们像传说一样说起他的名字。柏林转角——在台北便利店凌晨三点的荧光嗡嗡声与人群散去后的寂静之间被发现。',
            },
            {
              en: 'A rapper who treats words like coordinates. Each line a signal sent from somewhere most people never think to look. When skixO\'s frequency reached him across the static, the transmission became PRØVE.',
              zh: '一位把文字当作坐标的说唱歌手。每一行都是从大多数人从未想过去寻找的地方发出的信号。当skixO的频率穿越静电触达他时，这次传输便成为了《PRØVE》。',
            },
          ].map((p, i) => (
            <motion.p
              key={i}
              className={styles.bio}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.35 + i * 0.12 }}
            >
              {t(p.en, p.zh)}
            </motion.p>
          ))}

          <motion.div
            className={styles.links}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <a
              href="https://www.youtube.com/@BerlinTheCorner"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
            >
              YouTube ↗
            </a>
            <a
              href="https://www.instagram.com/berlinthecorner"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
            >
              Instagram ↗
            </a>
            <a
              href="https://open.spotify.com/artist/6Ml3hNstpLnUEG0ZK5jUzp"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
            >
              Spotify ↗
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
