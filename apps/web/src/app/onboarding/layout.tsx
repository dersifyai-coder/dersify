import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — Dersify",
};

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

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      <header
        className="flex items-center justify-center h-14 shrink-0 border-b"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <ConstellationMark />
          <span
            className="text-[17px] font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Dersify
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
