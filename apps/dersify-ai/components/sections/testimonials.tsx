'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';

const TESTIMONIALS = [
  {
    quote:
      "I went from confused to confident in 2 weeks. The AI adapts to how I think. It's like having a personal tutor who never gets tired.",
    name: 'Ayaan Mohamed',
    tag: 'Computer science · ALU',
    chip: 'Mastered data structures in 3 weeks',
    prominent: false,
  },
  {
    quote:
      "I built my first full-stack project using Dersify's roadmap. The explanations are personalized — it knew what I was going to get wrong before I did.",
    name: 'Hodan Ali',
    tag: 'Self-taught developer · Somalia',
    chip: 'Built 3 production projects',
    prominent: true,
  },
  {
    quote:
      'The diagnostic system is a game changer. I focus only on what I need to learn. No wasted sessions, no review of things I already know.',
    name: 'Yusuf Hassan',
    tag: 'University student · Kenya',
    chip: 'Improved 68% faster than self-study',
    prominent: false,
  },
];

function Initial({ name }: { name: string }) {
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        border: '1px solid var(--accent-soft-border)',
      }}
    >
      {name[0]}
    </span>
  );
}

export function Testimonials() {
  return (
    <section className="py-16 lg:py-24" style={{ background: 'var(--bg-base)' }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p
          className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--accent)' }}
        >
          Real learners
        </p>
        <h2
          className="mt-4 text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
          }}
        >
          Real learners. Real outcomes.
        </h2>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
              className="flex flex-col rounded-lg p-8"
              style={
                t.prominent
                  ? {
                      background: 'linear-gradient(180deg, var(--accent-soft), transparent), var(--bg-surface)',
                      border: '1px solid var(--accent-soft-border)',
                      boxShadow: 'var(--glow-accent)',
                    }
                  : {
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-sm)',
                    }
              }
            >
              <blockquote
                className="flex-1 text-[17px] italic leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Initial name={t.name} />
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {t.name}
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    {t.tag}
                  </p>
                </div>
              </div>
              <span
                className="mt-6 w-max rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-soft-border)',
                  color: 'var(--text-accent)',
                }}
              >
                {t.chip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
