import { db } from "@/server/db";

export type UserRole = "user" | "contributor" | "admin";

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

const DAILY_LIMITS: Record<UserRole, number> = {
  user: 5,
  contributor: 10,
  admin: Infinity,
};

export async function checkAndIncrementSearchUsage(
  userId: string,
  userRole: UserRole,
): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[userRole];

  // Admin has no limits
  if (userRole === "admin") {
    return {
      allowed: true,
      currentCount: 0,
      limit: -1,
    };
  }

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get or create today's usage record
    const usage = await db.searchUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        count: 1,
      },
    });

    // Check if limit exceeded
    if (usage.count > limit) {
      return {
        allowed: false,
        currentCount: usage.count,
        limit,
        message: `Daily search limit exceeded. You've used ${usage.count}/${limit} searches today. Limit resets at midnight.`,
      };
    }

    return {
      allowed: true,
      currentCount: usage.count,
      limit,
    };
  } catch (error) {
    console.error("[Rate Limit] Error checking search usage:", error);
    // Allow search on error to avoid blocking users
    return {
      allowed: true,
      currentCount: 0,
      limit,
    };
  }
}
