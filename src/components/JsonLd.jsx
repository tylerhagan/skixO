import { useEffect } from 'react';

// Injects a <script type="application/ld+json"> into <head> while mounted.
// The static MusicGroup entity lives in index.html; this is per-page data.
export default function JsonLd({ data }) {
  const json = JSON.stringify(data);
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = json;
    document.head.appendChild(el);
    return () => el.remove();
  }, [json]);
  return null;
}
