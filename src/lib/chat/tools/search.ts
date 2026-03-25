/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

const searchResourcesParams = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Search text to match against resource name, description, and tags.",
    ),
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category name or slug (e.g. 'developer-tools', 'ai-models').",
    ),
  tag: z
    .string()
    .optional()
    .describe("Filter by tag (e.g. 'music', 'offline', 'privacy')."),
  sortBy: z
    .enum(["stars", "forks", "latest", "oldest", "last-commit", "name"])
    .default("stars")
    .describe("Sort order for results."),
  limit: z
    .number()
    .min(1)
    .max(15)
    .default(10)
    .describe("Maximum number of results to return (1-15)."),
});

export const searchResources = tool({
  description:
    "Search the OpenResource database for free and open-source tools, apps, and resources. Use this FIRST when a user is looking for a tool, app, or resource. Supports filtering by text query, category, and tag simultaneously. Returns approved resources sorted by relevance.",
  parameters: searchResourcesParams,
  execute: async (args: z.infer<typeof searchResourcesParams>) => {
    try {
      const { query, category, tag, sortBy, limit } = args;

      const where: Prisma.ResourceWhereInput = {
        status: "APPROVED",
      };

      const conditions: Prisma.ResourceWhereInput[] = [];

      if (query?.trim()) {
        conditions.push({
          OR: [
            {
              name: {
                contains: query.trim(),
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: query.trim(),
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              shortDescription: {
                contains: query.trim(),
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              oneLiner: {
                contains: query.trim(),
                mode: Prisma.QueryMode.insensitive,
              },
            },
            { tags: { hasSome: [query.trim().toLowerCase()] } },
          ],
        });
      }

      if (category?.trim()) {
        conditions.push({
          categories: {
            some: {
              OR: [
                {
                  name: {
                    equals: category.trim(),
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  slug: {
                    equals: category.trim(),
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          },
        });
      }

      if (tag?.trim()) {
        conditions.push({
          tags: { has: tag.trim().toLowerCase() },
        });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      let orderBy: Prisma.ResourceOrderByWithRelationInput;
      switch (sortBy) {
        case "stars":
          orderBy = { stars: "desc" };
          break;
        case "forks":
          orderBy = { forks: "desc" };
          break;
        case "latest":
          orderBy = { createdAt: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "last-commit":
          orderBy = { lastCommit: "desc" };
          break;
        case "name":
          orderBy = { name: "asc" };
          break;
        default:
          orderBy = { stars: "desc" };
      }

      const resources = await db.resource.findMany({
        where,
        select: {
          id: true,
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
          license: true,
          tags: true,
          logo: true,
          categories: {
            select: { name: true, slug: true },
          },
        },
        orderBy,
        take: limit,
      });

      if (resources.length === 0) {
        return {
          found: 0,
          message:
            "No resources found matching your criteria. Try broadening your search or using different keywords.",
          resources: [],
        };
      }

      return {
        found: resources.length,
        resources: resources.map((r) => ({
          name: r.name,
          slug: r.slug,
          description: r.shortDescription ?? r.oneLiner ?? "",
          url: r.websiteUrl ?? r.repositoryUrl,
          repositoryUrl: r.repositoryUrl,
          alternative: r.alternative,
          stars: r.stars,
          forks: r.forks,
          lastCommit: r.lastCommit?.toISOString().split("T")[0] ?? null,
          license: r.license,
          tags: r.tags,
          categories: r.categories.map((c) => c.name),
          detailPage: `/resource/${r.slug}`,
        })),
      };
    } catch (error) {
      console.error("[Chat Tool] searchResources error:", error);
      return { error: "Failed to search resources. Please try again." };
    }
  },
} as any);
