import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Features",      href: "#features" },
    { label: "How It Works",  href: "#how-it-works" },
    { label: "Knowledge Map", href: "#" },
    { label: "AI Tutoring",   href: "#" },
    { label: "Pricing",       href: "#" },
    { label: "Changelog",     href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Learning Science", href: "#" },
    { label: "Blog",          href: "#" },
    { label: "Research",      href: "#" },
    { label: "Community",     href: "#" },
  ],
  Company: [
    { label: "About",         href: "#" },
    { label: "Mission",       href: "#" },
    { label: "Vision",        href: "#" },
    { label: "Careers",       href: "#" },
    { label: "Contact",       href: "#" },
  ],
  "For Institutions": [
    { label: "Overview",      href: "#" },
    { label: "Educators",     href: "#" },
    { label: "Analytics",     href: "#" },
    { label: "Enterprise",    href: "#" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] bg-[#050C1B]">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(37,99,235,0.4)]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-sora font-bold text-[17px] text-white">Dersify</span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-[220px]">
              The AI-native learning system that understands you and helps you master any subject.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-500 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.08] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col} className="col-span-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{col}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2025 Dersify AI Inc. All rights reserved. · Built in Somalia, for the world.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
