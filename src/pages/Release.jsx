import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getRelease, displayTitle, creditLine, coverSrc, toTrack,
  TYPE_LABEL, SITE_URL, releaseUrl, releaseDescription,
} from '../data/releases';
import { formatDate, isoDate } from '../lib/date';
import peaks from '../data/peaks.json';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import LazyFrame from '../components/LazyFrame';
import StreamEmbed from '../components/StreamEmbed';
import JsonLd from '../components/JsonLd';
import Magnetic from '../components/Magnetic';
import SignalLost from './SignalLost';
import styles from './Release.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const DEFAULT_TITLE = 'skixO';

// <meta name="description"> follows the page in the SPA. Crawlers get the
// prerendered value from dist/release/<slug>/index.html instead.
function useMetaDescription(content) {
  useEffect(() => {
    const el = document.querySelector('meta[name="description"]');
    if (!el || !content) return;
    const prev = el.getAttribute('content');
    el.setAttribute('content', content);
    return () => el.setAttribute('content', prev);
  }, [content]);
}

// Lyrics arrive as a flat list with { br: true } between stanzas.
// Group them so a stanza never splits across the two desktop columns.
function toStanzas(lines) {
  const out = [[]];
  lines.forEach(l => (l.br ? out.push([]) : out[out.length - 1].push(l)));
  return out.filter(s => s.length);
}

const absolute = path => (path.startsWith('http') ? path : `${SITE_URL}${path}`);

function recordingLd(r) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: displayTitle(r),
    byArtist: { '@type': 'MusicGroup', name: 'skixO', url: `${SITE_URL}/` },
    ...(isoDate(r.date) ? { datePublished: isoDate(r.date) } : {}),
    url: releaseUrl(r),
    image: absolute(coverSrc(r)),
    sameAs: [
      r.youtubeId && `https://www.youtube.com/watch?v=${r.youtubeId}`,
      r.soundcloudUrl,
      r.spotifyUrl,
    ].filter(Boolean),
  };
}

