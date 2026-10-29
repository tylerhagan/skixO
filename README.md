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
│   └── prove-square.webp
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

---

## Forms & newsletter

The `/press` page carries a booking form and a newsletter capture. There is
no backend, so both work out of the box with `mailto:` and can be pointed at
a form service with two build-time environment variables (set them in the
Vercel project settings, or a local `.env`).

| Variable | Used by | Behaviour when set | When unset |
|----------|---------|--------------------|------------|
| `VITE_FORM_ENDPOINT` | `BookingForm` | POSTs JSON to the URL (Formspree-style) and shows sent / error states | Builds `mailto:skixo@proton.me` with a structured subject, e.g. `[BOOKING] Name — City 2026-11-20`, and opens it. `COPY MESSAGE` copies the same text for people without a mail client |
| `VITE_NEWSLETTER_ENDPOINT` | `Newsletter` | POSTs `{ "email": "..." }` as JSON | Opens a `mailto:` to skixo@proton.me with the subject `SUBSCRIBE` |

Booking payload: `_subject`, `type` (`booking`, `remix`, `press`, `other`),
`name`, `email`, `message`, plus `date`, `venue`, `city` for bookings.
Both forms have a honeypot field; submissions that fill it are dropped
silently. Vite inlines these variables at build time, so redeploy after
changing them.

`<Newsletter />` is self-contained and can be dropped into any section
inside `LangProvider`.

## Press kit

- Copy, facts and asset list live in the `press` export of `src/data/siteData.js`.
- `npm run press:pdf` regenerates `public/press/skixO-press-kit.pdf` (one A4
  page, pdfkit). It also runs as part of `prebuild`.
- Fonts for the PDF are in `scripts/art/fonts/`: the two Latin faces as TTF
  and a Noto Sans TC subset (`noto-sans-tc-subset.otf`). The subset only
  holds the characters currently used; if the Chinese copy gains new
  characters, rebuild it as described in the header of
  `scripts/build-press-kit.mjs`. Without the subset the script still runs
  and replaces the Chinese bio with a "see website" line.
- The Chinese press copy is a draft and needs a native check.

