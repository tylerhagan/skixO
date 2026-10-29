// ─────────────────────────────────────────────
// skixO — Releases (the single catalogue)
//
// One entry per release. This file drives the catalogue grid, the
// Selected list, the /release/:slug pages, the tuner's stations, the
// mini-player queue, the cover build script and the per-release
// structured data. Every other list on the site is derived from it.
//
// Fields
//   slug          URL and file key (/release/<slug>, audio-src/<slug>.wav,
//                 public/audio/<slug>.mp3, peaks.json[<slug>])
//   catalogue     'SKX-0NN' — display only
//   type          'original' | 'remix' | 'eastern'
//   title / titleZh
//   artist        the original artist, for remixes (null for originals)
//   feat          featured artist credit, if any
//   date          'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD' — formatDate() renders
//                 whichever precision is known, in either language
//   bpm           string or null
//   youtubeId     the video; its cover is baked to public/covers/<id>.webp
//   cover         optional designed-cover spec for scripts/build-covers.mjs
//                 { scene, treatment } — see that file
//   soundcloudUrl / spotifyUrl   null hides the button
//   audioSrc      hosted excerpt (public/audio/<slug>.mp3) — enables the
//                 Web Audio player, the tuner station and the queue.
//                 Generate with `npm run audio:excerpts`.
//   excerpt       optional { start: seconds } — where that excerpt is cut
//                 from (default: 25% into the track). Only read by
//                 scripts/make-excerpts.mjs.
//   artwork       square master for the release page; falls back to the
//                 baked cover when null
//   tagline / story / credits / lyrics   optional, bilingual {en, zh}
//
// Each release also gets, at build time (postbuild):
//   public/og/<slug>.png          1200×630 share card (scripts/build-og.mjs)
//   dist/release/<slug>/index.html  the SPA shell with that release's
//                 title/description/og:* baked in, so link previews work
//                 (scripts/prerender-release-meta.mjs)
// Adding a release here is all it takes; commit the new og PNG.
//
// Order: newest first. The catalogue grid keeps this order; the queue
// plays it top to bottom.
// ─────────────────────────────────────────────

