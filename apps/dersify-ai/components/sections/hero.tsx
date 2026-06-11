'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';
import { ProductMockup } from '@/components/ui/product-mockup';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const entrance = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE, delay },
});

const AVATARS = [
  { initial: 'A', gradient: 'linear-gradient(135deg, #1B4FDB 0%, #0D9488 100%)' },
  { initial: 'H', gradient: 'linear-gradient(135deg, #0D9488 0%, #1B4FDB 100%)' },
  { initial: 'Y', gradient: 'linear-gradient(135deg, #1B4FDB 40%, #0D9488 100%)' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function Hero() {
  return (
    <section className="noise relative flex min-h-screen items-center overflow-hidden bg-navy">
      {/* Background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 800px 600px at -100px -200px, rgba(27,79,219,0.12) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 600px 500px at 110% 110%, rgba(13,148,136,0.10) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-16 px-6 py-32 lg:grid-cols-2 lg:gap-12 lg:px-12">
        {/* LEFT */}
        <div>
          <motion.div
            {...entrance(0)}
            className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/[0.12] px-3.5 py-1.5"
          >
            <span className="gradient-bg animate-pulse-dot h-2 w-2 rounded-full" />
            <span className="text-[13px] font-medium tracking-[0.04em] text-[#5B7FE8]">
              Early Access
            </span>
          </motion.div>

          <motion.h1
            {...entrance(0.1)}
            className="mt-6 max-w-[580px] text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white lg:text-7xl"
          >
            Every learner deserves{' '}
            <span className="gradient-text">a personal tutor.</span>
          </motion.h1>

          <motion.p
            {...entrance(0.2)}
            className="mt-5 max-w-[520px] text-lg leading-[1.7] text-[#9CA3AF]"
          >
            Dersify builds a complete model of how you learn — your strengths, your
            gaps, your misconceptions. Then it teaches you exactly what you need,
            exactly how you need it. Every session, smarter than the last.
          </motion.p>

          <motion.div {...entrance(0.3)} className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo('waitlist')}
              className="gradient-bg rounded-[10px] px-7 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(27,79,219,0.5)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(27,79,219,0.65)]"
            >
              Join the waitlist →
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="rounded-[10px] border border-white/15 px-7 py-3.5 text-base text-white transition-all duration-200 hover:border-white/30 hover:bg-white/[0.04]"
            >
              See how it works
            </button>
          </motion.div>

          <motion.div {...entrance(0.4)} className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {AVATARS.map((a) => (
                  <div
                    key={a.initial}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy text-xs font-semibold text-white"
                    style={{ background: a.gradient }}
                  >
                    {a.initial}
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#9CA3AF]">
                <AnimatedCounter to={2400} suffix="+" className="font-sora text-[#9CA3AF]" />{' '}
                learners waiting
              </span>
            </div>
            <div aria-hidden className="h-5 w-px bg-white/[0.12]" />
            <span className="text-sm text-[#9CA3AF]">
              Free to join · Any subject · Any level
            </span>
          </motion.div>
        </div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
        >
          <ProductMockup />
        </motion.div>
      </div>
    </section>
  );
}
