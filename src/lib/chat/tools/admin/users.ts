/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, logAdminToolAudit } from "./audit-helper";

// ─────────────────────────────────────────────────────────────────────────────
// searchUsers
// ─────────────────────────────────────────────────────────────────────────────

const searchUsersParams = z.object({
  query: z
    .string()
    .optional()
    .describe("Search by email or name (partial match)"),
  role: z
    .enum(["user", "contributor", "admin", "all"])
    .default("all")
    .describe("Filter by user role"),
  status: z
    .enum(["ACTIVE", "RESTRICTED", "BANNED", "all"])
    .default("all")
    .describe("Filter by user status"),
  page: z.number().default(1).describe("Page number"),
  limit: z.number().default(20).describe("Results per page (max 50)"),
});

export function createSearchUsersTool(adminUserId: string, userRole: string) {
  return tool({
    description:
      "Search and filter users by email, name, role, or status. Returns paginated results. Use this to find specific users or list users by criteria.",
    parameters: searchUsersParams,
    execute: async (args: z.infer<typeof searchUsersParams>) => {
      const { query, role, status, page, limit } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_SEARCH_USERS", adminUserId, {
        query,
        role,
        status,
      });

      try {
        const cappedLimit = Math.min(limit, 50);
        const skip = (page - 1) * cappedLimit;

        const where: any = {};
        if (query) {
          where.OR = [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ];
        }
        if (role !== "all") where.role = role;
        if (status !== "all") where.status = status;

        const [users, total] = await Promise.all([
          db.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: cappedLimit,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              lastLoginAt: true,
              _count: {
                select: {
                  chats: true,
                  bookmarks: true,
                  resources: true,
                  searchUsage: true,
                },
              },
            },
          }),
          db.user.count({ where }),
        ]);

        return {
          total,
          page,
          totalPages: Math.ceil(total / cappedLimit),
          users: users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            emailVerified: u.emailVerified,
            createdAt: u.createdAt,
            lastLoginAt: u.lastLoginAt,
            stats: {
              chats: u._count.chats,
              bookmarks: u._count.bookmarks,
              resources: u._count.resources,
              searchUsage: u._count.searchUsage,
            },
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] searchUsers error:", error);
        return { error: "Failed to search users" };
      }
    },
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserDetails
// ─────────────────────────────────────────────────────────────────────────────

const getUserDetailsParams = z.object({
  userId: z.string().describe("The user ID to look up"),
});

export function createGetUserDetailsTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Get detailed information about a specific user including their sessions, login history, chats, bookmarks, and activity stats.",
    parameters: getUserDetailsParams,
    execute: async (args: z.infer<typeof getUserDetailsParams>) => {
      const { userId } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_VIEW_USER_DETAILS", adminUserId, {
        targetUserId: userId,
      });

      try {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            sessions: {
              orderBy: { createdAt: "desc" },
              take: 5,
              select: {
                id: true,
                ipAddress: true,
                userAgent: true,
                createdAt: true,
                expiresAt: true,
              },
            },
            loginHistory: {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: {
                ipAddress: true,
                userAgent: true,
                createdAt: true,
              },
            },
            chats: {
              orderBy: { updatedAt: "desc" },
              take: 10,
              select: {
                id: true,
                title: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
              },
            },
            bookmarks: {
              take: 10,
              orderBy: { createdAt: "desc" },
              select: {
                resource: {
                  select: { name: true, slug: true, status: true },
                },
                createdAt: true,
              },
            },
            _count: {
              select: {
                chats: true,
                bookmarks: true,
                resources: true,
                sessions: true,
                loginHistory: true,
                searchUsage: true,
              },
            },
          },
        });

        if (!user) {
          return { error: "User not found" };
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsage = await db.searchUsage.findMany({
          where: { userId, date: { gte: sevenDaysAgo } },
          orderBy: { date: "desc" },
          select: { date: true, count: true },
        });

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          },
          stats: {
            totalChats: user._count.chats,
            totalBookmarks: user._count.bookmarks,
            totalResources: user._count.resources,
            totalSessions: user._count.sessions,
            totalLogins: user._count.loginHistory,
            totalSearchUsage: user._count.searchUsage,
          },
          recentSessions: user.sessions,
          recentLogins: user.loginHistory,
          recentChats: user.chats.map((c) => ({
            id: c.id,
            title: c.title,
            visibility: c.visibility,
            messageCount: c._count.messages,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
          recentBookmarks: user.bookmarks.map((b) => ({
            resourceName: b.resource.name,
            resourceSlug: b.resource.slug,
            resourceStatus: b.resource.status,
            bookmarkedAt: b.createdAt,
          })),
          searchUsageLast7Days: recentUsage.map((u) => ({
            date: u.date.toISOString().split("T")[0],
            count: u.count,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] getUserDetails error:", error);
        return { error: "Failed to get user details" };
      }
    },
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateUserRoleTool
// ─────────────────────────────────────────────────────────────────────────────

const updateUserRoleParams = z.object({
  userId: z.string().describe("The user ID to update"),
  newRole: z
    .enum(["user", "contributor", "admin"])
    .describe("The new role to assign"),
});

export function createUpdateUserRoleTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Change a user's role. Roles: 'user' (default), 'contributor' (can access dashboard), 'admin' (full access). Use with caution — admin role grants full system access.",
    parameters: updateUserRoleParams,
    execute: async (args: z.infer<typeof updateUserRoleParams>) => {
      const { userId, newRole } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_UPDATE_USER_ROLE", adminUserId, {
        targetUserId: userId,
        newRole,
      });

      try {
        const existingUser = await db.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, role: true },
        });

        if (!existingUser) {
          return { error: "User not found" };
        }

        await db.user.update({
          where: { id: userId },
          data: { role: newRole },
        });

        return {
          success: true,
          message: `User "${existingUser.name ?? existingUser.email}" role changed from '${existingUser.role}' to '${newRole}'`,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            previousRole: existingUser.role,
            newRole,
          },
        };
      } catch (error) {
        console.error("[Admin Tool] updateUserRole error:", error);
        return { error: "Failed to update user role" };
      }
    },
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateUserStatusTool
// ─────────────────────────────────────────────────────────────────────────────

const updateUserStatusParams = z.object({
  userId: z.string().describe("The user ID to update"),
  newStatus: z
    .enum(["ACTIVE", "RESTRICTED", "BANNED"])
    .describe("The new status to set"),
});

export function createUpdateUserStatusTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Change a user's status. Use to ban (BANNED), restrict (RESTRICTED), or reactivate (ACTIVE) a user account.",
    parameters: updateUserStatusParams,
    execute: async (args: z.infer<typeof updateUserStatusParams>) => {
      const { userId, newStatus } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_UPDATE_USER_STATUS", adminUserId, {
        targetUserId: userId,
        newStatus,
      });

      try {
        const existingUser = await db.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, status: true },
        });

        if (!existingUser) {
          return { error: "User not found" };
        }

        await db.user.update({
          where: { id: userId },
          data: { status: newStatus },
        });

        if (newStatus === "BANNED") {
          await db.session.deleteMany({ where: { userId } });
        }

        return {
          success: true,
          message: `User "${existingUser.name ?? existingUser.email}" status changed from '${existingUser.status}' to '${newStatus}'${newStatus === "BANNED" ? " (all sessions invalidated)" : ""}`,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            previousStatus: existingUser.status,
            newStatus,
          },
        };
      } catch (error) {
        console.error("[Admin Tool] updateUserStatus error:", error);
        return { error: "Failed to update user status" };
      }
    },
  } as any);
}
