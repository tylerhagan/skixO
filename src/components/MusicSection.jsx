import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReveal } from '../hooks/useReveal';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import { releases } from '../data/releases';
import styles from './MusicSection.module.css';



const FILTERS = [
  { key: 'all',      en: 'ALL',              zh: '全部' },
  { key: 'original', en: 'ORIGINALS',        zh: '原創' },
  { key: 'remix',    en: 'REMIXES',          zh: '混音' },
  { key: 'eastern',  en: 'EASTERN REMIXES',  zh: '東方混音' },
];

// Bilingual like the filter bar above it — these used to stay English in
// 中文 mode while the filters that select them switched.
const TYPE_LABEL = {
  original: { en: 'ORIGINAL', zh: '原創' },
  remix:    { en: 'REMIX',    zh: '混音' },
  eastern:  { en: 'EASTERN',  zh: '東方' },
};

const EASTERN_PLAYLIST = 'https://www.youtube.com/playlist?list=PLZg8rU_U1gb6-LJrYKIZe1a9Eer7aAbdZ';

const MotionLink = motion.create(Link);

function VideoCard({ release, index, featured }) {
  const { t } = useLang();
  // Same card text as before the move to releases.js.
  const video = {
    id: release.youtubeId,
    type: release.type,
    title: release.titleZh ? `${release.titleZh} ${release.title}` : release.title,
    artist: release.artist || (release.feat ? `skixO ft. ${release.feat}` : 'skixO'),
  };
  const ref = useRef(null);
  const { shown: inView, from } = useReveal(ref, '0px 0px -5% 0px');

  return (
    <MotionLink
      ref={ref}
      to={`/release/${release.slug}`}
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      initial={from({ opacity: 0, y: 20 })}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={styles.thumb}>
        {/* Self-hosted, baked by scripts/build-covers.mjs. The duotone sits
            on top in the site's two tones; hover fades it to reveal the
            source art in colour underneath. */}
        {release.artwork ? (
          // Designed square artwork (PRØVE): its video has no baked
          // cover, and the art is already in the site's tones.
          <img
            src={release.artwork}
            alt={video.title}
            className={styles.thumbImg}
            loading="lazy"
          />
        ) : (
          <>
            <img
              src={`/covers/${video.id}.webp`}
              alt=""
              className={styles.thumbImg}
              loading="lazy"
            />
            <img
              src={`/covers/${video.id}-duo.webp`}
              alt={video.title}
              className={`${styles.thumbImg} ${styles.thumbDuo}`}
              loading="lazy"
            />
          </>
        )}
        <div className={styles.thumbOverlay} />
        <div className={styles.thumbScanlines} />
        <div className={styles.playIcon}>▶</div>
      </div>

      <div className={styles.meta}>
        <span className={`${styles.typeTag} ${styles[`type_${video.type}`]}`}>
          {t(TYPE_LABEL[video.type].en, TYPE_LABEL[video.type].zh)}
        </span>
        <div className={styles.title}>{video.title}</div>
        <div className={styles.artist}>{video.artist}</div>
      </div>
    </MotionLink>
  );
}

export default function MusicSection() {
  const { t } = useLang();
  const [active, setActive] = useState('all');
  const ref = useRef(null);
  const { shown: inView, from } = useReveal(ref);

  const filtered = active === 'all' ? releases : releases.filter(r => r.type === active);

  return (
    <section className={styles.section} id="catalogue" ref={ref}>
      <SectionTag en="CATALOGUE" zh="音樂目錄" />

      {/* Filter bar */}
      <motion.div
        className={styles.filters}
        initial={from({ opacity: 0, y: 12 })}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${active === f.key ? styles.filterActive : ''}`}
            aria-pressed={active === f.key}
            onClick={() => setActive(f.key)}
          >
            {t(f.en, f.zh)}
          </button>
        ))}
      </motion.div>

      {/* Eastern playlist link */}
      <AnimatePresence>
        {active === 'eastern' && (
          <motion.div
            className={styles.playlistBar}
            initial={from({ opacity: 0, y: -6 })}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <span className={styles.playlistDot}>✦</span>
            {t('FULL PLAYLIST ON YOUTUBE', '完整播放清單')}
            <a
              href={EASTERN_PLAYLIST}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.playlistLink}
            >
              {t('VIEW ↗', '查看 ↗')}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        className={styles.grid}
        layout
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((release, i) => (
            // 17 cards in a 4-column grid left one orphan on the last row;
            // the lead card at 2×2 makes it 20 cells, five full rows.
            <VideoCard key={release.slug} release={release} index={i} featured={active === 'all' && i === 0} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
