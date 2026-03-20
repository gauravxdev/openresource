"use client";

import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const initPostHog = () => {
        void import("posthog-js").then((mod) => {
          const posthog = mod.default;
          try {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
              api_host: "/ingest",
              ui_host: "https://eu.posthog.com",
              capture_exceptions: true,
              capture_pageview: true,
              capture_pageleave: true,
              debug: process.env.NODE_ENV === "development",
            });
          } catch (error) {
            console.warn("Failed to initialize PostHog (non-critical):", error);
          }
        });
      };

      // Delay PostHog init until after LCP to avoid main thread blocking
      setTimeout(initPostHog, 3000);
    }
  }, []);

  return <>{children}</>;
}
