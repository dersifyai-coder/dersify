import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl border border-blue-500/20 bg-[#0D1A2E] overflow-hidden p-12 md:p-16 text-center">
          {/* Background glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-cyan-500/8 rounded-full blur-[70px] pointer-events-none" />

          {/* Dot grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

          <div className="relative">
            {/* Badge */}
            <div className="section-label mx-auto mb-6">Ready to Begin?</div>

            <h2 className="font-sora text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Start learning with an AI<br className="hidden md:block" />
              <span className="text-blue-400"> that understands you.</span>
            </h2>

            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
              Join thousands of learners and experience the future of education. Your journey to mastery starts here.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link href="/auth/sign-up" className="btn-primary text-base px-8 py-3.5">
                Start Learning Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="#features" className="btn-secondary text-base px-8 py-3.5">
                Explore Platform
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                Free forever plan
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                Special launch pricing
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
