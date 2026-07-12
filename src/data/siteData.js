// ─────────────────────────────────────────────
// skixO — Site Data
// ─────────────────────────────────────────────

// ── Audio pipeline ───────────────────────────
// Tracks with an `audioSrc` play a locally-hosted excerpt through the
// Web Audio engine (real analysis drives the hero visual, mini player
// bars and the global --amp glow). Tracks without one fall back to the
// hidden SoundCloud iframe.
//
//  - Hosted excerpts (30–60s MP3): drop in public/audio/<slug>.mp3,
//    set `audioSrc: '/audio/<slug>.mp3'`.
//  - Waveform shapes: drop full-length WAV bounces in audio-src/
//    (gitignored, never deployed) named <slug>.wav, then run
//    `npm run audio:peaks` — track cards pick them up by `slug`.
// ─────────────────────────────────────────────

// The current featured release. When a new single drops,
// update this object and the hero card, artist-section players
// and ticker all follow.
export const featuredRelease = {
  title: 'PRØVE',
  feat: 'Berlin the Corner',
  date: '30 MAY 2026',
  tagline: { en: 'East meets underground. A statement.', zh: '東方遇上地下。一個宣言。' },
  artwork: '/prove-square.png',
  youtubeId: 'q2PAD9txKlE',
  slug: 'prove',
  audioSrc: '/audio/prove-clip.mp3',
  soundcloudUrl: 'https://soundcloud.com/skixo/prove-s',
  soundcloudEmbed:
    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2325710012&color=%23060609&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
};

export const tickerItems = [
  'LATEST TRANSMISSION — PRØVE FEAT. BERLIN THE CORNER',
  'LIQUID DRUM & BASS // 174.0 BPM',
  'LONDON → BERLIN → TAIPEI',
  '17 RELEASES AND COUNTING',
  '訊號傳向東方 — A SIGNAL REACHING EAST',
  'SIGNAL ACTIVE',
];

export const tracks = [
  {
    id: '01',
    slug: 'lights-in-your-eyes',
    title: 'LIGHTS IN YOUR EYES',
    titleZh: null,
    subtitle: 'skixO Remix',
    date: 'MAY 2026',
    url: 'https://soundcloud.com/skixo/lightinyoureyes',
    audioSrc: null,
  },
  {
    id: '02',
    slug: 'nocturne',
    title: 'NOCTURNE',
    titleZh: '夜曲',
    subtitle: 'skixO Remix',
    date: 'APR 2026',
    url: 'https://soundcloud.com/skixo/nocturne',
    audioSrc: null,
  },
  {
    id: '03',
    slug: 'oh-love',
    title: '愛情你比我想的還較偉大',
    titleZh: null,
    subtitle: 'EggPlantEgg — skixO Remix',
    date: '2024',
    url: 'https://soundcloud.com/skixo/oh-love-you-are-much-greater-than-i-imagined-eggplantegg-skixo-remix',
    audioSrc: null,
  },
  {
    id: '04',
    slug: 'the-winner-is',
    title: 'THE WINNER IS',
    titleZh: null,
    subtitle: 'DeVotchKa — skixO Remix',
    date: '2012',
    url: 'https://soundcloud.com/skixo/the-winner-is',
    audioSrc: null,
  },
];

export const channels = [
  {
    id: 'CH-01',
    label: 'VISUAL CHANNEL',
    platform: 'YouTube',
    url: 'https://www.youtube.com/@skixo13',
    icon: 'youtube',
  },
  {
    id: 'CH-02',
    label: 'PRIMARY FEED',
    platform: 'SoundCloud',
    url: 'https://soundcloud.com/skixo',
    icon: 'soundcloud',
  },
  {
    id: 'CH-03',
    label: 'GRID DISTRIBUTION',
    platform: 'Spotify',
    url: 'https://open.spotify.com/artist/0bV3hLbjIx6fpRszSI0q5t',
    icon: 'spotify',
  },
  {
    id: 'CH-04',
    label: 'FIELD TRANSMISSIONS',
    platform: 'Instagram',
    url: 'https://www.instagram.com/skixo/',
    icon: 'instagram',
  },
  {
    id: 'CH-05',
    label: 'BOOKINGS & DEMOS',
    platform: 'Contact',
    url: 'mailto:skixo@proton.me',
    icon: 'mail',
  },
];

export const navLinks = [
  { label: 'ARTIST',    href: '#artist'    },
  { label: 'SIGNAL',    href: '#signal'    },
  { label: 'DOSSIER',   href: '#dossier'   },
  { label: 'CATALOGUE', href: '#catalogue' },
  { label: 'TUNE IN',   href: '#tune-in'   },
];

export const footerQuotes = [
  { zh: '披荊斬棘', en: 'Cut through thorns.' },
  { zh: '乘風破浪', en: 'Ride the wind. Break the waves.' },
  { zh: '訊號已捕獲', en: 'Signal captured.' },
  { zh: '來源：未知', en: 'Origin: unknown.' },
  { zh: '無所畏懼', en: 'Fear nothing.' },
];

export const dossierFile = [
  { key: 'SUBJECT',    value: 'skixO',                          redact: false },
  { key: 'ORIGIN',     value: '████████ // United Kingdom',     redact: true  },
  { key: 'GENRE',      value: 'Liquid DnB · Glitch Architecture', redact: false },
  { key: 'FREQ',       value: '170–180 bpm',                    redact: false },
  { key: 'STATUS',     value: '● ACTIVE',                       redact: false, active: true },
  { key: 'ASSOCIATES', value: 'Berlin the Corner [TW]',         redact: false },
  { key: 'LANGUAGES',  value: 'English · 中文',                  redact: false },
  { key: 'CLEARANCE',  value: '████',                           redact: true  },
];
