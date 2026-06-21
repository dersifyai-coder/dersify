'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EASE } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 4,   suffix: 'B+', label: "People we're building for" },
  { value: 150, suffix: '+',  label: 'Countries reached on launch' },
  { value: 12,  suffix: '+',  label: 'Languages supported' },
  { value: 1,   suffix: '',   label: 'Mission: expand human potential' },
];

export function Mission() {
  return (
    <section
      id="mission"
      className="py-16 lg:py-24"
      style={{ background: 'var(--bg-inverse)' }}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p
            className="text-[12.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'var(--green-300)' }}
          >
            Our mission
          </p>
          <h2
            className="mt-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: '#FFFFFF',
            }}
          >
            Built in Somalia.{' '}
            <br />
            <em style={{ color: 'var(--green-300)', fontStyle: 'italic' }}>Built for the world.</em>
          </h2>
          <p
            className="mt-5 max-w-[480px] text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            We&apos;re building the operating system for human learning — starting in
            Africa, scaling globally, and opening the future for every learner,
            everywhere. Quality education should not depend on your postcode.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 text-base font-medium transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Read our mission <ArrowRight size={16} />
          </a>
        </motion.div>

        <div
          className="relative"
          aria-hidden
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(34,178,107,0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 75%)',
            }}
          />
          <div className="relative grid grid-cols-2 gap-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3rem',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: '#FFFFFF',
                  }}
                >
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
