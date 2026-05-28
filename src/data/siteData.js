// ─────────────────────────────────────────────
// skixO — Site Data
// ─────────────────────────────────────────────

export const tracks = [
  {
    id: '01',
    title: 'LIGHTS IN YOUR EYES',
    titleZh: null,
    subtitle: 'skixO Remix',
    date: 'MAY 2026',
    url: 'https://soundcloud.com/skixo/lightinyoureyes',
  },
  {
    id: '02',
    title: 'NOCTURNE',
    titleZh: '夜曲',
    subtitle: 'skixO Remix',
    date: 'APR 2026',
    url: 'https://soundcloud.com/skixo/nocturne',
  },
  {
    id: '03',
    title: 'MI LA',
    titleZh: '米拉',
    subtitle: 'skixO Remix',
    date: 'JAN 2026',
    url: 'https://soundcloud.com/skixo/mi-la',
  },
  {
    id: '04',
    title: '日常',
    titleZh: 'EVERYDAY LIFE',
    subtitle: 'skixO Remix — Remastered',
    date: 'JAN 2026',
    url: 'https://soundcloud.com/skixo/everyday-life-skixo-remix-remastered',
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
  { label: 'PRØVE', href: '#prove' },
  { label: 'SIGNAL', href: '#signal' },
  { label: 'DOSSIER', href: '#dossier' },
  { label: 'TUNE IN', href: '#tune-in' },
];

export const footerQuotes = [
  { zh: '披荆斩棘', en: 'Cut through thorns.' },
  { zh: '乘风破浪', en: 'Ride the wind. Break the waves.' },
  { zh: '信号已捕获', en: 'Signal captured.' },
  { zh: '来源：未知', en: 'Origin: unknown.' },
  { zh: '无所畏惧', en: 'Fear nothing.' },
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
