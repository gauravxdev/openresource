"use server";

import { db } from "@/server/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ResourceWithCategories } from "./resources";

export type BookmarkResource = ResourceWithCategories & {
  bookmarkedAt: Date;
};

export async function getUserBookmarks(): Promise<{
  success: boolean;
  data: BookmarkResource[];
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, data: [] };
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        resource: {
          include: {
            categories: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = bookmarks
      .filter((b) => b.resource?.status === "APPROVED")
      .map((b) => ({
        ...b.resource,
        bookmarkedAt: b.createdAt,
      })) as BookmarkResource[];

    return { success: true, data };
  } catch (error) {
    console.error("[Bookmarks] Get Error:", error);
    return { success: false, data: [] };
  }
}

export async function toggleBookmark(resourceId: string): Promise<{
  success: boolean;
  bookmarked: boolean;
  message?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        bookmarked: false,
        message: "Not authenticated",
      };
    }

    const existing = await db.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({
        where: { id: existing.id },
      });
      return { success: true, bookmarked: false };
    }

    await db.bookmark.create({
      data: {
        userId: session.user.id,
        resourceId,
      },
    });

    return { success: true, bookmarked: true };
  } catch (error) {
    console.error("[Bookmarks] Toggle Error:", error);
    return { success: false, bookmarked: false, message: "Server error" };
  }
}

export async function checkBookmarkStatus(resourceId: string): Promise<{
  success: boolean;
  bookmarked: boolean;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: true, bookmarked: false };
    }

    const existing = await db.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId,
        },
      },
    });

    return { success: true, bookmarked: !!existing };
  } catch (error) {
    console.error("[Bookmarks] Check Error:", error);
    return { success: false, bookmarked: false };
  }
}

export async function checkBookmarkStatusBatch(resourceIds: string[]): Promise<{
  success: boolean;
  bookmarkedIds: Set<string>;
}> {
  if (resourceIds.length === 0) {
    return { success: true, bookmarkedIds: new Set() };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: true, bookmarkedIds: new Set() };
    }

    const bookmarks = await db.bookmark.findMany({
      where: {
        userId: session.user.id,
        resourceId: { in: resourceIds },
      },
      select: { resourceId: true },
    });

    return {
      success: true,
      bookmarkedIds: new Set(bookmarks.map((b) => b.resourceId)),
    };
  } catch (error) {
    console.error("[Bookmarks] Batch Check Error:", error);
    return { success: false, bookmarkedIds: new Set() };
  }
}
