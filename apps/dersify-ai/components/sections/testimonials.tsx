'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';

const TESTIMONIALS = [
  {
    quote:
      "Dersify went from confused to confident in 2 weeks. The AI adapts to how I think. It's like having a personal tutor who never gets tired.",
    name: 'Ayaan Mohamed',
    tag: 'Computer Science · ALU',
    chip: 'Mastered Data Structures in 3 weeks',
    prominent: false,
  },
  {
    quote:
      "I built my first full-stack project using Dersify's roadmap. The explanations are structured but personalized. It knew what I was going to get wrong before I did.",
    name: 'Hodan Ali',
    tag: 'Self-taught Developer · Somalia',
    chip: 'Built 3 production projects',
    prominent: true,
  },
  {
    quote:
      'The diagnostic system is a game changer. I focus only on what I need to learn. No wasted sessions, no review of things I already know.',
    name: 'Yusuf Hassan',
    tag: 'University Student · Kenya',
    chip: 'Improved 68% faster than self-study',
    prominent: false,
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-navy py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 800px 500px at 50% 50%, rgba(27,79,219,0.08) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
        <p className="text-center text-[13px] font-medium uppercase tracking-[0.1em] text-teal">
          Real Learners
        </p>
        <h2 className="mt-4 text-center text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-[40px]">
          Real learners. Real outcomes.
        </h2>

        <div className="mt-16 grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
              className={`flex flex-col rounded-2xl border bg-white/[0.04] p-8 ${
                t.prominent
                  ? 'border-blue/25 py-10 shadow-[0_0_60px_rgba(27,79,219,0.1)]'
                  : 'border-white/[0.08]'
              }`}
            >
              <blockquote className="text-xl italic leading-[1.5] text-white">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="gradient-bg flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{t.name}</p>
                  <p className="text-[13px] text-[#9CA3AF]">{t.tag}</p>
                </div>
              </div>
              <span className="mt-6 w-max rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-medium text-teal">
                {t.chip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
