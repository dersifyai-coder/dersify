'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { joinWaitlist, type WaitlistActionResult } from '@/app/actions/waitlist';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

interface WaitlistFormProps {
  source?: string;
  size?: 'default' | 'large';
}

const initialState: WaitlistActionResult | null = null;

export function WaitlistForm({ source = 'landing', size = 'default' }: WaitlistFormProps) {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);
  const [referrer, setReferrer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReferrer(document.referrer ?? '');
  }, []);

  useEffect(() => {
    if (state && !state.success && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  if (state?.success) {
    return (
      <div
        className="flex items-center gap-3 rounded-md px-5 py-4"
        role="status"
        aria-live="polite"
        style={{
          background: 'var(--success-soft)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
        }}
      >
        <CheckCircle size={20} className="shrink-0" />
        <p className="text-[15px] font-medium">{state.message}</p>
      </div>
    );
  }

  const isLarge = size === 'large';

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="referrer" value={referrer} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          type="email"
          name="email"
          placeholder="Enter your email address"
          required
          autoComplete="email"
          disabled={isPending}
          aria-label="Email address"
          aria-describedby={state && !state.success ? 'waitlist-error' : undefined}
          className={`flex-1 rounded-md outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${isLarge ? 'h-[52px] px-5 text-base' : 'h-[46px] px-4 text-[15px]'}`}
          style={{
            background: 'var(--bg-raised)',
            border: state && !state.success
              ? '1px solid var(--error)'
              : '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.boxShadow = 'var(--focus-ring)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor =
              state && !state.success ? 'var(--error)' : 'var(--border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        <button
          type="submit"
          disabled={isPending}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90 ${isLarge ? 'h-[52px] px-7 text-base' : 'h-[46px] px-6 text-[15px]'}`}
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-contrast)',
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Join the waitlist</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {state && !state.success && (
        <p
          id="waitlist-error"
          className="mt-2 text-[13px]"
          role="alert"
          aria-live="polite"
          style={{ color: 'var(--error)' }}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
