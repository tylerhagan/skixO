import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { initSmoothScroll, jumpToTop, scrollToId } from './lib/scroll';
import { LangProvider } from './hooks/useLang';
import { PlayerProvider } from './contexts/PlayerContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import MiniPlayer from './components/MiniPlayer';
import CustomCursor from './components/CustomCursor';
import LiquidField from './components/LiquidField';
import EntranceLoader from './components/EntranceLoader';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import Release from './pages/Release';
import Console from './pages/Console';
import SignalLost from './pages/SignalLost';
import './styles/globals.css';

// On route change: honor a requested section scroll (nav click from a
// subpage), otherwise jump to top.
function ScrollManager() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (state?.scrollTo) {
      requestAnimationFrame(() => scrollToId(state.scrollTo));
    } else {
      jumpToTop();
    }
  }, [pathname, state]);
  return null;
}

function Layout() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    return initSmoothScroll();
  }, [loaded]);

  return (
    <>
      <EntranceLoader onComplete={() => setLoaded(true)} />
      {loaded && (
        <>
          <LiquidField />
          <ScrollProgress />
          <CustomCursor />
          <Nav />
          <ScrollManager />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/release/:slug" element={<Release />} />
            <Route path="/console" element={<Console />} />
            <Route path="*" element={<SignalLost />} />
          </Routes>
          <Footer />
          <MiniPlayer />
        </>
      )}
    </>
  );
}

export default function App() {
  // A hint for the ones who open the hood
  useEffect(() => {
    console.log(
      '%c▓ SIGNAL FOUND %c\nyou found the back channel. it goes deeper: /console',
      // Signal rather than bone: devtools may be on a light theme, where
      // bone would be invisible. The accent reads on both.
      'color:#E8612C;font-family:monospace;letter-spacing:0.2em',
      'color:#888880;font-family:monospace'
    );
  }, []);

  return (
    <BrowserRouter>
      <LangProvider>
        <PlayerProvider>
          <Layout />
        </PlayerProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
