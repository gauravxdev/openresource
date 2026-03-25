/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";

export const getResourceDetails = tool({
  description:
    "Get detailed information about a specific resource by its slug. Use this when the user asks about a specific tool/resource, wants more info on a search result, or needs the full description, GitHub stats, tags, and links.",
  parameters: z.object({
    slug: z
      .string()
      .min(1)
      .describe("The resource slug (e.g. 'vlc-media-player', 'react')."),
  }),
  execute: async (args: { slug: string }) => {
    try {
      const resource = await db.resource.findUnique({
        where: { slug: args.slug, status: "APPROVED" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
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
          logo: true,
          image: true,
          createdAt: true,
          categories: {
            select: { name: true, slug: true },
          },
        },
      });

      if (!resource) {
        return {
          error: `Resource with slug "${args.slug}" not found. It may not exist or may not be approved yet.`,
        };
      }

      const now = new Date();
      const daysSinceLastCommit = resource.lastCommit
        ? Math.floor(
            (now.getTime() - resource.lastCommit.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      const repoAgeDays = resource.repositoryCreatedAt
        ? Math.floor(
            (now.getTime() - resource.repositoryCreatedAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      return {
        name: resource.name,
        slug: resource.slug,
        description: resource.description,
        shortDescription: resource.shortDescription,
        oneLiner: resource.oneLiner,
        websiteUrl: resource.websiteUrl,
        repositoryUrl: resource.repositoryUrl,
        alternative: resource.alternative,
        stars: resource.stars,
        forks: resource.forks,
        lastCommit: resource.lastCommit?.toISOString().split("T")[0] ?? null,
        daysSinceLastCommit,
        activityStatus:
          daysSinceLastCommit === null
            ? "unknown"
            : daysSinceLastCommit <= 30
              ? "actively maintained"
              : daysSinceLastCommit <= 180
                ? "recently active"
                : "potentially inactive",
        repositoryCreatedAt:
          resource.repositoryCreatedAt?.toISOString().split("T")[0] ?? null,
        repoAgeDays,
        license: resource.license,
        tags: resource.tags,
        builtWith: resource.builtWith,
        categories: resource.categories.map((c) => c.name),
        detailPageUrl: `/resource/${resource.slug}`,
      };
    } catch (error) {
      console.error("[Chat Tool] getResourceDetails error:", error);
      return { error: "Failed to fetch resource details." };
    }
  },
} as any);
