import { useLang } from '../hooks/useLang';
import DecryptText from './DecryptText';
import styles from './SectionTag.module.css';

// An <h2>, not a <div>: these are the section titles. As divs, the home
// page's heading outline was the hero <h1> and a single <h2> (the artist
// name) — nothing for screen-reader heading navigation to land on.
export default function SectionTag({ en, zh }) {
  const { t } = useLang();
  return (
    <h2 className={styles.tag}>
      <span className={styles.blink} aria-hidden="true">▓</span>
      <DecryptText text={t(en, zh)} className={styles.label} />
    </h2>
  );
}
