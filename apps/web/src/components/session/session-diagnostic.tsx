'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PriorKnowledgeSignal, StartSessionResult } from '@/types';

interface Props {
  onStart: (result: StartSessionResult) => void;
}

const TIME_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min+', value: 60 },
];

const LEVEL_OPTIONS: { label: string; description: string; value: PriorKnowledgeSignal }[] = [
  { label: 'Never studied', description: "It's completely new to me", value: 'none' },
  { label: 'Know the basics', description: 'I have a rough idea', value: 'beginner' },
  { label: 'Intermediate', description: "I've worked with it before", value: 'intermediate' },
  { label: 'Advanced', description: "I know it well, want to go deep", value: 'advanced' },
];

function buildApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const apiBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`;
  return `${apiBase}${p}`;
}

export default function SessionDiagnostic({ onStart }: Props) {
  const [topic, setTopic] = useState('');
  const [timeMinutes, setTimeMinutes] = useState<number | null>(null);
  const [level, setLevel] = useState<PriorKnowledgeSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = topic.trim().length >= 3 && timeMinutes !== null && level !== null;

  const handleStart = async () => {
    if (!canStart) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(buildApiUrl('/session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          prior_knowledge_signal: level,
          time_available_minutes: timeMinutes,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `Request failed: ${res.status}`);
      }

      const body = (await res.json()) as { data: StartSessionResult };
      onStart(body.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>
          Session Setup
        </p>
        <h1 className="mt-1 font-sora text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          What are you learning today?
        </h1>
      </div>

      <div className="space-y-8">
        {/* Q1 — Topic */}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: 'var(--text-subtle)' }}
          >
            What do you want to learn today?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. React hooks, Porter's Five Forces, Calculus derivatives"
            maxLength={200}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-1"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Q2 — Time */}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: 'var(--text-subtle)' }}
          >
            How much time do you have?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeMinutes(opt.value)}
                className="rounded-lg border px-3 py-2 text-sm font-medium transition"
                style={
                  timeMinutes === opt.value
                    ? {
                        background: 'linear-gradient(135deg, var(--primary), var(--teal))',
                        borderColor: 'transparent',
                        color: '#fff',
                      }
                    : {
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-subtle)',
                      }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q3 — Prior knowledge level */}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: 'var(--text-subtle)' }}
          >
            What&apos;s your current level on this topic?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevel(opt.value)}
                className="rounded-lg border p-3 text-left transition"
                style={
                  level === opt.value
                    ? {
                        borderColor: 'var(--primary)',
                        backgroundColor: 'rgba(27, 79, 219, 0.1)',
                      }
                    : {
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg-surface)',
                      }
                }
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      <button
        onClick={() => void handleStart()}
        disabled={!canStart || loading}
        className="mt-8 w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--teal))' }}
      >
        {loading ? 'Starting…' : 'Start learning →'}
      </button>
    </div>
  );
}
