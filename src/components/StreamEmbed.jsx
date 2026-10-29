import LazyFrame from './LazyFrame';

// Click-to-load SoundCloud / Spotify players for a release. Nothing from
// either service loads until the visitor taps the strip.

const SC_PARAMS =
  '&color=%23E8612C&auto_play=false&hide_related=true&show_comments=false' +
  '&show_user=false&show_reposts=false&show_teaser=false&visual=false';

const soundcloudEmbed = url =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}${SC_PARAMS}`;

// open.spotify.com/track/ID(?si=…) → open.spotify.com/embed/track/ID
const spotifyEmbed = url => {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0`;
};

export default function StreamEmbed({ service, url, title }) {
  if (!url) return null;
  if (service === 'soundcloud') {
    return <LazyFrame src={soundcloudEmbed(url)} title={title} label="SoundCloud" height={166} />;
  }
  if (service === 'spotify') {
    const src = spotifyEmbed(url);
    if (!src) return null;
    return <LazyFrame src={src} title={title} label="Spotify" height={152} />;
  }
  return null;
}
