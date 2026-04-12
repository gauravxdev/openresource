"use server";

import { db } from "@/server/db";

export async function getDashboardStats() {
  try {
    const [
      totalUsers,
      totalResources,
      pendingSubmissions,
      totalPendingReports,
      recentResources,
      recentActivity,
    ] = await Promise.all([
      db.user.count(),
      db.resource.count({ where: { status: "APPROVED" } }),
      db.resource.count({ where: { status: "PENDING" } }),
      db.report.count({ where: { status: "PENDING" } }),
      db.resource.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      }),
      db.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalResources,
        pendingSubmissions,
        totalPendingReports,
        recentResources,
        recentActivity,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { success: false, data: null, error: "Failed to fetch stats" };
  }
}

export async function getAuditLogs(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      db.auditLog.count(),
    ]);

    return {
      success: true,
      data: {
        logs,
        metadata: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { success: false, data: null, error: "Failed to fetch logs" };
  }
}

export async function getLoginHistory(page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;

    // This query joins with User to get the email/name
    const [history, total] = await Promise.all([
      db.loginHistory.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      db.loginHistory.count(),
    ]);

    return {
      success: true,
      data: {
        history,
        metadata: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch login history:", error);
    return {
      success: false,
      data: null,
      error: "Failed to fetch login history",
    };
  }
}

export async function getRecentUsers(limit = 10) {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to fetch recent users:", error);
    return { success: false, data: null, error: "Failed to fetch users" };
  }
}
