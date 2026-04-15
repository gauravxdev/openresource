import { db } from "@/server/db";
import { logAudit } from "@/lib/audit";

export type UserRole = "user" | "contributor" | "admin";

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

const SEARCH_LIMITS: Record<UserRole, number> = {
  user: 5,
  contributor: 10,
  admin: Infinity,
};

const CHAT_LIMITS: Record<UserRole, number> = {
  user: Infinity,
  contributor: Infinity,
  admin: Infinity,
};

export async function checkAndIncrementSearchUsage(
  userId: string,
  userRole: UserRole,
): Promise<RateLimitResult> {
  const limit = SEARCH_LIMITS[userRole];

  if (userRole === "admin") {
    return {
      allowed: true,
      currentCount: 0,
      limit: -1,
    };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOURS_24_MS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const usage = await db.searchUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        searchCount: { increment: 1 },
        expiresAt,
      },
      create: {
        userId,
        date: today,
        expiresAt,
        searchCount: 1,
        chatCount: 0,
      },
    });

    if (usage.searchCount > limit) {
      const expAt = usage.expiresAt ?? new Date(now.getTime() + HOURS_24_MS);
      const remainingMinutes = Math.ceil(
        (expAt.getTime() - now.getTime()) / (1000 * 60),
      );

      void logAudit({
        action: "USER_SEARCH_LIMIT_EXCEEDED",
        userId,
        details: {
          searchCount: usage.searchCount,
          limit,
          role: userRole,
        },
      });

      return {
        allowed: false,
        currentCount: usage.searchCount,
        limit,
        message: `Daily search limit exceeded. You've used ${usage.searchCount}/${limit} searches today. Limit resets in ${remainingMinutes} minutes.`,
      };
    }

    return {
      allowed: true,
      currentCount: usage.searchCount,
      limit,
    };
  } catch (error) {
    console.error("[Rate Limit] Error checking search usage:", error);
    return {
      allowed: true,
      currentCount: 0,
      limit,
    };
  }
}

export async function checkAndIncrementChatUsage(
  userId: string,
  userRole: UserRole,
): Promise<RateLimitResult> {
  const limit = CHAT_LIMITS[userRole];

  if (userRole === "admin") {
    return {
      allowed: true,
      currentCount: 0,
      limit: -1,
    };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOURS_24_MS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const usage = await db.searchUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        chatCount: { increment: 1 },
        expiresAt,
      },
      create: {
        userId,
        date: today,
        expiresAt,
        searchCount: 0,
        chatCount: 1,
      },
    });

    if (usage.chatCount > limit) {
      const expAt = usage.expiresAt ?? new Date(now.getTime() + HOURS_24_MS);
      const remainingMinutes = Math.ceil(
        (expAt.getTime() - now.getTime()) / (1000 * 60),
      );

      void logAudit({
        action: "USER_CHAT_LIMIT_EXCEEDED",
        userId,
        details: {
          chatCount: usage.chatCount,
          limit,
          role: userRole,
        },
      });

      return {
        allowed: false,
        currentCount: usage.chatCount,
        limit,
        message: `Daily chat limit exceeded. You've used ${usage.chatCount}/${limit} chats today. Limit resets in ${remainingMinutes} minutes.`,
      };
    }

    return {
      allowed: true,
      currentCount: usage.chatCount,
      limit,
    };
  } catch (error) {
    console.error("[Chat Rate Limit] Error:", error);
    return {
      allowed: true,
      currentCount: 0,
      limit,
    };
  }
}

export async function getUserUsageStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const usage = await db.searchUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!usage) {
      return {
        chatCount: 0,
        chatLimit: Infinity,
        searchCount: 0,
        searchLimit: 5,
      };
    }

    return {
      chatCount: usage.chatCount,
      chatLimit: CHAT_LIMITS.user,
      searchCount: usage.searchCount,
      searchLimit: SEARCH_LIMITS.user,
    };
  } catch (error) {
    console.error("[Usage Stats] Error:", error);
    return {
      chatCount: 0,
      chatLimit: Infinity,
      searchCount: 0,
      searchLimit: 5,
    };
  }
}
