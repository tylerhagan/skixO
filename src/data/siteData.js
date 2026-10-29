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
  date: '2026-05-30',
  tagline: { en: 'East meets underground. A statement.', zh: '東方遇上地下。一個宣言。' },
  artwork: '/prove-square.webp',
  youtubeId: 'q2PAD9txKlE',
  slug: 'prove',
  audioSrc: '/audio/prove-clip.mp3',
  soundcloudUrl: 'https://soundcloud.com/skixo/prove-s',
  soundcloudEmbed:
    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2325710012&color=%23060609&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
};

// zh: draft, needs native check
const bilingualTicker = '訊號傳向東方 — A SIGNAL REACHING EAST';
export const tickerItems = [
  { en: 'PRØVE FEAT. BERLIN THE CORNER', zh: 'PRØVE 特別收錄 柏林角落' },
  { en: 'LIQUID DRUM & BASS // 174.0 BPM', zh: '液態鼓打貝斯 // 174.0 BPM' },
  { en: 'LONDON → BERLIN → TAIPEI', zh: '倫敦 → 柏林 → 台北' },
  { en: '17 RELEASES AND COUNTING', zh: '已發行 17 首，持續增加' },
  { en: bilingualTicker, zh: bilingualTicker },
  { en: 'SIGNAL ACTIVE', zh: '訊號活躍中' },
];

export const tracks = [
  {
    id: '01',
    slug: 'lights-in-your-eyes',
    title: 'LIGHTS IN YOUR EYES',
    titleZh: null,
    subtitle: 'skixO Remix',
    subtitleZh: 'skixO 混音',
    date: '2026-05',
    url: 'https://soundcloud.com/skixo/lightinyoureyes',
    audioSrc: null,
  },
  {
    id: '02',
    slug: 'nocturne',
    title: 'NOCTURNE',
    titleZh: '夜曲',
    subtitle: 'skixO Remix',
    subtitleZh: 'skixO 混音',
    date: '2026-04',
    url: 'https://soundcloud.com/skixo/nocturne',
    audioSrc: null,
  },
  {
    id: '03',
    slug: 'oh-love',
    title: '愛情你比我想的還較偉大',
    titleZh: null,
    subtitle: 'EggPlantEgg — skixO Remix',
    subtitleZh: 'EggPlantEgg — skixO 混音',
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
    subtitleZh: 'DeVotchKa — skixO 混音',
    date: '2012',
    url: 'https://soundcloud.com/skixo/the-winner-is',
    audioSrc: null,
  },
];

export const channels = [
  {
    id: 'CH-01',
    label: 'VISUAL CHANNEL',
    labelZh: '影像頻道',
    platform: 'YouTube',
    url: 'https://www.youtube.com/@skixo13',
    icon: 'youtube',
  },
  {
    id: 'CH-02',
    label: 'PRIMARY FEED',
    labelZh: '主要訊號',
    platform: 'SoundCloud',
    url: 'https://soundcloud.com/skixo',
    icon: 'soundcloud',
  },
  {
    id: 'CH-03',
    label: 'GRID DISTRIBUTION',
    labelZh: '串流發行',
    platform: 'Spotify',
    url: 'https://open.spotify.com/artist/0bV3hLbjIx6fpRszSI0q5t',
    icon: 'spotify',
  },
  {
    id: 'CH-04',
    label: 'FIELD TRANSMISSIONS',
    labelZh: '現場傳輸',
    platform: 'Instagram',
    url: 'https://www.instagram.com/skixo/',
    icon: 'instagram',
  },
  {
    id: 'CH-05',
    label: 'BOOKINGS & DEMOS',
    labelZh: '演出邀約與投稿',
    platform: 'Contact',
    url: 'mailto:skixo@proton.me',
    icon: 'mail',
  },
];

export const navLinks = [
  { label: 'ARTIST',    labelZh: '藝術家',   href: '#artist'    },
  { label: 'SELECTED',  labelZh: '精選',     href: '#signal'    },
  { label: 'DOSSIER',   labelZh: '檔案',     href: '#dossier'   },
  { label: 'CATALOGUE', labelZh: '音樂目錄', href: '#catalogue' },
  { label: 'TUNE IN',   labelZh: '收聽',     href: '#tune-in'   },
];

export const footerQuotes = [
  { zh: '披荊斬棘', en: 'Cut through thorns.' },
  { zh: '乘風破浪', en: 'Ride the wind. Break the waves.' },
  { zh: '來源：未知', en: 'Origin: unknown.' },
];

// Redacted rows with a `secret` can be decrypted by press-and-hold.
export const dossierFile = [
  { key: 'SUBJECT',    value: 'skixO',                          redact: false },
  { key: 'ORIGIN',     value: '████████████',                   redact: true,
    secret: '51.5°N × 121.4°E — NO SUCH PLACE 不存在的座標' },
  { key: 'GENRE',      value: 'Liquid DnB · Glitch Architecture', redact: false },
  { key: 'FREQ',       value: '170–180 bpm',                    redact: false },
  { key: 'STATUS',     value: '● ACTIVE',                       redact: false, active: true },
  { key: 'ASSOCIATES', value: 'Berlin the Corner [TW]',         redact: false },
  { key: 'LANGUAGES',  value: 'English · 中文',                  redact: false },
  { key: 'ACCESS',     value: '████',                           redact: true,
    secret: 'LEVEL Ø — SELF-GRANTED 自授' },
];
