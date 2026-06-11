'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { label: 'Learn', active: true },
  { label: 'Knowledge Map' },
  { label: 'Review Queue', badge: true },
  { label: 'Progress' },
  { label: 'Settings' },
];

const CONCEPTS = [
  { name: 'Modules', status: 'Mastered', color: '#0D9488' },
  { name: 'Controllers', status: 'Mastered', color: '#0D9488' },
  { name: 'Services', status: 'Mastered', color: '#0D9488' },
  { name: 'Dep. Injection', status: 'Review due', color: '#F59E0B', pulse: true },
  { name: 'Guards', status: 'Next up', color: '#4B5563' },
];

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.6 + i * 0.35 },
  }),
};

export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]" style={{ perspective: '1600px' }}>
      {/* Glow behind the card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(27,79,219,0.2) 0%, transparent 70%)',
        }}
      />

      <div
        className="animate-float overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.04]"
        style={{
          boxShadow:
            '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        <div className="flex min-h-[420px] text-left">
          {/* LEFT SIDEBAR */}
          <div className="hidden w-[150px] shrink-0 flex-col border-r border-white/5 bg-black/20 p-4 md:flex">
            <div className="mb-5 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 28 28">
                <defs>
                  <linearGradient id="mockup-lg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1B4FDB" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
                <path d="M14 2L26 14L14 26L2 14Z" fill="url(#mockup-lg)" />
                <path d="M14 8L20 14L14 20L8 14Z" fill="rgba(10,22,40,0.6)" />
              </svg>
              <span className="text-[11px] font-semibold text-white">Dersify</span>
              <div className="gradient-bg ml-auto h-5 w-5 rounded-full text-center text-[9px] leading-5 text-white">
                A
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {SIDEBAR_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 py-1.5 pl-2 text-[12px] ${
                    item.active
                      ? 'border-l-2 border-[#1B4FDB] text-white'
                      : 'border-l-2 border-transparent text-[#9CA3AF]'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-amber" />
                  )}
                </div>
              ))}
            </nav>
            <div className="mt-auto">
              <span className="rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-[9px] font-semibold tracking-widest text-teal">
                PRO
              </span>
            </div>
          </div>

          {/* MAIN CONVERSATION */}
          <div className="flex min-w-0 flex-1 flex-col p-4">
            <div className="mb-4">
              <span className="rounded-md bg-teal/15 px-2 py-1 text-[10px] font-medium text-teal">
                NestJS Architecture
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className="max-w-[90%] self-start rounded-xl rounded-bl-sm bg-white/[0.06] p-3 text-[12px] leading-relaxed text-white"
              >
                Before we continue — from last session, can you explain in one sentence
                why dependency injection makes testing easier?
              </motion.div>

              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className="max-w-[90%] self-end rounded-xl rounded-br-sm border border-blue/40 bg-blue/30 p-3 text-[12px] leading-relaxed text-white"
              >
                Because you swap the real dependency for a mock without changing the
                class.
              </motion.div>

              <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className="max-w-[90%] self-start rounded-xl rounded-bl-sm bg-white/[0.06] p-3 text-[12px] leading-relaxed text-white"
              >
                Exactly right. That&apos;s the core insight. Now — where does the
                dependency come from? Right now you might be doing this:
                <span className="animate-blink ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-teal" />
                <pre className="mt-2 overflow-x-auto rounded-md border-l-2 border-teal bg-black/30 p-2 font-mono text-[11px] text-[#9CA3AF]">
                  {'class UserService {\n  db = new DatabaseConnection();\n}'}
                </pre>
              </motion.div>
            </div>

            <div className="mt-4 rounded-[10px] border border-white/10 bg-black/20 px-3 py-2.5 text-[12px] text-[#4B5563]">
              Ask anything...
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="hidden w-[170px] shrink-0 flex-col gap-4 border-l border-white/5 bg-black/15 p-4 sm:flex">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-teal">
                Progress
              </p>
              <p className="mt-1 text-[11px] text-white">18 mastered · 14 sessions</p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#9CA3AF]">
                Concept map — NestJS
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {CONCEPTS.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.pulse ? 'animate-pulse-dot' : ''}`}
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate text-white">{c.name}</span>
                    <span className="ml-auto shrink-0 text-[9px] text-[#4B5563]">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#9CA3AF]">
                Active gap
              </p>
              <div className="mt-2 rounded-md border-l-2 border-amber bg-white/[0.03] p-2.5">
                <p className="text-[11px] font-semibold text-white">
                  DEPENDENCY INJECTION
                </p>
                <p className="mt-1 text-[11px] leading-snug text-[#9CA3AF]">
                  Confuses provider scope with module scope...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
