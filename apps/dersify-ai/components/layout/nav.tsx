'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Method', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For institutions', href: '#mission' },
  { label: 'Pricing', href: '#waitlist' },
];

function ConstellationMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
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

function scrollToWaitlist() {
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(251,252,251,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'var(--blur-overlay)' : 'none',
        WebkitBackdropFilter: scrolled ? 'var(--blur-overlay)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 lg:px-12">
        <a href="#" className="flex items-center gap-2.5">
          <ConstellationMark />
          <span
            className="text-[21px] font-semibold"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
          >
            Dersify
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/auth/login"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign in
          </a>
          <Button variant="primary" size="sm" onClick={scrollToWaitlist}>
            Start learning
          </Button>
        </div>

        {/* Mobile */}
        <button
          className="md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
          style={{ color: 'var(--text-primary)' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <nav className="flex flex-col gap-1 px-6 pb-6 pt-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-base font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <a href="/auth/login" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Sign in
              </a>
              <Button
                variant="primary"
                onClick={() => {
                  setMenuOpen(false);
                  scrollToWaitlist();
                }}
              >
                Start learning
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
