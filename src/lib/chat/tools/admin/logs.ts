/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, logAdminToolAudit } from "./audit-helper";

// ─────────────────────────────────────────────────────────────────────────────
// searchAuditLogs
// ─────────────────────────────────────────────────────────────────────────────

const searchAuditLogsParams = z.object({
  action: z
    .string()
    .optional()
    .describe(
      "Filter by action type (e.g., LOGIN, UPDATE_USER_ROLE, APPROVE_RESOURCE)",
    ),
  userId: z.string().optional().describe("Filter by user ID"),
  days: z
    .number()
    .default(30)
    .describe("Number of days to look back (max 365)"),
  page: z.number().default(1).describe("Page number"),
  limit: z.number().default(20).describe("Results per page (max 50)"),
});

export const searchAuditLogs = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Search audit logs by action type, user ID, or date range. Returns paginated log entries with details.",
    parameters: searchAuditLogsParams,
    execute: async (args: z.infer<typeof searchAuditLogsParams>) => {
      requireAdmin(userRole);
      const { action, userId, days, page, limit } = args;
      await logAdminToolAudit("ADMIN_SEARCH_AUDIT_LOGS", adminUserId, {
        filterAction: action,
        filterUserId: userId,
      });

      try {
        const cappedLimit = Math.min(limit, 50);
        const cappedDays = Math.min(days, 365);
        const skip = (page - 1) * cappedLimit;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - cappedDays);

        const where: Record<string, unknown> = {
          createdAt: { gte: startDate },
        };
        if (action) where.action = action;
        if (userId) where.userId = userId;

        const [logs, total] = await Promise.all([
          db.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: cappedLimit,
          }),
          db.auditLog.count({ where }),
        ]);

        return {
          total,
          page,
          totalPages: Math.ceil(total / cappedLimit),
          period: `${cappedDays} days`,
          logs: logs.map((log) => ({
            id: log.id,
            action: log.action,
            userId: log.userId,
            resourceId: log.resourceId,
            details: log.details,
            createdAt: log.createdAt,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] searchAuditLogs error:", error);
        return { error: "Failed to search audit logs" };
      }
    },
      } as any);

// ─────────────────────────────────────────────────────────────────────────────
// getRecentActivity
// ─────────────────────────────────────────────────────────────────────────────

const getRecentActivityParams = z.object({
  limit: z
    .number()
    .default(15)
    .describe("Number of entries to return (max 50)"),
});

export const getRecentActivity = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Get the most recent system activity/audit log entries. Useful for a quick overview of what's been happening.",
    parameters: getRecentActivityParams,
    execute: async (args: z.infer<typeof getRecentActivityParams>) => {
      requireAdmin(userRole);
      const { limit } = args;
      await logAdminToolAudit("ADMIN_VIEW_RECENT_ACTIVITY", adminUserId);

      try {
        const cappedLimit = Math.min(limit, 50);

        const logs = await db.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: cappedLimit,
        });

        return {
          count: logs.length,
          activity: logs.map((log) => ({
            id: log.id,
            action: log.action,
            userId: log.userId,
            resourceId: log.resourceId,
            details: log.details,
            timestamp: log.createdAt,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] getRecentActivity error:", error);
        return { error: "Failed to get recent activity" };
      }
    },
      } as any);
