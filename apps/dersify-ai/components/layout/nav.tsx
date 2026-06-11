'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Institutions', href: '#mission' },
  { label: 'Pricing', href: '#waitlist' },
];

function Logo() {
  return (
    <a href="#" className="flex items-center">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <defs>
          <linearGradient id="nav-lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B4FDB" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
        <path d="M14 2L26 14L14 26L2 14Z" fill="url(#nav-lg)" />
        <path d="M14 8L20 14L14 20L8 14Z" fill="rgba(10,22,40,0.6)" />
      </svg>
      <span className="ml-[10px] text-lg font-semibold text-white">Dersify</span>
    </a>
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
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,22,40,0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 lg:px-12">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#9CA3AF] transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" size="sm" className="px-2">
            Log in
          </Button>
          <button
            onClick={scrollToWaitlist}
            className="gradient-bg rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(27,79,219,0.4)] transition-transform duration-200 hover:scale-[1.02]"
          >
            Join Waitlist →
          </button>
        </div>

        {/* Mobile menu */}
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger asChild>
            <button
              className="text-white md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/95 backdrop-blur-xl md:hidden" />
            <Dialog.Content className="fixed inset-0 z-50 flex flex-col p-6 md:hidden">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <div className="flex h-16 items-center justify-between">
                <Logo />
                <Dialog.Close asChild>
                  <button className="text-white" aria-label="Close navigation menu">
                    <X size={24} />
                  </button>
                </Dialog.Close>
              </div>
              <nav className="mt-12 flex flex-col gap-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-2xl font-semibold text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-4">
                <Button variant="outline">Log in</Button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToWaitlist();
                  }}
                  className="gradient-bg rounded-[10px] px-7 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_rgba(27,79,219,0.4)]"
                >
                  Join Waitlist →
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
