'use client';

import { useEffect, useState } from 'react';
import type { EndSessionResult } from '@/types';

interface Props {
  topic: string;
  result: EndSessionResult;
}

function RetentionRing({ value }: { value: number }) {
  const size = 88;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const fullOffset = circumference;
  const targetOffset = circumference - (value / 100) * circumference;

  const [currentOffset, setCurrentOffset] = useState(fullOffset);

  useEffect(() => {
    const id = requestAnimationFrame(() => setCurrentOffset(targetOffset));
    return () => cancelAnimationFrame(id);
  }, [targetOffset]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={currentOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`${value}% estimated retention`}
        >
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            {value}%
          </span>
        </div>
      </div>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        retention
      </p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: 'var(--accent)' }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function SessionEndScreen({ topic: _topic, result }: Props) {
  const { summary, consolidationQuestion } = result;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-8"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--accent)' }}
            >
              Session complete
            </p>
            <h1
              className="mt-1 text-xl font-semibold leading-snug"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              {summary.title}
            </h1>
          </div>
          <RetentionRing value={summary.estimatedRetention} />
        </div>

        {/* What we covered */}
        <section className="mb-5">
          <SectionHeading>What we covered</SectionHeading>
          <BulletList items={summary.whatWeCovered} />
        </section>

        {/* What you showed */}
        <section
          className="mb-5 rounded-xl p-4"
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-soft-border)',
          }}
        >
          <SectionHeading>What you showed</SectionHeading>
          <BulletList items={summary.whatYouHave} />
        </section>

        {/* Next focus */}
        <section className="mb-6">
          <SectionHeading>Next focus</SectionHeading>
          <BulletList items={summary.nextFocus} />
        </section>

        {/* Consolidation question */}
        {consolidationQuestion && (
          <div
            className="mb-6 rounded-xl p-4"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
            }}
          >
            <p
              className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Before you go
            </p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {consolidationQuestion}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <a
            href="/dashboard"
            className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            Back to dashboard
          </a>
          <a
            href="/dashboard/progress"
            className="block w-full rounded-xl py-3 text-center text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
          >
            View your progress
          </a>
        </div>
      </div>
    </div>
  );
}
