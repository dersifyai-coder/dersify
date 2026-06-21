export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { BookOpen, Brain, ArrowRight } from 'lucide-react';

const QUICK_CARDS = [
  {
    title: 'Start a session',
    description:
      'Ask Dersify to guide you through any topic. The AI adapts to your level in real time.',
    href: '/dashboard/learn',
    cta: 'Start learning',
    Icon: BookOpen,
  },
  {
    title: 'Review misconceptions',
    description:
      'See what gaps the AI has identified in your understanding and work through them.',
    href: '/dashboard/progress',
    cta: 'View progress',
    Icon: Brain,
  },
];

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10">
          <p
            className="text-[12px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            {today}
          </p>
          <h1
            className="mt-2 text-3xl font-semibold"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Ready to learn something today?
          </h1>
          <p
            className="mt-1.5 text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Pick a topic, and Dersify will build a session around what you need most.
          </p>
        </div>

        {/* Hero CTA card */}
        <Link
          href="/dashboard/learn"
          className="group mb-8 flex items-center justify-between rounded-xl px-6 py-5 transition-transform hover:-translate-y-0.5"
          style={{
            background:
              'linear-gradient(180deg, var(--accent-soft), transparent), var(--bg-surface)',
            border: '1px solid var(--accent-soft-border)',
            boxShadow: 'var(--glow-accent)',
          }}
        >
          <div>
            <p
              className="font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Start today&apos;s session
            </p>
            <p
              className="mt-0.5 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tell Dersify what you want to understand — it handles the rest.
            </p>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 transition-transform group-hover:translate-x-1"
            style={{ color: 'var(--accent)' }}
          />
        </Link>

        {/* Grid cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_CARDS.map(({ title, description, href, cta, Icon }) => (
            <div
              key={href}
              className="rounded-xl p-5"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                className="mb-3 inline-flex items-center justify-center rounded-lg p-2"
                style={{ background: 'var(--accent-soft)' }}
              >
                <Icon size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h2
                className="mb-1 font-semibold text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {description}
              </p>
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                {cta}
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
