'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';
import { WaitlistForm } from '@/components/ui/waitlist-form';

export function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="border-t py-16 lg:py-24"
      style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto max-w-[680px] rounded-xl px-6 py-16 text-center sm:px-16"
          style={{
            background: 'linear-gradient(180deg, var(--accent-soft), transparent), var(--bg-surface)',
            border: '1px solid var(--accent-soft-border)',
            boxShadow: 'var(--glow-accent)',
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-soft-border)',
              color: 'var(--accent)',
            }}
          >
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Early access
          </span>

          <h2
            className="mx-auto mt-6 max-w-[520px]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
            }}
          >
            What will you understand{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>by tonight?</em>
          </h2>

          <p
            className="mx-auto mt-5 max-w-[480px] text-lg leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Join the waitlist and be among the first to experience Dersify when we
            launch. Free to join. No credit card required.
          </p>

          <div className="mt-8 text-left">
            <WaitlistForm source="waitlist-section" size="large" />
          </div>

          <p className="mt-4 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            2,400+ learners waiting · No spam · Unsubscribe anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
