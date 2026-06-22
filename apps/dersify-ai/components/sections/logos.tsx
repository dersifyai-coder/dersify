import {
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  GraduationCap,
  LucideIcon,
  Map,
  MessageCircle,
  Route,
  Youtube,
} from 'lucide-react';

type StudySignal = {
  label: string;
  detail: string;
  Icon: LucideIcon;
};

const STUDY_INPUTS: StudySignal[] = [
  { label: 'YouTube tutorials', detail: 'watched once', Icon: Youtube },
  { label: 'Course modules', detail: 'half clear', Icon: BookOpen },
  { label: 'Documentation', detail: 'looked up', Icon: FileText },
  { label: 'Lecture notes', detail: 'reviewed late', Icon: FileText },
  { label: 'Personal projects', detail: 'got stuck', Icon: Code2 },
  { label: 'ChatGPT answers', detail: 'reset later', Icon: MessageCircle },
  { label: 'Exam prep', detail: 'forgot after', Icon: GraduationCap },
  { label: 'Career skills', detail: 'needs practice', Icon: Briefcase },
];

const DERSIFY_MEMORY: StudySignal[] = [
  { label: 'Last struggle', detail: 'remembered', Icon: Brain },
  { label: 'Misconception', detail: 'tracked', Icon: CheckCircle2 },
  { label: 'Knowledge map', detail: 'updated', Icon: Map },
  { label: 'Review timing', detail: 'scheduled', Icon: Clock3 },
  { label: 'Next concept', detail: 'chosen', Icon: Route },
  { label: 'Your pace', detail: 'adapted', Icon: Brain },
];

function SignalPill({ signal, active = false }: { signal: StudySignal; active?: boolean }) {
  const Icon = signal.Icon;

  return (
    <span
      className="mr-3 inline-flex h-14 min-w-[220px] items-center gap-3 rounded-full border px-4 shadow-sm"
      style={{
        background: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
        borderColor: active ? 'rgba(15, 122, 69, 0.22)' : 'var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{
          background: active ? 'rgba(15, 122, 69, 0.12)' : 'var(--bg-subtle)',
          color: 'var(--accent)',
        }}
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-[15px] font-semibold leading-5">{signal.label}</span>
        <span
          className="block truncate text-[12.5px] font-medium leading-4"
          style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {signal.detail}
        </span>
      </span>
    </span>
  );
}

export function Logos() {
  return (
    <section
      className="relative overflow-hidden border-y py-10"
      style={{
        background: 'var(--bg-subtle)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
        style={{ background: 'linear-gradient(90deg, var(--bg-subtle), transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
        style={{ background: 'linear-gradient(270deg, var(--bg-subtle), transparent)' }}
      />
      <p
        className="text-center text-[12.5px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: 'var(--text-muted)' }}
      >
        Scattered self-study becomes one learner model
      </p>
      <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold shadow-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <span>Study inputs</span>
        <ArrowRight size={14} strokeWidth={2.2} style={{ color: 'var(--accent)' }} />
        <span style={{ color: 'var(--accent)' }}>Dersify memory</span>
      </div>
      <div className="mt-5 space-y-3">
        <div className="pointer-events-none overflow-hidden">
          <div className="animate-marquee pointer-events-auto flex w-max">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                {STUDY_INPUTS.map((signal) => (
                  <SignalPill key={`${copy}-${signal.label}`} signal={signal} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none overflow-hidden">
          <div className="animate-marquee-reverse pointer-events-auto flex w-max">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                {DERSIFY_MEMORY.map((signal) => (
                  <SignalPill key={`${copy}-${signal.label}`} signal={signal} active />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p
        className="mx-auto mt-5 max-w-2xl text-center text-[15px] font-medium leading-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        Bring the material from anywhere. Dersify keeps the useful signal: what you tried, where you struggled, and what to study next.
      </p>
    </section>
  );
}
