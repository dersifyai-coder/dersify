const INSTITUTIONS = [
  "MIT",
  "Stanford",
  "Harvard",
  "Google for Education",
  "African Union",
  "ALU",
  "Strathmore",
  "Morehouse",
  "UCLA",
  "Yale",
  "AWS Academy",
  "Udacity",
];

export default function TrustedBy() {
  const doubled = [...INSTITUTIONS, ...INSTITUTIONS];

  return (
    <section className="py-14 border-y border-white/[0.05] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.18em]">
          Trusted by learners &amp; institutions worldwide
        </p>
      </div>

      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {doubled.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center shrink-0 px-2"
            >
              <span className="text-slate-500 font-semibold text-sm tracking-wide hover:text-slate-300 transition-colors cursor-default select-none font-sora">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
