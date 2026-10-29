import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { audioEngine } from '../lib/audioEngine';
import { releases, featured, toTrack } from '../data/releases';
import { useLang } from '../hooks/useLang';

// Two playback modes, decided by the track object:
//  - track.audioSrc set  → local excerpt through audioEngine (real analysis)
//  - track.audioSrc null → hidden SoundCloud iframe (MiniPlayer handles it)
//
// `live` is the one answer to "is something actually playing right now",
// across both modes — the thing --signal is allowed to mean. `playing`
// alone only knows about the local engine: an embed never reports it, so
// anything gating the accent on `playing` would stay dark for every
// SoundCloud track, and anything gating on `track` alone would stay lit
// after the mini player's stop button. The embed's stopped state lives
// here (not inside MiniPlayer) for exactly that reason.
//
// The queue is the catalogue in order, limited to what can actually play
// on the site: a hosted excerpt (audioSrc, see playable()) or a
// SoundCloud page for the embed. next()/prev() walk all of it. Auto-advance
// only follows local excerpts (an embed can't tell us when it ends, and an
// iframe auto-playing with no gesture is a coin toss), and stops at the
// end of the catalogue rather than wrapping.
//
// The featured release keeps the id 'featured' in the queue: the hero,
// FeaturedCard and /console all recognise it by that id.
const PlayerContext = createContext(null);

const queueable = r => !!(r.audioSrc || r.soundcloudUrl);
const asQueueTrack = (r, lang) => ({ ...toTrack(r, lang), ...(r === featured ? { id: 'featured' } : null) });

// Hero / console build their own featured track object without a slug,
// so position in the queue falls back to the media it points at.
const findIndex = (queue, track) => {
  if (!track) return -1;
  let i = track.slug ? queue.findIndex(q => q.slug === track.slug) : -1;
  if (i < 0 && track.audioSrc) i = queue.findIndex(q => q.audioSrc === track.audioSrc);
  if (i < 0 && track.url) i = queue.findIndex(q => q.url === track.url);
  return i;
};

export function PlayerProvider({ children }) {
  const { lang } = useLang();
  const [track, setTrackState] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [embedStopped, setEmbedStopped] = useState(false);
  const [time, setTime] = useState({ currentTime: 0, duration: 0 });
  const [autoAdvance, setAutoAdvance] = useState(true);

  const queue = useMemo(
    () => releases.filter(queueable).map(r => asQueueTrack(r, lang)),
    [lang],
  );
  const index = findIndex(queue, track);

  const setTrack = useCallback(next => {
    setTrackState(next);
    setEmbedStopped(false);
    setTime({ currentTime: 0, duration: 0 });
    if (next?.audioSrc) {
      audioEngine.play(next.audioSrc).catch(err => console.error('playback failed:', err));
    } else {
      audioEngine.stop();
    }
  }, []);

  // Latest values for the engine's 'ended' handler, which is bound once.
  const latest = useRef({ queue, index, setTrack, autoAdvance });
  useEffect(() => { latest.current = { queue, index, setTrack, autoAdvance }; });

  useEffect(() => {
    const offs = [
      audioEngine.on('play', () => setPlaying(true)),
      audioEngine.on('pause', () => setPlaying(false)),
      audioEngine.on('ended', () => {
        setPlaying(false);
        const { queue: q, index: i, setTrack: set, autoAdvance: auto } = latest.current;
        if (!auto || i < 0) return;
        const nextLocal = q.slice(i + 1).find(t => t.audioSrc);
        if (nextLocal) set(nextLocal);
      }),
      audioEngine.on('time', t => setTime(t)),
    ];
    return () => offs.forEach(off => off());
  }, []);

  const toggle = useCallback(() => {
    if (!track?.audioSrc) return;
    if (playing) audioEngine.pause();
    else audioEngine.play(track.audioSrc).catch(err => console.error('playback failed:', err));
  }, [track, playing]);

  const next = useCallback(() => {
    if (index < 0 || index >= queue.length - 1) return;
    setTrack(queue[index + 1]);
  }, [queue, index, setTrack]);

  // Like every player: more than a few seconds in, "back" means "from the top".
  const prev = useCallback(() => {
    if (track?.audioSrc && time.currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    if (index <= 0) return;
    setTrack(queue[index - 1]);
  }, [queue, index, track, time.currentTime, setTrack]);

  const playQueue = useCallback(startSlug => {
    const start = queue.find(q => q.slug === startSlug) ?? queue[0];
    if (start) setTrack(start);
  }, [queue, setTrack]);

  const seek = useCallback(fraction => audioEngine.seek(fraction), []);

  const live = !!track && (track.audioSrc ? playing : !embedStopped);
  const isLocal = !!track?.audioSrc;
  const duration = isLocal ? time.duration : 0;
  const progress = isLocal && time.duration > 0 ? Math.min(1, time.currentTime / time.duration) : 0;

  return (
    <PlayerContext.Provider
      value={{
        track, setTrack, playing, toggle, live, embedStopped, setEmbedStopped,
        queue, index, next, prev, playQueue, seek, progress, duration,
        autoAdvance, setAutoAdvance,
        hasNext: index >= 0 && index < queue.length - 1,
        hasPrev: index > 0 || (isLocal && time.currentTime > 3),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlayer = () => useContext(PlayerContext);
