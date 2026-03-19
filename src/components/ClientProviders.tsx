"use client";

import dynamic from "next/dynamic";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";

// Lazy-load client-only components with ssr: false is allowed here 
// because this is a Client Component.
const PostHogProvider = dynamic(
  () => import("@/components/PostHogProvider").then((mod) => mod.PostHogProvider),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <TRPCReactProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </TRPCReactProvider>
    </PostHogProvider>
  );
}
