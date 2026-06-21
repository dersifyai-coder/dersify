"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useSearchParams } from "next/navigation";

function ConstellationMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M9.5 9.5L9.5 22.5" stroke="var(--border-strong)" strokeWidth="1.6" />
      <path d="M9.5 9.5L22.5 16" stroke="var(--border-strong)" strokeWidth="1.6" />
      <path d="M9.5 22.5L22.5 16" stroke="var(--accent-soft-border)" strokeWidth="1.8" />
      <path d="M22.5 16L21 27" stroke="var(--border-strong)" strokeWidth="1.6" />
      <circle cx="9.5" cy="9.5" r="2.5" fill="var(--n-300)" />
      <circle cx="9.5" cy="22.5" r="2.5" fill="var(--accent-2)" />
      <circle cx="21" cy="27" r="2" fill="var(--n-300)" />
      <circle cx="22.5" cy="16" r="3.6" fill="var(--accent)" />
    </svg>
  );
}

function LoginForm() {
  const { login, loading } = useAuth();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [message, setMessage] = useState<string | undefined>(
    callbackError ?? undefined,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setMessage(await login(email, password));
  }

  return (
    <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <h1
          className="text-3xl font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          Sign in
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Continue learning with Dersify.
        </p>
      </div>

      <div className="space-y-1">
        <label
          className="block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Email
        </label>
        <input
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
          name="email"
          type="email"
          autoComplete="email"
          required
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--border-focus)";
            e.currentTarget.style.boxShadow = "var(--focus-ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div className="space-y-1">
        <label
          className="block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Password
        </label>
        <input
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--border-focus)";
            e.currentTarget.style.boxShadow = "var(--focus-ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {message ? (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: "rgba(239,68,68,0.07)",
            color: "var(--error)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {message}
        </p>
      ) : null}

      <button
        className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
        disabled={loading}
        type="submit"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        New to Dersify?{" "}
        <Link
          className="font-semibold transition-opacity hover:opacity-80"
          href="/auth/register"
          style={{ color: "var(--accent)" }}
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Brand panel — desktop only */}
      <div
        className="hidden lg:flex lg:w-[420px] lg:shrink-0 flex-col justify-between px-10 py-12"
        style={{
          background: "var(--bg-subtle)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <ConstellationMark />
          <span
            className="text-lg font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Dersify
          </span>
        </div>

        <div>
          <p
            className="text-2xl leading-snug"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            The AI tutor that adapts
            <br />
            to how{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              you
            </em>{" "}
            think.
          </p>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            No pre-built courses. No passive videos.
            <br />
            Just a Socratic conversation tailored to your mind.
          </p>
        </div>

        <p
          className="text-xs font-medium"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
          }}
        >
          Made for the curious
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
