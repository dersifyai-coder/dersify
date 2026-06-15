const STATS = [
  { value: "50K+",  label: "Active Learners",             icon: "👥" },
  { value: "1M+",   label: "Sessions Completed",          icon: "⚡" },
  { value: "92%",   label: "Report Better Understanding", icon: "🎯" },
  { value: "120+",  label: "Countries",                   icon: "🌍" },
];

export default function Stats() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 bg-[#0D1A2E]/30" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-blue-600/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/[0.05]">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`reveal reveal-delay-${i + 1} text-center px-8 py-6`}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-sora text-4xl md:text-5xl font-bold text-white mb-2">
                {s.value}
              </div>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
