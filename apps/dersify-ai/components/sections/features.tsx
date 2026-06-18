'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Globe,
  CalendarClock,
  Crosshair,
  FileText,
  BarChart3,
  Activity,
} from 'lucide-react';
import { EASE } from '@/lib/utils';
import { FeatureCard } from '@/components/ui/feature-card';

const ROTATING_TOPICS = [
  'Python', "Porter's Five Forces", 'Calculus', 'React',
  'Mandarin', 'Criminal law', 'IELTS', 'Machine learning', 'History',
];

const PROGRESS_TOPICS = [
  { name: 'NestJS architecture',    segments: [{ pct: 55 }, { pct: 20, muted: true }, { pct: 15, dimmed: true }] },
  { name: 'Strategic management',   segments: [{ pct: 40 }, { pct: 25, muted: true }, { pct: 10, dimmed: true }] },
  { name: 'Linear algebra',         segments: [{ pct: 70 }, { pct: 10, muted: true }, { pct: 12, dimmed: true }] },
];

const MODES = [
  { label: 'exploration', color: 'var(--accent)' },
  { label: 'rescue',      color: 'var(--warning)' },
  { label: 'acceleration',color: 'var(--accent-2)' },
];

function ForgettingCurve() {
  return (
    <svg viewBox="0 0 280 80" className="mt-6 w-full" aria-hidden>
      <path
        d="M0 10 C 30 40, 50 55, 70 62 L 70 22 C 100 48, 120 58, 140 64 L 140 30 C 170 52, 195 60, 215 65 L 215 38 C 240 55, 260 62, 280 66"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      {[70, 140, 215].map((x) => (
        <circle key={x} cx={x} cy={x === 70 ? 22 : x === 140 ? 30 : 38} r="3.5" fill="var(--warning)" />
      ))}
    </svg>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="border-y py-16 lg:py-24"
      style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p
          className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--accent)' }}
        >
          Features
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
          Everything that makes real understanding possible.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Row 1 */}
          <FeatureCard className="lg:col-span-7">
            <MessageSquare size={32} style={{ color: 'var(--accent)' }} />
            <h3
              className="mt-4 text-[22px] font-semibold"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              It teaches through conversation.
            </h3>
            <p className="mt-2 max-w-[480px] text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Dersify doesn&apos;t ask you to fill in blanks. It engages you in real
              dialogue — explaining, questioning, correcting, and adapting.
            </p>
            <div className="mt-6 flex max-w-[420px] flex-col gap-2 text-[13px]">
              <div
                className="max-w-[85%] self-start rounded-lg px-3 py-2"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                What happens if two modules provide the same token?
              </div>
              <div
                className="max-w-[85%] self-end rounded-lg px-3 py-2"
                style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-soft-border)', color: 'var(--text-primary)' }}
              >
                The last one registered wins... I think?
              </div>
              <div
                className="max-w-[85%] self-start rounded-lg px-3 py-2"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                Close — let&apos;s trace exactly what Nest does, step by step.
              </div>
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-5" delay={0.08}>
            <Globe size={28} style={{ color: 'var(--accent)' }} />
            <h3 className="mt-4 text-xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Any subject. Any level.
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              From quantum mechanics to contract law. Dersify doesn&apos;t know the
              phrase &ldquo;outside my scope.&rdquo;
            </p>
            <div className="mt-6 h-[88px] overflow-hidden">
              <div className="animate-tag-scroll flex w-max flex-col gap-2">
                {[...ROTATING_TOPICS, ...ROTATING_TOPICS].map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="w-max rounded-full px-3 py-1 text-xs"
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* Row 2 */}
          <FeatureCard className="lg:col-span-4">
            <CalendarClock size={28} style={{ color: 'var(--accent)' }} />
            <h3 className="mt-4 text-xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Reviews when you&apos;re about to forget.
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              FSRS spaced repetition schedules each concept precisely — not once a week,
              but exactly when your memory is about to slip.
            </p>
            <ForgettingCurve />
          </FeatureCard>

          <FeatureCard className="lg:col-span-4" delay={0.08}>
            <Crosshair size={28} style={{ color: 'var(--warning)' }} />
            <h3 className="mt-4 text-xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Finds gaps you didn&apos;t know you had.
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Dersify detects 6 types of misconceptions — terminology, false analogies,
              causal inversions. Then fixes them with targeted remediation.
            </p>
          </FeatureCard>

          <FeatureCard className="lg:col-span-4" delay={0.16}>
            <FileText size={28} style={{ color: 'var(--accent)' }} />
            <h3 className="mt-4 text-xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Learn from your own materials.
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Upload PDFs, paste URLs, or add YouTube videos. Dersify grounds
              explanations in your materials while filling gaps with its own knowledge.
            </p>
            <div className="mt-6 flex gap-2">
              {['PDF', 'URL', 'YouTube'].map((t) => (
                <span
                  key={t}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </FeatureCard>

          {/* Row 3 */}
          <FeatureCard className="lg:col-span-5">
            <BarChart3 size={28} style={{ color: 'var(--accent)' }} />
            <h3 className="mt-4 text-[22px] font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Know exactly what you know.
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A real-time forgetting curve map. No XP. No streaks. Just an honest picture
              of what&apos;s solid, what&apos;s slipping, and what&apos;s due for review.
            </p>
            <div className="mt-6 space-y-3">
              {PROGRESS_TOPICS.map((topic) => (
                <div key={topic.name}>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{topic.name}</p>
                  <div
                    className="mt-1.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full"
                    style={{ background: 'var(--border-default)' }}
                  >
                    {topic.segments.map((seg, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${seg.pct}%` }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: seg.muted
                            ? 'var(--warning)'
                            : seg.dimmed
                            ? 'var(--accent-2)'
                            : 'var(--accent)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-7" delay={0.08}>
            <Activity size={28} style={{ color: 'var(--accent-2)' }} />
            <h3 className="mt-4 text-[22px] font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              The AI reads the room.
            </h3>
            <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Dersify detects when you&apos;re fatigued, in flow, or confused. It shifts
              modes — rescue, acceleration, consolidation — invisibly, in real-time.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {MODES.map((mode, i) => (
                <motion.div
                  key={mode.label}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.25 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className="rounded-full px-3 py-1 text-xs"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: mode.color,
                      border: `1px solid ${mode.color}55`,
                      background: `${mode.color}18`,
                    }}
                  >
                    {mode.label}
                  </span>
                  {i < MODES.length - 1 && (
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                  )}
                </motion.div>
              ))}
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
