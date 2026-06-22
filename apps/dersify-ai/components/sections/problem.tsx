'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  HelpCircle,
  History,
  MessageCircle,
  RefreshCw,
  Route,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { EASE } from '@/lib/utils';

type SourceChip = {
  label: string;
  detail: string;
  Icon: LucideIcon;
  className: string;
};

type MapNode = {
  label: string;
  detail: string;
  Icon: LucideIcon;
  className: string;
  active?: boolean;
};

const SOURCE_CHIPS: SourceChip[] = [
  { label: 'YouTube', detail: 'watched', Icon: Youtube, className: 'left-[6%] top-[15%]' },
  { label: 'Course', detail: 'paused', Icon: BookOpen, className: 'right-[7%] top-[17%]' },
  { label: 'Docs', detail: 'searched', Icon: FileText, className: 'left-[8%] bottom-[23%]' },
  { label: 'Chat', detail: 'answered', Icon: MessageCircle, className: 'right-[8%] bottom-[23%]' },
  { label: 'Project', detail: 'stuck', Icon: Code2, className: 'right-[24%] bottom-[8%]' },
];

const MEMORY_NODES: MapNode[] = [
  { label: 'Last struggle', detail: 'remembered', Icon: History, className: 'left-[5%] top-[15%]' },
  { label: 'Misconception', detail: 'tracked', Icon: HelpCircle, className: 'right-[5%] top-[15%]' },
  { label: 'Review due', detail: 'scheduled', Icon: Clock3, className: 'left-[7%] bottom-[26%]' },
];

