"use client";

import dynamic from "next/dynamic";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/theme-provider";

// Lazy-load heavy providers to keep them off the initial JS bundle.
// TRPCReactProvider pulls in @tanstack/react-query + @trpc/client + superjson (~150KB+).
const TRPCReactProvider = dynamic(
  () => import("@/trpc/react").then((mod) => mod.TRPCReactProvider),
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
