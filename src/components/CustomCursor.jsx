import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

// Anything the ring should swell over. Includes the ARIA widgets
// (track cards, the frequency dial), not just native links/buttons.
const INTERACTIVE = 'a, button, [role="button"], [role="slider"], input';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    let seen = false;

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Hidden until the first real pointer position — otherwise both
      // circles sit parked at (0,0), a stray ring in the top-left corner
      // of every page load until the mouse moves.
      if (!seen) {
        seen = true;
        ring.current = { x: e.clientX, y: e.clientY };
        dotRef.current?.classList.add(styles.visible);
        ringRef.current?.classList.add(styles.visible);
      }
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    // Delegated, not bound per element. The old version bound
    // mouseenter/leave to whatever `a, button` existed at mount — which
    // is only the first route's first render. Every link or button that
    // mounted later (the release page, the mini player, the featured
    // card's OPEN FILE link, filtered catalogue cards, the mobile menu,
    // every page after a route change) never got the hover state.
    const onOver = (e) => {
      const on = !!e.target.closest?.(INTERACTIVE);
      ringRef.current?.classList.toggle(styles.hover, on);
      dotRef.current?.classList.toggle(styles.hover, on);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
