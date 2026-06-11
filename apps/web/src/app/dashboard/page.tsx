export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-navy">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal">Dashboard</p>
          <h1 className="mt-2 font-sora text-3xl font-bold text-navy">
            Welcome to Dersify
          </h1>
          <p className="mt-1 text-sm text-navy/60">
            Your learning journey is being built.
          </p>
        </div>
      </div>
    </main>
  );
}
