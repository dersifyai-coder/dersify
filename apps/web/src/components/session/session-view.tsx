'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ActiveSession, DisplayMessage, SendMessageResult, SessionMessage } from '@/types';
import ConversationThread from './conversation-thread';
import MessageInput from './message-input';

interface Props {
  session:          ActiveSession;
  initialMessages?: SessionMessage[];
}

function buildApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const apiBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`;
  return `${apiBase}${p}`;
}

async function apiFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
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

function toDisplayMessage(m: SessionMessage): DisplayMessage {
  return {
    role: m.role,
    content: m.compressed && m.compressionSummary ? m.compressionSummary : m.content,
    turnIndex: m.turnIndex,
  };
}

export default function SessionView({ session: initialSession, initialMessages = [] }: Props) {
  const [token, setToken]               = useState<string | null>(null);
  const [messages, setMessages]         = useState<DisplayMessage[]>(
    initialMessages.map(toDisplayMessage),
  );
  const [isStreaming, setIsStreaming]   = useState(false);
  const [currentPhase, setCurrentPhase] = useState(initialSession.currentPhase);
  const [previousPhase, setPreviousPhase] = useState<string | undefined>(undefined);
  const [ended, setEnded]               = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!token || ended) return;
      setIsStreaming(true);
      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content, turnIndex: prev.length }]);
      try {
        const result = await apiFetch<SendMessageResult>(
          `/session/${initialSession.id}/message`,
          token,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          },
        );
        setPreviousPhase(currentPhase);
        setCurrentPhase(result.phase);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message, turnIndex: prev.length },
        ]);
      } catch (err) {
        setError((err as Error).message);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
      }
    },
    [token, ended, currentPhase, initialSession.id],
  );

  const handleEndSession = useCallback(async () => {
    if (!token) return;
    try {
      await apiFetch<void>(`/session/${initialSession.id}/end`, token, { method: 'POST' });
      setEnded(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [token, initialSession.id]);

  if (ended) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-xl p-10 text-center"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'var(--accent-soft)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            Session complete
          </p>
          <h2
            className="mt-2 text-2xl font-semibold"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Great work!
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your knowledge model has been updated. Come back to review what you learned.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:h-screen">
      {/* Session header */}
      <div
        className="flex items-center justify-between border-b px-5 py-3"
        style={{
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {initialSession.topic}
          </p>
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
            {currentPhase} phase
          </p>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {initialSession.timeAvailableMinutes} min session
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
        <ConversationThread
          messages={messages}
          isStreaming={isStreaming}
          streamingContent=""
          currentPhase={currentPhase}
          previousPhase={previousPhase}
        />
      </div>

      {error && (
        <p
          className="px-4 pb-1 text-xs"
          style={{ color: 'var(--error)' }}
        >
          {error}
        </p>
      )}

      {/* Input */}
      <MessageInput
        sessionId={initialSession.id}
        onMessage={(content) => void handleSendMessage(content)}
        disabled={isStreaming || !token}
        onEndSession={() => void handleEndSession()}
      />
    </div>
  );
}