function SourcePill({ chip }: { chip: SourceChip }) {
  const Icon = chip.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.42, ease: EASE }}
      className={`absolute z-10 flex max-w-[160px] items-center gap-2 rounded-full border px-3 py-2 shadow-sm ${chip.className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.84)',
        borderColor: 'var(--border-default)',
        color: 'var(--text-primary)',
      }}
    >
      <Icon size={15} style={{ color: 'var(--text-muted)' }} />
      <span className="text-[13px] font-semibold leading-4">{chip.label}</span>
      <span className="hidden text-[12px] leading-4 sm:inline" style={{ color: 'var(--text-muted)' }}>
        {chip.detail}
      </span>
    </motion.div>
  );
}

function MemoryNode({ node }: { node: MapNode }) {
  const Icon = node.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`absolute z-20 flex max-w-[174px] items-center gap-2 rounded-full border px-3 py-2 shadow-sm ${node.className}`}
      style={{
        background: node.active ? 'var(--bg-inverse)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: node.active ? 'var(--bg-inverse)' : 'var(--accent-soft-border)',
        color: node.active ? 'var(--accent-contrast)' : 'var(--text-primary)',
      }}
    >
      <span
        className="flex size-7 items-center justify-center rounded-full"
        style={{
          background: node.active ? 'rgba(255,255,255,0.12)' : 'var(--accent-soft)',
          color: node.active ? 'var(--accent-contrast)' : 'var(--accent)',
        }}
      >
        <Icon size={14} strokeWidth={2.2} />
      </span>
      <span>
        <span className="block text-[12px] font-semibold leading-4">{node.label}</span>
        <span
          className="block text-[11px] leading-3"
          style={{ color: node.active ? 'rgba(255,255,255,0.68)' : 'var(--text-muted)' }}
        >
          {node.detail}
        </span>
      </span>
    </motion.div>
  );
}

function FragmentedIllustration() {
  return (
    <div className="relative mt-6 h-[340px] overflow-hidden rounded-[26px] border" style={{ borderColor: 'var(--border-subtle)' }}>
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(19,24,21,0.08), transparent 34%), linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: 'auto, 42px 42px, 42px 42px',
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 320" aria-hidden>
        <path d="M130 78 C208 108 230 138 280 176" fill="none" stroke="var(--text-muted)" strokeOpacity="0.22" strokeWidth="1.6" strokeDasharray="7 8" />
        <path d="M430 82 C354 112 330 140 280 176" fill="none" stroke="var(--text-muted)" strokeOpacity="0.22" strokeWidth="1.6" strokeDasharray="7 8" />
        <path d="M120 238 C198 212 235 198 280 176" fill="none" stroke="var(--text-muted)" strokeOpacity="0.22" strokeWidth="1.6" strokeDasharray="7 8" />
        <path d="M442 238 C368 212 326 196 280 176" fill="none" stroke="var(--text-muted)" strokeOpacity="0.22" strokeWidth="1.6" strokeDasharray="7 8" />
      </svg>

      {SOURCE_CHIPS.map((chip) => (
        <SourcePill key={chip.label} chip={chip} />
      ))}

      <div className="absolute left-1/2 top-[47%] z-20 flex -translate-x-1/2 flex-col items-center">
        <div
          className="relative flex h-24 w-32 items-end justify-center rounded-[28px] border"
          style={{
            background: 'rgba(255,255,255,0.82)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <span className="absolute top-5 size-10 rounded-full" style={{ background: 'rgba(81,88,82,0.18)' }} />
          <span
            className="mb-0 h-12 w-24 rounded-t-[28px]"
            style={{ background: 'linear-gradient(180deg, rgba(81,88,82,0.13), rgba(81,88,82,0.2))' }}
          />
        </div>
      </div>

      <div
        className="absolute left-1/2 top-[5%] z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <RefreshCw size={14} />
        <span className="text-[13px] font-semibold">starts over next time</span>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(251,252,251,0.92))' }}
      />
    </div>
  );
}

function DersifyIllustration() {
  return (
    <div className="relative mt-6 h-[340px] overflow-hidden rounded-[26px] border" style={{ borderColor: 'var(--accent-soft-border)' }}>
      <div
        className="absolute inset-0 opacity-[0.8]"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(15,122,69,0.16), transparent 34%), linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: 'auto, 42px 42px, 42px 42px',
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 320" aria-hidden>
        <path d="M126 72 C185 108 224 132 280 136" fill="none" stroke="var(--accent-soft-border)" strokeWidth="2" />
        <path d="M434 72 C374 108 336 132 280 136" fill="none" stroke="var(--accent-soft-border)" strokeWidth="2" />
        <path d="M132 236 C200 204 236 174 280 136" fill="none" stroke="var(--accent-soft-border)" strokeWidth="2" />
      </svg>

      {MEMORY_NODES.map((node) => (
        <MemoryNode key={node.label} node={node} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
        className="absolute left-1/2 top-[25%] z-10 w-[220px] -translate-x-1/2 rounded-[24px] border p-4 text-center"
        style={{
          background: 'rgba(255,255,255,0.88)',
          borderColor: 'var(--accent-soft-border)',
          boxShadow: 'var(--shadow-lg), var(--highlight-top)',
        }}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full" style={{ background: 'var(--accent-soft)' }}>
          <Brain size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <p className="mt-3 text-[16px] font-semibold leading-5" style={{ color: 'var(--text-primary)' }}>
          Learner model
        </p>
        <p className="mt-1 text-[12px] leading-4" style={{ color: 'var(--text-secondary)' }}>
          remembers the path, not just the prompt
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.24 }}
        className="absolute bottom-5 left-1/2 z-30 w-[min(340px,calc(100%-56px))] -translate-x-1/2 rounded-2xl px-4 py-3"
        style={{
          background: 'var(--bg-inverse)',
          color: 'var(--accent-contrast)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Route size={15} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.62)' }}>
              next lesson
            </p>
            <p className="mt-0.5 text-[13px] font-semibold leading-5">
              Start from yesterday's loop mistake.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ComparisonPanel({
  eyebrow,
  title,
  body,
  tone,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  tone: 'muted' | 'active';
  children: React.ReactNode;
}) {
  const active = tone === 'active';

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE, delay: active ? 0.08 : 0 }}
      className="relative overflow-hidden rounded-[32px] border p-5 sm:p-6"
      style={{
        background: active
          ? 'linear-gradient(180deg, var(--accent-soft), transparent 42%), var(--bg-surface)'
          : 'linear-gradient(180deg, rgba(245,247,245,0.86), transparent 44%), var(--bg-surface)',
        borderColor: active ? 'var(--accent-soft-border)' : 'var(--border-default)',
        boxShadow: active ? 'var(--shadow-xl), var(--glow-accent), var(--highlight-top)' : 'var(--shadow-lg), var(--highlight-top)',
      }}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: active ? 'var(--text-accent)' : 'var(--text-muted)' }}
          >
            {eyebrow}
          </p>
          <h3
            className="mt-3 max-w-[460px] text-[28px] font-semibold leading-[1.05] tracking-[-0.025em]"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>
        </div>
        <span
          className="hidden rounded-full px-3 py-1 text-[12px] font-semibold sm:inline-flex"
          style={{
            background: active ? 'var(--accent-soft)' : 'var(--bg-subtle)',
            color: active ? 'var(--text-accent)' : 'var(--text-muted)',
          }}
        >
          {active ? 'remembered' : 'fragmented'}
        </span>
      </div>
      <p className="relative z-10 mt-3 max-w-[540px] text-[15px] leading-6" style={{ color: 'var(--text-secondary)' }}>
        {body}
      </p>
      {children}
    </motion.article>
  );
}

export function Problem() {
  return (
    <section
      id="problem"
      className="relative scroll-mt-28 overflow-hidden py-16 lg:py-24"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.44]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(15,122,69,0.09), transparent 36%), linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: 'auto, 72px 72px, 72px 72px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1260px] px-6 lg:px-12">
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
          className="mx-auto mt-4 max-w-[820px] text-center"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.7vw, 3.15rem)',
            fontWeight: 650,
            letterSpacing: '-0.032em',
            lineHeight: 1.08,
            color: 'var(--text-primary)',
          }}
        >
          Self-study has endless content. It still forgets you.
        </motion.h2>

        <p
          className="mx-auto mt-5 max-w-[690px] text-center text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Videos, courses, docs, and chat can explain the next idea. They do not keep a
          living model of what you know, what confused you, and where to continue.
        </p>

        <div className="relative mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ComparisonPanel
            eyebrow="Fragmented self-study"
            title="Every resource helps for a moment."
            body="The learner does the hard work of remembering context, connecting sources, and deciding what to review next."
            tone="muted"
          >
            <FragmentedIllustration />
          </ComparisonPanel>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[12px] font-bold lg:flex"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            vs
          </div>

          <ComparisonPanel
            eyebrow="Dersify learning"
            title="The system carries your memory forward."
            body="Dersify turns scattered study signals into a learner model, then uses that model to choose the next explanation, review, and challenge."
            tone="active"
          >
            <DersifyIllustration />
          </ComparisonPanel>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.16 }}
          className="mx-auto mt-6 flex max-w-[860px] flex-col gap-3 rounded-[26px] border px-5 py-4 text-center sm:flex-row sm:items-center sm:justify-center sm:text-left"
          style={{
            background: 'rgba(255,255,255,0.78)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-sm), var(--highlight-top)',
            color: 'var(--text-secondary)',
          }}
        >
          <CheckCircle2 className="mx-auto shrink-0 sm:mx-0" size={18} style={{ color: 'var(--accent)' }} />
          <p className="text-[15px] font-semibold leading-6">
            More content is not the missing layer. Memory, diagnosis, and continuity are.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
