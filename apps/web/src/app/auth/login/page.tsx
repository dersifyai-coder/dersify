"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
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
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-navy">
      <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <h1 className="font-sora text-3xl font-semibold">Sign in</h1>
          <p className="text-sm text-navy/70">Continue learning with Dersify.</p>
        </div>

        <label className="block space-y-2 text-sm font-medium">
          <span>Email</span>
          <input
            className="w-full rounded-md border border-navy/20 px-3 py-2 outline-none focus:border-primary"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span>Password</span>
          <input
            className="w-full rounded-md border border-navy/20 px-3 py-2 outline-none focus:border-primary"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>

        {message ? <p className="text-sm text-navy/70">{message}</p> : null}

        <button
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-navy/70">
          New to Dersify?{" "}
          <Link className="font-semibold text-primary" href="/auth/register">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
