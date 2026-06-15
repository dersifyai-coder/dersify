"use client";

import { useState } from "react";

const TESTIMONIALS = [
  {
    quote: "Dersify explains things in a way that finally makes sense to me. The AI explains concepts in a way that human teachers couldn't — patient, personalised, and always exactly at my level.",
    name: "Amina K.",
    role: "Computer Science Student",
    school: "MIT",
    rating: 5,
    avatar: "AK",
    color: "blue",
  },
  {
    quote: "It's like having a personal tutor available 24/7. I went from confused to confident. The explanations are exactly what I needed, when I needed them. My grades improved dramatically.",
    name: "Mohamed A.",
    role: "Software Engineer",
    school: "Stanford",
    rating: 5,
    avatar: "MA",
    color: "cyan",
  },
  {
    quote: "The knowledge map helps me see the big picture and remember everything better. I finally understand how concepts connect instead of just memorising isolated facts.",
    name: "Fatima H.",
    role: "Data Science Learner",
    school: "Harvard",
    rating: 5,
    avatar: "FH",
    color: "purple",
  },
];

const AVATAR_COLORS: Record<string, string> = {
  blue:   "bg-blue-600/30 border-blue-500/40 text-blue-300",
  cyan:   "bg-cyan-500/30 border-cyan-500/40 text-cyan-300",
  purple: "bg-purple-600/30 border-purple-500/40 text-purple-300",
};

const CARD_BORDERS: Record<string, string> = {
  blue:   "hover:border-blue-500/30",
  cyan:   "hover:border-cyan-500/30",
  purple: "hover:border-purple-500/30",
};

export default function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="section-label mx-auto">Students Love Dersify</div>
          <h2 className="font-sora text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Loved by learners,<br className="hidden md:block" /> trusted by achievers.
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Join thousands of students who are already learning smarter.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              onClick={() => setActive(i)}
              className={`reveal reveal-delay-${i + 1} group relative p-7 bg-[#0D1A2E] border border-white/[0.07] rounded-2xl cursor-pointer transition-all duration-300 ${CARD_BORDERS[t.color]} ${
                active === i ? "ring-1 ring-blue-500/30 shadow-[0_8px_40px_rgba(0,0,0,0.4)]" : ""
              }`}
            >
              {/* Quote mark */}
              <div className="text-5xl text-slate-800 font-serif leading-none mb-4 select-none">&ldquo;</div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <svg key={si} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>

              <blockquote className="text-sm text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                {t.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${AVATAR_COLORS[t.color]}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${active === i ? "bg-blue-400 w-6" : "bg-slate-700 hover:bg-slate-500"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
