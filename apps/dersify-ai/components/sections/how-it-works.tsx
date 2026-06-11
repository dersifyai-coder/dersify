'use client';

import { motion } from 'framer-motion';
import { Pencil, Brain, Sparkles, type LucideIcon } from 'lucide-react';
import { EASE } from '@/lib/utils';

const KNOWLEDGE_BARS = [
  { name: "Porter's Five Forces", pct: 80, color: '#0D9488', label: 'Strong' },
  { name: 'Competitive Advantage', pct: 45, color: '#F59E0B', label: 'Slipping' },
  { name: 'VRIN Framework', pct: 15, color: '#1B4FDB', label: 'Due for review' },
];

const PROMPT_LINES = ['profile → learning style, pace', 'history → 18 concepts, 1 gap', 'today → review DI before new material'];

function StepIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue/20 bg-blue/10">
      <Icon size={18} className="text-teal" />
    </div>
  );
}

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.15 }}
      className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8"
    >
      <div className="flex items-center justify-between">
        <StepIcon Icon={Icon} />
        <span className="font-mono text-[13px] text-teal">{number}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">{body}</p>
      <div className="mt-auto pt-6">{children}</div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p className="text-center text-[13px] font-medium uppercase tracking-[0.1em] text-teal">
          How Dersify Works
        </p>
        <h2 className="mx-auto mt-4 max-w-[640px] text-center text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-5xl">
          An intelligence layer built specifically for learning.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StepCard
            index={0}
            number="01"
            Icon={Pencil}
            title="You bring the topic"
            body="Tell Dersify what you want to learn — a skill, a subject, a concept. Any topic. Any level. In any language."
          >
            <div className="flex flex-wrap gap-2">
              {['React Hooks', "Porter's Five Forces", 'Organic Chemistry'].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[#9CA3AF]"
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
            body="Dersify tracks every concept you've touched — confirmed, shaky, or about to be forgotten. Your knowledge map gets sharper with every session."
          >
            <div className="space-y-3">
              {KNOWLEDGE_BARS.map((bar) => (
                <div key={bar.name}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white">{bar.name}</span>
                    <span style={{ color: bar.color }}>{bar.label}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
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
            body="Before your first message, Dersify knows your learning style, your misconceptions, your calibration score, and exactly which concepts are slipping. The AI starts from where you actually are — not from the beginning."
          >
            <div className="space-y-2">
              {PROMPT_LINES.map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.4 + i * 0.2 }}
                  className="rounded-md border border-white/[0.06] bg-black/20 px-3 py-2 font-mono text-[11px] text-[#9CA3AF]"
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
