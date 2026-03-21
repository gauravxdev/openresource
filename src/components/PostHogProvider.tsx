"use client"

import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Lazy-load posthog-js so it stays OFF the initial JS bundle entirely.
    // Use requestIdleCallback to ensure we don't block the main thread during hydration.
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const initPostHog = () => {
        void import("posthog-js").then((mod) => {
          const posthog = mod.default
          try {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
              api_host: "/ingest",
              ui_host: "https://eu.posthog.com",
              capture_exceptions: true,
              capture_pageview: true,
              capture_pageleave: true,
              debug: process.env.NODE_ENV === "development",
            })
          } catch (error) {
            console.warn("Failed to initialize PostHog (non-critical):", error)
          }
        })
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(initPostHog);
      } else {
        setTimeout(initPostHog, 2000);
      }
    }
  }, [])

  // Always return the same JSX structure — never conditionally wrap children.
  // This prevents React from unmounting/remounting the entire app tree.
  return <>{children}</>
}
