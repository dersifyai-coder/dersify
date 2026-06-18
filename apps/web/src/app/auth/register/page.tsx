"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

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

const inputClass =
  "w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all";
const inputStyle = {
  background: "var(--bg-raised)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
};

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [message, setMessage] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setMessage(await register(fullName, email, password));
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--border-focus)";
    e.currentTarget.style.boxShadow = "var(--focus-ring)";
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--border-default)";
    e.currentTarget.style.boxShadow = "none";
  }

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
            Build your learner model.
            <br />
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              The AI does the rest.
            </em>
          </p>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Dersify tracks what you know, what you struggle with, and how you
            think — then tailors every session to close the gap.
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
              Create account
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Start building your learner model.
            </p>
          </div>

          <div className="space-y-1">
            <label
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Full name
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              name="fullName"
              type="text"
              autoComplete="name"
              required
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Email
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              name="email"
              type="email"
              autoComplete="email"
              required
              onFocus={handleFocus}
              onBlur={handleBlur}
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
              className={inputClass}
              style={inputStyle}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              onFocus={handleFocus}
              onBlur={handleBlur}
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
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link
              className="font-semibold transition-opacity hover:opacity-80"
              href="/auth/login"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
