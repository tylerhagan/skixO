import { useEffect, useRef, useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import styles from './GlitchMask.module.css';

// The mask, live. Same glyph as the favicon (public/skixO-glyph.svg) —
// recoloured per layer via CSS mask-image rather than duplicating its path
// data, so the file stays the one source of truth for the shape.
//
// A weak transmission doesn't snow constantly, it drops out: the glyph
// sits mostly still with a faint, permanent channel-split fringe (bone one
// side, signal the other, via feDisplacementMap) and corrupts harder in
// short, irregular bursts. Used wherever the lore layer needs the mask
// standing in for a face that isn't there — /console, SIGNAL LOST.
//
// Deliberately not a canned CSS @keyframes loop: the burst timing is
// randomised per mount (setTimeout re-scheduling itself, not setInterval)
// so two instances on screen never glitch in sync, and it reads as a
// signal problem rather than a decorative animation.
//
// Displacement scale and ghost offset are kept proportional to `size`
// rather than fixed pixel values — the same absolute scale that reads as
// a tasteful corruption on a 200px mark tears a 26px inline one apart
// entirely (checked against an actual render, not just the numbers: at
// scale 9-16 the 26px favicon-sized glyph disintegrated into unrecognisable
// streaks rather than distorting). Fractions below are tuned at 44px and
// 26px, the two sizes actually used on the site.
const idleFor = size => ({
  freq: 0.015,
  scale: size * 0.05,
  offset: size * 0.035,
  opacity: 0.22,
});
const burstFor = size => ({
  freq: 0.06 + Math.random() * 0.05,
  scale: size * (0.16 + Math.random() * 0.12),
  offset: size * (0.09 + Math.random() * 0.08),
  opacity: 0.55 + Math.random() * 0.3,
});

export default function GlitchMask({ size = 64, className = '' }) {
  const reduced = useReducedMotion();
  const rawId = useId();
  const filterId = `glitch-mask-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const idle = idleFor(size);

  const turbRef = useRef(null);
  const dispRef = useRef(null);
  const boneGhostRef = useRef(null);
  const signalGhostRef = useRef(null);

  useEffect(() => {
    if (reduced) return; // static idle frame from the JSX below stands as-is

    let cancelled = false;
    let burstTimer = 0;

    const setState = ({ freq, scale, offset, opacity }) => {
      turbRef.current?.setAttribute('baseFrequency', `${freq} ${freq * 1.6}`);
      dispRef.current?.setAttribute('scale', String(scale));
      if (boneGhostRef.current) {
        boneGhostRef.current.style.transform = `translateX(${-offset}px)`;
        boneGhostRef.current.style.opacity = opacity;
      }
      if (signalGhostRef.current) {
        signalGhostRef.current.style.transform = `translateX(${offset}px)`;
        signalGhostRef.current.style.opacity = opacity;
      }
    };

    // idleFor(size) directly, not the outer `idle` — that's a fresh object
    // every render, so closing over it would make ESLint (correctly) want
    // it in the dependency array, which would restart the burst loop on
    // every render. size is the real, stable dependency.
    const settle = () => setState(idleFor(size));

    const burst = () => {
      if (cancelled) return;
      turbRef.current?.setAttribute('seed', String(Math.floor(Math.random() * 100)));
      setState(burstFor(size));
      const burstLength = 80 + Math.random() * 170;
      burstTimer = window.setTimeout(() => {
        if (cancelled) return;
        settle();
        scheduleNext();
      }, burstLength);
    };

    const scheduleNext = () => {
      const gap = 1800 + Math.random() * 3200;
      burstTimer = window.setTimeout(burst, gap);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      window.clearTimeout(burstTimer);
    };
  }, [reduced, size]);

  return (
    <div className={`${styles.wrap} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {/* 0×0, purely a filter host — feTurbulence/feDisplacementMap can't
          be expressed as CSS, so this is the one bit of inline SVG. */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency={`${idle.freq} ${idle.freq * 1.6}`}
              numOctaves="2"
              seed="6"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale={idle.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className={styles.layer} style={{ filter: `url(#${filterId})` }}>
        {/* Ghosts first (screen-blended, so they only ever brighten the
            base, never obscure it), base glyph on top, full strength. */}
        <span
          ref={signalGhostRef}
          className={`${styles.glyph} ${styles.glyphSignal}`}
          style={{ transform: `translateX(${idle.offset}px)`, opacity: idle.opacity }}
        />
        <span
          ref={boneGhostRef}
          className={`${styles.glyph} ${styles.glyphBone}`}
          style={{ transform: `translateX(${-idle.offset}px)`, opacity: idle.opacity }}
        />
        <span className={`${styles.glyph} ${styles.glyphBase}`} />
      </div>
    </div>
  );
}
