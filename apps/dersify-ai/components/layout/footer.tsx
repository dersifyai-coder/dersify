'use client';

import { Twitter, Linkedin, Github, Youtube } from 'lucide-react';

const COLUMNS = [
  {
    label: 'Product',
    links: ['Features', 'Knowledge map', 'Adaptive learning', 'Pricing'],
  },
  {
    label: 'Company',
    links: ['About', 'Careers', 'Blog'],
  },
  {
    label: 'Legal',
    links: ['Privacy', 'Terms'],
  },
];

const SOCIALS = [
  { Icon: Twitter, label: 'X (Twitter)' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Github, label: 'GitHub' },
  { Icon: Youtube, label: 'YouTube' },
];

function ConstellationMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
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

export function Footer() {
  return (
    <footer
      className="border-t pb-10 pt-16"
      style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <ConstellationMark />
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
              >
                Dersify
              </span>
            </div>
            <p
              className="mt-3 max-w-[240px] text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              The adaptive tutor that learns how you learn.
            </p>
            <div className="mt-5 flex gap-4">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.label}>
              <p
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                {col.label}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex flex-col items-center gap-3 border-t pt-6 text-[13px] sm:flex-row sm:justify-between"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>© 2026 Dersify Inc. All rights reserved.</p>
          <p style={{ color: 'var(--text-muted)' }}>
            <a
              href="#"
              className="transition-colors hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              Privacy policy
            </a>
            {' · '}
            <a
              href="#"
              className="transition-colors hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              Terms of service
            </a>
          </p>
          <p
            className="font-medium"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', fontSize: '0.75rem' }}
          >
            Made for the curious
          </p>
        </div>
      </div>
    </footer>
  );
}
