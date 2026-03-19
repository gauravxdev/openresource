/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use server";

import { env } from "@/env";
import { PostHog } from 'posthog-node';

// Initialize a local instance for server-side fetching only if keys exist
let posthogClient: PostHog | null = null;

if (env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_HOST) {
    posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
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

export async function getTrafficSummary(days = 30) {
    if (!env.POSTHOG_PERSONAL_API_KEY || !env.POSTHOG_PROJECT_ID) {
        return { success: false, data: null, isConfigured: false };
    }

    try {
        const baseUrl = env.NEXT_PUBLIC_POSTHOG_HOST?.includes('eu') 
            ? 'https://eu.posthog.com' 
            : 'https://app.posthog.com';
            
        const response = await fetch(
            `${baseUrl}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: {
                        kind: "TrendsQuery",
                        series: [
                            {
                                event: "$pageview",
                                kind: "EventsNode",
                                math: "total"
                            }
                        ],
                        dateRange: {
                            date_from: `-${days}d`
                        },
                        interval: "day"
                    }
                }),
                next: { revalidate: 0 },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`PostHog Traffic Query Error (${response.status}):`, errorText);
            throw new Error(`PostHog API responded with ${response.status}`);
        }

        const result = await response.json();
        const trend = result.results?.[0]; // Note: results (plural) in Query API
        
        const totalVisitors = trend?.count ?? 0;
        const chartData = trend?.data?.map((val: number, i: number) => ({
            date: trend.labels?.[i],
            views: val
        })) ?? [];

        return {
            success: true,
            isConfigured: true,
            data: {
                totalVisitors,
                averageSessionLength: "N/A",
                chartData
            }
        };
    } catch (error) {
        console.error("Failed to fetch PostHog traffic summary:", error);
        return { success: false, data: null, error: "Failed to fetch traffic summary", isConfigured: true };
    }
}

export async function getTopResources(days = 30, limit = 10) {
    if (!env.POSTHOG_PERSONAL_API_KEY || !env.POSTHOG_PROJECT_ID) {
        return { success: false, data: [], isConfigured: false };
    }

    try {
        const baseUrl = env.NEXT_PUBLIC_POSTHOG_HOST?.includes('eu') 
            ? 'https://eu.posthog.com' 
            : 'https://app.posthog.com';

        const response = await fetch(
            `${baseUrl}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: {
                        kind: "TrendsQuery",
                        series: [
                            {
                                event: "resource_viewed",
                                kind: "EventsNode",
                                math: "total"
                            }
                        ],
                        breakdownFilter: {
                            breakdown: "resourceName",
                            breakdown_type: "event"
                        },
                        dateRange: {
                            date_from: `-${days}d`
                        }
                    }
                }),
                next: { revalidate: 0 },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`PostHog Top Resources Query Error (${response.status}):`, errorText);
            throw new Error(`PostHog API responded with ${response.status}`);
        }

        const result = await response.json();

        // Extracting breakdown results from Query API response
        const topResources = result.results?.map((item: any) => ({
            name: item.label, // In breakdown query, label is the breakdown value
            views: item.count
        }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, limit) ?? [];

        return {
            success: true,
            isConfigured: true,
            data: topResources
        };
    } catch (error) {
        console.error("Failed to fetch Top Resources from PostHog:", error);
        return { success: false, data: [], isConfigured: true, error: "Failed to fetch top resources" };
    }
}

export async function getUserActivityStats() {
    if (!env.POSTHOG_PERSONAL_API_KEY || !env.POSTHOG_PROJECT_ID) {
        return { success: false, data: null, isConfigured: false };
    }

    try {
        const baseUrl = env.NEXT_PUBLIC_POSTHOG_HOST?.includes('eu') 
            ? 'https://eu.posthog.com' 
            : 'https://app.posthog.com';

        // Fetch DAU (Daily Active Users) - last 30 days
        const dauResponse = await fetch(
            `${baseUrl}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: {
                        kind: "TrendsQuery",
                        series: [{ event: "$pageview", kind: "EventsNode", math: "dau" }],
                        interval: "day",
                        dateRange: { date_from: "-30d" }
                    }
                }),
                next: { revalidate: 3600 },
            }
        );

        // Fetch WAU (Weekly Active Users) - last 8 weeks
        const wauResponse = await fetch(
            `${baseUrl}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: {
                        kind: "TrendsQuery",
                        series: [{ event: "$pageview", kind: "EventsNode", math: "weekly_active" }],
                        interval: "week",
                        dateRange: { date_from: "-8w" }
                    }
                }),
                next: { revalidate: 3600 },
            }
        );

        if (!dauResponse.ok || !wauResponse.ok) {
            throw new Error("Failed to fetch DAU/WAU from PostHog");
        }

        const dauResult = await dauResponse.json();
        const wauResult = await wauResponse.json();

        const dauTrend = dauResult.results?.[0];
        const wauTrend = wauResult.results?.[0];

        return {
            success: true,
            isConfigured: true,
            data: {
                dau: {
                    current: dauTrend?.count ?? 0,
                    chartData: dauTrend?.data?.map((val: number, i: number) => ({
                        date: dauTrend.labels?.[i],
                        users: val
                    })) ?? []
                },
                wau: {
                    current: wauTrend?.count ?? 0,
                    chartData: wauTrend?.data?.map((val: number, i: number) => ({
                        week: wauTrend.labels?.[i],
                        users: val
                    })) ?? []
                }
            }
        };
    } catch (error) {
        console.error("Failed to fetch user activity stats:", error);
        return { success: false, data: null, error: "Failed to fetch activity stats", isConfigured: true };
    }
}
