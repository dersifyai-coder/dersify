'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

interface MisconceptionItem {
  id:                  string;
  conceptId:           string;
  topic:               string;
  description:         string;
  misconceptionType:   string;
  severity:            string;
  remediationStrategy: string | null;
  frequency:           number;
  resolved:            boolean;
  concept:             { displayName: string };
}

function buildApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const apiBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`;
  return `${apiBase}${p}`;
}

async function apiBrowserFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  terminology:       { bg: 'var(--accent-soft)',          text: 'var(--accent)',         border: 'var(--accent-soft-border)'  },
  overgeneralization:{ bg: 'rgba(234,179,8,0.08)',        text: 'var(--warning)',        border: 'rgba(234,179,8,0.25)'       },
  underapplication:  { bg: 'rgba(234,179,8,0.08)',        text: 'var(--warning)',        border: 'rgba(234,179,8,0.25)'       },
  causal_inversion:  { bg: 'rgba(239,68,68,0.08)',        text: 'var(--error)',          border: 'rgba(239,68,68,0.2)'        },
  false_analogy:     { bg: 'rgba(168,85,247,0.08)',       text: 'rgb(168,85,247)',       border: 'rgba(168,85,247,0.2)'       },
  structural:        { bg: 'rgba(239,68,68,0.08)',        text: 'var(--error)',          border: 'rgba(239,68,68,0.2)'        },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  surface: { bg: 'var(--bg-subtle)',           text: 'var(--text-muted)',    border: 'var(--border-default)' },
  deep:    { bg: 'rgba(249,115,22,0.08)',      text: 'rgb(249,115,22)',      border: 'rgba(249,115,22,0.2)'  },
};

const TYPE_LABEL: Record<string, string> = {
  terminology:        'Terminology',
  overgeneralization: 'Overgeneralization',
  underapplication:   'Underapplication',
  causal_inversion:   'Causal Inversion',
  false_analogy:      'False Analogy',
  structural:         'Structural',
};

function Badge({ colors, label }: { colors: { bg: string; text: string; border: string }; label: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs capitalize"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {label}
    </span>
  );
}

export default function ProgressPage() {
  const [token, setToken]                   = useState<string | null>(null);
  const [topic, setTopic]                   = useState('');
  const [misconceptions, setMisconceptions] = useState<MisconceptionItem[]>([]);
  const [loadingError, setLoadingError]     = useState<string | null>(null);
  const [loading, setLoading]               = useState(false);
  const [resolvingId, setResolvingId]       = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  const fetchMisconceptions = useCallback(async () => {
    if (!token || !topic.trim()) return;
    setLoading(true);
    setLoadingError(null);
    try {
      const data = await apiBrowserFetch<MisconceptionItem[]>(
        `/learner/misconceptions/${encodeURIComponent(topic.trim())}`,
        token,
      );
      setMisconceptions(data);
    } catch (err) {
      setLoadingError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, topic]);

  const handleResolve = async (id: string) => {
    if (!token) return;
    setResolvingId(id);
    try {
      await apiBrowserFetch<void>(`/learner/misconceptions/${id}/resolve`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setMisconceptions((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setLoadingError((err as Error).message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p
            className="text-[12px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            Progress
          </p>
          <h1
            className="mt-2 text-2xl font-semibold"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Learning progress
          </h1>
        </div>

        {/* Misconception panel */}
        <section
          className="rounded-xl p-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="mb-5">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Active misconceptions
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Unresolved knowledge gaps the AI will address in future sessions.
            </p>
          </div>

          {/* Search */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void fetchMisconceptions(); }}
              placeholder="Enter topic (e.g. python)"
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all"
              style={{
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.boxShadow = 'var(--focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={() => void fetchMisconceptions()}
              disabled={!topic.trim() || loading}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
            >
              {loading ? 'Loading...' : 'View'}
            </button>
          </div>

          {loadingError && (
            <p className="mb-4 text-sm" style={{ color: 'var(--error)' }}>
              {loadingError}
            </p>
          )}

          {token === null ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading...
            </p>
          ) : misconceptions.length === 0 && !loading ? (
            <div
              className="rounded-lg border border-dashed py-10 text-center"
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
                No active misconceptions
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                {topic.trim()
                  ? `Great work on "${topic}"!`
                  : 'Enter a topic above to check for misconceptions.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {misconceptions.map((m) => {
                const typeColor = TYPE_COLORS[m.misconceptionType];
                const sevColor  = SEVERITY_COLORS[m.severity];
                return (
                  <li
                    key={m.id}
                    className="rounded-lg p-4"
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-medium text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {m.concept.displayName}
                        </p>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {m.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {typeColor && (
                            <Badge
                              colors={typeColor}
                              label={TYPE_LABEL[m.misconceptionType] ?? m.misconceptionType}
                            />
                          )}
                          {sevColor && (
                            <Badge colors={sevColor} label={m.severity} />
                          )}
                          {m.frequency > 1 && (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs"
                              style={{
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              x{m.frequency}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => void handleResolve(m.id)}
                        disabled={resolvingId === m.id}
                        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                        style={{
                          border: '1px solid var(--accent)',
                          color: 'var(--accent)',
                          background: 'transparent',
                        }}
                      >
                        {resolvingId === m.id ? '...' : 'Mark resolved'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
