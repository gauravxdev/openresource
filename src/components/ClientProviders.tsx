"use client";

import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/theme-provider";
import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("@/components/ui/sonner").then(mod => ({ default: mod.Toaster })), {
  ssr: false,
});

const TRPCReactProvider = dynamic(() => import("@/trpc/react").then(mod => mod.TRPCReactProvider), {
  ssr: false,
});

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
