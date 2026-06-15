export default function GlobalVision() {
  return (
    <section id="institutions" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* World map dot grid background */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      {/* Deep blue radial glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-700/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="reveal">
            <div className="section-label">Our Mission</div>
            <h2 className="font-sora text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Built in Somalia.<br />
              <span className="text-blue-400">Built for the world.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              We&apos;re building the operating system for human learning — starting in Africa, scaling globally, and opening the future for every learner, everywhere. Education should adapt to you, not the other way around.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mb-10">
              {[
                { value: "150+", label: "People Aim to Impact" },
                { value: "72+",  label: "Languages Supported" },
                { value: "1",    label: "Mission: Expand Human Potential" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-sora text-3xl font-bold text-white mb-1">{s.value}</p>
                  <p className="text-xs text-slate-500 max-w-[140px] leading-snug">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <a href="/auth/sign-up" className="btn-primary">
                Join the Movement
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#" className="btn-secondary">
                Learn our story
              </a>
            </div>
          </div>

          {/* Right — world visualization */}
          <div className="reveal reveal-delay-2 relative flex items-center justify-center">
            {/* Outer ring */}
            <div className="relative w-full aspect-square max-w-[360px] mx-auto">
              {/* Concentric rings */}
              <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-spin-slow" style={{ animationDuration: "40s" }} />
              <div className="absolute inset-8 rounded-full border border-blue-500/8 animate-spin-slow" style={{ animationDuration: "30s", animationDirection: "reverse" }} />
              <div className="absolute inset-16 rounded-full border border-blue-500/12" />

              {/* Center circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
                  <p className="font-sora text-2xl font-bold text-white">48+</p>
                  <p className="text-[10px] text-blue-300 mt-0.5">Countries</p>
                </div>
              </div>

              {/* Orbit dots — representing global reach */}
              {[
                { label: "Somalia",   angle: 0,   dist: 48 },
                { label: "Kenya",     angle: 45,  dist: 42 },
                { label: "Nigeria",   angle: 100, dist: 46 },
                { label: "India",     angle: 155, dist: 44 },
                { label: "USA",       angle: 210, dist: 48 },
                { label: "UK",        angle: 255, dist: 42 },
                { label: "Germany",   angle: 300, dist: 46 },
                { label: "Brazil",    angle: 340, dist: 44 },
              ].map((dot) => {
                const rad = (dot.angle * Math.PI) / 180;
                const x = 50 + dot.dist * Math.cos(rad);
                const y = 50 + dot.dist * Math.sin(rad);
                return (
                  <div
                    key={dot.label}
                    className="absolute"
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                  >
                    <div className="relative group">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400/70 border border-blue-300/40 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0D1A2E] px-1.5 py-0.5 rounded border border-white/[0.06]">
                        {dot.label}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Connection lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                {[0, 45, 100, 155, 210, 255, 300, 340].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const dists = [48, 42, 46, 44, 48, 42, 46, 44];
                  const x = 50 + dists[i] * Math.cos(rad);
                  const y = 50 + dists[i] * Math.sin(rad);
                  return (
                    <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#3B82F6" strokeWidth="0.3" strokeDasharray="2 2" />
                  );
                })}
              </svg>
            </div>

            {/* Floating community card */}
            <div className="absolute -bottom-4 -left-4 bg-[#0D1A2E] border border-white/[0.08] rounded-xl p-4 shadow-xl">
              <p className="text-[10px] text-slate-500 mb-1">Somali Community</p>
              <p className="text-sm font-bold text-white">Growing every day</p>
              <div className="flex mt-2 -space-x-1.5">
                {["AK", "MA", "FH", "BM", "SA"].map((init, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-600/40 border-2 border-[#0D1A2E] flex items-center justify-center text-[7px] font-bold text-blue-300">
                    {init}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full bg-white/[0.05] border-2 border-[#0D1A2E] flex items-center justify-center text-[7px] font-bold text-slate-500">+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
