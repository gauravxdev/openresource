"use client"

import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useRef, useState } from "react"
import type posthogType from "posthog-js"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogRef = useRef<typeof posthogType | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Only initialize PostHog if we have a valid key and are not in build mode
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
      void import("posthog-js").then((mod) => {
        const posthog = mod.default
        try {
          posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
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
          posthogRef.current = posthog
          setReady(true)
        } catch (error) {
          console.warn("Failed to initialize PostHog (non-critical):", error)
        }
      })
    }
  }, [])

  if (!ready || !posthogRef.current) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthogRef.current}>
      {children}
    </PHProvider>
  )
}