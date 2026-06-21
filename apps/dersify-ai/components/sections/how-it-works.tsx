'use client';

import { motion } from 'framer-motion';
import { Pencil, Brain, Sparkles, type LucideIcon } from 'lucide-react';
import { EASE } from '@/lib/utils';

const KNOWLEDGE_BARS = [
  { name: "Porter's Five Forces", pct: 80, color: 'var(--accent)' },
  { name: 'Competitive Advantage', pct: 45, color: 'var(--warning)' },
  { name: 'VRIN Framework', pct: 15, color: 'var(--accent-2)' },
];

const PROMPT_LINES = [
  'profile → learning style, pace',
  'history → 18 concepts, 1 gap',
  'today → review DI before new material',
];

function StepCard({
  index,
  number,
  Icon,
  title,
  body,
  children,
}: {
  index: number;
  number: string;
  Icon: LucideIcon;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.12 }}
      className="flex flex-col rounded-lg p-8"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-md"
          style={{ background: 'var(--accent-soft)' }}
        >
          <Icon size={18} style={{ color: 'var(--accent)' }} />
        </span>
        <span
          className="font-mono text-[13px]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {number}
        </span>
      </div>
      <h3
        className="mt-5 text-xl font-semibold"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {body}
      </p>
      <div className="mt-auto pt-6">{children}</div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y py-16 lg:py-24"
      style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p
          className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--accent)' }}
        >
          The method
        </p>
        <h2
          className="mx-auto mt-4 max-w-[640px] text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
          }}
        >
          Tutoring, not content delivery.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <StepCard
            index={0}
            number="01"
            Icon={Pencil}
            title="You bring the topic"
            body="Tell Dersify what you want to learn — a skill, a subject, a concept. Any topic. Any level. In any language."
          >
            <div className="flex flex-wrap gap-2">
              {['React hooks', "Porter's Five Forces", 'Organic chemistry'].map((t) => (
                <span
                  key={t}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </StepCard>

          <StepCard
            index={1}
            number="02"
            Icon={Brain}
            title="It maps what you know"
            body="Dersify tracks every concept — confirmed, shaky, or about to be forgotten. Your knowledge map gets sharper with every session."
          >
            <div className="space-y-3">
              {KNOWLEDGE_BARS.map((bar) => (
                <div key={bar.name}>
                  <div className="flex justify-between text-[11px]">
                    <span style={{ color: 'var(--text-primary)' }}>{bar.name}</span>
                    <span style={{ color: bar.color }}>{bar.pct}%</span>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full"
                    style={{ background: 'var(--border-default)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.pct}%` }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </StepCard>

          <StepCard
            index={2}
            number="03"
            Icon={Sparkles}
            title="Every session gets smarter"
            body="Before your first message, Dersify knows your learning style, your misconceptions, your calibration score, and exactly which concepts are slipping."
          >
            <div className="space-y-2">
              {PROMPT_LINES.map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.4 + i * 0.2 }}
                  className="rounded-md px-3 py-2 text-[11px]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </StepCard>
        </div>
      </div>
    </section>
  );
}
