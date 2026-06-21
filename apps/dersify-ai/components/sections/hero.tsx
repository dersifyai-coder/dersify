'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE, delay },
});

const HERO_NODES = [
  { name: 'Vectors',        x: 12, y: 30, mastery: 100, state: 'mastered' as const },
  { name: 'Linear maps',    x: 12, y: 74, mastery: 100, state: 'mastered' as const },
  { name: 'Eigenvectors',   x: 50, y: 52, mastery: 64,  state: 'active'   as const },
  { name: 'Diagonalization',x: 86, y: 28, mastery: 0,   state: 'locked'   as const },
  { name: 'SVD',            x: 86, y: 76, mastery: 0,   state: 'locked'   as const },
];

function MasteryArc({ value, size, thickness }: { value: number; size: number; thickness: number }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const complete = value >= 100;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-default)" strokeWidth={thickness} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={complete ? 'var(--accent-2)' : 'var(--accent)'}
        strokeWidth={thickness} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
      />
    </svg>
  );
}

function HeroMap() {
  const sz = 30, th = 3;
  return (
    <div
      className="relative mx-auto mt-14 hidden sm:block"
      style={{ maxWidth: 880, height: 190 }}
      aria-hidden
    >
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 880 190"
        preserveAspectRatio="none"
      >
        <path d="M150 57 C 330 57, 330 99, 440 99" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" />
        <path d="M150 140 C 330 140, 330 99, 440 99" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" />
        <path d="M440 99 C 640 99, 640 53, 756 53" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeDasharray="5 5" />
        <path d="M440 99 C 640 99, 640 144, 756 144" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeDasharray="5 5" />
      </svg>
      {HERO_NODES.map((n, i) => {
        const isLocked = n.state === 'locked';
        const isActive = n.state === 'active';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${n.x}%`,
              top: `${n.y}%`,
              transform: 'translate(-50%,-50%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px 6px 6px',
              background: isActive
                ? 'linear-gradient(180deg, var(--accent-soft), transparent), var(--bg-surface)'
                : 'var(--bg-surface)',
              border: `1px solid ${isActive ? 'var(--accent-soft-border)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-full)',
              boxShadow: isActive ? 'var(--glow-accent)' : 'var(--shadow-md)',
              opacity: isLocked ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isLocked ? (
              <span
                style={{
                  width: sz, height: sz, borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
            ) : (
              <MasteryArc value={n.mastery} size={sz} thickness={th} />
            )}
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              {n.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-4"
      style={{
        background: 'radial-gradient(120% 60% at 50% -10%, rgba(15,122,69,0.08) 0%, transparent 55%)',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 text-center lg:px-12">
        <motion.span
          {...fade(0)}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-soft-border)',
            color: 'var(--accent)',
          }}
        >
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          An AI tutor that remembers how you learn
        </motion.span>

        <motion.h1
          {...fade(0.1)}
          className="mx-auto mt-7 max-w-[820px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
          }}
        >
          Learn anything,{' '}
          <br className="hidden sm:block" />
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>the way you think.</em>
        </motion.h1>

        <motion.p
          {...fade(0.2)}
          className="mx-auto mt-6 max-w-[600px] text-xl leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          No pre-built courses. Bring any topic — Dersify maps it to how your mind works
          and teaches through real conversation, not lectures.
        </motion.p>

        <motion.div {...fade(0.3)} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={() => scrollTo('waitlist')}>
            Start with any topic
          </Button>
          <Button variant="secondary" size="lg" onClick={() => scrollTo('how-it-works')}>
            See the method
          </Button>
        </motion.div>

        <motion.p
          {...fade(0.4)}
          className="mt-4 text-[13px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Free to start · no credit card
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        className="mx-auto max-w-[1200px] px-6 lg:px-12"
      >
        <HeroMap />
      </motion.div>

      {/* bottom fade to page bg */}
      <div
        className="pointer-events-none mt-8 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
        aria-hidden
      />
    </section>
  );
}
