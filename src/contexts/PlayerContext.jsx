import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { audioEngine } from '../lib/audioEngine';

// Two playback modes, decided by the track object:
//  - track.audioSrc set  → local excerpt through audioEngine (real analysis)
//  - track.audioSrc null → hidden SoundCloud iframe (MiniPlayer handles it)
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [track, setTrackState] = useState(null);
  const [playing, setPlaying] = useState(false);

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

  return (
    <PlayerContext.Provider value={{ track, setTrack, playing, toggle }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
