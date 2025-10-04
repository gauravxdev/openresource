"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog if we have a valid key and are not in build mode
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: "/ingest",
          ui_host: "https://eu.posthog.com",
          capture_exceptions: true,
          debug: process.env.NODE_ENV === "development",
          // Handle network failures gracefully
          loaded: (posthogInstance) => {
            // Override capture method to handle network errors
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
      } catch (error) {
        console.warn("Failed to initialize PostHog (non-critical):", error)
      }
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}