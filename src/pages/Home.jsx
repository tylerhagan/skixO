import ProveHero from '../components/ProveHero';
import ArtistSection from '../components/ArtistSection';
import SignalSection from '../components/SignalSection';
import DossierSection from '../components/DossierSection';
import TuneInSection from '../components/TuneInSection';
import SectionDivider from '../components/SectionDivider';

export default function Home() {
  return (
    <main>
      <ProveHero />
      <SectionDivider label="SKX-001" coord="51.5°N // 121.4°E" />

      <ArtistSection />
      <SectionDivider label="SKX-003" coord="FREQ: 174.0 bpm" />
      <SignalSection />
      <SectionDivider label="SKX-004" coord="ORIGIN: [REDACTED]" />
      <DossierSection />
      <SectionDivider label="SKX-005" coord="TRANSMISSION ACTIVE" />
      <TuneInSection />
    </main>
  );
}
