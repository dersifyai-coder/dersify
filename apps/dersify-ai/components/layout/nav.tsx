'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { EASE } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'The problem', href: '#problem' },
  { label: 'The method', href: '#how-it-works' },
  { label: 'Learner model', href: '#intelligence-engine' },
  { label: 'Use cases', href: '#features' },
];

function isElement(section: Element | null): section is Element {
  return section !== null;
}

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

function WaitlistCta({ className = '', onClick }: { className?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        scrollToWaitlist();
      }}
      className={`inline-flex items-center gap-2.5 rounded-full py-1.5 pl-4 pr-1.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none ${className}`}
      style={{
        background: 'var(--accent)',
        color: 'var(--accent-contrast)',
        boxShadow: '0 12px 28px -20px rgba(15, 122, 69, 0.75)',
      }}
    >
      <span>Join waitlist</span>
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full"
        style={{
          background: 'rgba(255,255,255,0.96)',
          color: 'var(--accent-active)',
        }}
        aria-hidden
      >
        <ArrowRight size={16} />
      </span>
    </button>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('problem');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.querySelector(link.href)).filter(isElement);
    let animationFrame = 0;

    const updateActiveSection = () => {
      const activationLine = window.scrollY + 160;
      let currentId = sections[0]?.id ?? 'problem';

      for (const section of sections) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;

        if (sectionTop <= activationLine) {
          currentId = section.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-all duration-300 sm:px-6"
      style={{
        background: 'transparent',
      }}
    >
      <div
        className="mx-auto grid h-16 max-w-[1080px] grid-cols-[1fr_auto_auto] items-center gap-4 rounded-full px-3 pl-4 transition-all duration-300 md:grid-cols-[1fr_auto_1fr] md:px-3 md:pl-4"
        style={{
          background: scrolled || menuOpen ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
          border: '1px solid var(--border-default)',
          boxShadow: scrolled || menuOpen
            ? '0 22px 64px -44px rgba(10,13,11,0.48), var(--highlight-top)'
            : 'var(--highlight-top)',
          backdropFilter: 'var(--blur-overlay)',
          WebkitBackdropFilter: 'var(--blur-overlay)',
        }}
      >
        <a href="#" className="group flex min-w-0 items-center gap-3" aria-label="Dersify home">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid var(--border-subtle)',
              boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <ConstellationMark size={28} />
          </span>
          <span
            className="text-[22px] font-semibold leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            Dersify
          </span>
        </a>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveId(link.href.slice(1))}
              className="relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 hover:text-[var(--text-primary)]"
              style={{
                color: activeId === link.href.slice(1) ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {activeId === link.href.slice(1) && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  transition={{ duration: 0.22, ease: EASE }}
                />
              )}
              <span className="relative">{link.label}</span>
            </a>
          ))}
        </nav>

        <div className="hidden justify-self-end md:flex">
          <WaitlistCta />
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-md transition-colors md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            color: 'var(--text-primary)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
          }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mx-auto mt-3 max-w-[1200px] overflow-hidden rounded-[24px] md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{
              background: 'rgba(255,255,255,0.96)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
              backdropFilter: 'var(--blur-overlay)',
              WebkitBackdropFilter: 'var(--blur-overlay)',
            }}
          >
            <nav className="flex flex-col gap-1 px-4 pb-5 pt-4" aria-label="Mobile navigation">
              <div
                className="mb-3 rounded-lg p-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <p className="text-[12px] font-semibold tracking-[0.02em]" style={{ color: 'var(--accent)' }}>
                  Product coming soon
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Join the waitlist for early access to the adaptive tutor.
                </p>
              </div>

              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    setActiveId(link.href.slice(1));
                    setMenuOpen(false);
                  }}
                  className="flex items-center justify-between rounded-md px-3 py-3 text-base font-semibold"
                  style={{
                    background: activeId === link.href.slice(1) ? 'var(--accent-soft)' : 'transparent',
                    color: activeId === link.href.slice(1) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {link.label}
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </a>
              ))}

              <div className="mt-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <WaitlistCta className="w-full justify-between" onClick={() => setMenuOpen(false)} />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
