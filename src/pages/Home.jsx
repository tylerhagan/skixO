import ProveHero from '../components/ProveHero';
import AboutSection from '../components/AboutSection';
import ArtistSection from '../components/ArtistSection';
import SignalSection from '../components/SignalSection';
import DossierSection from '../components/DossierSection';
import MusicSection from '../components/MusicSection';
import TuneInSection from '../components/TuneInSection';
import SectionDivider from '../components/SectionDivider';

export default function Home() {
  return (
    <main>
      <ProveHero />
      <SectionDivider label="SKX-001" coord="51.5°N // 121.4°E" />
      <AboutSection />
      <SectionDivider label="SKX-002" coord="LONDON · BERLIN · TAIPEI" />
      <ArtistSection />
      <SectionDivider label="SKX-003" coord="FREQ: 174.0 bpm" />
      <SignalSection />
      <SectionDivider label="SKX-004" coord="ORIGIN: [REDACTED]" />
      <DossierSection />
      <SectionDivider label="SKX-005" coord="CATALOGUE // 17 RELEASES" />
      <MusicSection />
      <SectionDivider label="SKX-006" coord="TRANSMISSION ACTIVE" />
      <TuneInSection />
    </main>
  );
}
