import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-context";
import "../styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const fontVariables = [
  newsreader.variable,
  hankenGrotesk.variable,
  ibmPlexMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Dersify",
  description: "The adaptive tutor that learns how you learn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontVariables}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
