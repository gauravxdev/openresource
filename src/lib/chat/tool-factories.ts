/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import {
  checkAndIncrementSearchUsage,
  type UserRole,
} from "@/lib/chat/rate-limit";
import { checkAndIncrementGuestSearchUsage } from "@/lib/chat/guest-rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// Tool Factory: getUserBookmarks (with user context)
// ─────────────────────────────────────────────────────────────────────────────

export function createGetUserBookmarksTool(userId: string) {
  return tool({
    description:
      "Get the current user's bookmarked/saved resources. Use this when the user asks to see their bookmarks, saved resources, or favorites.",
    parameters: z.object({}),
    execute: async () => {
      try {
        const resources = await db.resource.findMany({
          where: {
            status: "APPROVED",
            bookmarks: {
              some: {
                userId: userId,
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
          orderBy: { name: "asc" },
          take: 50,
        });

        if (resources.length === 0) {
          return {
            found: 0,
            message:
              "No bookmarked resources found. You can bookmark resources from the resource detail pages.",
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Factory: searchResources (NO rate limiting - unlimited internal search)
// ─────────────────────────────────────────────────────────────────────────────

export function createSearchResourcesTool(
  userId: string,
  userRole: UserRole,
  originalTool: any,
) {
  return tool({
    description: originalTool.description,
    parameters: originalTool.parameters,
    execute: async (args: any) => {
      return originalTool.execute(args);
    },
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Factory: serperSearch (with rate limiting)
// ─────────────────────────────────────────────────────────────────────────────

export function createSerperSearchTool(
  userId: string,
  userRole: UserRole,
  originalTool: any,
  ipAddress?: string | null,
  isGuest = false,
) {
  return tool({
    description: originalTool.description,
    parameters: originalTool.parameters,
    execute: async (args: any) => {
      if (isGuest && ipAddress) {
        const rateLimitResult =
          await checkAndIncrementGuestSearchUsage(ipAddress);
        if (!rateLimitResult.allowed) {
          return {
            error: rateLimitResult.message,
          };
        }
      } else {
        const rateLimitResult = await checkAndIncrementSearchUsage(
          userId,
          userRole,
        );
        if (!rateLimitResult.allowed) {
          return {
            error: rateLimitResult.message,
          };
        }
      }

      return originalTool.execute(args);
    },
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Factory: exaSearch (with rate limiting)
// ─────────────────────────────────────────────────────────────────────────────

export function createExaSearchTool(
  userId: string,
  userRole: UserRole,
  originalTool: any,
  ipAddress?: string | null,
  isGuest = false,
) {
  return tool({
    description: originalTool.description,
    parameters: originalTool.parameters,
    execute: async (args: any) => {
      if (isGuest && ipAddress) {
        const rateLimitResult =
          await checkAndIncrementGuestSearchUsage(ipAddress);
        if (!rateLimitResult.allowed) {
          return {
            error: rateLimitResult.message,
          };
        }
      } else {
        const rateLimitResult = await checkAndIncrementSearchUsage(
          userId,
          userRole,
        );
        if (!rateLimitResult.allowed) {
          return {
            error: rateLimitResult.message,
          };
        }
      }

      return originalTool.execute(args);
    },
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Factory: tavilySearch (with rate limiting)
// ─────────────────────────────────────────────────────────────────────────────

export function createTavilySearchTool(
  userId: string,
  userRole: UserRole,
  originalTool: any,
  ipAddress?: string | null,
  isGuest = false,
) {
  return tool({
    description: originalTool.description,
    parameters: originalTool.parameters,
    execute: async (args: any) => {
      if (isGuest && ipAddress) {
        const rateLimitResult =
          await checkAndIncrementGuestSearchUsage(ipAddress);
        if (!rateLimitResult.allowed) {
          return {
            error: rateLimitResult.message,
          };
        }
      } else {
        const rateLimitResult = await checkAndIncrementSearchUsage(
          userId,
          userRole,
        );
        if (!rateLimitResult.allowed) {
          return {
            error: rateLimitResult.message,
          };
        }
      }

      return originalTool.execute(args);
    },
  } as any);
}
