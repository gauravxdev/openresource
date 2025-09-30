import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { CSSProperties } from "react";
import { ThemeProvider } from "@/components/theme-provider"

import { TRPCReactProvider } from "@/trpc/react";

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
});

// Custom Lexend font configuration
const lexendFont = localFont({
  src: "../../fonts/Lexend-VariableFont_wght.ttf",
  variable: "--font-lexend",
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
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} ${righteousFont.variable} ${lexendFont.variable}`} suppressHydrationWarning>
      <body className="bg-transparent">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Dynamic Background */}
          <div className="min-h-screen w-full relative">
            <div
              className="
                absolute inset-0 z-0
                bg-white dark:bg-[#0a0a0a]
                [--dot-color-1:rgba(0,0,0,0.45)] [--dot-color-2:rgba(0,0,0,0.15)]
                dark:[--dot-color-1:#222222] dark:[--dot-color-2:#111111]
              "
              style={dottedBackgroundStyle}
            />

            <div className="relative z-10">
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
