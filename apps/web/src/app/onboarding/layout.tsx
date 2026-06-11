import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — Dersify",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center h-14 shrink-0"
        style={{ background: "linear-gradient(135deg, #1B4FDB 0%, #0D9488 100%)" }}
      >
        <span className="font-sora text-xl font-bold text-white tracking-tight">
          Dersify
        </span>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
