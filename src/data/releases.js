// ─────────────────────────────────────────────
// skixO — Release files
//
// One entry per release drives its /release/:slug page.
// `lyrics: null` hides the lyrics section until supplied;
// same for any optional field. Bilingual fields are {en, zh}.
// ─────────────────────────────────────────────

export const releases = [
  {
    slug: 'prove',
    catalogue: 'SKX-017',
    title: 'PRØVE',
    feat: 'Berlin the Corner',
    date: '30 MAY 2026',
    bpm: '174.0',
    artwork: '/prove-square.png',
    youtubeId: 'q2PAD9txKlE',
    soundcloudUrl: 'https://soundcloud.com/skixo/prove-s',
    spotifyUrl: 'https://open.spotify.com/track/0WscgaBAIUQeqSZEj78lX7',
    audioSrc: '/audio/prove-clip.mp3',
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
];

export const getRelease = slug => releases.find(r => r.slug === slug);
