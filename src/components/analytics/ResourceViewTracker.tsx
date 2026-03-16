"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

interface ResourceViewTrackerProps {
  resourceId: string;
  resourceName: string;
  resourceSlug: string;
}

export function ResourceViewTracker({
  resourceId,
  resourceName,
  resourceSlug,
}: ResourceViewTrackerProps) {
  const posthog = usePostHog();
  const trackedRef = useRef(false);

  useEffect(() => {
    // Only track once per mount to avoid duplicate events in strict mode
    if (!trackedRef.current) {
      posthog.capture("resource_viewed", {
        resourceId,
        resourceName,
        resourceSlug,
      });
      trackedRef.current = true;
    }
  }, [posthog, resourceId, resourceName, resourceSlug]);

  return null;
}
