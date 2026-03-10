import type { Metadata } from "next";
import { Bodoni_Moda, Instrument_Sans } from "next/font/google";

import "./globals.css";
import { SiteShell } from "@/components/providers/site-shell";

const fontDisplay = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "700"],
});

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Elina Vale | Immersive Graphic Design Portfolio",
  description:
    "A cinematic WebGL portfolio blending editorial design, interactive mockups, particle assembly, and immersive motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} bg-ink font-sans text-mist antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
