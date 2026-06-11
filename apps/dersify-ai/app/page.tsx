import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Logos } from '@/components/sections/logos';
import { Problem } from '@/components/sections/problem';
import { HowItWorks } from '@/components/sections/how-it-works';
import { IntelligenceEngine } from '@/components/sections/intelligence-engine';
import { Features } from '@/components/sections/features';
import { Testimonials } from '@/components/sections/testimonials';
import { Mission } from '@/components/sections/mission';
import { WaitlistSection } from '@/components/sections/waitlist-section';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Problem />
        <HowItWorks />
        <IntelligenceEngine />
        <Features />
        <Testimonials />
        <Mission />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
