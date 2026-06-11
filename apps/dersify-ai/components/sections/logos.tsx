const LOGOS = [
  'MIT',
  'Stanford',
  'Harvard',
  'Google for Education',
  'ALU',
  'Andela',
  'Morehouse',
  'Strathmore',
  'African Union',
  'freeCodeCamp',
  'Udacity',
];

export function Logos() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] py-8">
      <p className="text-center text-[13px] uppercase tracking-[0.08em] text-[#4B5563]">
        Trusted by learners at
      </p>
      <div className="pointer-events-none mt-6 overflow-hidden">
        <div className="animate-marquee pointer-events-auto flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {LOGOS.map((logo) => (
                <span
                  key={`${copy}-${logo}`}
                  className="mr-16 whitespace-nowrap text-[15px] font-semibold text-[#374151] transition-colors duration-200 hover:text-[#9CA3AF]"
                >
                  {logo}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
