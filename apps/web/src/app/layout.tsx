import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "../styles/globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Dersify",
  description: "AI-native learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
