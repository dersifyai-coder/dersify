'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TopicProgress } from '@/types';

function daysSinceLabel(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export default function ForgettingCurveMap({ topics }: { topics: TopicProgress[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {topics.map((topic) => {
        const total = topic.conceptCount || 1;
        const safePct = (topic.safeCount / total) * 100;
        const slippingPct = (topic.slippingCount / total) * 100;
        const duePct = (topic.dueCount / total) * 100;
        const newPct = (topic.newCount / total) * 100;
        const isHovered = hoveredId === topic.topic;

        return (
          <div
            key={topic.topic}
            className="relative rounded-xl p-5"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {topic.topic}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Last studied {daysSinceLabel(topic.lastStudiedAt)}
                </p>
              </div>
              <Link
                href={`/dashboard/learn?topic=${encodeURIComponent(topic.topic)}`}
                className="shrink-0 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                Study now →
              </Link>
            </div>

            <div
              className="relative h-2 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--bg-subtle)' }}
              onMouseEnter={() => setHoveredId(topic.topic)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex h-full w-full">
                {safePct > 0 && (
                  <div style={{ width: `${safePct}%`, backgroundColor: 'var(--success)' }} />
                )}
                {slippingPct > 0 && (
                  <div style={{ width: `${slippingPct}%`, backgroundColor: 'var(--warning)' }} />
                )}
                {duePct > 0 && (
                  <div style={{ width: `${duePct}%`, backgroundColor: 'var(--info)' }} />
                )}
                {newPct > 0 && (
                  <div style={{ width: `${newPct}%`, backgroundColor: 'var(--n-300)' }} />
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {topic.safeCount > 0 && (
                <span style={{ color: 'var(--success)' }}>{topic.safeCount} safe</span>
              )}
              {topic.slippingCount > 0 && (
                <span style={{ color: 'var(--warning)' }}>{topic.slippingCount} slipping</span>
              )}
              {topic.dueCount > 0 && (
                <span style={{ color: 'var(--info)' }}>{topic.dueCount} due</span>
              )}
              {topic.newCount > 0 && (
                <span style={{ color: 'var(--n-300)' }}>{topic.newCount} new</span>
              )}
              {topic.conceptCount === 0 && (
                <span style={{ color: 'var(--text-muted)' }}>No concepts yet</span>
              )}
            </div>

            {isHovered && (
              <div
                className="absolute left-5 top-[4.5rem] z-10 rounded-lg px-3 py-1.5 text-xs"
                style={{
                  background: 'var(--n-900)',
                  color: 'var(--n-0)',
                  boxShadow: 'var(--shadow-md)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {topic.safeCount} safe · {topic.slippingCount} slipping · {topic.dueCount} due · {topic.newCount} new
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
