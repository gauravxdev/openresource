/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";

export const getUserBookmarks = tool({
  description:
    "Get the current user's bookmarked/saved resources. Use this when the user asks to see their bookmarks, saved resources, or favorites.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const resources = await db.resource.findMany({
        where: {
          status: "APPROVED",
          bookmarks: { some: {} },
        },
        select: {
          slug: true,
          name: true,
          shortDescription: true,
          oneLiner: true,
          websiteUrl: true,
          repositoryUrl: true,
          stars: true,
          forks: true,
          license: true,
          tags: true,
          categories: { select: { name: true, slug: true } },
        },
        orderBy: { name: "asc" },
        take: 50,
      });

      if (resources.length === 0) {
        return {
          found: 0,
          message:
            "No bookmarked resources found. Users can bookmark resources from the resource detail pages.",
          resources: [],
        };
      }

      return {
        found: resources.length,
        resources: resources.map((r) => ({
          name: r.name,
          slug: r.slug,
          description: r.shortDescription ?? r.oneLiner ?? "",
          url: `/resource/${r.slug}`,
          stars: r.stars,
          forks: r.forks,
          license: r.license,
          tags: r.tags,
          categories: r.categories.map((c) => c.name),
        })),
      };
    } catch (error) {
      console.error("[Chat Tool] getUserBookmarks error:", error);
      return { error: "Failed to fetch bookmarks." };
    }
  },
} as any);
