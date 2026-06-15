import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import TheProblem from "@/components/landing/TheProblem";
import HowItWorks from "@/components/landing/HowItWorks";
import ProductShowcase from "@/components/landing/ProductShowcase";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import GlobalVision from "@/components/landing/GlobalVision";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

export const metadata: Metadata = {
  title: "Dersify — AI-Native Learning System | Every Learner Deserves a Personal Tutor",
  description:
    "Dersify is the AI-native learning system that understands how you learn, adapts in real time, remembers your progress, and guides you to true mastery of any subject.",
  openGraph: {
    title: "Dersify — AI-Native Learning System",
    description:
      "Every learner deserves a personal tutor. Dersify adapts to your learning style, identifies misconceptions, and guides you to mastery.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="relative bg-[#050C1B] text-white overflow-x-hidden">
      {/* Scroll-triggered animation observer (client-only) */}
      <ScrollReveal />

      {/* ─── Navigation ──────────────────────────────────────────────────── */}
      <Navbar />

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ─── Social Proof Marquee ─────────────────────────────────────────── */}
      <TrustedBy />

      {/* ─── The Problem ──────────────────────────────────────────────────── */}
      <TheProblem />

      {/* ─── How It Works: 3 Layers ───────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── Product Showcase ─────────────────────────────────────────────── */}
      <ProductShowcase />

      {/* ─── Stats Bar ────────────────────────────────────────────────────── */}
      <Stats />

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ─── Global Vision ────────────────────────────────────────────────── */}
      <GlobalVision />

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <FinalCTA />

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
