import { withSentryConfig } from "@sentry/nextjs";
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  async rewrites() {
    // Skip PostHog proxy if environment variable is set (for build troubleshooting)
    if (process.env.SKIP_POSTHOG_PROXY === 'true') {
      return [];
    }

    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image-937.pages.dev",
      },
    ],
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(config, {
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
