import { Twitter, Linkedin, Github, Youtube } from 'lucide-react';

const COLUMNS = [
  {
    label: 'PRODUCT',
    links: ['Features', 'Knowledge Map', 'Adaptive Learning', 'Analytics', 'Pricing'],
  },
  {
    label: 'RESOURCES',
    links: ['Documentation', 'Learning Science', 'Blog', 'Research', 'Community'],
  },
  {
    label: 'COMPANY',
    links: ['About', 'Vision', 'Careers', 'Contact', 'Enterprise'],
  },
];

const SOCIALS = [
  { Icon: Twitter, label: 'X (Twitter)' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Github, label: 'GitHub' },
  { Icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060E1A] pb-10 pt-16">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center">
              <svg width="28" height="28" viewBox="0 0 28 28">
                <defs>
                  <linearGradient id="footer-lg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1B4FDB" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
                <path d="M14 2L26 14L14 26L2 14Z" fill="url(#footer-lg)" />
                <path d="M14 8L20 14L14 20L8 14Z" fill="rgba(10,22,40,0.6)" />
              </svg>
              <span className="ml-[10px] text-lg font-semibold text-white">Dersify</span>
            </div>
            <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-[#4B5563]">
              The AI-native learning system that adapts to you, understands your
              thinking, and guides you to true mastery.
            </p>
            <div className="mt-5 flex gap-4">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-[#4B5563] transition-colors duration-200 hover:text-[#9CA3AF]"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.label}>
              <p className="text-[11px] font-medium uppercase tracking-widest text-teal">
                {col.label}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#9CA3AF] transition-colors duration-200 hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/[0.06] pt-6 text-[13px] sm:flex-row sm:justify-between">
          <p className="text-[#4B5563]">© 2025 Dersify AI Inc. All rights reserved.</p>
          <p className="text-[#4B5563]">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            {' · '}
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
          </p>
          <p className="font-medium text-teal">Built in Somalia · For the World</p>
        </div>
      </div>
    </footer>
  );
}
