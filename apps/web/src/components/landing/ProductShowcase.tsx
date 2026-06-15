"use client";

import { useState } from "react";

const TABS = [
  {
    id: "tutoring",
    label: "AI Tutoring",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Tutoring Sessions",
    desc: "Interactive, Socratic, and adaptive conversations. Ask anything, get guided through problems step by step with an AI that truly understands your level.",
    ui: <TutoringUI />,
  },
  {
    id: "workspace",
    label: "Code Workspace",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: "Coding Workspace",
    desc: "Write, run, and get AI feedback in real time. Integrated coding environment with intelligent debugging and explanations tied to your learning path.",
    ui: <CodeUI />,
  },
  {
    id: "graph",
    label: "Knowledge Graph",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"/>
      </svg>
    ),
    title: "Knowledge Graph",
    desc: "See how concepts connect and build. Your understanding is mapped as a living, growing graph — identifying gaps and suggesting the perfect next concept.",
    ui: <GraphUI />,
  },
  {
    id: "analytics",
    label: "Learning Analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Learning Analytics",
    desc: "Track progress, accuracy, and mastery. Deep insights into your learning patterns, streaks, weak areas, and projected mastery timelines.",
    ui: <AnalyticsUI />,
  },
  {
    id: "roadmap",
    label: "Adaptive Roadmap",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zM13 13l6 6"/>
      </svg>
    ),
    title: "Adaptive Roadmap",
    desc: "Your path evolves with your growth. A dynamic learning roadmap that restructures itself based on your pace, goals, and knowledge gaps.",
    ui: <RoadmapUI />,
  },
];

function TutoringUI() {
  return (
    <div className="h-full flex flex-col gap-3 p-1">
      <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-widest mb-1">Dependency Injection · Session 12</div>
      {[
        { from: "ai", text: "Before we go further — can you tell me what happens when a class creates its own dependency inside itself?" },
        { from: "user", text: "It becomes tightly coupled? Because it directly instantiates the other class..." },
        { from: "ai", text: "Exactly. That's the key insight ✓. And why is tight coupling a problem? Think about testing..." },
      ].map((msg, i) => (
        <div key={i} className={`flex gap-2 ${msg.from === "user" ? "justify-end" : ""}`}>
          {msg.from === "ai" && (
            <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[7px] text-blue-400 font-bold">D</span>
            </div>
          )}
          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
            msg.from === "ai"
              ? "bg-white/[0.04] border border-white/[0.06] text-slate-300 rounded-tl-sm"
              : "bg-blue-600/20 border border-blue-500/20 text-slate-200 rounded-tr-sm"
          }`}>
            {msg.text}
          </div>
          {msg.from === "user" && (
            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[7px] text-white font-bold">A</span>
            </div>
          )}
        </div>
      ))}
      <div className="mt-auto bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 flex gap-2 items-center">
        <span className="text-[11px] text-slate-600 flex-1">Type your response...</span>
        <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>
  );
}

function CodeUI() {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex gap-2 text-[10px] text-slate-500">
        {["main.ts", "app.module.ts", "user.service.ts"].map((f, i) => (
          <span key={f} className={`px-2 py-1 rounded-t-md border-t border-x ${i === 0 ? "border-blue-500/30 text-blue-400 bg-blue-600/10" : "border-white/[0.05] bg-transparent"}`}>{f}</span>
        ))}
      </div>
      <div className="flex-1 bg-[#050C1B] rounded-xl border border-white/[0.05] p-4 font-mono text-[10px] leading-relaxed">
        <div className="text-slate-600">// Dependency Injection example</div>
        <div><span className="text-blue-400">@Injectable</span><span className="text-slate-400">()</span></div>
        <div><span className="text-purple-400">export class</span> <span className="text-yellow-400">UserService</span> <span className="text-slate-400">{"{"}</span></div>
        <div className="ml-4"><span className="text-purple-400">constructor</span><span className="text-slate-400">(</span></div>
        <div className="ml-8"><span className="text-slate-400">private readonly </span><span className="text-cyan-400">userRepo</span><span className="text-slate-400">: </span><span className="text-yellow-400">UserRepository</span><span className="text-slate-400">,</span></div>
        <div className="ml-4"><span className="text-slate-400">) {"{"}"</span></div>
        <div className="ml-8 bg-green-500/10 border border-green-500/15 rounded px-2 -mx-2 py-0.5">
          <span className="text-green-400 text-[9px]">✓ AI: Dependency injected correctly</span>
        </div>
        <div className="ml-4"><span className="text-slate-600">{"}"}</span></div>
        <div><span className="text-slate-600">{"}"}</span></div>
      </div>
    </div>
  );
}

function GraphUI() {
  const nodes = [
    { label: "OOP", x: 20, y: 20, mastered: true },
    { label: "Classes", x: 50, y: 10, mastered: true },
    { label: "Interfaces", x: 75, y: 20, mastered: true },
    { label: "DI", x: 50, y: 50, mastered: false, active: true },
    { label: "IoC", x: 25, y: 70, mastered: false },
    { label: "Modules", x: 72, y: 68, mastered: false },
  ];

  return (
    <div className="h-full relative">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Lines */}
        <line x1="20" y1="20" x2="50" y2="50" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5"/>
        <line x1="50" y1="10" x2="50" y2="50" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5"/>
        <line x1="75" y1="20" x2="50" y2="50" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5"/>
        <line x1="50" y1="50" x2="25" y2="70" stroke="rgba(100,116,139,0.2)" strokeWidth="0.5" strokeDasharray="2"/>
        <line x1="50" y1="50" x2="72" y2="68" stroke="rgba(100,116,139,0.2)" strokeWidth="0.5" strokeDasharray="2"/>
        {/* Nodes */}
        {nodes.map((n) => (
          <g key={n.label}>
            <circle
              cx={`${n.x}%`} cy={`${n.y}%`} r={n.active ? "5" : "3.5"}
              fill={n.active ? "rgba(59,130,246,0.3)" : n.mastered ? "rgba(74,222,128,0.2)" : "rgba(100,116,139,0.15)"}
              stroke={n.active ? "#3B82F6" : n.mastered ? "#4ADE80" : "#475569"}
              strokeWidth={n.active ? "0.8" : "0.5"}
            />
            <text x={`${n.x}%`} y={`${n.y + 8}%`} textAnchor="middle" fontSize="4" fill={n.active ? "#60A5FA" : n.mastered ? "#4ADE80" : "#64748B"}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 left-2 flex gap-3 text-[9px] text-slate-600">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400/60 inline-block"/>Mastered</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400/60 inline-block"/>In Progress</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600/60 inline-block"/>Upcoming</span>
      </div>
    </div>
  );
}

function AnalyticsUI() {
  const bars = [85, 60, 92, 70, 88, 55, 95, 78, 83, 90, 75, 97];
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Accuracy", value: "92%", col: "text-green-400" }, { label: "Sessions", value: "47", col: "text-blue-400" }, { label: "Streak", value: "14d", col: "text-yellow-400" }].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-2 text-center">
            <p className={`text-base font-bold ${s.col}`}>{s.value}</p>
            <p className="text-[9px] text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-[#050C1B] rounded-xl border border-white/[0.05] p-3">
        <p className="text-[9px] text-slate-600 mb-3">Weekly Progress</p>
        <div className="flex items-end justify-between h-24 gap-1">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm" style={{ height: `${h}%`, background: `rgba(59,130,246,${0.3 + (h / 300)})` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapUI() {
  const steps = [
    { label: "OOP Fundamentals", done: true },
    { label: "Classes & Interfaces", done: true },
    { label: "Dependency Injection", active: true },
    { label: "Design Patterns", done: false },
    { label: "Architecture", done: false },
  ];
  return (
    <div className="h-full flex flex-col justify-center gap-3 px-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold shrink-0 ${
            s.done ? "bg-green-500/20 border-green-500/40 text-green-400" :
            s.active ? "bg-blue-600/30 border-blue-500/50 text-blue-400 animate-pulse-glow" :
            "bg-white/[0.03] border-white/[0.08] text-slate-600"
          }`}>
            {s.done ? "✓" : i + 1}
          </div>
          <div className="flex-1">
            <p className={`text-xs font-medium ${s.done ? "text-slate-500 line-through" : s.active ? "text-white" : "text-slate-600"}`}>{s.label}</p>
            {s.active && <p className="text-[10px] text-blue-400">Current focus</p>}
          </div>
          {s.active && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
        </div>
      ))}
    </div>
  );
}

