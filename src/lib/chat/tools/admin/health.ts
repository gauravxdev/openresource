/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, logAdminToolAudit } from "./audit-helper";

export const getSystemHealth = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Get system health overview: database table counts, active sessions, recent errors in audit logs, rate limit usage, and platform status.",
    parameters: z.object({}),
        execute: async (_args: any) => {
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_VIEW_SYSTEM_HEALTH", adminUserId);

      try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
          totalUsers,
          activeSessions,
          expiredSessions,
          totalChats,
          totalMessages,
          totalResources,
          pendingResources,
          totalBookmarks,
          totalAuditLogs,
          todayAuditLogs,
          totalSearchUsageToday,
          totalFeedback,
          totalCategories,
          totalNewsletters,
        ] = await Promise.all([
          db.user.count(),
          db.session.count({
            where: { expiresAt: { gt: now } },
          }),
          db.session.count({
            where: { expiresAt: { lte: now } },
          }),
          db.chat.count(),
          db.chatMessage.count(),
          db.resource.count(),
          db.resource.count({ where: { status: "PENDING" } }),
          db.bookmark.count(),
          db.auditLog.count(),
          db.auditLog.count({
            where: { createdAt: { gte: oneDayAgo } },
          }),
          db.searchUsage.aggregate({
            where: { date: { gte: oneDayAgo } },
            _sum: { count: true },
          }),
          db.messageFeedback.count(),
          db.category.count(),
          db.newsletter.count(),
        ]);

        // Get recent admin actions (last 7 days)
        const recentAdminActions = await db.auditLog.count({
          where: {
            createdAt: { gte: sevenDaysAgo },
            action: { startsWith: "ADMIN_" },
          },
        });

        // Top 5 most active users by search usage in last 7 days
        const topSearchUsers = await db.searchUsage.groupBy({
          by: ["userId"],
          where: { date: { gte: sevenDaysAgo } },
          _sum: { count: true },
          orderBy: { _sum: { count: "desc" } },
          take: 5,
        });

        const topUsersDetails = await Promise.all(
          topSearchUsers.map(async (u) => {
            const user = await db.user.findUnique({
              where: { id: u.userId },
              select: { name: true, email: true, role: true },
            });
            return {
              name: user?.name ?? "Unknown",
              email: user?.email ?? "Unknown",
              role: user?.role ?? "Unknown",
              searchCount: u._sum.count ?? 0,
            };
          }),
        );

        // Check for stale sessions to clean up
        const staleSessionCount = await db.session.count({
          where: {
            expiresAt: { lte: now },
          },
        });

        return {
          database: {
            users: totalUsers,
            sessions: { active: activeSessions, expired: expiredSessions },
            chats: totalChats,
            messages: totalMessages,
            resources: {
              total: totalResources,
              pending: pendingResources,
              approved: totalResources - pendingResources,
            },
            bookmarks: totalBookmarks,
            categories: totalCategories,
            newsletters: totalNewsletters,
            auditLogs: totalAuditLogs,
            feedbackEntries: totalFeedback,
          },
          activity: {
            auditLogsLast24h: todayAuditLogs,
            adminActionsLast7d: recentAdminActions,
            searchesLast24h: totalSearchUsageToday._sum.count ?? 0,
          },
          maintenance: {
            staleSessions: staleSessionCount,
            cleanupNeeded: staleSessionCount > 100,
          },
          topSearchUsers7d: topUsersDetails,
          timestamp: now.toISOString(),
        };
      } catch (error) {
        console.error("[Admin Tool] getSystemHealth error:", error);
        return { error: "Failed to get system health" };
      }
    },
      } as any);
