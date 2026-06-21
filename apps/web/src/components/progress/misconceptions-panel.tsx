'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MisconceptionItem {
  id: string;
  conceptId: string;
  topic: string;
  description: string;
  misconceptionType: string;
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

async function fetchJson<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const TYPE_LABEL: Record<string, string> = {
  terminology: 'Terminology',
  overgeneralization: 'Overgeneralization',
  underapplication: 'Underapplication',
  causal_inversion: 'Causal Inversion',
  false_analogy: 'False Analogy',
  structural: 'Structural',
};

const TYPE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  terminology: { bg: 'var(--accent-soft)', text: 'var(--accent)', border: 'var(--accent-soft-border)' },
  overgeneralization: { bg: 'var(--warning-soft)', text: 'var(--warning)', border: 'rgba(199,125,20,0.25)' },
  underapplication: { bg: 'var(--warning-soft)', text: 'var(--warning)', border: 'rgba(199,125,20,0.25)' },
  causal_inversion: { bg: 'var(--error-soft)', text: 'var(--error)', border: 'rgba(209,67,67,0.20)' },
  false_analogy: { bg: 'rgba(168,85,247,0.08)', text: 'rgb(168,85,247)', border: 'rgba(168,85,247,0.20)' },
  structural: { bg: 'var(--error-soft)', text: 'var(--error)', border: 'rgba(209,67,67,0.20)' },
};

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_COLOR[type];
  if (!colors) return null;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

interface TopicSectionProps {
  topic: string;
  token: string;
}

function TopicSection({ topic, token }: TopicSectionProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MisconceptionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (items !== null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<MisconceptionItem[]>(
        `/learner/misconceptions/${encodeURIComponent(topic)}`,
        token,
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [items, topic, token]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void load();
  };

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await fetchJson<void>(`/learner/misconceptions/${id}/resolve`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setItems((prev) => (prev ?? []).filter((m) => m.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div
      className="rounded-xl"
      style={{
        border: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
      }}
    >
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {topic}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t px-5 pb-4 pt-3" style={{ borderColor: 'var(--border-default)' }}>
          {loading && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading…
            </p>
          )}
          {error && (
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {error}
            </p>
          )}
          {!loading && !error && items !== null && items.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No active misconceptions for this topic.
            </p>
          )}
          {!loading && items !== null && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {m.concept.displayName}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {m.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <TypeBadge type={m.misconceptionType} />
                        {m.frequency > 1 && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
                          >
                            ×{m.frequency}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => void handleResolve(m.id)}
                      disabled={resolvingId === m.id}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}
                    >
                      {resolvingId === m.id ? '…' : 'Resolve'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function MisconceptionsPanel({ topicNames }: { topicNames: string[] }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  if (topicNames.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Study a topic first to see misconceptions.
      </p>
    );
  }

  if (!token) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading…
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {topicNames.map((topic) => (
        <TopicSection key={topic} topic={topic} token={token} />
      ))}
    </div>
  );
}