export const releases = [
  {
    slug: 'prove',
    catalogue: 'SKX-017',
    type: 'original',
    title: 'PRØVE',
    titleZh: null,
    artist: null,
    feat: 'Berlin the Corner',
    date: '2026-05-30',
    bpm: '174.0',
    youtubeId: 'q2PAD9txKlE',
    soundcloudUrl: 'https://soundcloud.com/skixo/prove-s',
    spotifyUrl: 'https://open.spotify.com/track/0WscgaBAIUQeqSZEj78lX7',
    audioSrc: '/audio/prove-clip.mp3',
    artwork: '/prove-square.webp',
    tagline: { en: 'East meets underground. A statement.', zh: '東方遇上地下。一個宣言。' },
    story: [
      {
        en: 'Seventeen transmissions in, the signal stopped borrowing voices. PRØVE is the first original statement — built from the ground up at 174, with Berlin the Corner carrying the eastern frequency straight from Taipei.',
        zh: '第十七次傳輸，訊號不再借用他人的聲音。《PRØVE》是第一個原創宣言——以174 BPM從零打造，柏林角落將東方頻率直接從台北傳來。',
      },
      {
        en: 'Liquid low-end under glitch architecture: the two halves of the signal finally speaking at once.',
        zh: '液態低頻之下是故障建築：訊號的兩個半體終於同時發聲。',
      },
    ],
    credits: [
      { role: { en: 'PRODUCTION', zh: '製作' }, name: 'skixO' },
      { role: { en: 'FEATURING', zh: '特別收錄' }, name: 'Berlin the Corner 柏林角落' },
      { role: { en: 'MIX & MASTER', zh: '混音與母帶' }, name: 'skixO' },
      { role: { en: 'ARTWORK', zh: '封面設計' }, name: 'skixO' },
    ],
    // Lines: { zh, en? } — en column appears per-line when provided.
    // { br: true } marks a stanza break.
    lyrics: [
      { zh: '沒有聯繫' },
      { zh: '三天沒睡' },
      { zh: '紅著眼睛' },
      { zh: '你知道我不會騙你' },
      { zh: '他要我努力競爭' },
      { zh: '都這個年紀' },
      { zh: '我總是墊底' },
      { br: true },
      { zh: '未來都留在過去' },
      { zh: '所以我很有想到以後' },
      { zh: '我試著在釜底抽薪' },
      { br: true },
      { zh: '我釜底抽薪' },
      { zh: '我想法很多' },
      { zh: '大概還需要練習' },
      { zh: '我三天沒睡' },
      { zh: '紅著眼睛' },
      { zh: '你知道我不會騙你' },
      { br: true },
      { zh: '他要我努力競爭' },
      { zh: '都這個年紀' },
      { zh: '我總是墊底' },
      { zh: '我聯絡著D' },
      { zh: '交貨的地點還有點偏僻' },
      { zh: '知道的人心再多' },
      { zh: '所以我平常都故意不說' },
      { zh: '不需要為誰來收' },
      { zh: '又不是準備要查我戶口' },
      { zh: '有時候等我開口' },
      { zh: '早就知道' },
      { zh: '我們的確不同' },
      { br: true },
      { zh: '未來都留在過去' },
      { zh: '所以我很有想到以後' },
      { zh: '我試著在釜底抽薪' },
      { zh: '我想法很多' },
      { zh: '大概還需要練習' },
      { zh: '我三天沒睡' },
      { zh: '紅著眼睛' },
      { zh: '你知道我不會騙你' },
    ],
  },

  // ── Eastern Remixes ──────────────────────────
  {
    slug: 'lights-in-your-eyes',
    catalogue: 'SKX-016',
    type: 'eastern',
    title: 'LIGHTS IN YOUR EYES',
    titleZh: null,
    artist: 'Gummy B',
    feat: null,
    date: '2026-05',
    bpm: null,
    youtubeId: 'a2sSj_aiDhY',
    soundcloudUrl: 'https://soundcloud.com/skixo/lightinyoureyes',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'nocturne',
    catalogue: 'SKX-015',
    type: 'eastern',
    title: 'NOCTURNE',
    titleZh: '夜曲',
    artist: '周杰倫 Jay Chou',
    feat: null,
    date: '2026-04',
    bpm: null,
    youtubeId: '7lnSVhn_RyY',
    soundcloudUrl: 'https://soundcloud.com/skixo/nocturne',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'model',
    catalogue: 'SKX-014',
    type: 'eastern',
    title: 'MODEL',
    titleZh: '模特',
    artist: '李榮浩 Ronghao Li',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'RfXKNRE-59w',
    soundcloudUrl: 'https://soundcloud.com/skixo/model-skixo-remix',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'who',
    catalogue: 'SKX-013',
    type: 'eastern',
    title: 'WHO',
    titleZh: '誰',
    artist: '廖俊澧 ft. 岑寧兒',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'kKq-jU_WJ7s',
    soundcloudUrl: 'https://soundcloud.com/skixo/who-remix',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'only-a-spell',
    catalogue: 'SKX-012',
    type: 'eastern',
    title: '只有咒語才能解除咒語',
    titleZh: null,
    artist: '柏林角落 Berlin the Corner',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'AU42eLgyLPY',
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'oh-love',
    catalogue: 'SKX-011',
    type: 'eastern',
    title: '愛情你比我想的還較偉大',
    titleZh: null,
    artist: '茄子蛋 EggPlantEgg',
    feat: null,
    date: '2024',
    bpm: null,
    youtubeId: '5zdidTaZf3M',
    soundcloudUrl: 'https://soundcloud.com/skixo/oh-love-you-are-much-greater-than-i-imagined-eggplantegg-skixo-remix',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'lie',
    catalogue: 'SKX-010',
    type: 'eastern',
    title: 'LIE',
    titleZh: '床',
    artist: '草東沒有派對 No Party for Cao Dong',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'hei62d71fuA',
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'next-life',
    catalogue: 'SKX-009',
    type: 'eastern',
    title: '我若是有來生我想欲變成你',
    titleZh: null,
    artist: '茄子蛋 EggPlantEgg ft. YVV',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: '3bVGE5g3ibM',
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'everyday-life',
    catalogue: 'SKX-008',
    type: 'eastern',
    title: 'EVERYDAY LIFE',
    titleZh: '日常',
    artist: '茄子蛋 EggPlantEgg',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'zvRfal00Wmg',
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },

  // ── Other Remixes ────────────────────────────
  {
    slug: 'mila',
    catalogue: 'SKX-007',
    type: 'remix',
    title: 'MILA',
    titleZh: '米拉',
    artist: 'Xu Bin 徐濱',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'XyQpKZ9WxKc',
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'the-winner-is-2012',
    catalogue: 'SKX-006',
    type: 'remix',
    title: 'THE WINNER IS (2012)',
    titleZh: null,
    artist: 'DeVotchKa',
    feat: null,
    date: '2012',
    bpm: null,
    youtubeId: 'BLhdjHB2Zbo',
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'the-winner-is',
    catalogue: 'SKX-005',
    type: 'remix',
    title: 'THE WINNER IS',
    titleZh: null,
    artist: 'DeVotchKa',
    feat: null,
    date: null,
    bpm: null,
    youtubeId: '2ZLQmdZGyIk',
    soundcloudUrl: 'https://soundcloud.com/skixo/the-winner-is-remix',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },

  // ── Originals ────────────────────────────────
  {
    slug: 'duen',
    catalogue: 'SKX-004',
    type: 'original',
    title: 'DUEN',
    titleZh: null,
    artist: null,
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'YKsIuaGSStQ',
    cover: { scene: 'wistful-night-coastline', treatment: 'duotone' },
    soundcloudUrl: 'https://soundcloud.com/skixo/duen-demo',
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'midnight',
    catalogue: 'SKX-003',
    type: 'original',
    title: 'MIDNIGHT',
    titleZh: null,
    artist: null,
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'AlprPVhKRu4',
    cover: { scene: 'wistful-night-cityskyline', treatment: 'duotone' },
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'oh-god',
    catalogue: 'SKX-002',
    type: 'original',
    title: 'OH GOD',
    titleZh: null,
    artist: null,
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'YQy7s0y5Kuc',
    cover: { scene: 'surreal-night-eclipse', treatment: 'duotone' },
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: 'need',
    catalogue: 'SKX-001',
    type: 'original',
    title: 'NEED',
    titleZh: null,
    artist: null,
    feat: null,
    date: null,
    bpm: null,
    youtubeId: '2dQapfiJrpw',
    cover: { scene: 'wistful-night-rain-window', treatment: 'duotone' },
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
  {
    slug: '1-48',
    catalogue: 'SKX-000',
    type: 'original',
    title: '1:48',
    titleZh: null,
    artist: null,
    feat: null,
    date: null,
    bpm: null,
    youtubeId: 'vSeMjPox2H4',
    cover: { scene: 'wistful-night-asiancityl', treatment: 'duotone' },
    soundcloudUrl: null,
    spotifyUrl: null,
    audioSrc: null,
    artwork: null,
  },
];

// ── Derived views ─────────────────────────────

export const getRelease = slug => releases.find(r => r.slug === slug);

// The current featured release: the newest entry. Hero card, artist
// section player, tuner's live station and the ticker all follow it.
export const featured = releases[0];

// Display title: the Latin title with the Han title beside it, when both
// exist. Order follows the language.
export const displayTitle = (r, lang = 'en') => {
  if (!r.titleZh) return r.title;
  return lang === 'zh' ? `${r.titleZh} ${r.title}` : `${r.title} ${r.titleZh}`;
};

// Credit line under a title: "skixO Remix", "EggPlantEgg — skixO Remix",
// "feat. Berlin the Corner".
export const creditLine = (r, lang = 'en') => {
  const remix = lang === 'zh' ? 'skixO 混音' : 'skixO Remix';
  if (r.type === 'original') return r.feat ? (lang === 'zh' ? `特別收錄 ${r.feat}` : `feat. ${r.feat}`) : 'skixO';
  return r.artist ? `${r.artist} — ${remix}` : remix;
};

// Square-ish cover for lists and the queue: the designed artwork when
// there is one, otherwise the baked duotone card.
export const coverSrc = r => r.artwork || `/covers/${r.youtubeId}-duo.webp`;

// Track object for PlayerContext.setTrack
export const toTrack = (r, lang = 'en') => ({
  id: `release-${r.slug}`,
  slug: r.slug,
  title: displayTitle(r, lang),
  subtitle: creditLine(r, lang),
  url: r.soundcloudUrl || `https://www.youtube.com/watch?v=${r.youtubeId}`,
  audioSrc: r.audioSrc,
  artwork: coverSrc(r),
});

// Type label for cards and the release page, bilingual.
export const TYPE_LABEL = {
  original: { en: 'ORIGINAL',      zh: '原創' },
  remix:    { en: 'REMIX',         zh: '混音' },
  eastern:  { en: 'EASTERN REMIX', zh: '東方混音' },
};

// Canonical origin, shared by the structured data and the build scripts.
export const SITE_URL = 'https://www.skixo.uk';
export const releaseUrl = r => `${SITE_URL}/release/${r.slug}`;

// One-line description for <meta name="description"> and og:description.
// English only: crawlers read one language, and the site's default is en.
export const releaseDescription = r => {
  const bits = [displayTitle(r), creditLine(r)];
  if (r.tagline?.en) bits.push(r.tagline.en);
  else bits.push('Liquid Drum & Bass.');
  return bits.join(' · ');
};

// schema.org ItemList of every release page, for the home page.
export const catalogueLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'skixO catalogue',
  itemListElement: releases.map((r, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: releaseUrl(r),
    name: displayTitle(r),
  })),
};

// Everything with a hosted excerpt, in catalogue order — the queue.
export const playable = () => releases.filter(r => r.audioSrc);
