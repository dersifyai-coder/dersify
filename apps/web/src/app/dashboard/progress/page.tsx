'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

interface MisconceptionItem {
  id: string;
  conceptId: string;
  topic: string;
  description: string;
  misconceptionType: string;
  severity: string;
  remediationStrategy: string | null;
  frequency: number;
  resolved: boolean;
  concept: { displayName: string };
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

const TYPE_STYLE: Record<string, string> = {
  terminology: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  overgeneralization: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  underapplication: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  causal_inversion: 'bg-red-500/10 text-red-400 border-red-500/20',
  false_analogy: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  structural: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SEVERITY_STYLE: Record<string, string> = {
  surface: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  deep: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const TYPE_LABEL: Record<string, string> = {
  terminology: 'Terminology',
  overgeneralization: 'Overgeneralization',
  underapplication: 'Underapplication',
  causal_inversion: 'Causal Inversion',
  false_analogy: 'False Analogy',
  structural: 'Structural',
};

export default function ProgressPage() {
  const [token, setToken] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [misconceptions, setMisconceptions] = useState<MisconceptionItem[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

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
          <p className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>
            Progress
          </p>
          <h1 className="mt-1 font-sora text-2xl font-bold">Learning Progress</h1>
        </div>

        {/* Misconception Panel */}
        <section
          className="rounded-xl border p-6"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="mb-5">
            <h2 className="font-sora text-lg font-semibold">Active Misconceptions</h2>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              Unresolved knowledge gaps the AI will address in future sessions.
            </p>
          </div>

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void fetchMisconceptions(); }}
              placeholder="Enter topic (e.g. python)"
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-surface-2)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={() => void fetchMisconceptions()}
              disabled={!topic.trim() || loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--teal))' }}
            >
              {loading ? 'Loading…' : 'View'}
            </button>
          </div>

          {loadingError && (
            <p className="mb-4 text-sm text-red-400">{loadingError}</p>
          )}

          {token === null ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading…
            </p>
          ) : misconceptions.length === 0 && !loading ? (
            <div
              className="rounded-lg border border-dashed py-10 text-center"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="mb-2 text-2xl">✓</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-subtle)' }}>
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
              {misconceptions.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border p-4"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-2)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{m.concept.displayName}</p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-subtle)' }}>
                        {m.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs capitalize ${TYPE_STYLE[m.misconceptionType] ?? ''}`}
                        >
                          {TYPE_LABEL[m.misconceptionType] ?? m.misconceptionType}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs capitalize ${SEVERITY_STYLE[m.severity] ?? ''}`}
                        >
                          {m.severity}
                        </span>
                        {m.frequency > 1 && (
                          <span
                            className="rounded-full border px-2 py-0.5 text-xs"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                          >
                            ×{m.frequency}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => void handleResolve(m.id)}
                      disabled={resolvingId === m.id}
                      className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{
                        borderColor: 'var(--teal)',
                        color: 'var(--teal)',
                      }}
                    >
                      {resolvingId === m.id ? '…' : 'Mark resolved'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
