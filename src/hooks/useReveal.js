import { useInView, useReducedMotion } from 'framer-motion';

// Scroll-reveal state shared by the home sections.
//
// The trigger fires as soon as any part of the section crosses the
// viewport (bottom edge pulled in by 10%, never pushed out), so fast
// scrolling doesn't outrun the reveal and leave a black section.
// Under prefers-reduced-motion the reveal is simply already done:
// `from()` returns false for `initial`, so nothing ever starts at
// opacity 0 and nothing animates in.
//
//   const { shown, from } = useReveal(ref);
//   <motion.div initial={from({ opacity: 0, y: 20 })} animate={shown ? {...} : {}} />
export function useReveal(ref, margin = '0px 0px -10% 0px') {
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin });
  return {
    shown: inView || !!reduced,
    reduced: !!reduced,
    from: v => (reduced ? false : v),
  };
}
