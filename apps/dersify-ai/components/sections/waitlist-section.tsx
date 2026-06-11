'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';
import { WaitlistForm } from '@/components/ui/waitlist-form';

export function WaitlistSection() {
  return (
    <section id="waitlist" className="bg-navy py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-3xl border border-blue/20 bg-blue/[0.04] px-6 py-16 shadow-[inset_0_0_100px_rgba(27,79,219,0.08)] sm:px-16"
        >
          <div className="mx-auto max-w-[600px] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/[0.12] px-3.5 py-1.5">
              <span className="gradient-bg animate-pulse-dot h-2 w-2 rounded-full" />
              <span className="text-[13px] font-medium tracking-[0.04em] text-[#5B7FE8]">
                Early Access
              </span>
            </div>

            <h2 className="mt-6 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-5xl">
              Start learning with an AI that{' '}
              <span className="gradient-text">understands you.</span>
            </h2>

            <p className="mt-5 text-lg leading-[1.7] text-[#9CA3AF]">
              Join the waitlist and be among the first to experience Dersify when we
              launch. Free to join. No credit card required.
            </p>

            <div className="mt-8 text-left">
              <WaitlistForm source="waitlist-section" size="large" />
            </div>

            <p className="mt-4 text-[13px] text-[#4B5563]">
              2,400+ learners waiting · No spam · Unsubscribe anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
