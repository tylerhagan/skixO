import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import { press, channels } from '../data/siteData';
import { copyText } from '../lib/copyText';
import { scrollToId } from '../lib/scroll';
import SectionTag from '../components/SectionTag';
import BookingForm from '../components/BookingForm';
import Newsletter from '../components/Newsletter';
import styles from './Press.module.css';

const wordCount = s => s.trim().split(/\s+/).length;
const charCount = s => [...s.replace(/\s/g, '')].length;

function CopyButton({ text }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    if (!(await copyText(text))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button type="button" className={styles.copyBtn} onClick={onClick}>
      {copied ? t('COPIED', '已複製') : t('COPY BIO', '複製簡介')}
    </button>
  );
}

function BioCard({ id, label, text, lang, draft }) {
  const { t } = useLang();
  return (
    <article className={styles.card} aria-labelledby={id}>
      <header className={styles.cardHead}>
        <span id={id} className={styles.cardLabel}>
          {label}
          {draft && <span className={styles.draft}> // {t('DRAFT, NEEDS NATIVE CHECK', '草稿，待母語校對')}</span>}
        </span>
        <CopyButton text={text} />
      </header>
      <div className={styles.bio} lang={lang === 'zh' ? 'zh-Hant' : 'en-GB'}>
        {text.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  );
}

function Preview({ asset }) {
  if (asset.mask) {
    // The glyph is currentColor: as an <img> it would render black on ink.
    // Painted through a mask it takes the bone ink the site uses.
    return (
      <span
        className={styles.maskPreview}
        style={{ '--mask': `url(${asset.href})` }}
        role="img"
        aria-label={asset.en}
      />
    );
  }
  return (
    <img
      src={asset.href}
      alt={asset.en}
      width={asset.w}
      height={asset.h}
      loading="lazy"
      decoding="async"
      className={styles.previewImg}
    />
  );
}

export default function Press() {
  const { t, lang } = useLang();
  const { hash } = useLocation();

  useEffect(() => {
    document.title = 'PRESS KIT — skixO';
    return () => { document.title = 'skixO'; };
  }, []);

  // A full page load on /press#booking (the Tune In contact card) lands
  // before the page exists: scroll once it has mounted, after the route's
  // own jump to top has run.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = setTimeout(() => scrollToId(id), 250);
    return () => clearTimeout(timer);
  }, [hash]);

  const { short, long } = press.bios;
  const link = platform => channels.find(c => c.platform === platform);

  const facts = [
    { k: t('GENRE', '風格'), v: 'Liquid DnB · Glitch Architecture' },
    { k: t('FREQ', '頻率'), v: `${press.bpm} bpm` },
    { k: t('ORIGIN', '出身'), v: press.origin.toUpperCase() },
    { k: t('BASE', '基地'), v: press.base.toUpperCase() },
    { k: t('LANGUAGES', '語言'), v: 'English · 中文' },
    { k: t('RELEASES', '作品'), v: `${press.releases}` },
    { k: t('SINGLE', '單曲'), v: 'PRØVE feat. Berlin the Corner' },
    { k: t('CONTACT', '聯絡'), v: press.email, href: `mailto:${press.email}` },
    ...['SoundCloud', 'YouTube', 'Spotify', 'Instagram'].map(p => ({
      k: p.toUpperCase(),
      v: link(p).url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
      href: link(p).url,
      external: true,
    })),
  ];

  return (
    <main className={styles.page}>
      <div className={styles.fileBar}>
        <Link to="/" className={styles.back}>{t('← RETURN TO SIGNAL', '← 返回訊號')}</Link>
        <span className={styles.fileId}>FILE // PRESS</span>
      </div>

      <header className={styles.intro}>
        <span className={styles.eyebrow} aria-hidden="true" lang={lang === 'zh' ? 'en' : 'zh-Hant'}>
          {lang === 'zh' ? 'PRESS KIT' : '媒體資料'}
        </span>
        <h1 className={styles.title}>{t('PRESS KIT', '媒體資料')}</h1>
        <div className={styles.introRow}>
          <p className={styles.lede}>
            {t(
              'Bios, facts, logos and artwork for press, promoters and playlists. Use freely, credit skixO.',
              '提供媒體、活動主辦與播放清單使用的簡介、資料、標誌與圖像。歡迎使用，請標示 skixO。'
            )}
          </p>
          <a className={styles.pdfBtn} href={press.pdf} download>
            <span>{t('ONE-PAGE PDF', '一頁式 PDF')}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      {/* Bios */}
      <section className={styles.section} aria-labelledby="press-bio">
        <div id="press-bio"><SectionTag en="BIO" zh="簡介" /></div>
        <div className={styles.bioGrid}>
          <BioCard id="bio-s-en" label={`EN // ${wordCount(short.en)} WORDS`} text={short.en} lang="en" />
          <BioCard id="bio-s-zh" label={`中文 // ${charCount(short.zh)} 字`} text={short.zh} lang="zh" draft />
          <BioCard id="bio-l-en" label={`EN // ${wordCount(long.en)} WORDS`} text={long.en} lang="en" />
          <BioCard id="bio-l-zh" label={`中文 // ${charCount(long.zh)} 字`} text={long.zh} lang="zh" draft />
        </div>
      </section>

      {/* Facts */}
      <section className={styles.section} aria-labelledby="press-facts">
        <div id="press-facts"><SectionTag en="FACTS" zh="資料" /></div>
        <div className={styles.file}>
          <div className={styles.fileHeader}>
            <span className={styles.fileLabel}>{t('SUBJECT FILE', '主體檔案')}</span>
            <span className={styles.fileIdSmall}>FILE // SKX-001</span>
          </div>
          <table className={styles.fileTable}>
            <tbody>
              {facts.map(f => (
                <tr key={f.k} className={styles.fileRow}>
                  <th scope="row" className={styles.fileKey}>{f.k}</th>
                  <td className={styles.fileVal}>
                    {f.href ? (
                      <a
                        href={f.href}
                        className={styles.fileLink}
                        {...(f.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {f.v}
                      </a>
                    ) : f.v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assets */}
      <section className={styles.section} aria-labelledby="press-assets">
        <div id="press-assets"><SectionTag en="ASSETS" zh="素材" /></div>
        <ul className={styles.assets}>
          {press.assets.map(a => (
            <li key={a.id} className={styles.tile}>
              <div className={styles.preview}><Preview asset={a} /></div>
              <div className={styles.tileMeta}>
                <span className={styles.tileName}>{t(a.en, a.zh)}</span>
                <span className={styles.tileFile}>{a.file}</span>
                <span className={styles.tileDims}>
                  {a.fmt} · {a.w} × {a.h}{a.fmt === 'SVG' ? ' · VECTOR' : ''}
                </span>
              </div>
              <a className={styles.dl} href={a.href} download={a.file}>
                {t('DOWNLOAD', '下載')} <span aria-hidden="true">↓</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Booking */}
      <section className={styles.section} id="booking" aria-labelledby="press-booking">
        <div id="press-booking"><SectionTag en="BOOKING & CONTACT" zh="邀約與聯絡" /></div>
        <p className={styles.sectionNote}>
          {t(
            `Bookings, remix requests and press. Goes straight to ${press.email}.`,
            `演出邀約、混音邀請與媒體洽詢，會直接寄到 ${press.email}。`
          )}
        </p>
        <BookingForm />
      </section>

      {/* Newsletter */}
      <section className={styles.section} aria-label={t('Newsletter', '電子報')}>
        <Newsletter />
      </section>
    </main>
  );
}
