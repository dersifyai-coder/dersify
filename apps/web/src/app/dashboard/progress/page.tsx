export const dynamic = 'force-dynamic';

import { apiFetch } from '@/lib/api';
import type { ConceptDueItem, ProgressDashboard } from '@/types';
import ForgettingCurveMap from '@/components/progress/forgetting-curve-map';
import MisconceptionsPanel from '@/components/progress/misconceptions-panel';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

const DUE_STATUS_COLORS: Record<ConceptDueItem['dueStatus'], { bg: string; text: string }> = {
  due: { bg: 'var(--info-soft)', text: 'var(--info)' },
  slipping: { bg: 'var(--warning-soft)', text: 'var(--warning)' },
  new: { bg: 'var(--bg-subtle)', text: 'var(--text-muted)' },
};

export default async function ProgressPage() {
  let dashboard: ProgressDashboard | null = null;

  try {
    dashboard = await apiFetch<ProgressDashboard>('/learner/progress');
  } catch {
    // Degraded state: show skeleton with zeros
  }

  const topics = dashboard?.topics ?? [];
  const dueToday = dashboard?.dueToday ?? [];

  const dueByTopic = dueToday.reduce<Record<string, ConceptDueItem[]>>((acc, item) => {
    const group = acc[item.topic] ?? [];
    group.push(item);
    acc[item.topic] = group;
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <p
            className="text-[12px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            Progress
          </p>
          <h1
            className="mt-2 text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
          >
            Your knowledge state
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Real information about what you know, what&apos;s slipping, and what needs review.
          </p>
        </div>

        {/* Section 1 — Overview stats */}
        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Concepts learned" value={dashboard?.totalConceptsLearned ?? 0} />
          <StatCard label="Topics studied" value={topics.length} />
          <StatCard label="Due for review" value={dueToday.length} />
          <StatCard label="Sessions" value={dashboard?.totalSessions ?? 0} />
        </section>

        {/* Section 2 — Forgetting Curve Map */}
        <section className="mb-8">
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Forgetting curve map
          </h2>
          {topics.length === 0 ? (
            <div
              className="rounded-xl border border-dashed py-10 text-center"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No topics studied yet. Start a session to build your knowledge map.
              </p>
            </div>
          ) : (
            <ForgettingCurveMap topics={topics} />
          )}
        </section>

        {/* Section 3 — Due Today */}
        <section className="mb-8">
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Due today
          </h2>

          {dueToday.length === 0 ? (
            <div
              className="rounded-xl border border-dashed py-10 text-center"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <div
                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-soft)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Nothing due today. Keep learning!
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                All caught up. Great work.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(dueByTopic).map(([topic, concepts]) => (
                <div
                  key={topic}
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <p
                    className="mb-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {topic}
                  </p>
                  <ul className="space-y-2">
                    {concepts.map((c) => {
                      const colors = DUE_STATUS_COLORS[c.dueStatus];
                      return (
                        <li key={c.canonicalId} className="flex items-center justify-between gap-3">
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {c.displayName}
                          </span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{ background: colors.bg, color: colors.text }}
                            >
                              {c.dueStatus}
                            </span>
                            <span
                              className="text-xs"
                              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                            >
                              {Math.round(c.confidence * 100)}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4 — Active Misconceptions */}
        <section>
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Active misconceptions
          </h2>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Unresolved gaps the AI will address in future sessions.
          </p>
          <MisconceptionsPanel topicNames={topics.map((t) => t.topic)} />
        </section>

      </div>
    </div>
  );
}
