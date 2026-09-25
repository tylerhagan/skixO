import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRelease } from '../data/releases';
import peaks from '../data/peaks.json';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import LazyFrame from '../components/LazyFrame';
import Magnetic from '../components/Magnetic';
import SignalLost from './SignalLost';
import styles from './Release.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Release() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const { track, setTrack, playing, toggle } = usePlayer();
  const release = getRelease(slug);

  useEffect(() => {
    if (release) document.title = `${release.title} — skixO`;
    return () => { document.title = 'skixO'; };
  }, [release]);

  // Unknown slug — a lost transmission
  if (!release) return <SignalLost />;

  const isThis = track?.id === `release-${release.slug}`;
  const isPlaying = isThis && playing;
  const wavePeaks = peaks[release.slug];

  const playExcerpt = () => {
    if (isThis) toggle();
    else if (release.audioSrc) {
      setTrack({
        id: `release-${release.slug}`,
        title: release.title,
        subtitle: `feat. ${release.feat}`,
        url: release.soundcloudUrl,
        audioSrc: release.audioSrc,
      });
    }
  };

  return (
    <main className={styles.page}>
      {/* File header */}
      <motion.div className={styles.fileBar} variants={fadeUp} initial="hidden" animate="show">
        <Link to="/" className={styles.back}>
          {t('← ALL TRANSMISSIONS', '← 所有傳輸')}
        </Link>
        <span className={styles.fileId}>FILE // {release.catalogue}</span>
      </motion.div>

      <div className={styles.grid}>
        {/* Left — title, meta, story */}
        <div>
          <motion.h1
            className={styles.title}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {release.title}
          </motion.h1>
          <motion.div className={styles.feat} variants={fadeUp} initial="hidden" animate="show">
            {t('feat.', '特別收錄')} {release.feat}
          </motion.div>
          <motion.p className={styles.tagline} variants={fadeUp} initial="hidden" animate="show">
            {t(release.tagline.en, release.tagline.zh)}
          </motion.p>

          {/* CTAs */}
          <motion.div className={styles.ctaRow} variants={fadeUp} initial="hidden" animate="show">
            {release.audioSrc && (
              <Magnetic>
                <button className={styles.ctaPrimary} onClick={playExcerpt}>
                  {isPlaying
                    ? t('■ PAUSE EXCERPT', '■ 暫停節錄')
                    : t('▶ PLAY EXCERPT', '▶ 播放節錄')}
                </button>
              </Magnetic>
            )}
            <a href={release.soundcloudUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
              SoundCloud ↗
            </a>
            {release.spotifyUrl && (
              <a href={release.spotifyUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
                Spotify ↗
              </a>
            )}
          </motion.div>

          {/* Waveform strip — real shape when peaks exist for this slug */}
          {wavePeaks && (
            <motion.div className={styles.waveStrip} variants={fadeUp} initial="hidden" animate="show" aria-hidden="true">
              {wavePeaks.map((p, i) => (
                <span key={i} className={styles.waveBar} style={{ height: `${8 + p * 92}%` }} />
              ))}
            </motion.div>
          )}

          {/* Meta table */}
          <motion.table className={styles.meta} variants={fadeUp} initial="hidden" animate="show">
            <tbody>
              <tr><td className={styles.metaKey}>{t('RELEASED', '發行日期')}</td><td className={styles.metaVal}>{release.date}</td></tr>
              <tr><td className={styles.metaKey}>{t('FREQ', '頻率')}</td><td className={styles.metaVal}>{release.bpm} bpm</td></tr>
              <tr><td className={styles.metaKey}>{t('CATALOGUE', '目錄編號')}</td><td className={styles.metaVal}>{release.catalogue}</td></tr>
            </tbody>
          </motion.table>

          {/* Story */}
          <div className={styles.story}>
            {release.story.map((p, i) => (
              <motion.p key={i} className={styles.para} variants={fadeUp} initial="hidden" animate="show">
                {t(p.en, p.zh)}
              </motion.p>
            ))}
          </div>

          {/* Credits */}
          <motion.div className={styles.credits} variants={fadeUp} initial="hidden" animate="show">
            <div className={styles.creditsLabel}>{t('CREDITS', '製作名單')}</div>
            {release.credits.map((c, i) => (
              <div key={i} className={styles.creditRow}>
                <span className={styles.creditRole}>{t(c.role.en, c.role.zh)}</span>
                <span className={styles.creditName}>{c.name}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — artwork + video */}
        <div className={styles.media}>
          <motion.div className={styles.artWrap} variants={fadeUp} initial="hidden" animate="show">
            <img src={release.artwork} alt={`${release.title} artwork`} className={styles.art} />
            <div className={styles.artScanlines} />
          </motion.div>
          {release.youtubeId && (
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <LazyFrame
                src={`https://www.youtube.com/embed/${release.youtubeId}?autoplay=1`}
                title={release.title}
                thumb={`https://img.youtube.com/vi/${release.youtubeId}/hqdefault.jpg`}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Lyrics — bilingual, only when provided */}
      {release.lyrics && (
        <div className={styles.lyrics}>
          <div className={styles.creditsLabel}>{t('LYRICS', '歌詞')}</div>
          <div className={styles.lyricsGrid}>
            {release.lyrics.map((line, i) =>
              line.br ? (
                <div key={i} className={styles.lyricBreak} />
              ) : line.en ? (
                <div key={i} className={styles.lyricLine}>
                  <span className={lang === 'zh' ? styles.lyricAlt : ''}>{line.en}</span>
                  <span className={lang === 'zh' ? '' : styles.lyricAlt}>{line.zh}</span>
                </div>
              ) : (
                <div key={i} className={styles.lyricSingle}>{line.zh}</div>
              )
            )}
          </div>
        </div>
      )}
    </main>
  );
}