export default function Release() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const { track, setTrack, playing, toggle } = usePlayer();
  const release = getRelease(slug);

  // Lyrics: open on desktop, folded on phones where they are a long scroll.
  const [lyricsOpen, setLyricsOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches
  );

  useEffect(() => {
    if (release) document.title = `${displayTitle(release)} — skixO`;
    return () => { document.title = DEFAULT_TITLE; };
  }, [release]);

  useMetaDescription(release ? releaseDescription(release) : null);

  // Unknown slug — a lost transmission
  if (!release) return <SignalLost />;

  const title = displayTitle(release, lang);
  const isThis = track?.id === `release-${release.slug}`;
  const isPlaying = isThis && playing;
  const wavePeaks = peaks[release.slug];
  const typeLabel = TYPE_LABEL[release.type];
  const date = formatDate(release.date, lang);
  // Long Han titles at display size overflow the column; step them down.
  const longTitle = [...title].length > 14;

  const playExcerpt = () => {
    if (isThis) toggle();
    else if (release.audioSrc) setTrack(toTrack(release, lang));
  };

  return (
    <main className={styles.page}>
      <JsonLd data={recordingLd(release)} />

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
            className={`${styles.title} ${longTitle ? styles.titleLong : ''}`}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {title}
          </motion.h1>
          <motion.div className={styles.feat} variants={fadeUp} initial="hidden" animate="show">
            {release.type === 'original' ? (
              release.feat ? creditLine(release, lang) : t(typeLabel.en, typeLabel.zh)
            ) : (
              <>
                <span>{t(typeLabel.en, typeLabel.zh)}</span>
                {release.artist && <span className={styles.featArtist}> // {release.artist}</span>}
              </>
            )}
          </motion.div>
          {release.tagline && (
            <motion.p className={styles.tagline} variants={fadeUp} initial="hidden" animate="show">
              {t(release.tagline.en, release.tagline.zh)}
            </motion.p>
          )}

          {/* CTAs */}
          {(release.audioSrc || release.soundcloudUrl || release.spotifyUrl) && (
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
              {release.soundcloudUrl && (
                <a href={release.soundcloudUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
                  SoundCloud ↗
                </a>
              )}
              {release.spotifyUrl && (
                <a href={release.spotifyUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
                  Spotify ↗
                </a>
              )}
            </motion.div>
          )}

          {/* Waveform strip — real shape when peaks exist for this slug */}
          {wavePeaks && (
            <motion.div className={styles.waveStrip} variants={fadeUp} initial="hidden" animate="show" aria-hidden="true">
              {wavePeaks.map((p, i) => (
                <span key={i} className={styles.waveBar} style={{ height: `${8 + p * 92}%` }} />
              ))}
            </motion.div>
          )}

          {/* Meta table — rows only for what is known */}
          <motion.table className={styles.meta} variants={fadeUp} initial="hidden" animate="show">
            <tbody>
              {date && (
                <tr><td className={styles.metaKey}>{t('RELEASED', '發行日期')}</td><td className={styles.metaVal}>{date}</td></tr>
              )}
              {release.bpm && (
                <tr><td className={styles.metaKey}>{t('FREQ', '頻率')}</td><td className={styles.metaVal}>{release.bpm} bpm</td></tr>
              )}
              <tr><td className={styles.metaKey}>{t('CATALOGUE', '目錄編號')}</td><td className={styles.metaVal}>{release.catalogue}</td></tr>
            </tbody>
          </motion.table>

          {/* Story */}
          {release.story?.length > 0 && (
            <div className={styles.story}>
              {release.story.map((p, i) => (
                <motion.p key={i} className={styles.para} variants={fadeUp} initial="hidden" animate="show">
                  {t(p.en, p.zh)}
                </motion.p>
              ))}
            </div>
          )}

          {/* Credits */}
          {release.credits?.length > 0 && (
            <motion.div className={styles.credits} variants={fadeUp} initial="hidden" animate="show">
              <div className={styles.creditsLabel}>{t('CREDITS', '製作名單')}</div>
              {release.credits.map((c, i) => (
                <div key={i} className={styles.creditRow}>
                  <span className={styles.creditRole}>{t(c.role.en, c.role.zh)}</span>
                  <span className={styles.creditName}>{c.name}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right — artwork, then the players, each only when present */}
        <div className={styles.media}>
          <motion.div className={styles.artWrap} variants={fadeUp} initial="hidden" animate="show">
            <img src={coverSrc(release)} alt={t(`${release.title} artwork`, `${release.title} 封面`)} className={styles.art} />
            <div className={styles.artScanlines} />
          </motion.div>
          {release.youtubeId && (
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <LazyFrame
                src={`https://www.youtube.com/embed/${release.youtubeId}?autoplay=1`}
                title={release.title}
                // Self-hosted baked cover where there is one; PRØVE's video
                // has no baked cover, so it keeps YouTube's thumbnail.
                thumb={release.artwork
                  ? `https://img.youtube.com/vi/${release.youtubeId}/hqdefault.jpg`
                  : `/covers/${release.youtubeId}.webp`}
              />
            </motion.div>
          )}
          {release.soundcloudUrl && (
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <StreamEmbed service="soundcloud" url={release.soundcloudUrl} title={release.title} />
            </motion.div>
          )}
          {release.spotifyUrl && (
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <StreamEmbed service="spotify" url={release.spotifyUrl} title={release.title} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Lyrics — bilingual, only when provided */}
      {release.lyrics?.length > 0 && (
        <div className={styles.lyrics}>
          <button
            type="button"
            className={styles.lyricsToggle}
            aria-expanded={lyricsOpen}
            aria-controls="release-lyrics"
            onClick={() => setLyricsOpen(o => !o)}
          >
            {lyricsOpen
              ? t('HIDE LYRICS ▴', '隱藏歌詞 ▴')
              : t('SHOW LYRICS ▾', '顯示歌詞 ▾')}
          </button>
          {lyricsOpen && (
            <div id="release-lyrics" className={styles.lyricsGrid}>
              {toStanzas(release.lyrics).map((stanza, s) => (
                <div key={s} className={styles.stanza}>
                  {stanza.map((line, i) =>
                    line.en ? (
                      <div key={i} className={styles.lyricLine}>
                        <span className={lang === 'zh' ? styles.lyricAlt : ''}>{line.en}</span>
                        <span className={lang === 'zh' ? '' : styles.lyricAlt}>{line.zh}</span>
                      </div>
                    ) : (
                      <div key={i} className={styles.lyricSingle}>{line.zh}</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
