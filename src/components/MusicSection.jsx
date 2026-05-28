import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import styles from './MusicSection.module.css';

const VIDEOS = [
  // Eastern Remixes
  { id: 'a2sSj_aiDhY', title: 'LIGHTS IN YOUR EYES', artist: 'Gummy B', type: 'eastern' },
  { id: '7lnSVhn_RyY', title: '夜曲 NOCTURNE', artist: '周杰伦 Jay Chou', type: 'eastern' },
  { id: 'RfXKNRE-59w', title: '模特 MODEL', artist: '李榮浩 Ronghao Li', type: 'eastern' },
  { id: 'kKq-jU_WJ7s', title: 'WHO 誰', artist: '廖俊澧 ft. 岑寧兒', type: 'eastern' },
  { id: 'AU42eLgyLPY', title: '只有唔語才能解除唔語', artist: '柏林角落 Berlin the Corner', type: 'eastern' },
  { id: '5zdidTaZf3M', title: '愛情你比我想的還較偉大', artist: '茄子蛋 EggPlantEgg', type: 'eastern' },
  { id: 'hei62d71fuA', title: '床 LIE', artist: '草東沒有派對 No Party for Cao Dong', type: 'eastern' },
  { id: '3bVGE5g3ibM', title: '我若是有來生我想欲變成你', artist: '茄子蛋 EggPlantEgg ft. YVV', type: 'eastern' },
  { id: 'zvRfal00Wmg', title: '日常 EVERYDAY LIFE', artist: '茄子蛋 EggPlantEgg', type: 'eastern' },
  // Other Remixes
  { id: 'XyQpKZ9WxKc', title: 'MILA 米拉', artist: 'Xu Bin 徐濱', type: 'remix' },
  { id: 'BLhdjHB2Zbo', title: 'THE WINNER IS (2012)', artist: 'DeVotchKa', type: 'remix' },
  { id: '2ZLQmdZGyIk', title: 'THE WINNER IS', artist: 'DeVotchKa', type: 'remix' },
  // Originals
  { id: 'YKsIuaGSStQ', title: 'DUEN', artist: 'skixO', type: 'original' },
  { id: 'AlprPVhKRu4', title: 'MIDNIGHT', artist: 'skixO', type: 'original' },
  { id: 'YQy7s0y5Kuc', title: 'OH GOD', artist: 'skixO', type: 'original' },
  { id: '2dQapfiJrpw', title: 'NEED', artist: 'skixO', type: 'original' },
  { id: 'vSeMjPox2H4', title: '1:48', artist: 'skixO', type: 'original' },
];

const FILTERS = [
  { key: 'all',      en: 'ALL',              zh: '全部' },
  { key: 'original', en: 'ORIGINALS',        zh: '原創' },
  { key: 'remix',    en: 'REMIXES',          zh: '混音' },
  { key: 'eastern',  en: 'EASTERN REMIXES',  zh: '東方混音' },
];

const TYPE_LABEL = {
  original: 'ORIGINAL',
  remix:    'REMIX',
  eastern:  'EASTERN',
};

const EASTERN_PLAYLIST = 'https://www.youtube.com/playlist?list=PLZg8rU_U1gb6-LJrYKIZe1a9Eer7aAbdZ';

function VideoCard({ video, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.a
      ref={ref}
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={styles.thumb}>
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          className={styles.thumbImg}
          loading="lazy"
        />
        <div className={styles.thumbOverlay} />
        <div className={styles.thumbScanlines} />
        <div className={styles.playIcon}>▶</div>
      </div>

      <div className={styles.meta}>
        <span className={`${styles.typeTag} ${styles[`type_${video.type}`]}`}>
          {TYPE_LABEL[video.type]}
        </span>
        <div className={styles.title}>{video.title}</div>
        <div className={styles.artist}>{video.artist}</div>
      </div>
    </motion.a>
  );
}

export default function MusicSection() {
  const { t } = useLang();
  const [active, setActive] = useState('all');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const filtered = active === 'all' ? VIDEOS : VIDEOS.filter(v => v.type === active);

  return (
    <section className={styles.section} id="catalogue" ref={ref}>
      <SectionTag en="CATALOGUE" zh="音樂目錄" />

      {/* Filter bar */}
      <motion.div
        className={styles.filters}
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${active === f.key ? styles.filterActive : ''}`}
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
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <span className={styles.playlistDot}>◆</span>
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
          {filtered.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
