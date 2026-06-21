'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';

const LEARNER_TYPES = [
  {
    title: 'Self-taught developers',
    body:
      'You are learning programming from docs, YouTube, Stack Overflow, and projects. Dersify helps connect the pieces and remembers where you got stuck.',
    tag: 'Programming / projects',
    chip: 'Turn scattered resources into a learning path',
    prominent: false,
  },
  {
    title: 'University students studying alone',
    body:
      'You have lectures, PDFs, assignments, and deadlines, but not enough personal support. Dersify helps you understand the topic before exam week panic.',
    tag: 'Courses / exams',
    chip: 'Review what is shaky before it disappears',
    prominent: true,
  },
  {
    title: 'Course collectors who want mastery',
    body:
      'You have started courses on Coursera, Udemy, or YouTube, but progress keeps fading. Dersify gives the learning journey continuity.',
    tag: 'Courses / mastery',
    chip: 'Stop restarting from lesson one',
    prominent: false,
  },
];

function Initial({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        border: '1px solid var(--accent-soft-border)',
      }}
    >
      {label[0]}
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
          Who it is for
        </p>
        <h2
          className="mx-auto mt-4 max-w-[720px] text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
          }}
        >
          For people who learn before anyone gives them permission.
        </h2>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
          {LEARNER_TYPES.map((learner, i) => (
            <motion.div
              key={learner.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
              className="flex flex-col rounded-lg p-8"
              style={
                learner.prominent
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
              <p className="flex-1 text-[17px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {learner.body}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Initial label={learner.title} />
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {learner.title}
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    {learner.tag}
                  </p>
                </div>
              </div>
              <span
                className="mt-6 w-max max-w-full rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-soft-border)',
                  color: 'var(--text-accent)',
                }}
              >
                {learner.chip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
