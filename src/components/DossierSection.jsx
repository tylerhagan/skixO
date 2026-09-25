import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { dossierFile } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import SectionTag from './SectionTag';
import styles from './DossierSection.module.css';

const GLYPHS = '█▓▒░◆◇/\\|<>_—0123456789Xskixo訊號';
const HOLD_MS = 900;

// A redacted value that decrypts on press-and-hold (or Enter-hold).
function RedactedValue({ value, secret, holdLabel }) {
  const reduced = useReducedMotion();
  const [state, setState] = useState('sealed'); // sealed | holding | revealed
  const [output, setOutput] = useState('');
  const holdTimer = useRef(null);
  const scramble = useRef(null);

  useEffect(() => () => {
    clearTimeout(holdTimer.current);
    clearInterval(scramble.current);
  }, []);

  const reveal = () => {
    setState('revealed');
    if (reduced) { setOutput(secret); return; }
    const chars = [...secret];
    let n = 0;
    scramble.current = setInterval(() => {
      n += 2;
      setOutput(
        chars.map((c, i) =>
          i < n || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ).join('')
      );
      if (n >= chars.length) clearInterval(scramble.current);
    }, 30);
  };

  const begin = () => {
    if (state === 'revealed') return;
    setState('holding');
    holdTimer.current = setTimeout(reveal, HOLD_MS);
  };

  const cancel = () => {
    clearTimeout(holdTimer.current);
    setState(s => (s === 'holding' ? 'sealed' : s));
  };

  if (state === 'revealed') {
    return <span className={styles.decrypted}>{output}</span>;
  }

  return (
    <button
      className={`${styles.redactBtn} ${state === 'holding' ? styles.redactHolding : ''}`}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); begin(); } }}
      onKeyUp={cancel}
      aria-label={holdLabel}
      title={holdLabel}
    >
      <span className={styles.redact}>{value}</span>
      <span className={styles.redactProgress} aria-hidden="true" />
    </button>
  );
}

export default function DossierSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} id="dossier" ref={ref}>
      <SectionTag en="DOSSIER" zh="檔案" />

      <div className={styles.grid}>
        {/* Classified file card */}
        <motion.div
          className={styles.file}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className={styles.fileHeader}>
            {/* Was "CLASSIFIED" — government-agency framing left over from
                the old surveillance identity, never touched by the mask
                reframe. The mask is the redaction now, worn by choice,
                not a stamp applied by some outside authority. */}
            <span className={styles.fileLabel}>{t('REDACTED', '已隱藏')}</span>
            <span className={styles.fileId}>FILE // SKX-001</span>
          </div>
          <table className={styles.fileTable}>
            <tbody>
              {dossierFile.map(({ key, value, redact, active, secret }) => (
                <tr key={key} className={styles.fileRow}>
                  <td className={styles.fileKey}>{key}</td>
                  <td className={`${styles.fileVal} ${redact && !secret ? styles.redact : ''} ${active ? styles.active : ''}`}>
                    {redact && secret ? (
                      <RedactedValue
                        value={value}
                        secret={secret}
                        holdLabel={t('HOLD TO DECRYPT', '長按解密')}
                      />
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Narrative */}
        <div className={styles.narrative}>
          {[
            {
              en: 'Somewhere between a rain-soaked studio and the neon-lit night markets of Taipei, a frequency emerged. Not born from a scene. Intercepted from one.',
              zh: '在雨水浸透的錄音室與台北霓虹閃爍的夜市之間，某個頻率出現了。不是從一個場景中誕生，而是從中截取的。',
            },
            {
              en: "skixO learned to speak through other people\u2019s songs \u2014 dissecting the melodic architecture of Chinese and Taiwanese artists, rewiring it through liquid drum & bass and glitch.",
              zh: 'skixO通過他人的歌曲學會了表達——解構中文和台灣藝術家的旋律架構，通過液態鼓打貝斯和故障音效重新接線。',
            },
            {
              en: 'With PRØVE, it became his own.',
              zh: '隨著《PRØVE》，它成為了他自己的。',
            },
          ].map((p, i) => (
            <motion.p
              key={i}
              className={styles.para}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.2 + i * 0.12 }}
            >
              {t(p.en, p.zh)}
            </motion.p>
          ))}

          {/* Icarus quote */}
          <motion.blockquote
            className={styles.quote}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <div className={styles.quoteZh}>披荊斬棘</div>
            <div className={styles.quoteEn}>
              Fly on these second-hand wings —<br />
              I'm willing to find out what impossible means.<br />
              I'll climb through the heavens on feathers and dreams,<br />
              'cause the melting point of wax means nothing to me.
            </div>
          </motion.blockquote>

          {/* Welcome message */}
          <motion.div
            className={styles.welcome}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <span className={styles.welcomeZh}>訊號傳向東方</span>
            <span className={styles.welcomeEn}>
              {t('A signal reaching east.', '訊號傳向東方')}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
