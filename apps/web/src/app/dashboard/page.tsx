"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-context";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white px-6 py-10 text-navy">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal">Dashboard</p>
            <h1 className="mt-2 font-sora text-3xl font-semibold">Welcome to Dersify</h1>
            <p className="mt-2 text-sm text-navy/70">{user?.email ?? user?.id}</p>
          </div>
          <button
            className="rounded-md border border-navy/20 px-4 py-2 text-sm font-semibold disabled:opacity-60"
            disabled={loading}
            onClick={() => void logout()}
            type="button"
          >
            Sign out
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
