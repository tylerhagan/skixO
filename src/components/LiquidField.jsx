import { useEffect, useRef } from 'react';
import { audioEngine } from '../lib/audioEngine';
import styles from './LiquidField.module.css';

// The liquid counterpoint to the glitch — slow crimson blobs drifting
// behind sections with transparent backgrounds (Signal, Tune In).
// Rendered at 1/8 resolution and upscaled: gradients stay soft, GPU
// cost stays negligible. While a track plays, bass swells the field.
const BLOBS = [
  { r: 0.34, hue: [204, 0, 0], a: 0.10, sx: 0.21, sy: 0.13, px: 0.25, py: 0.35 },
  { r: 0.42, hue: [102, 0, 0], a: 0.14, sx: 0.13, sy: 0.17, px: 0.75, py: 0.6 },
  { r: 0.26, hue: [204, 0, 0], a: 0.08, sx: 0.17, sy: 0.23, px: 0.55, py: 0.2 },
  { r: 0.3, hue: [153, 0, 10], a: 0.1, sx: 0.11, sy: 0.19, px: 0.35, py: 0.8 },
];
const SCALE = 8;       // downscale factor
const FRAME_MS = 33;   // ~30fps is plenty for motion this slow

export default function LiquidField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = 0;
    let bass = 0;

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / SCALE);
      canvas.height = Math.ceil(window.innerHeight / SCALE);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = t => {
      const { width: w, height: h } = canvas;
      const levels = audioEngine.sample();
      // Smooth the bass so the field swells instead of twitching
      bass += ((levels.playing ? levels.bass : 0) - bass) * 0.06;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < BLOBS.length; i++) {
        const b = BLOBS[i];
        const x = (b.px + Math.sin(t * b.sx + i * 2.1) * 0.16) * w;
        const y = (b.py + Math.cos(t * b.sy + i * 1.3) * 0.14) * h;
        const r = b.r * Math.max(w, h) * (1 + bass * 0.7);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const [cr, cg, cb] = b.hue;
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${b.a * (1 + bass * 0.9)})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    if (reduced) {
      draw(2); // one static frame
    } else {
      const loop = now => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || now - last < FRAME_MS) return;
        last = now;
        draw(now / 8000); // very slow clock — liquid, not lava lamp
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
