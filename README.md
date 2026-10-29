# skixO — Official Website

Liquid Drum & Bass artist website. Built with Vite + React + Framer Motion.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite | Build tool & dev server |
| React 18 | UI framework |
| Framer Motion | Animations & transitions |
| React Router DOM | Client-side routing |
| CSS Modules | Scoped component styles |

---

## Project Structure

```
skixo-react/
├── public/                  # Static assets served at root
│   ├── hero-banner.png
│   ├── avatar-circle.png
│   ├── prove-thumbnail.png
│   └── prove-square.png
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CustomCursor.jsx / .module.css
│   │   ├── Nav.jsx / .module.css
│   │   ├── SectionTag.jsx / .module.css
│   │   ├── ProveHero.jsx / .module.css
│   │   ├── ArtistSection.jsx / .module.css
│   │   ├── SignalSection.jsx / .module.css
│   │   ├── DossierSection.jsx / .module.css
│   │   ├── TuneInSection.jsx / .module.css
│   │   └── Footer.jsx / .module.css
│   │
│   ├── pages/
│   │   └── Home.jsx
│   │
│   ├── hooks/
│   │   ├── useLang.jsx      <- EN/ZH language context
│   │   └── useScrollSpy.js  <- Active nav section detection
│   │
│   ├── data/
│   │   └── siteData.js      <- All content: tracks, channels, quotes, dossier
│   │
│   └── styles/
│       └── globals.css      <- CSS variables, resets, grain overlay
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # production build
npm run preview   # preview production build locally
```

---

## Audio (excerpts, queue, tuner)

Releases in `src/data/releases.js` with an `audioSrc` play a hosted 45s
excerpt through the Web Audio engine: real analysis drives the visuals,
they join the mini player's queue (prev/next, auto-advance, seek) and each
gets its own station on the Tune In dial. Releases without one fall back to
the hidden SoundCloud embed (or a YouTube link).

**Cutting excerpts** (needs ffmpeg on PATH: `winget install ffmpeg`):

1. Bounce full-length WAVs into `audio-src/<slug>.wav` (gitignored, local only).
2. Run:
   ```powershell
   npm run audio:excerpts                 # new ones only
   npm run audio:excerpts -- --force      # redo all
   npm run audio:excerpts -- --only=prove # one release
   ```
   Each becomes `public/audio/<slug>.mp3`: 45s from 25% in, 0.5s fade in /
   1.5s fade out, loudness-normalised to about -14 LUFS, MP3 128k stereo
   (~700KB). To cut from a different point, set
   `excerpt: { start: <seconds> }` on that release.
3. The script prints the `audioSrc: '/audio/<slug>.mp3'` lines to paste into
   `releases.js`. The site only plays what the data names; nothing is
   auto-detected.
4. Commit the MP3s. Never commit the WAVs.

No ffmpeg or no `audio-src/` (Vercel, CI): the script skips with a hint and
exits cleanly. It is not part of `prebuild`.

`npm run audio:peaks` (waveform shapes for the track cards) reads the same
`audio-src/` WAVs.

---

## Deployment (Vercel)

1. Push repo to GitHub
2. Import in vercel.com — auto-detects Vite, no config needed
3. Deploy. Subsequent deploys on every push to main.

---

## Swapping the Hero (after ~1 month)

In src/pages/Home.jsx, swap <ProveHero /> for an artist identity hero once PROVE has had its launch window.

---

## Adding a New Release

1. Add track to src/data/siteData.js tracks array
2. Add artwork to public/
3. Swap hero component in Home.jsx for launch period

---

## Logo File (incoming)

When the skixO logo file arrives, add it to public/logo.svg and update Nav.jsx:
  <img src="/logo.svg" alt="skixO" className={styles.logoImg} />

---

## Language System

Uses LangProvider context. To translate any string:
  const { t } = useLang();
  {t('English text', '中文文本')}
