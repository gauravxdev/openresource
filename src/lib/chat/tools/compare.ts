/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";

export const compareResources = tool({
  description:
    "Compare 2-3 resources side by side. Shows stats, features, categories, tags, and activity status for each. Use this when the user wants to compare tools, asks 'which is better', or wants a side-by-side comparison.",
  parameters: z.object({
    slugs: z
      .array(z.string())
      .min(2)
      .max(3)
      .describe(
        "Array of 2-3 resource slugs to compare (e.g. ['vlc-media-player', 'mpv']).",
      ),
  }),
  execute: async (args: { slugs: string[] }) => {
    try {
      const resources = await db.resource.findMany({
        where: {
          slug: { in: args.slugs },
          status: "APPROVED",
        },
        select: {
          slug: true,
          name: true,
          shortDescription: true,
          oneLiner: true,
          websiteUrl: true,
          repositoryUrl: true,
          alternative: true,
          stars: true,
          forks: true,
          lastCommit: true,
          repositoryCreatedAt: true,
          license: true,
          tags: true,
          builtWith: true,
          categories: { select: { name: true } },
        },
        take: 5,
      });

      if (resources.length < 2) {
        return {
          error: `Could not find enough resources to compare. Found ${resources.length} of ${args.slugs.length} requested. Check that the slugs are correct.`,
          found: resources.map((r) => r.slug),
        };
      }

      const now = new Date();

      return {
        comparison: resources.map((r) => {
          const daysSinceLastCommit = r.lastCommit
            ? Math.floor(
                (now.getTime() - r.lastCommit.getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : null;

          return {
            name: r.name,
            slug: r.slug,
            description: r.shortDescription ?? r.oneLiner ?? "",
            websiteUrl: r.websiteUrl,
            repositoryUrl: r.repositoryUrl,
            alternative: r.alternative,
            stars: r.stars,
            forks: r.forks,
            lastCommit: r.lastCommit?.toISOString().split("T")[0] ?? null,
            daysSinceLastCommit,
            activityStatus:
              daysSinceLastCommit === null
                ? "unknown"
                : daysSinceLastCommit <= 30
                  ? "active"
                  : daysSinceLastCommit <= 180
                    ? "low activity"
                    : "likely inactive",
            license: r.license,
            tags: r.tags,
            builtWith: r.builtWith,
            categories: r.categories.map((c) => c.name),
          };
        }),
      };
    } catch (error) {
      console.error("[Chat Tool] compareResources error:", error);
      return { error: "Failed to compare resources." };
    }
  },
} as any);
