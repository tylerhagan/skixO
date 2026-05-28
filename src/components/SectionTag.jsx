import { useLang } from '../hooks/useLang';
import styles from './SectionTag.module.css';

export default function SectionTag({ en, zh }) {
  const { t } = useLang();
  return (
    <div className={styles.tag}>
      <span className={styles.blink}>▓</span>
      <span className={styles.label}>{t(en, zh)}</span>
    </div>
  );
}
