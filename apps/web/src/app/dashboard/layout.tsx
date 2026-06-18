'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BarChart2, Settings, Home } from 'lucide-react';

function ConstellationMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
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

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Home',     Icon: Home,     exact: true  },
  { href: '/dashboard/learn',    label: 'Learn',    Icon: BookOpen, exact: false },
  { href: '/dashboard/progress', label: 'Progress', Icon: BarChart2,exact: false },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings, exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ── Sidebar (desktop) ───────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-[268px] shrink-0 flex-col border-r"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 py-[14px] border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <ConstellationMark />
          <span
            className="text-base font-semibold"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            Dersify
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors"
                style={
                  active
                    ? {
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        paddingLeft: '10px',
                        paddingRight: '12px',
                        borderLeft: '2px solid var(--accent)',
                      }
                    : {
                        color: 'var(--text-secondary)',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                      }
                }
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div
          className="border-t px-4 py-4"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Link
            href="/dashboard/learn"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            <BookOpen size={14} />
            Start learning
          </Link>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar */}
        <header
          className="flex lg:hidden items-center justify-between border-b px-4 py-3"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="flex items-center gap-2">
            <ConstellationMark />
            <span
              className="text-base font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}
            >
              Dersify
            </span>
          </div>
          <div className="flex items-center gap-5">
            {NAV_ITEMS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                aria-label={label}
                style={{ color: 'var(--text-secondary)' }}
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
