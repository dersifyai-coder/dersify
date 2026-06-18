'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { EASE } from '@/lib/utils';

const OTHER_TOOLS = [
  'Resets to zero each session',
  'No memory of your struggles',
  'Same pace for every learner',
  'Teaches from the beginning every time',
  "Can't detect what you misunderstood",
  "No concept of what's due for review",
];

const DERSIFY = [
  'Builds a permanent model of your mind',
  'Remembers every struggle, every breakthrough',
  'Adapts pace, depth, and approach in real-time',
  'Starts exactly where you left off, every time',
  'Detects and corrects misconceptions automatically',
  "Knows which concepts you're about to forget",
];

export function Problem() {
  return (
    <section id="problem" className="py-16 lg:py-24" style={{ background: 'var(--bg-base)' }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p
          className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--accent)' }}
        >
          The problem
        </p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mt-4 max-w-[700px] text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
          }}
        >
          Traditional AI tutors reset to zero the moment you close the tab.
        </motion.h2>

        <p
          className="mx-auto mt-5 max-w-[560px] text-center text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          You re-explain yourself every session. Your progress is invisible. The AI has
          no idea what you struggled with last week.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-lg p-8"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Every other tool
              </h3>
            </div>
            <ul className="mt-6 space-y-4">
              {OTHER_TOOLS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                  <X size={17} className="mt-0.5 shrink-0" style={{ color: 'var(--text-disabled)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-lg p-8"
            style={{
              background: 'linear-gradient(180deg, var(--accent-soft), transparent), var(--bg-surface)',
              border: '1px solid var(--accent-soft-border)',
              boxShadow: 'var(--glow-accent)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Dersify
              </h3>
            </div>
            <ul className="mt-6 space-y-4">
              {DERSIFY.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px]" style={{ color: 'var(--text-primary)' }}>
                  <Check size={17} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
