/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";

export const getCategories = tool({
  description:
    "List all available categories on OpenResource with their resource counts. Use this when the user asks what categories are available, wants to browse by category, or when you need to know valid category names for filtering.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const categories = await db.category.findMany({
        select: {
          name: true,
          slug: true,
          _count: {
            select: {
              resources: {
                where: { status: "APPROVED" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return {
        categories: categories
          .filter((c) => c._count.resources > 0)
          .map((c) => ({
            name: c.name,
            slug: c.slug,
            resourceCount: c._count.resources,
          })),
      };
    } catch (error) {
      console.error("[Chat Tool] getCategories error:", error);
      return { error: "Failed to fetch categories." };
    }
  },
} as any);

export const getTags = tool({
  description:
    "List all available tags on OpenResource with resource counts. Use this when the user asks what tags exist, wants to browse by tag, or when you need valid tag names for filtering. Tags are user/metadata-assigned labels like 'music', 'privacy', 'offline', etc.",
  parameters: z.object({
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(30)
      .describe("Maximum number of tags to return (1-50)."),
  }),
  execute: async (args: { limit: number }) => {
    try {
      const resources = await db.resource.findMany({
        where: { status: "APPROVED" },
        select: { tags: true },
        take: 500,
      });

      const tagCounts = new Map<string, number>();
      for (const resource of resources) {
        for (const tag of resource.tags) {
          const normalized = tag.trim().toLowerCase();
          if (normalized) {
            tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
          }
        }
      }

      const tags = Array.from(tagCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, args.limit);

      return { tags };
    } catch (error) {
      console.error("[Chat Tool] getTags error:", error);
      return { error: "Failed to fetch tags." };
    }
  },
} as any);
