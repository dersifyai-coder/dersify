import { apiFetch } from '@/lib/api';
import type { ActiveSession, SessionMessage } from '@/types';
import LearnShell from '@/components/session/learn-shell';

export const dynamic = 'force-dynamic';

async function fetchActiveSession(): Promise<ActiveSession | null> {
  try {
    return await apiFetch<ActiveSession | null>('/session/active');
  } catch {
    return null;
  }
}

async function fetchSessionMessages(sessionId: string): Promise<SessionMessage[]> {
  try {
    return await apiFetch<SessionMessage[]>(`/session/${sessionId}/messages`);
  } catch {
    return [];
  }
}

export default async function LearnPage() {
  const activeSession = await fetchActiveSession();
  const initialMessages = activeSession
    ? await fetchSessionMessages(activeSession.id)
    : [];

  return (
    <LearnShell activeSession={activeSession} initialMessages={initialMessages} />
  );
}
