const LAYERS = [
  {
    num: "01",
    title: "Conversation Layer",
    subtitle: "You talk. Ask, explore, question, and think — naturally.",
    desc: "The AI converses with you naturally. It asks, explains, challenges, and guides you through concepts in a dialogue that feels human — not mechanical.",
    color: "blue",
    demo: {
      label: "Ask a follow-up",
      prompt: "Explain Dependency Injection in React JS",
      response: "Great starting point! Let me connect this to what you already know about props...",
    },
    items: ["Socratic questioning", "Explain in your words", "Instant clarification", "Guided discovery"],
  },
  {
    num: "02",
    title: "Knowledge Map",
    subtitle: "Your knowledge is structured, connected, and alive.",
    desc: "Your learning is mapped as a living graph that connects concepts and adjusts as you master new ones. No more disconnected lessons — everything builds on itself.",
    color: "cyan",
    items: ["Concept graph", "Dependency tracking", "Gap detection", "Continuous update"],
    nodes: ["Modules", "Providers", "Services", "Dependency Injection", "IoC Container"],
  },
  {
    num: "03",
    title: "Intelligence Engine",
    subtitle: "The system remembers, understands, and personalizes everything.",
    desc: "Our AI analyses how you learn, where you struggle, and what clicks — adapting every session, every explanation, every practice problem to your specific mind.",
    color: "purple",
    items: ["Memory", "Diagnostics", "Adaptation", "Prediction"],
  },
];

const colorMap: Record<string, { border: string; glow: string; num: string; icon: string; badge: string }> = {
  blue:   { border: "border-blue-500/25",   glow: "bg-blue-600/10",   num: "text-blue-400",   icon: "bg-blue-600/15 border-blue-500/25",   badge: "bg-blue-600/15 text-blue-400 border-blue-500/25" },
  cyan:   { border: "border-cyan-500/25",    glow: "bg-cyan-500/10",   num: "text-cyan-400",   icon: "bg-cyan-500/15 border-cyan-500/25",    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
  purple: { border: "border-purple-500/25",  glow: "bg-purple-500/10", num: "text-purple-400", icon: "bg-purple-500/15 border-purple-500/25", badge: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 reveal">
          <div className="section-label mx-auto">How It Works</div>
          <h2 className="font-sora text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            An intelligent system with<br className="hidden md:block" /> three connected layers
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Dersify works like an operating system for learning — understanding you, connecting your knowledge, and driving you to mastery.
          </p>
        </div>

        {/* Connector line (desktop) */}
        <div className="hidden lg:flex items-center justify-center mb-12 relative">
          <div className="absolute w-[70%] h-[1px] bg-gradient-to-r from-blue-500/40 via-cyan-500/40 to-purple-500/40 top-1/2" />
          <div className="flex w-[70%] justify-between relative z-10">
            {["01", "02", "03"].map((n, i) => (
              <div
                key={n}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                  i === 0 ? "bg-blue-600/20 border-blue-500/50 text-blue-400" :
                  i === 1 ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" :
                            "bg-purple-500/20 border-purple-500/50 text-purple-400"
                } bg-[#050C1B] shadow-lg`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {LAYERS.map((layer, i) => {
            const c = colorMap[layer.color];
            return (
              <div
                key={layer.num}
                className={`reveal reveal-delay-${i + 1} group relative bg-[#0D1A2E] border ${c.border} rounded-2xl p-7 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300`}
              >
                {/* Glow */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${c.glow} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                {/* Number */}
                <div className={`text-5xl font-bold ${c.num} opacity-20 font-sora mb-4 -ml-1`}>{layer.num}</div>

                <h3 className="font-sora text-xl font-bold text-white mb-1">{layer.title}</h3>
                <p className="text-xs text-slate-500 mb-3 font-medium">{layer.subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{layer.desc}</p>

                {/* Demo box for layer 1 */}
                {layer.demo && (
                  <div className="mb-6 bg-[#081121] border border-white/[0.05] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] text-slate-500">Live conversation</span>
                    </div>
                    <div className="bg-blue-600/10 border border-blue-500/15 rounded-lg px-3 py-2 mb-2">
                      <p className="text-[10px] text-slate-400">{layer.demo.prompt}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                      <p className="text-[10px] text-slate-500">{layer.demo.response}</p>
                    </div>
                  </div>
                )}

                {/* Knowledge graph for layer 2 */}
                {layer.nodes && (
                  <div className="mb-6 bg-[#081121] border border-white/[0.05] rounded-xl p-4">
                    <div className="flex flex-wrap gap-2">
                      {layer.nodes.map((node, ni) => (
                        <span
                          key={node}
                          className={`px-2 py-1 rounded-md text-[9px] font-semibold border ${
                            ni === 3
                              ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                              : "bg-white/[0.03] border-white/[0.06] text-slate-500"
                          }`}
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className={`w-1 h-1 rounded-full ${
                        layer.color === "blue" ? "bg-blue-400" :
                        layer.color === "cyan" ? "bg-cyan-400" : "bg-purple-400"
                      }`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center reveal">
          <p className="text-xs text-slate-600 flex items-center justify-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            Continuous Adaptation — the system learns and improves as you learn
          </p>
        </div>
      </div>
    </section>
  );
}
