"use client";

import Link from "next/link";

const FEATURE_PILLS = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07"/></svg>
    ),
    label: "AI-Native Learning",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l18 18M3 21l18-18"/></svg>
    ),
    label: "Personalized Pathways",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    ),
    label: "Adaptive Tutoring",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    ),
    label: "Deep Understanding",
  },
];

const STATS = [
  { value: "50K+",  label: "Active Learners" },
  { value: "1M+",   label: "Sessions Completed" },
  { value: "92%",   label: "Report Better Understanding" },
  { value: "120+",  label: "Countries" },
];

function ProductMockup() {
  return (
    <div className="relative w-full max-w-[580px] animate-float">
      {/* Glow behind card */}
      <div className="absolute inset-0 blur-[60px] bg-blue-600/20 rounded-3xl scale-95 translate-y-4" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0D1A2E] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] animate-pulse-glow">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#081121]">
          <span className="w-3 h-3 rounded-full bg-red-400/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <span className="w-3 h-3 rounded-full bg-green-400/70" />
          <div className="ml-4 flex-1 flex items-center gap-2">
            <div className="flex-1 max-w-[200px] h-5 bg-white/[0.04] rounded-md flex items-center px-3">
              <span className="text-[10px] text-slate-500">Dersify — AI Learning System</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">v2.1</div>
        </div>

        {/* Main layout */}
        <div className="flex h-[340px]">
          {/* Sidebar */}
          <div className="w-[160px] border-r border-white/[0.05] p-3 flex flex-col gap-0.5 bg-[#081121]/60">
            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest px-2 mb-2">Learn</p>
            {[
              { label: "Current Session", active: true },
              { label: "Knowledge Map" },
              { label: "My Roadmap" },
              { label: "Review Queue" },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-2 py-1.5 rounded-md text-[10px] font-medium cursor-pointer transition-colors ${
                  item.active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                    : "text-slate-500 hover:text-slate-400 hover:bg-white/[0.03]"
                }`}
              >
                {item.label}
              </div>
            ))}
            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest px-2 mt-3 mb-2">Problems</p>
            {[
              { label: "Analytics" },
              { label: "Session History" },
              { label: "Settings" },
            ].map((item) => (
              <div key={item.label} className="px-2 py-1.5 rounded-md text-[10px] font-medium text-slate-600 hover:text-slate-400 cursor-pointer">
                {item.label}
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
            <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Dependency Injection</div>

            {/* AI message */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
                <span className="text-[8px] text-blue-400 font-bold">D</span>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Before we start — Dependency Injection: tell me in your own words — what do you think it means when a class <span className="text-blue-400 font-mono bg-blue-900/30 px-1 rounded">depends on another class</span>?
                </p>
              </div>
            </div>

            {/* User message */}
            <div className="flex gap-2 justify-end">
              <div className="bg-blue-600/20 border border-blue-500/20 rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-slate-200 leading-relaxed">
                  I think it means one class needs another to work — like it uses another class&apos;s methods or properties?
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <span className="text-[8px] text-white font-bold">A</span>
              </div>
            </div>

            {/* AI follow-up */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
                <span className="text-[8px] text-blue-400 font-bold">D</span>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  That&apos;s exactly right. ✓ Now here&apos;s the key question — where does that dependency <span className="text-cyan-400 font-semibold">come from</span>?
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="mt-auto flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2">
              <input
                type="text"
                placeholder="Type your answer or question..."
                className="flex-1 text-[10px] bg-transparent text-slate-400 outline-none placeholder-slate-600"
                readOnly
              />
              <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-[140px] border-l border-white/[0.05] p-3 bg-[#081121]/40">
            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest mb-3">Progress</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {[
                { label: "MASTERED", value: "18", color: "text-green-400" },
                { label: "SESSIONS", value: "14", color: "text-blue-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
                  <p className={`text-[14px] font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[7px] text-slate-600 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04] mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-slate-500">Accuracy</span>
                <span className="text-[10px] text-blue-400 font-bold">76%</span>
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full w-[76%] bg-blue-500 rounded-full" />
              </div>
            </div>
            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest mt-3 mb-2">Concept Map</p>
            {["Modules", "Services", "Providers", "Adaptation", "Prediction"].map((c, i) => (
              <div key={c} className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? "bg-green-400" : i === 3 ? "bg-yellow-400" : "bg-slate-600"}`} />
                <span className="text-[9px] text-slate-500">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -left-3 bg-[#0D1A2E] border border-white/[0.08] rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
        <span className="text-[10px] text-slate-300 font-semibold">AI Tutor Active</span>
      </div>

      {/* Floating stat */}
      <div className="absolute -top-3 -right-3 bg-[#0D1A2E] border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-[10px] text-slate-500">Next Review</p>
        <p className="text-[13px] font-bold text-white">6.2<span className="text-[9px] text-slate-400 ml-1">hrs</span></p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 grid-pattern bg-grid-48" />
      <div className="absolute inset-0 radial-glow" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
        {/* Left — Copy */}
        <div className="flex-1 min-w-0 max-w-[560px]">
          {/* Badge */}
          <div className="section-label animate-fade-in mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Native Learning System
          </div>

          {/* Headline */}
          <h1 className="font-sora text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight text-white animate-fade-in-up delay-100 mb-6">
            Every learner{" "}
            <br className="hidden sm:block" />
            deserves a{" "}
            <br className="hidden sm:block" />
            <span className="text-blue-400">personal tutor.</span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-lg leading-relaxed animate-fade-in-up delay-200 mb-8 max-w-[480px]">
            Dersify is the AI-native learning system that understands how you learn, adapts in real time, remembers your progress, identifies misconceptions, and guides you to true mastery — so you can master anything.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300 mb-10">
            <Link href="/auth/sign-up" className="btn-primary">
              Start Learning
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="#features" className="btn-secondary">
              Explore Platform
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 animate-fade-in-up delay-400">
            {FEATURE_PILLS.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/[0.07] rounded-lg text-xs font-medium text-slate-400"
              >
                <span className="text-blue-400">{pill.icon}</span>
                {pill.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Product mockup */}
        <div className="flex-1 flex justify-center lg:justify-end animate-slide-in-right">
          <ProductMockup />
        </div>
      </div>

      {/* Stat strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.05] bg-[#050C1B]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white font-sora">{s.value}</span>
              <span className="text-sm text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
