import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { audioEngine } from '../lib/audioEngine';

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
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [track, setTrackState] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [embedStopped, setEmbedStopped] = useState(false);

  useEffect(() => {
    const offs = [
      audioEngine.on('play', () => setPlaying(true)),
      audioEngine.on('pause', () => setPlaying(false)),
      audioEngine.on('ended', () => setPlaying(false)),
    ];
    return () => offs.forEach(off => off());
  }, []);

  const setTrack = useCallback(next => {
    setTrackState(next);
    setEmbedStopped(false);
    if (next?.audioSrc) {
      audioEngine.play(next.audioSrc).catch(err => console.error('playback failed:', err));
    } else {
      audioEngine.stop();
    }
  }, []);

  const toggle = useCallback(() => {
    if (!track?.audioSrc) return;
    if (playing) audioEngine.pause();
    else audioEngine.play(track.audioSrc).catch(err => console.error('playback failed:', err));
  }, [track, playing]);

  const live = !!track && (track.audioSrc ? playing : !embedStopped);

  return (
    <PlayerContext.Provider value={{ track, setTrack, playing, toggle, live, embedStopped, setEmbedStopped }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
