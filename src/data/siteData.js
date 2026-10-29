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
    url: '/press#booking',
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

// ── Press kit ────────────────────────────────
// One source for /press and scripts/build-press-kit.mjs (plain ESM, safe to
// import from Node). Change the copy here and re-run `npm run press:pdf`.
// If the Chinese copy gains new characters, re-run the CJK subset step
// documented in the header of scripts/build-press-kit.mjs.
export const press = {
  email: 'skixo@proton.me',
  bpm: '170\u2013180',
  base: 'Berlin, DE',
  origin: 'London, UK',
  releases: 17,
  pdf: '/press/skixO-press-kit.pdf',
  // zh: draft, needs native check
  zhDraft: true,
  bios: {
    short: {
      en: 'skixO is a London-born, Berlin-based producer making liquid drum & bass. After an eighteen-year silence he came back to the desk, and the Eastern Remixes series now reworks Chinese and Taiwanese artists. PRØVE feat. Berlin the Corner is his first original single, part of a catalogue now at 17 releases.',
      zh: 'skixO 生於倫敦，現居柏林，創作液態鼓打貝斯。沉寂十八年後，他重回混音台前，「東方重混」系列重新詮釋華語與台灣藝術家的作品。《PRØVE》（與 Berlin the Corner 合作）是他的首支原創單曲，至今共發行 17 件作品。',
    },
    long: {
      en: 'skixO is a producer born in London and based in Berlin, writing liquid drum & bass that is hooky, restless and built for movement. Glitch is the second language: stutters, cuts and hard edges laid over warm, rolling basslines, so a track can feel both organic and machined. After twenty-five years of production and an eighteen-year silence, he returned to the desk three years ago. The music never left. It waited.\n\nThe Eastern Remixes series began with something more personal than craft: a partner from Taiwan, travel across Asia and friendships built in Taipei. It reworks the songs of Chinese and Taiwanese artists through liquid drum & bass and glitch, keeping the melodies and rewiring everything underneath.\n\nWith PRØVE feat. Berlin the Corner, released on 30 May 2026, the sound became his own: his first original single. The catalogue now stands at 17 releases, played at 170 to 180 BPM.',
      zh: 'skixO 生於倫敦，現居柏林，創作旋律鮮明、躁動、為律動而生的液態鼓打貝斯。故障音效是他的第二語言：碎裂、切斷與銳利的邊緣，疊在溫暖滾動的貝斯線上，讓一首曲子同時帶有有機與機械的質地。經歷二十五年的製作歲月與十八年的沉寂後，他於三年前重返混音台。音樂從未離開，只是一直在等待。\n\n「東方重混」系列的起點，比技藝更貼近個人：一位來自台灣的伴侶、走遍亞洲的旅程，以及在台北結下的友誼。這個系列透過液態鼓打貝斯與故障音效，重新詮釋華語與台灣藝術家的歌曲，保留旋律，重新接線其餘一切。\n\n2026 年 5 月 30 日發行的《PRØVE》（與 Berlin the Corner 合作）是他的首支原創單曲，聲音從此屬於他自己。目前共發行 17 件作品，速度落在 170 至 180 BPM。',
    },
  },
  // Dimensions checked with sharp/identify; SVGs are vector, viewBox size shown.
  assets: [
    { id: 'portrait', file: 'portrait.webp', href: '/portrait.webp', w: 750, h: 750, fmt: 'WEBP',
      en: 'Portrait', zh: '肖像' },
    { id: 'lean', file: 'lean-up.webp', href: '/mascot/lean-up.webp', w: 1024, h: 1536, fmt: 'WEBP',
      en: 'Mascot, full figure', zh: '吉祥物，全身' },
    { id: 'peek', file: 'cutout-peek-still.webp', href: '/mascot/cutout-peek-still.webp', w: 1254, h: 1254, fmt: 'WEBP',
      en: 'Mascot, cut-out', zh: '吉祥物，去背' },
    { id: 'emblem', file: 'emblem.svg', href: '/emblem.svg', w: 1024, h: 1024, fmt: 'SVG',
      en: 'Emblem', zh: '徽章' },
    { id: 'wordmark', file: 'wordmark-cut-bone.svg', href: '/wordmark-cut-bone.svg', w: 502, h: 159, fmt: 'SVG',
      en: 'Wordmark, bone', zh: '字標，骨白' },
    { id: 'glyph', file: 'skixO-glyph.svg', href: '/skixO-glyph.svg', w: 1104, h: 1104, fmt: 'SVG', mask: true,
      en: 'Glyph', zh: '符號' },
    { id: 'prove', file: 'prove-square.png', href: '/prove-square.png', w: 3000, h: 3000, fmt: 'PNG',
      en: 'PR\u00d8VE artwork', zh: '《PR\u00d8VE》封面' },
  ],
};
