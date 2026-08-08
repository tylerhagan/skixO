import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import AboutSection from '../components/AboutSection';
import ArtistSection from '../components/ArtistSection';
import SignalSection from '../components/SignalSection';
import DossierSection from '../components/DossierSection';
import MusicSection from '../components/MusicSection';
import TuneInSection from '../components/TuneInSection';
import SectionDivider from '../components/SectionDivider';

// Three seams, not six — the ticker marks the first one, so no divider
// sits directly beneath it. Marking every section made the structure
// announce itself.
export default function Home() {
  return (
    <main>
      <Hero />
      <Ticker />
      <AboutSection />
      <ArtistSection />
      <SignalSection />
      <SectionDivider label="SKX-001" />
      <DossierSection />
      <SectionDivider label="SKX-002" />
      <MusicSection />
      <TuneInSection />
    </main>
  );
}
