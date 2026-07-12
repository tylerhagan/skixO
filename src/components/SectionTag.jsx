import { useLang } from '../hooks/useLang';
import DecryptText from './DecryptText';
import styles from './SectionTag.module.css';

export default function SectionTag({ en, zh }) {
  const { t } = useLang();
  return (
    <div className={styles.tag}>
      <span className={styles.blink}>▓</span>
      <DecryptText text={t(en, zh)} className={styles.label} />
    </div>
  );
}
