import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const GLYPHS = '█▓▒░◆◇/\\|<>_—0123456789Xskixo訊號';

// Text that resolves from random glyphs when it scrolls into view.
export default function DecryptText({ text, interval = 34, revealPerTick = 1, as: Tag = 'span', className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (reduced || !inView) return;

    let revealed = 0;
    const chars = [...text];
    const timer = setInterval(() => {
      revealed = Math.min(revealed + revealPerTick, chars.length);
      setOutput(
        chars
          .map((c, i) => {
            if (i < revealed || c === ' ') return c;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );
      if (revealed >= chars.length) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [inView, text, interval, revealPerTick, reduced]);

  if (reduced) {
    return <Tag ref={ref} className={className}>{text}</Tag>;
  }

  // Real text for assistive tech, scramble for eyes. Was aria-label on
  // the wrapper with the visible glyphs aria-hidden — but aria-label on a
  // plain span/div (no role) is ignored by most screen readers, so with
  // the only readable content hidden, every section title read as empty.
  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{output || ' '}</span>
    </Tag>
  );
}
