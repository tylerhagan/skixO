import { useEffect, useRef } from 'react';
import { audioEngine } from '../lib/audioEngine';
import styles from './HeroVisual.module.css';

// The receiver — an oscilloscope line across the lower hero.
// Idle: a slow synthetic carrier wave drifting like a signal being
// searched for. Playing: the actual time-domain waveform of the
// featured track, plus a bass-driven glow that echoes the overlay's
// red radial. Renders only while the hero is on screen.
export default function HeroVisual() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = true;
    let dpr = 1, w = 0, h = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(() => { resize(); if (reduced) drawFrame(0); });
    ro.observe(canvas);
    resize();

    // Idle carrier — layered slow sines, amplitude in [-1, 1]
    const idleValue = (x, t) =>
      Math.sin(x * 0.008 + t * 0.8) * 0.5 +
      Math.sin(x * 0.021 - t * 1.3) * 0.3 +
      Math.sin(x * 0.0047 + t * 0.35) * 0.2;

    const drawLine = (t, levels) => {
      const y0 = h * 0.74;
      const playing = levels?.playing;
      const wave = playing ? levels.wave : null;
      const scale = playing
        ? h * 0.05 + levels.amp * h * 0.16
        : h * 0.028;

      // Two passes: wide dim glow, then the bright core line
      const passes = [
        { width: 3.5, color: `rgba(204, 0, 0, ${playing ? 0.28 : 0.16})` },
        { width: 1.2, color: `rgba(255, 48, 48, ${playing ? 0.95 : 0.55})` },
      ];
      for (const pass of passes) {
        ctx.beginPath();
        ctx.lineWidth = pass.width;
        ctx.strokeStyle = pass.color;
        const step = 3;
        for (let x = 0; x <= w; x += step) {
          let v;
          if (wave) {
            const i = Math.floor((x / w) * (wave.length - 1));
            v = (wave[i] - 128) / 128;
          } else {
            v = idleValue(x, t);
          }
          const y = y0 + v * scale;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const drawFrame = t => {
      const levels = audioEngine.sample();

      // Fade previous frames to transparent — leaves a phosphor trail
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      // Bass glow — reinforces the existing red radial in the overlay
      if (levels?.playing && levels.bass > 0.05) {
        const g = ctx.createRadialGradient(w * 0.7, h * 0.5, 0, w * 0.7, h * 0.5, Math.max(w, h) * 0.45);
        g.addColorStop(0, `rgba(204, 0, 0, ${levels.bass * 0.13})`);
        g.addColorStop(1, 'rgba(204, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      drawLine(t, levels);
    };

    if (reduced) {
      // Single static frame, no animation
      drawFrame(0);
    } else {
      const loop = now => {
        if (visible) drawFrame(now / 1000);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
