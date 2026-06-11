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
  'Python',
  "Porter's Five Forces",
  'Calculus',
  'React',
  'Mandarin',
  'Criminal Law',
  'IELTS',
  'Machine Learning',
  'History',
];

const PROGRESS_TOPICS = [
  {
    name: 'NestJS Architecture',
    segments: [
      { pct: 55, color: '#0D9488' },
      { pct: 20, color: '#F59E0B' },
      { pct: 15, color: '#1B4FDB' },
    ],
  },
  {
    name: 'Strategic Management',
    segments: [
      { pct: 40, color: '#0D9488' },
      { pct: 25, color: '#F59E0B' },
      { pct: 10, color: '#1B4FDB' },
    ],
  },
  {
    name: 'Linear Algebra',
    segments: [
      { pct: 70, color: '#0D9488' },
      { pct: 10, color: '#F59E0B' },
      { pct: 12, color: '#1B4FDB' },
    ],
  },
];

const MODES = [
  { label: 'exploration', color: '#1B4FDB' },
  { label: 'rescue', color: '#F59E0B' },
  { label: 'acceleration', color: '#0D9488' },
];

function ForgettingCurve() {
  return (
    <svg viewBox="0 0 280 80" className="mt-6 w-full" aria-hidden>
      <path
        d="M0 10 C 30 40, 50 55, 70 62 L 70 22 C 100 48, 120 58, 140 64 L 140 30 C 170 52, 195 60, 215 65 L 215 38 C 240 55, 260 62, 280 66"
        fill="none"
        stroke="#0D9488"
        strokeWidth="2"
      />
      {[70, 140, 215].map((x) => (
        <circle key={x} cx={x} cy={x === 70 ? 22 : x === 140 ? 30 : 38} r="3.5" fill="#F59E0B" />
      ))}
    </svg>
  );
}

export function Features() {
  return (
    <section id="features" className="bg-navy py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p className="text-center text-[13px] font-medium uppercase tracking-[0.1em] text-teal">
          Features
        </p>
        <h2 className="mx-auto mt-4 max-w-[640px] text-center text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-[40px]">
          Everything that makes real understanding possible.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Row 1 */}
          <FeatureCard className="lg:col-span-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -right-16 z-0 h-56 w-56 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(27,79,219,0.25) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <MessageSquare size={36} className="text-teal" />
              <h3 className="mt-4 text-[22px] font-semibold text-white">
                It teaches through conversation.
              </h3>
              <p className="mt-2 max-w-[480px] text-base leading-relaxed text-[#9CA3AF]">
                Dersify doesn&apos;t ask you to fill in blanks. It engages you in real
                dialogue — explaining, questioning, correcting, and adapting based on
                what you say.
              </p>
              <div className="mt-6 flex max-w-[420px] flex-col gap-2 text-xs">
                <div className="max-w-[85%] self-start rounded-lg bg-white/[0.06] px-3 py-2 text-white">
                  What happens if two modules provide the same token?
                </div>
                <div className="max-w-[85%] self-end rounded-lg border border-blue/40 bg-blue/30 px-3 py-2 text-white">
                  The last one registered wins... I think?
                </div>
                <div className="max-w-[85%] self-start rounded-lg bg-white/[0.06] px-3 py-2 text-white">
                  Close — let&apos;s trace exactly what Nest does, step by step.
                </div>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-5" delay={0.08}>
            <Globe size={28} className="text-teal" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Any subject. Any level.
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[#9CA3AF]">
              From quantum mechanics to contract law. From beginner to expert. Dersify
              doesn&apos;t know the word &lsquo;outside my scope&rsquo;.
            </p>
            <div className="mt-6 h-[88px] overflow-hidden">
              <div className="animate-tag-scroll flex w-max flex-col gap-2">
                {[...ROTATING_TOPICS, ...ROTATING_TOPICS].map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="w-max rounded-full bg-white/[0.06] px-3 py-1 text-xs text-[#9CA3AF]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* Row 2 */}
          <FeatureCard className="lg:col-span-4">
            <CalendarClock size={28} className="text-blue" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Reviews when you&apos;re about to forget.
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[#9CA3AF]">
              FSRS spaced repetition schedules each concept precisely — not once a
              week, but exactly when your memory is about to slip.
            </p>
            <ForgettingCurve />
          </FeatureCard>

          <FeatureCard className="lg:col-span-4" delay={0.08}>
            <Crosshair size={28} className="text-amber" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Finds gaps you didn&apos;t know you had.
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[#9CA3AF]">
              Dersify detects 6 types of misconceptions — terminology, false analogies,
              causal inversions. Then fixes them with targeted remediation.
            </p>
          </FeatureCard>

          <FeatureCard className="lg:col-span-4" delay={0.16}>
            <FileText size={28} className="text-teal" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              Learn from your own materials.
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[#9CA3AF]">
              Upload PDFs, paste URLs, or add YouTube videos. Dersify grounds
              explanations in your materials while filling gaps with its own knowledge.
            </p>
            <div className="mt-6 flex gap-2">
              {['PDF', 'URL', 'YouTube'].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-[#9CA3AF]"
                >
                  {t}
                </span>
              ))}
            </div>
          </FeatureCard>

          {/* Row 3 */}
          <FeatureCard className="lg:col-span-5">
            <BarChart3 size={28} className="text-teal" />
            <h3 className="mt-4 text-[22px] font-semibold text-white">
              Know exactly what you know.
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[#9CA3AF]">
              A real-time forgetting curve map. No XP. No streaks. Just an honest
              picture of what&apos;s solid, what&apos;s slipping, and what&apos;s due
              for review today.
            </p>
            <div className="mt-6 space-y-3">
              {PROGRESS_TOPICS.map((topic) => (
                <div key={topic.name}>
                  <p className="text-xs text-white">{topic.name}</p>
                  <div className="mt-1.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                    {topic.segments.map((seg, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${seg.pct}%` }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-7" delay={0.08}>
            <Activity size={28} className="text-blue" />
            <h3 className="mt-4 text-[22px] font-semibold text-white">
              The AI reads the room.
            </h3>
            <p className="mt-2 max-w-[520px] text-base leading-relaxed text-[#9CA3AF]">
              Dersify detects when you&apos;re fatigued, when you&apos;re in flow, when
              you&apos;re confused. It shifts modes — rescue, acceleration,
              consolidation — invisibly, in real-time.
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
                    className="rounded-full border px-3 py-1 font-mono text-xs"
                    style={{
                      color: mode.color,
                      borderColor: `${mode.color}66`,
                      backgroundColor: `${mode.color}1A`,
                    }}
                  >
                    {mode.label}
                  </span>
                  {i < MODES.length - 1 && (
                    <span className="text-[#4B5563]">→</span>
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
