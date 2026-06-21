'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { EASE } from '@/lib/utils';

const OTHER_TOOLS = [
  'YouTube shows the same lesson to everyone',
  'Coursera and Udemy courses cannot see where you are stuck',
  'ChatGPT answers the moment, then loses the learning journey',
  'Your notes, questions, code, and progress stay scattered',
  'Misunderstandings disappear instead of becoming part of the plan',
  'You decide what to review even when you are not sure',
];

const DERSIFY = [
  'Builds a persistent learner model around you',
  'Tracks what you understand, forget, and confuse',
  'Adapts pace, depth, and examples to your responses',
  'Starts from your real history, not a blank chat',
  'Turns misconceptions into targeted correction plans',
  'Connects your sources, sessions, and progress over time',
  'Schedules review before concepts slip away',
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
          The internet gives self-learners content. It does not give them memory.
        </motion.h2>

        <p
          className="mx-auto mt-5 max-w-[560px] text-center text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          The hard part is no longer finding explanations. It is knowing what you
          actually understand, what you misunderstood, and what to learn next.
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
                Static content and blank chats
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
