import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './SectionDivider.module.css';

// Pseudo-random but deterministic barcode bars from a seed string
function barsFromSeed(seed, count = 28) {
  const bars = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  for (let i = 0; i < count; i++) {
    h = (Math.imul(31, h) + i * 7) | 0;
    const w = ((Math.abs(h) % 3) + 1); // 1, 2 or 3px wide
    const tall = (Math.abs(h * 13) % 4) === 0; // occasionally taller
    bars.push({ w, tall });
  }
  return bars;
}

// `slice` picks which band of the bramble banner shows (an object-position
// y value) and `flip` mirrors it, so consecutive dividers aren't the same
// strip of thorns twice.
export default function SectionDivider({ label = 'SKX', coord, slice = 'center', flip = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const bars = barsFromSeed(label);

  return (
    <div className={styles.divider} ref={ref} aria-hidden="true">
      {/* The bramble banner, cropped by cover-fit to a thin band. By
          default that's the seam its own horizontal rule and star sit on
          (source centre); `slice`/`flip` move later dividers to other
          bands of the same running thorn line. */}
      <img
        src="/bramble.webp"
        alt=""
        className={styles.bgImg}
        style={{ objectPosition: `center ${slice}`, transform: flip ? 'scaleX(-1)' : undefined }}
      />
      <div className={styles.bgOverlay} />

      {/* Left line — reinforces the art's own rule with a crisp CSS edge */}
      <motion.div
        className={styles.line}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      {/* Barcode + label sit right where the art's own star is —
          busiest part of the image, so they get a small glass chip
          rather than floating bare over the vines. */}
      <div className={styles.infoGroup}>
        <motion.div
          className={styles.barcode}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {bars.map((bar, i) => (
            <span
              key={i}
              className={`${styles.bar} ${bar.tall ? styles.barTall : ''}`}
              style={{ width: `${bar.w}px` }}
            />
          ))}
        </motion.div>

        <motion.div
          className={styles.meta}
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <span className={styles.metaLabel}>{label}</span>
          {coord && (
            <>
              <span className={styles.metaDot}>✦</span>
              <span className={styles.metaCoord}>{coord}</span>
            </>
          )}
        </motion.div>
      </div>

      {/* Right line */}
      <motion.div
        className={styles.line}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        style={{ transformOrigin: 'right' }}
      />
    </div>
  );
}
