const SELF_STUDY_SIGNALS = [
  'YouTube tutorials',
  'Coursera courses',
  'Udemy courses',
  'Documentation',
  'Lecture notes',
  'Your PDFs',
  'YouTube lectures',
  'Personal projects',
  'Programming',
  'Exam prep',
  'Career skills',
  'Any topic',
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
        Built around the way self-learners actually study
      </p>
      <div className="pointer-events-none mt-6 overflow-hidden">
        <div className="animate-marquee pointer-events-auto flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {SELF_STUDY_SIGNALS.map((signal) => (
                <span
                  key={`${copy}-${signal}`}
                  className="mr-16 whitespace-nowrap text-[15px] font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {signal}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
