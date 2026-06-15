"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Product",         href: "#features" },
  { label: "How It Works",    href: "#how-it-works" },
  { label: "For Students",    href: "#testimonials" },
  { label: "For Institutions",href: "#institutions" },
  { label: "Pricing",         href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050C1B]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(37,99,235,0.5)] group-hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-shadow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-sora font-bold text-[17px] text-white tracking-tight">Dersify</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Group */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
          >
            Log In
          </Link>
          <Link
            href="/auth/sign-up"
            className="btn-primary text-sm"
          >
            Start Learning
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#050C1B]/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            <Link href="/auth/sign-in" className="btn-secondary text-sm justify-center">Log In</Link>
            <Link href="/auth/sign-up" className="btn-primary text-sm justify-center">Start Learning →</Link>
          </div>
        </div>
      )}
    </header>
  );
}
