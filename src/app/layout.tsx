import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { CSSProperties } from "react";
import { ClientProviders } from "@/components/ClientProviders";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Openresource",
  description: "By Gaurav Sharma",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Geist font configuration
const fontSans = GeistSans;
const fontMono = GeistMono;

// Custom Righteous font configuration
const righteousFont = localFont({
  src: "../../fonts/Righteous-Regular.ttf",
  variable: "--font-righteous",
  display: "optional",
});

// Custom Lexend font configuration
const lexendFont = localFont({
  src: "../../fonts/Lexend-VariableFont_wght.ttf",
  variable: "--font-lexend",
  display: "optional",
});

const dottedBackgroundStyle: CSSProperties = {
  backgroundImage: `
    radial-gradient(circle at 25% 25%, var(--dot-color-1) 0.3px, transparent 1px),
    radial-gradient(circle at 75% 75%, var(--dot-color-2) 0.3px, transparent 1px)
  `,
  backgroundSize: "10px 10px",
  imageRendering: "pixelated",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${righteousFont.variable} ${lexendFont.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-transparent" suppressHydrationWarning>
        <ClientProviders>
            {/* Dynamic Background */}
            <div className="relative min-h-screen w-full">
              <div
                className="bg-background absolute inset-0 z-0 [--dot-color-1:rgba(0,0,0,0.45)] [--dot-color-2:rgba(0,0,0,0.15)] dark:[--dot-color-1:#222222] dark:[--dot-color-2:#111111]"
                style={dottedBackgroundStyle}
              />

              <div className="relative z-10">
                <AppShell>{children}</AppShell>
              </div>
            </div>
        </ClientProviders>
      </body>
    </html>
  );
}
