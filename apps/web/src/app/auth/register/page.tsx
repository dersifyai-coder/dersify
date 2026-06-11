"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-navy">
      <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <h1 className="font-sora text-3xl font-semibold">Create account</h1>
          <p className="text-sm text-navy/70">Start building your learner model.</p>
        </div>

        <label className="block space-y-2 text-sm font-medium">
          <span>Full name</span>
          <input
            className="w-full rounded-md border border-navy/20 px-3 py-2 outline-none focus:border-primary"
            name="fullName"
            type="text"
            autoComplete="name"
            required
          />
        </label>

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
            autoComplete="new-password"
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
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-sm text-navy/70">
          Already have an account?{" "}
          <Link className="font-semibold text-primary" href="/auth/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
