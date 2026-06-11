import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:  "#1B4FDB",
        teal:     "#0D9488",
        navy:     "#0A1628",
        "bg-base":    "#050C1B",
        "bg-surface": "#0D1A2E",
        "bg-surface-2": "#0F1F38",
        "blue-brand": "#2563EB",
        "cyan-brand": "#06B6D4",
      },
      fontFamily: {
        sora:  ["var(--font-sora)", "sans-serif"],
        mono:  ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.07)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-48": "48px 48px",
      },
      animation: {
        "fade-in-up":      "fadeInUp 0.7s ease both",
        "fade-in":         "fadeIn 0.6s ease both",
        "slide-in-right":  "slideInRight 0.7s ease both",
        "slide-in-left":   "slideInLeft 0.7s ease both",
        "step-in-right":   "slideInRight 0.25s ease both",
        "step-in-left":    "slideInLeft 0.25s ease both",
        "marquee":         "marquee 28s linear infinite",
        "pulse-glow":      "pulse-glow 3s ease-in-out infinite",
        "float":           "float 4s ease-in-out infinite",
        "spin-slow":       "spin-slow 20s linear infinite",
        "blink":           "blink 1.2s step-end infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(32px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.2)" },
          "50%":       { boxShadow: "0 0 40px rgba(59,130,246,0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-32px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
