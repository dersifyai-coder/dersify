const TRADITIONAL = [
  "One-size-fits-all content",
  "Same pace for everyone",
  "Linear and rigid paths",
  "Tests memory, not understanding",
  "No memory of your journey",
  "Hard to stay motivated",
];

const DERSIFY = [
  "Personalised to how you learn",
  "Adapts in real time",
  "Dynamic paths based on you",
  "Builds understanding deeply",
  "Remembers everything",
  "Keeps you engaged",
];

export default function TheProblem() {
  return (
    <section id="problem" className="py-28 relative overflow-hidden">
      {/* Bg accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Label + heading */}
        <div className="text-center mb-16 reveal">
          <div className="section-label mx-auto">The Problem</div>
          <h2 className="font-sora text-4xl md:text-5xl font-bold text-white leading-tight">
            Why traditional education<br className="hidden md:block" /> fails most learners
          </h2>
        </div>

        {/* Comparison card */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-0 max-w-5xl mx-auto">
          {/* Traditional */}
          <div className="reveal reveal-delay-1 bg-[#0D1A2E]/60 border border-white/[0.06] rounded-2xl rounded-r-none md:rounded-r-none p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">Traditional Learning</p>
                <p className="text-sm text-slate-400 font-medium mt-0.5">Rigid classrooms, one pace</p>
              </div>
            </div>

            <ul className="space-y-3">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </div>
                  <span className="text-sm text-slate-500 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* VS divider */}
          <div className="reveal reveal-delay-2 flex items-center justify-center z-10 relative">
            <div className="hidden md:flex flex-col items-center">
              <div className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
              <div className="w-10 h-10 rounded-full bg-[#0D1A2E] border border-white/[0.10] flex items-center justify-center shadow-xl -mx-5">
                <span className="text-xs font-bold text-slate-500">VS</span>
              </div>
              <div className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
            </div>
            {/* Mobile VS badge */}
            <div className="md:hidden w-full flex items-center justify-center py-3">
              <span className="px-4 py-1.5 bg-[#0D1A2E] border border-white/[0.08] rounded-full text-xs font-bold text-slate-500">VS</span>
            </div>
          </div>

          {/* Dersify */}
          <div className="reveal reveal-delay-3 bg-[#0D1A2E] border border-blue-500/[0.2] rounded-2xl md:rounded-l-none p-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/12 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold">Dersify Learning</p>
                <p className="text-sm text-slate-300 font-medium mt-0.5">AI that adapts to every mind</p>
              </div>
            </div>

            <ul className="space-y-3">
              {DERSIFY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom pain points */}
        <div className="grid md:grid-cols-3 gap-5 mt-12 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              ),
              title: "One-size-fits-all doesn't work",
              desc: "Every student learns differently. Traditional classrooms can't adapt to you.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
              ),
              title: "Hard to stay on track",
              desc: "It's easy to fall behind and hard to know what to focus on next.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
              ),
              title: "Getting help is too slow",
              desc: "You can't get personalised help instantly when you're stuck.",
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className={`reveal reveal-delay-${i + 1} p-6 bg-[#0D1A2E]/50 border border-white/[0.05] rounded-xl hover:border-blue-500/20 transition-colors`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
