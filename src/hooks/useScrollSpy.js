import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds, offset = 80) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + offset + 1;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return active;
}
