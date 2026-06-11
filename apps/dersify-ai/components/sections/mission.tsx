'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EASE } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 4, suffix: 'B+', label: "People we're building for" },
  { value: 150, suffix: '+', label: 'Countries reached on launch' },
  { value: 12, suffix: '+', label: 'Languages supported' },
  { value: 1, suffix: '', label: 'Mission: expand human potential' },
];

export function Mission() {
  return (
    <section id="mission" className="bg-[#060E1A] py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-12">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-teal">
            Our Mission
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.15] tracking-[-0.02em] lg:text-5xl">
            <span className="text-white">Built in Somalia.</span>
            <br />
            <span className="gradient-text">Built for the world.</span>
          </h2>
          <p className="mt-5 max-w-[480px] text-lg leading-[1.7] text-[#9CA3AF]">
            We&apos;re building the operating system for human learning — starting in
            Africa, scaling globally, and opening the future for every learner,
            everywhere. Quality education should not depend on your postcode.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 text-base font-medium text-white transition-colors hover:text-teal"
          >
            Read our mission <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* RIGHT */}
        <div className="relative">
          {/* Dotted world-map style background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(rgba(27,79,219,0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
              maskImage:
                'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 75%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 75%)',
            }}
          />
          <div className="relative grid grid-cols-2 gap-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-bold">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-[#9CA3AF]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
