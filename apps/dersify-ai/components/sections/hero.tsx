'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EASE } from '@/lib/utils';
import { WaitlistForm } from '@/components/ui/waitlist-form';

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.48, ease: EASE, delay },
});

const CONCEPTS = [
  { label: 'Variables', value: 100, state: 'mastered' },
  { label: 'Loops', value: 64, state: 'learning now' },
  { label: 'Async flow', value: 0, state: 'unlocks next' },
];

function MasteryRing({ value, size = 34 }: { value: number; size?: number }) {
  const thickness = 3;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border-default)"
        strokeWidth={thickness}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={value >= 85 ? 'var(--accent-2)' : 'var(--accent)'}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
        transition={{ duration: 0.85, ease: EASE, delay: 0.55 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
    </svg>
  );
}

function HeroProof() {
  return (
    <motion.div
      {...fade(0.18)}
      className="relative overflow-hidden rounded-[30px] p-5 sm:p-6"
      style={{
        background: 'linear-gradient(180deg, var(--accent-soft), transparent 42%), var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xl), var(--highlight-top)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold" style={{ color: 'var(--text-accent)' }}>
            Tutor memory on
          </p>
          <h2
            className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-[-0.02em]"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Programming
            <br />
            fundamentals
          </h2>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[12px] font-semibold"
          style={{ background: 'var(--accent-soft)', color: 'var(--text-accent)' }}
        >
          active
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: EASE, delay: 0.3 }}
        className="relative mt-5 rounded-[22px] p-4"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-md), var(--highlight-top)',
        }}
      >
        <p className="text-[12px] font-semibold" style={{ color: 'var(--text-accent)' }}>
          Persistent learner memory
        </p>
        <p className="mt-2 max-w-[520px] text-[15px] font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          Dersify carries your history into the next lesson, so the tutor starts from what you already tried.
        </p>
      </motion.div>

      <div
        className="relative mt-4 rounded-[22px] p-4"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-md), var(--highlight-top)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Connected map
            </p>
            <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Loops before async flow
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: 'var(--accent-soft)', color: 'var(--text-accent)' }}>
            64%
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {CONCEPTS.map((concept, index) => {
            const active = concept.label === 'Loops';
            const locked = concept.value === 0;

            return (
              <motion.div
                key={concept.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: EASE, delay: 0.42 + index * 0.07 }}
                className="flex items-center justify-between rounded-2xl px-3.5 py-2.5"
                style={{
                  background: active ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                  border: active ? '1px solid var(--accent-soft-border)' : '1px solid var(--border-subtle)',
                  color: locked ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                <div className="flex items-center gap-3">
                  <MasteryRing value={concept.value} />
                  <div>
                    <p className="text-[14px] font-semibold">{concept.label}</p>
                    <p className="text-[12px]" style={{ color: active ? 'var(--text-accent)' : 'var(--text-muted)' }}>
                      {concept.state}
                    </p>
                  </div>
                </div>
                {active ? (
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-accent)' }}>
                    next
                  </span>
                ) : !locked ? (
                  <Check size={17} style={{ color: 'var(--accent-2)' }} />
                ) : (
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    later
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: EASE, delay: 0.64 }}
          className="mt-3 rounded-2xl px-4 py-3"
          style={{
            background: 'var(--bg-inverse)',
            border: '1px solid var(--bg-inverse)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.62)' }}>
            next move from memory
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed" style={{ color: 'var(--accent-contrast)' }}>
            Start with yesterday's loop mistake, then unlock async flow.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:pb-14 lg:pt-30"
      style={{
        background:
          'radial-gradient(circle at 70% 8%, rgba(15,122,69,0.12), transparent 38%), linear-gradient(180deg, var(--bg-base), var(--bg-subtle))',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
        <div className="max-w-[590px] text-left">
          <motion.span
            {...fade(0)}
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-soft-border)',
              color: 'var(--text-accent)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            For self-learners stuck between videos, courses, docs, and chat
          </motion.span>

          <motion.h1
            {...fade(0.08)}
            className="mt-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 5.1vw, 4.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 0.98,
              color: 'var(--text-primary)',
            }}
          >
            Learn anything,
            the way you think.
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="mt-6 max-w-[560px] text-lg leading-relaxed sm:text-xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            YouTube, Coursera, Udemy, docs, and ChatGPT can explain but they don’t know when you’re stuck. Dersify doesn’t just explain — it learns how you learn, tracks your progress, spots misconceptions, and helps you master anything.
          </motion.p>

          <motion.p
            {...fade(0.22)}
            className="mt-4 max-w-[520px] text-[15px] font-semibold leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            Bring any topic. Dersify turns it into a learning map that remembers you.
          </motion.p>

          <motion.div
            {...fade(0.3)}
            className="mt-7 max-w-[620px] rounded-[22px] p-2"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg), var(--highlight-top)',
            }}
          >
            <WaitlistForm
              source="hero"
              size="large"
              placeholder="Enter your email for early access"
              buttonLabel="Join waitlist"
            />
          </motion.div>

          <motion.div
            {...fade(0.38)}
            className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Early access</span>
            <span>Text-first and low-bandwidth friendly</span>
            <span>No credit card</span>
          </motion.div>
        </div>

        <HeroProof />
      </div>
    </section>
  );
}
