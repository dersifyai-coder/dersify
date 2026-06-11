'use client';

import { motion } from 'framer-motion';
import { User, BarChart3, AlertTriangle, Target, type LucideIcon } from 'lucide-react';
import { EASE } from '@/lib/utils';

interface EngineCard {
  Icon: LucideIcon;
  iconColor: string;
  title: string;
  body: string;
  extra: React.ReactNode;
}

const CARDS: EngineCard[] = [
  {
    Icon: User,
    iconColor: '#0D9488',
    title: 'Your learning style',
    body: 'How you learn best. How you react when stuck. Your pace preference. Captured once during onboarding and used in every session forever.',
    extra: (
      <pre className="mt-3 rounded-md bg-black/20 px-3 py-2 font-mono text-xs leading-relaxed text-teal">
        {'motivation: "career-advance"\npace: "steady"\nwhen_stuck: "explain-differently"'}
      </pre>
    ),
  },
  {
    Icon: BarChart3,
    iconColor: '#1B4FDB',
    title: 'Your knowledge state',
    body: "Every concept you've ever studied — confidence level, last review date, next due date. FSRS algorithm calculates exactly when you're about to forget.",
    extra: (
      <p className="mt-3 font-mono text-xs text-[#9CA3AF]">
        Mastered <span className="text-teal">18</span> · Slipping{' '}
        <span className="text-amber">4</span> · Due today{' '}
        <span className="text-white">2</span>
      </p>
    ),
  },
  {
    Icon: AlertTriangle,
    iconColor: '#F59E0B',
    title: 'Your active misconceptions',
    body: 'Dersify tracks where your mental model is wrong — the type, the severity, and the exact strategy to fix it — then addresses it in the next session.',
    extra: (
      <pre className="mt-3 rounded-md bg-black/20 px-3 py-2 font-mono text-xs leading-relaxed text-teal">
        {'concept: "dependency injection"\ntype: "causal_inversion"\nremedy: "Prompt comparison with ..."'}
      </pre>
    ),
  },
  {
    Icon: Target,
    iconColor: '#0D9488',
    title: 'Your calibration score',
    body: 'Dersify tracks the gap between how confident you are and how you actually perform. Over time it knows whether to trust your self-assessments — or probe deeper.',
    extra: (
      <div className="mt-3">
        <span className="font-mono text-3xl text-teal">-0.4</span>
        <p className="mt-1 text-xs text-[#9CA3AF]">slightly overestimates</p>
      </div>
    ),
  },
];

export function IntelligenceEngine() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p className="text-center text-[13px] font-medium uppercase tracking-[0.1em] text-teal">
          The Intelligence Engine
        </p>
        <h2 className="mx-auto mt-4 max-w-[700px] text-center text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-5xl">
          Before your first message, the AI already knows.
        </h2>
        <p className="mx-auto mt-5 max-w-[600px] text-center text-lg leading-[1.7] text-[#9CA3AF]">
          While other AI tutors wait for you to explain yourself, Dersify assembles a
          complete picture of who you are and where your knowledge stands before the
          session begins.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition-colors duration-200 hover:border-blue/40 hover:bg-blue/[0.03]"
            >
              <card.Icon size={32} style={{ color: card.iconColor }} />
              <h3 className="mt-4 text-[17px] font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{card.body}</p>
              {card.extra}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
