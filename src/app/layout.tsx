import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { CSSProperties } from "react";
import { ClientProviders } from "@/components/ClientProviders";
import { AppShell } from "@/components/AppShell";
import { WebsiteJsonLd } from "@/components/StructuredData";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "OpenResource - Open Source Projects Directory",
    template: "%s | OpenResource",
  },
  description:
    "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
  keywords: [
    "open source",
    "github repositories",
    "self-hosted",
    "windows apps",
    "android apps",
    "developer tools",
    "open source projects",
    "developer resources",
    "free software",
  ],
  authors: [{ name: "Gaurav Sharma", url: "https://gauravxdev.site" }],
  creator: "Gaurav Sharma",
  publisher: "OpenResource",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "OpenResource",
    title: "OpenResource - Open Source Projects Directory",
    description:
      "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "OpenResource - Open Source Projects Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenResource - Open Source Projects Directory",
    description:
      "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
    images: ["/og-image.svg"],
    creator: "@bitsbygaurav",
  },
  icons: [
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/icon.png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  alternates: {
    canonical: BASE_URL,
  },
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
        <WebsiteJsonLd />
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
