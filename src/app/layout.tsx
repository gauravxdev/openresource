import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider"

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Openstore",
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
            {/* Dark Theme Background */}
            <div className="dark:block hidden">
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: '#0a0a0a',
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, #222222 0.3px, transparent 1px),
                    radial-gradient(circle at 75% 75%, #111111 0.3px, transparent 1px)
                  `,
                  backgroundSize: '10px 10px',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
            
            {/* Light Theme Background */}
            <div className="dark:hidden">
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: '#ffffff',
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            <div className="relative z-10">
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
