'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';

interface Props {
  sessionId:    string;
  onMessage:    (content: string) => void;
  disabled:     boolean;
  onEndSession: () => void;
}

const MAX_CHARS = 10_000;
const COUNTER_THRESHOLD = Math.floor(MAX_CHARS * 0.8);

export default function MessageInput({ sessionId: _sessionId, onMessage, disabled, onEndSession }: Props) {
  const [content, setContent]           = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [content]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onMessage(trimmed);
    setContent('');
  };

  const showCounter = content.length >= COUNTER_THRESHOLD;

  return (
    <>
      <div
        className="border-t px-4 py-3"
        style={{
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div
          className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-shadow focus-within:shadow-sm"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Thinking...' : 'Ask a question or respond...'}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none disabled:opacity-50"
            style={{
              color: 'var(--text-primary)',
              maxHeight: '120px',
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={submit}
            disabled={!content.trim() || disabled}
            className="mb-0.5 rounded-lg p-2 transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" />
            </svg>
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <button
            onClick={() => setShowEndModal(true)}
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            End session
          </button>
          {showCounter && (
            <span
              className="text-xs"
              style={{
                color: content.length >= MAX_CHARS ? 'var(--error)' : 'var(--text-muted)',
              }}
            >
              {content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>

      {/* End session modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-sm rounded-xl p-6"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3
              className="text-base font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
              }}
            >
              End this session?
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Your progress will be saved and your knowledge model updated.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="rounded-lg px-4 py-2 text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Keep going
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  onEndSession();
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                }}
              >
                End session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
