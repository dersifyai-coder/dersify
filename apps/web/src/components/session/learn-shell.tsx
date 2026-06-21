'use client';

import { useState } from 'react';
import type { ActiveSession, SessionMessage, StartSessionResult } from '@/types';
import SessionDiagnostic from './session-diagnostic';
import SessionView from './session-view';

interface Props {
  activeSession: ActiveSession | null;
  initialMessages: SessionMessage[];
}

export default function LearnShell({ activeSession: initial, initialMessages }: Props) {
  const [session, setSession] = useState<ActiveSession | null>(initial);
  const [messages, setMessages] = useState<SessionMessage[]>(initialMessages);

  const handleSessionStart = (result: StartSessionResult) => {
    const newSession: ActiveSession = {
      id: result.sessionId,
      learnerId: '',
      topic: '',
      priorKnowledgeSignal: '',
      timeAvailableMinutes: 30,
      currentPhase: result.phase,
      currentMode: 'exploration',
      exchangesCount: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
      lastActivityAt: new Date().toISOString(),
    };

    const openingMsg: SessionMessage = {
      id: 'opening',
      sessionId: result.sessionId,
      role: 'assistant',
      content: result.openingMessage,
      turnIndex: 0,
      compressed: false,
      compressionSummary: null,
      createdAt: new Date().toISOString(),
    };

    setSession(newSession);
    setMessages([openingMsg]);
  };

  if (!session) {
    return <SessionDiagnostic onStart={handleSessionStart} />;
  }

  return <SessionView session={session} initialMessages={messages} />;
}
