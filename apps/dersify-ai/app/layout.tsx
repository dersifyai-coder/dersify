import type { Metadata } from 'next';
import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dersify — AI Learning System | Every learner deserves a personal tutor',
  description:
    'Dersify is an AI-native learning system that builds a complete model of how you learn — your strengths, gaps, and misconceptions. Then it teaches you exactly what you need, exactly how you need it.',
  openGraph: {
    title: 'Dersify — AI Learning System',
    description:
      'Dersify is an AI-native learning system that builds a complete model of how you learn — your strengths, gaps, and misconceptions. Then it teaches you exactly what you need, exactly how you need it.',
    type: 'website',
    siteName: 'Dersify',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dersify — AI Learning System',
  },
  keywords: [
    'AI tutor',
    'personalized learning',
    'spaced repetition',
    'adaptive learning',
    'AI education',
    'online tutor',
    'learning system',
    'misconception detection',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
