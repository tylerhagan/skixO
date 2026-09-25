import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuredRelease, tracks, dossierFile } from '../data/siteData';
import { useLang } from '../hooks/useLang';
import { usePlayer } from '../contexts/PlayerContext';
import GlitchMask from '../components/GlitchMask';
import styles from './Console.module.css';

// The back channel. Unlisted — found via the browser console hint,
// curiosity, or word of mouth. Commands are deliberately lo-fi.
const BANNER = [
  'skixO back channel // v0.3',
  '訊號攔截站 — unauthorized access tolerated',
  "type 'help' to begin",
];

export default function Console() {
  const { toggle: toggleLang } = useLang();
  const { setTrack, playing, toggle } = usePlayer();
  const navigate = useNavigate();
  const [lines, setLines] = useState(BANNER.map(text => ({ text })));
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    document.title = '/// back channel — skixO';
    inputRef.current?.focus();
    return () => { document.title = 'skixO'; };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const print = (...texts) =>
    setLines(prev => [...prev, ...texts.map(text => ({ text }))]);

  const run = raw => {
    const cmd = raw.trim().toLowerCase();
    const [name, ...args] = cmd.split(/\s+/);
    setLines(prev => [...prev, { text: `> ${raw}`, own: true }]);
    if (!name) return;

    switch (name) {
      case 'help':
        print(
          'help        — this list',
          'signal      — current transmission status',
          'catalogue   — selected transmissions',
          'dossier     — subject file',
          'play / stop — the latest signal, right here',
          'tune <freq> — search the spectrum',
          'lang        — 切換語言 / switch language',
          'clear       — wipe the terminal',
          'exit        — return to base',
        );
        break;
      case 'whoami':
        print('guest // clearance: none // location: triangulating…');
        break;
      case 'signal':
        print(
          'SIGNAL ACTIVE — 174.0 bpm',
          `latest transmission: ${featuredRelease.title} feat. ${featuredRelease.feat}`,
          `released ${featuredRelease.date} // try: play`,
        );
        break;
      case 'catalogue':
        tracks.forEach(tr => print(`${tr.id}  ${tr.title}  — ${tr.date}`));
        print('full archive: /#catalogue');
        break;
      case 'dossier':
        dossierFile.forEach(row => print(`${row.key.padEnd(11)} ${row.value}`));
        print('… some fields resist. hold them, on the main page.');
        break;
      case 'play':
        setTrack({
          id: 'featured',
          title: featuredRelease.title,
          subtitle: `feat. ${featuredRelease.feat}`,
          url: featuredRelease.soundcloudUrl,
          audioSrc: featuredRelease.audioSrc,
        });
        print('▓ transmitting…');
        break;
      case 'stop':
      case 'pause':
        if (playing) { toggle(); print('◼ signal paused.'); }
        else print('nothing is playing.');
        break;
      case 'tune': {
        const f = parseFloat(args[0]);
        if (args[0] === undefined) print('usage: tune <frequency>');
        else if (f === 174) {
          setTrack({
            id: 'featured',
            title: featuredRelease.title,
            subtitle: `feat. ${featuredRelease.feat}`,
            url: featuredRelease.soundcloudUrl,
            audioSrc: featuredRelease.audioSrc,
          });
          print('174.0 — LOCKED. ▓ transmitting…');
        }
        else if (f === 51.5 || f === 121.4) print('coordinates, not frequencies. and that place does not exist.');
        else print(`${args[0]} — …static…`);
        break;
      }
      case 'decrypt':
        print('decryption requires a physical hold. see the DOSSIER.');
        break;
      case 'icarus':
        print(
          '披荊斬棘',
          'fly on these second-hand wings —',
          'the melting point of wax means nothing to me.',
        );
        break;
      case 'lang':
        toggleLang();
        print('language toggled. 語言已切換。');
        break;
      case 'clear':
        setLines([]);
        break;
      case 'exit':
        print('returning to base…');
        setTimeout(() => navigate('/'), 400);
        break;
      default:
        print(`unrecognized transmission: '${name}' — try 'help'`);
    }
  };

  const onSubmit = e => {
    e.preventDefault();
    run(input);
    setInput('');
  };

  return (
    <main className={styles.page} onClick={() => inputRef.current?.focus()}>
      {/* Station ident — the back channel's own broken signal, corner-mounted
          the way a broadcast overlay marks its feed. */}
      <GlitchMask size={44} className={styles.ident} />

      <div className={styles.terminal}>
        {lines.map((l, i) => (
          <div key={i} className={l.own ? styles.own : styles.line}>{l.text}</div>
        ))}
        <form onSubmit={onSubmit} className={styles.inputRow}>
          <span className={styles.prompt}>&gt;</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Console command"
          />
        </form>
        <div ref={endRef} />
      </div>
    </main>
  );
}
