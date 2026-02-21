"use server";

import { env } from "@/env";
import { PostHog } from 'posthog-node';

// Initialize a local instance for server-side fetching only if keys exist
if (env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_HOST) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: env.NEXT_PUBLIC_POSTHOG_HOST,
        // Since we are just fetching data in edge environments/server actions,
        // we disable local caching.
        flushAt: 1,
        flushInterval: 0
    });
}

// NOTE: The posthog-node library is primarily for INGESTING events server-side.
// To fetch analytics data (like traffic over time), we usually have to query the PostHog REST API directly
// because the node SDK doesn't expose robust reporting/querying methods.

export async function getTrafficSummary(_days = 30) {
    // If the user hasn't configured PostHog API keys yet, return a graceful stub
    if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST) {
        return {
            success: false,
            data: null,
            error: "PostHog API not configured in environment variables",
            isConfigured: false
        };
    }

    try {
        // In a real implementation extracting data FROM PostHog, you would make a fetch() call
        // to their /api/projects/:project_id/insights endpoint using a Personal API Key.
        // For now, we return stub data that the UI can render gracefully until the user 
        // provides exactly what PostHog project ID they want to query.

        return {
            success: true,
            isConfigured: true,
            // Returning stubbed shape to match what the chart component will expect
            data: {
                totalVisitors: 0,
                averageSessionLength: "0m 0s",
                chartData: []
            }
        };
    } catch (error) {
        console.error("Failed to fetch PostHog traffic summary:", error);
        return { success: false, data: null, error: "Failed to fetch traffic summary", isConfigured: true };
    }
}
