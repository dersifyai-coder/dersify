'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { DisplayMessage } from '@/types';

interface Props {
  messages:       DisplayMessage[];
  isStreaming:    boolean;
  streamingContent: string;
  currentPhase:   string;
  previousPhase?: string;
}

export default function ConversationThread({
  messages,
  isStreaming,
  streamingContent,
  currentPhase,
  previousPhase,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, streamingContent]);

  const phaseJustChanged =
    previousPhase && previousPhase !== currentPhase && currentPhase === 'consolidation';

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {messages.map((msg, i) => (
        <div key={i}>
          {/* Phase transition separator */}
          {phaseJustChanged && i === messages.length - 1 && msg.role === 'assistant' && (
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-default)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Moving to practice section
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-default)' }} />
            </div>
          )}

          <div
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={
                msg.role === 'assistant'
                  ? { background: 'var(--accent)', color: 'var(--accent-contrast)' }
                  : { background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
              }
            >
              {msg.role === 'assistant' ? 'D' : 'Y'}
            </div>

            {/* Bubble */}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === 'assistant'
                  ? {
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      borderBottomLeftRadius: '4px',
                    }
                  : {
                      background: 'var(--accent)',
                      color: 'var(--accent-contrast)',
                      borderBottomRightRadius: '4px',
                    }
              }
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-start gap-3">
          <div
            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            D
          </div>
          <div
            className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              borderBottomLeftRadius: '4px',
            }}
          >
            {streamingContent ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
              </div>
            ) : null}
            <span
              className="inline-block h-4 w-0.5 animate-pulse"
              style={{ backgroundColor: 'var(--accent)', verticalAlign: 'middle' }}
            />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
