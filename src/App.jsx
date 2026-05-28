import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './hooks/useLang';
import { PlayerProvider } from './contexts/PlayerContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import MiniPlayer from './components/MiniPlayer';
import CustomCursor from './components/CustomCursor';
import EntranceLoader from './components/EntranceLoader';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import './styles/globals.css';

function Layout() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <EntranceLoader onComplete={() => setLoaded(true)} />
      {loaded && (
        <>
          <ScrollProgress />
          <CustomCursor />
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Future pages — uncomment to add: */}
            {/* <Route path="/release/:slug" element={<Release />} /> */}
          </Routes>
          <Footer />
          <MiniPlayer />
        </>
      )}
    </>
  );
}

export default function App() {
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
