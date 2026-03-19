"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

// Initialize posthog globally outside the component to avoid recreating it
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    loaded: (posthogInstance) => {
      const originalCapture = posthogInstance.capture.bind(posthogInstance)
      posthogInstance.capture = function(event: string, properties?: Record<string, unknown>, options?: Record<string, unknown>) {
        try {
          return originalCapture(event, properties, options)
        } catch (error) {
          console.warn("PostHog capture failed (non-critical):", error)
          return undefined
        }
      }
    }
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Return the provider unconditionally. Conditionally wrapping children causes the entire
  // React app tree to unmount and remount during hydration, blocking the main thread for seconds.
  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
