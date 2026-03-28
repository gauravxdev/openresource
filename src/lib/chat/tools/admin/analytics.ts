/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, logAdminToolAudit } from "./audit-helper";

// ─────────────────────────────────────────────────────────────────────────────
// getDashboardStats
// ─────────────────────────────────────────────────────────────────────────────

export const getDashboardStats = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Get overall platform statistics: total users, resources (approved/pending/rejected), chats, bookmarks, recent signups, and recent activity.",
    parameters: z.object({}),
        execute: async (_args: any) => {
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_VIEW_DASHBOARD_STATS", adminUserId);

      try {
        const [
          totalUsers,
          usersByRole,
          usersByStatus,
          totalResources,
          resourcesByStatus,
          totalChats,
          totalBookmarks,
          totalMessages,
          recentUsers,
          recentResources,
          recentActivity,
        ] = await Promise.all([
          db.user.count(),
          db.user.groupBy({
            by: ["role"],
            _count: true,
          }),
          db.user.groupBy({
            by: ["status"],
            _count: true,
          }),
          db.resource.count(),
          db.resource.groupBy({
            by: ["status"],
            _count: true,
          }),
          db.chat.count(),
          db.bookmark.count(),
          db.chatMessage.count(),
          db.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          }),
          db.resource.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              name: true,
              slug: true,
              status: true,
              createdAt: true,
            },
          }),
          db.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              action: true,
              userId: true,
              createdAt: true,
              details: true,
            },
          }),
        ]);

        return {
          users: {
            total: totalUsers,
            byRole: Object.fromEntries(
              usersByRole.map((r) => [r.role, r._count]),
            ),
            byStatus: Object.fromEntries(
              usersByStatus.map((s) => [s.status, s._count]),
            ),
          },
          resources: {
            total: totalResources,
            byStatus: Object.fromEntries(
              resourcesByStatus.map((s) => [s.status, s._count]),
            ),
          },
          engagement: {
            totalChats,
            totalBookmarks,
            totalMessages,
          },
          recentSignups: recentUsers.map((u) => ({
            name: u.name,
            email: u.email,
            role: u.role,
            joinedAt: u.createdAt,
          })),
          recentResources: recentResources.map((r) => ({
            name: r.name,
            slug: r.slug,
            status: r.status,
            createdAt: r.createdAt,
          })),
          recentActivity: recentActivity.map((a) => ({
            action: a.action,
            userId: a.userId,
            timestamp: a.createdAt,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] getDashboardStats error:", error);
        return { error: "Failed to get dashboard stats" };
      }
    },
  } as any);

// ─────────────────────────────────────────────────────────────────────────────
// getUsageStats
// ─────────────────────────────────────────────────────────────────────────────

const getUsageStatsParams = z.object({
  days: z.number().default(7).describe("Number of days to look back (max 90)"),
});

export const getUsageStats = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Get search/tool usage statistics for a date range. Shows daily usage breakdown, top users, and total counts.",
    parameters: getUsageStatsParams,
    execute: async (args: z.infer<typeof getUsageStatsParams>) => {
      requireAdmin(userRole);
      const { days } = args;
      await logAdminToolAudit("ADMIN_VIEW_USAGE_STATS", adminUserId, { days });

      try {
        const cappedDays = Math.min(days, 90);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - cappedDays);
        startDate.setHours(0, 0, 0, 0);

        const [usageRecords, totalSearches, topUsers] = await Promise.all([
          db.searchUsage.findMany({
            where: { date: { gte: startDate } },
            orderBy: { date: "desc" },
            select: {
              date: true,
              count: true,
              user: {
                select: { name: true, email: true, role: true },
              },
            },
          }),
          db.searchUsage.aggregate({
            where: { date: { gte: startDate } },
            _sum: { count: true },
          }),
          db.searchUsage.groupBy({
            by: ["userId"],
            where: { date: { gte: startDate } },
            _sum: { count: true },
            orderBy: { _sum: { count: "desc" } },
            take: 10,
          }),
        ]);

        const dailyMap = new Map<string, number>();
        for (const record of usageRecords) {
          const dateStr = record.date.toISOString().split("T")[0] ?? "";
          dailyMap.set(dateStr, (dailyMap.get(dateStr) ?? 0) + record.count);
        }

        const topUserDetails = await Promise.all(
          topUsers.map(async (u) => {
            const user = await db.user.findUnique({
              where: { id: u.userId },
              select: { name: true, email: true, role: true },
            });
            return {
              name: user?.name,
              email: user?.email,
              role: user?.role,
              totalSearches: u._sum.count ?? 0,
            };
          }),
        );

        return {
          period: `${cappedDays} days`,
          totalSearches: totalSearches._sum.count ?? 0,
          dailyUsage: Array.from(dailyMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => b.date.localeCompare(a.date)),
          topUsers: topUserDetails,
        };
      } catch (error) {
        console.error("[Admin Tool] getUsageStats error:", error);
        return { error: "Failed to get usage stats" };
      }
    },
  } as any);

// ─────────────────────────────────────────────────────────────────────────────
// getFeedbackStats
// ─────────────────────────────────────────────────────────────────────────────

export const getFeedbackStats = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Get AI feedback statistics: overall satisfaction rate, feedback by tool, best/worst performing tools, and feedback trends.",
    parameters: z.object({}),
        execute: async (_args: any) => {
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_VIEW_FEEDBACK_STATS", adminUserId);

      try {
        const [totalFeedback, goodCount, badCount] = await Promise.all([
          db.messageFeedback.count(),
          db.messageFeedback.count({ where: { type: "good" } }),
          db.messageFeedback.count({ where: { type: "bad" } }),
        ]);

        const satisfactionRate =
          totalFeedback > 0 ? Math.round((goodCount / totalFeedback) * 100) : 0;

        const recentFeedback = await db.messageFeedback.findMany({
          take: 20,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentFeedbackAll = await db.messageFeedback.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { type: true, createdAt: true },
        });

        const dailyMap = new Map<string, { good: number; bad: number }>();
        for (const fb of recentFeedbackAll) {
          const dateStr = fb.createdAt.toISOString().split("T")[0] ?? "";
          const current = dailyMap.get(dateStr) ?? { good: 0, bad: 0 };
          if (fb.type === "good") current.good++;
          else current.bad++;
          dailyMap.set(dateStr, current);
        }

        return {
          summary: {
            totalFeedback,
            goodFeedback: goodCount,
            badFeedback: badCount,
            satisfactionRate: `${satisfactionRate}%`,
          },
          recentFeedback: recentFeedback.map((f) => ({
            id: f.id,
            type: f.type,
            userName: f.user.name,
            createdAt: f.createdAt,
          })),
          dailyBreakdown: Array.from(dailyMap.entries())
            .map(([date, counts]) => ({
              date,
              good: counts.good,
              bad: counts.bad,
              total: counts.good + counts.bad,
            }))
            .sort((a, b) => b.date.localeCompare(a.date)),
        };
      } catch (error) {
        console.error("[Admin Tool] getFeedbackStats error:", error);
        return { error: "Failed to get feedback stats" };
      }
    },
      } as any);
