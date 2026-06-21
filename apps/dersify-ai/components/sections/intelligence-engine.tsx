'use client';

import { motion } from 'framer-motion';
import { User, BarChart3, AlertTriangle, Target, type LucideIcon } from 'lucide-react';
import { EASE } from '@/lib/utils';

interface EngineCard {
  Icon: LucideIcon;
  title: string;
  body: string;
  extra: React.ReactNode;
}

const CARDS: EngineCard[] = [
  {
    Icon: User,
    title: 'Your learning profile',
    body: 'Why you are learning, how much time you have, how you respond when stuck, and whether you want depth, speed, or project-first learning.',
    extra: (
      <pre
        className="mt-3 rounded-md px-3 py-2 text-xs leading-relaxed"
        style={{
          fontFamily: 'var(--font-mono)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-accent)',
        }}
      >
        {'motivation: "build-project"\npace: "steady"\nwhen_stuck: "explain-differently"'}
      </pre>
    ),
  },
  {
    Icon: BarChart3,
    title: 'Your knowledge state',
    body: "Every concept you touch: what is new, learning, understood, mastered, and due for review. FSRS helps Dersify choose the next useful review moment.",
    extra: (
      <p className="mt-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
        Mastered <span style={{ color: 'var(--accent)' }}>18</span>
        {' / '}Shaky <span style={{ color: 'var(--warning)' }}>4</span>
        {' / '}Due today <span style={{ color: 'var(--text-primary)' }}>2</span>
      </p>
    ),
  },
  {
    Icon: AlertTriangle,
    title: 'Your active misconceptions',
    body: 'Dersify tracks where your mental model is wrong, the type of mistake, how serious it is, and the correction strategy to use next time.',
    extra: (
      <pre
        className="mt-3 rounded-md px-3 py-2 text-xs leading-relaxed"
        style={{
          fontFamily: 'var(--font-mono)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-accent)',
        }}
      >
        {'concept: "dependency injection"\ntype: "causal_inversion"\nremedy: "Prompt comparison..."'}
      </pre>
    ),
  },
  {
    Icon: Target,
    title: 'Your calibration signal',
    body: 'Dersify compares confidence with demonstrated understanding, so the tutor knows when to trust your answer and when to ask one more question.',
    extra: (
      <div className="mt-3">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.875rem', fontWeight: 700, color: 'var(--accent)' }}>
          -0.4
        </span>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          slightly overestimates
        </p>
      </div>
    ),
  },
];

export function IntelligenceEngine() {
  return (
    <section id="intelligence-engine" className="py-16 lg:py-24" style={{ background: 'var(--bg-base)' }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p
          className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--accent)' }}
        >
          The learner model
        </p>
        <h2
          className="mx-auto mt-4 max-w-[700px] text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
          }}
        >
          The tutor remembers what normal AI forgets.
        </h2>
        <p
          className="mx-auto mt-5 max-w-[600px] text-center text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Dersify is not a blank chat. It carries your history, misconceptions,
          sources, pace, and review schedule into every session.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              className="rounded-lg p-6"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <card.Icon size={28} style={{ color: 'var(--accent)' }} />
              <h3
                className="mt-4 text-[17px] font-semibold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
              >
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {card.body}
              </p>
              {card.extra}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
