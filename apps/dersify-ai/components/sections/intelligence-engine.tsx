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
    title: 'Your learning style',
    body: 'How you learn best. How you react when stuck. Your pace preference. Captured once during onboarding and used in every session forever.',
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
        {'motivation: "career-advance"\npace: "steady"\nwhen_stuck: "explain-differently"'}
      </pre>
    ),
  },
  {
    Icon: BarChart3,
    title: 'Your knowledge state',
    body: "Every concept you've ever studied — confidence level, last review date, next due date. FSRS calculates exactly when you're about to forget.",
    extra: (
      <p className="mt-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
        Mastered <span style={{ color: 'var(--accent)' }}>18</span>
        {' · '}Slipping <span style={{ color: 'var(--warning)' }}>4</span>
        {' · '}Due today <span style={{ color: 'var(--text-primary)' }}>2</span>
      </p>
    ),
  },
  {
    Icon: AlertTriangle,
    title: 'Your active misconceptions',
    body: 'Dersify tracks where your mental model is wrong — the type, the severity, and the exact strategy to fix it — then addresses it in the next session.',
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
    title: 'Your calibration score',
    body: 'Dersify tracks the gap between how confident you are and how you actually perform. Over time it knows whether to trust your self-assessments — or probe deeper.',
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
    <section className="py-16 lg:py-24" style={{ background: 'var(--bg-base)' }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p
          className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--accent)' }}
        >
          The intelligence engine
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
          Before your first message, the AI already knows.
        </h2>
        <p
          className="mx-auto mt-5 max-w-[600px] text-center text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          While other AI tutors wait for you to explain yourself, Dersify assembles a
          complete picture of who you are before the session begins.
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
