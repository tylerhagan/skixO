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

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{output || ' '}</span>
    </Tag>
  );
}
