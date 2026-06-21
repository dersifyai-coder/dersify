import type { Metadata } from 'next';
import { Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import '@dersify/design-system/styles.css';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
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
    <html lang="en" className={`${hankenGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
