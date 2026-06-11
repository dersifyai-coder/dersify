'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { EASE } from '@/lib/utils';

const OTHER_TOOLS = [
  'Resets to zero each session',
  'No memory of your struggles',
  'Same pace for every learner',
  'Teaches from the beginning every time',
  "Can't detect what you misunderstood",
  "No concept of what's due for review",
];

const DERSIFY = [
  'Builds a permanent model of your mind',
  'Remembers every struggle, every breakthrough',
  'Adapts pace, depth, and approach in real-time',
  'Starts exactly where you left off, every time',
  'Detects and corrects misconceptions automatically',
  "Knows which concepts you're about to forget",
];

export function Problem() {
  return (
    <section id="problem" className="bg-navy py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <p className="text-center text-[13px] font-medium uppercase tracking-[0.1em] text-teal">
          The Problem
        </p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mt-4 max-w-[700px] text-center text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-5xl"
        >
          Traditional AI tutors reset to zero the moment you close the tab.
        </motion.h2>

        <p className="mx-auto mt-5 max-w-[560px] text-center text-lg leading-[1.7] text-[#9CA3AF]">
          You re-explain yourself every session. Your progress is invisible. The AI has
          no idea what you struggled with last week.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Every other tool */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8"
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#4B5563]" />
              <h3 className="text-lg font-semibold text-white">Every other tool</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {OTHER_TOOLS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base text-[#9CA3AF]">
                  <X size={18} className="mt-0.5 shrink-0 text-[#4B5563]" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Dersify */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-2xl border border-blue/25 bg-blue/[0.06] p-8 shadow-[0_0_60px_rgba(27,79,219,0.1)]"
          >
            <div className="flex items-center gap-3">
              <span className="gradient-bg h-2 w-2 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Dersify</h3>
            </div>
            <ul className="mt-6 space-y-4">
              {DERSIFY.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base text-white">
                  <Check size={18} className="mt-0.5 shrink-0 text-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
