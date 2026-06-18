const LOGOS = [
  'MIT', 'Stanford', 'Harvard', 'Google for Education',
  'ALU', 'Andela', 'Morehouse', 'Strathmore',
  'African Union', 'freeCodeCamp', 'Udacity',
];

export function Logos() {
  return (
    <section
      className="border-y py-8"
      style={{
        background: 'var(--bg-subtle)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <p
        className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: 'var(--text-muted)' }}
      >
        Trusted by learners at
      </p>
      <div className="pointer-events-none mt-6 overflow-hidden">
        <div className="animate-marquee pointer-events-auto flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {LOGOS.map((logo) => (
                <span
                  key={`${copy}-${logo}`}
                  className="mr-16 whitespace-nowrap text-[15px] font-semibold"
                  style={{ color: 'var(--text-muted)' }}
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
