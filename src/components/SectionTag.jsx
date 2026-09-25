import { useLang } from '../hooks/useLang';
import DecryptText from './DecryptText';
import styles from './SectionTag.module.css';

// Section title: a large display heading under a small mono eyebrow.
//
// The eyebrow carries the *other* language — 藝術家 over THE ARTIST, and
// THE ARTIST over 藝術家 in 中文 mode — rather than repeating the heading
// word for word at a tenth of the size. The site is bilingual by
// identity, and a verbatim echo directly above the headline reads as a
// mistake. It's decorative (aria-hidden, with its own lang so the right
// glyph forms are picked); the heading is the <h2>'s accessible name.
//
// An <h2>, not a <div>: these are the section titles, the stops for
// screen-reader heading navigation.
export default function SectionTag({ en, zh }) {
  const { lang, t } = useLang();
  const other = lang === 'zh' ? en : zh;

  return (
    <h2 className={styles.wrap}>
      <span className={styles.tag} aria-hidden="true" lang={lang === 'zh' ? 'en' : 'zh-Hant'}>
        <span className={styles.dot}>▓</span>
        <DecryptText text={other} className={styles.label} />
      </span>
      <span className={styles.heading}>{t(en, zh)}</span>
    </h2>
  );
}
