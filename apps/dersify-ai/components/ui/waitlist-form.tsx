'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { joinWaitlist, type WaitlistActionResult } from '@/app/actions/waitlist';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

interface WaitlistFormProps {
  source?: string; // which section this form is in
  size?: 'default' | 'large'; // hero vs section
}

const initialState: WaitlistActionResult | null = null;

export function WaitlistForm({ source = 'landing', size = 'default' }: WaitlistFormProps) {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);
  const [referrer, setReferrer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Capture referrer client-side (cannot do in server action)
  useEffect(() => {
    setReferrer(document.referrer ?? '');
  }, []);

  // Focus input on error to help the user fix it
  useEffect(() => {
    if (state && !state.success && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  // Success state — replace form entirely
  if (state?.success) {
    return (
      <div
        className="flex items-center gap-3 rounded-[10px] border border-teal/30 bg-teal/10 px-5 py-4 text-teal"
        role="status"
        aria-live="polite"
      >
        <CheckCircle size={20} className="shrink-0" />
        <p className="font-sora text-[15px] font-medium">{state.message}</p>
      </div>
    );
  }

  const isLarge = size === 'large';

  return (
    <form action={formAction} noValidate>
      {/* Hidden fields */}
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="referrer" value={referrer} />

      {/* Input + button row */}
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
          className={`
            flex-1 rounded-[10px] border bg-white/[0.06] px-5 font-sora text-white
            placeholder-gray-500 outline-none transition-all duration-200
            focus:border-blue/60 focus:bg-white/[0.08]
            disabled:cursor-not-allowed disabled:opacity-50
            ${isLarge ? 'h-[52px] text-base' : 'h-[48px] text-[15px]'}
            ${state && !state.success ? 'border-red-500/60 focus:border-red-500/80' : 'border-white/10'}
          `}
        />

        <button
          type="submit"
          disabled={isPending}
          className={`
            flex shrink-0 items-center justify-center gap-2 rounded-[10px]
            font-sora font-semibold text-white transition-all duration-200
            disabled:cursor-not-allowed disabled:opacity-70
            ${isLarge ? 'h-[52px] px-7 text-base' : 'h-[48px] px-6 text-[15px]'}
          `}
          style={{
            background: isPending
              ? 'rgba(27,79,219,0.5)'
              : 'linear-gradient(135deg, #1B4FDB 0%, #0D9488 100%)',
            boxShadow: isPending ? 'none' : '0 0 30px rgba(27,79,219,0.4)',
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

      {/* Error message */}
      {state && !state.success && (
        <p
          id="waitlist-error"
          className="mt-2 font-sora text-[13px] text-red-400"
          role="alert"
          aria-live="polite"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
