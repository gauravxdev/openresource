/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

export const getResourcesByCategory = tool({
  description:
    "Get resources filtered by a specific category. Use this when the user clearly specifies a category (e.g. 'show me developer tools', 'list AI models', 'android apps'). Faster than searchResources when you already know the category.",
  parameters: z.object({
    categorySlug: z
      .string()
      .min(1)
      .describe(
        "The category slug or name (e.g. 'developer-tools', 'ai-models', 'android-apps').",
      ),
    sortBy: z
      .enum(["stars", "forks", "latest", "last-commit", "name"])
      .default("stars")
      .describe("Sort order for results."),
    limit: z
      .number()
      .min(1)
      .max(15)
      .default(10)
      .describe("Maximum number of results (1-15)."),
  }),
  execute: async (args: {
    categorySlug: string;
    sortBy: string;
    limit: number;
  }) => {
    try {
      const { categorySlug, sortBy, limit } = args;

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
        where: {
          status: "APPROVED",
          categories: {
            some: {
              OR: [
                {
                  slug: {
                    equals: categorySlug,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  name: {
                    equals: categorySlug,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          },
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
        orderBy,
        take: limit,
      });

      if (resources.length === 0) {
        return {
          found: 0,
          message: `No resources found in category "${categorySlug}". Use getCategories to see available categories.`,
          resources: [],
        };
      }

      return {
        found: resources.length,
        category: categorySlug,
        resources: resources.map((r) => ({
          name: r.name,
          slug: r.slug,
          description: r.shortDescription ?? r.oneLiner ?? "",
          url: r.websiteUrl ?? r.repositoryUrl,
          stars: r.stars,
          forks: r.forks,
          license: r.license,
          tags: r.tags,
          categories: r.categories.map((c) => c.name),
        })),
      };
    } catch (error) {
      console.error("[Chat Tool] getResourcesByCategory error:", error);
      return { error: "Failed to fetch resources by category." };
    }
  },
} as any);

export const getResourcesByTag = tool({
  description:
    "Get resources filtered by a specific tag. Use this when the user asks for resources with a specific tag (e.g. 'resources tagged privacy', 'show me offline apps'). Tags are descriptive labels like 'music', 'privacy', 'offline', 'self-hosted', etc.",
  parameters: z.object({
    tag: z
      .string()
      .min(1)
      .describe(
        "The tag to filter by (e.g. 'music', 'privacy', 'offline'). Case-insensitive.",
      ),
    sortBy: z
      .enum(["stars", "forks", "latest", "last-commit", "name"])
      .default("stars")
      .describe("Sort order for results."),
    limit: z
      .number()
      .min(1)
      .max(15)
      .default(10)
      .describe("Maximum number of results (1-15)."),
  }),
  execute: async (args: { tag: string; sortBy: string; limit: number }) => {
    try {
      const { tag, sortBy, limit } = args;
      const normalizedTag = tag.trim().toLowerCase();

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
        where: {
          status: "APPROVED",
          tags: { has: normalizedTag },
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
        orderBy,
        take: limit,
      });

      if (resources.length === 0) {
        return {
          found: 0,
          message: `No resources found with tag "${tag}". Use getTags to see available tags.`,
          resources: [],
        };
      }

      return {
        found: resources.length,
        tag: normalizedTag,
        resources: resources.map((r) => ({
          name: r.name,
          slug: r.slug,
          description: r.shortDescription ?? r.oneLiner ?? "",
          url: r.websiteUrl ?? r.repositoryUrl,
          stars: r.stars,
          forks: r.forks,
          license: r.license,
          tags: r.tags,
          categories: r.categories.map((c) => c.name),
        })),
      };
    } catch (error) {
      console.error("[Chat Tool] getResourcesByTag error:", error);
      return { error: "Failed to fetch resources by tag." };
    }
  },
} as any);