export default function ProductShowcase() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="section-label mx-auto">Product Showcase</div>
          <h2 className="font-sora text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Everything you need to<br className="hidden md:block" /> master any subject
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Powerful tools, one seamless experience. Built from the ground up for deep learning.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap reveal">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                active === i
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "bg-transparent border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/[0.12]"
              }`}
            >
              <span className={active === i ? "text-blue-400" : "text-slate-600"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left — description */}
          <div className="reveal">
            <h3 className="font-sora text-3xl font-bold text-white mb-4">
              {TABS[active].title}
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {TABS[active].desc}
            </p>
            <a href="/auth/sign-up" className="btn-primary inline-flex">
              Try It Free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Right — UI preview */}
          <div className="reveal reveal-delay-2">
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0D1A2E] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] glow-blue">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-[#081121]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                <span className="ml-3 text-[10px] text-slate-600 font-medium">Dersify — {TABS[active].title}</span>
              </div>
              <div className="p-5 h-64">
                {TABS[active].ui}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { title: "Adaptive Learning",    desc: "Adjusts to your pace and focuses on what you need.", icon: "📈" },
            { title: "AI Explanations",      desc: "Get instant, easy-to-understand explanations on tap.", icon: "💡" },
            { title: "Smart Practice",       desc: "Personalised exercises that target your weak areas.", icon: "🎯" },
            { title: "Progress Insights",    desc: "Track mastery and see where you're growing clearly.", icon: "📊" },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`reveal reveal-delay-${i + 1} p-5 bg-[#0D1A2E]/50 border border-white/[0.05] rounded-xl hover:border-blue-500/20 transition-all hover:-translate-y-1 duration-300`}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h4 className="text-sm font-semibold text-white mb-1.5">{f.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
