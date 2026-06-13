import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <nav
        className="border-b px-6 py-4"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Dersify
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm" style={{ color: 'var(--text-subtle)' }}>
              Home
            </Link>
            <Link href="/dashboard/progress" className="text-sm" style={{ color: 'var(--text-subtle)' }}>
              Progress
            </Link>
            <Link href="/dashboard/settings" className="text-sm" style={{ color: 'var(--text-subtle)' }}>
              Settings
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
