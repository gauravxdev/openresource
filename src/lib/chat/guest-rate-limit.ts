import { db } from "@/server/db";
import { logAudit } from "@/lib/audit";

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export interface GuestRateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

export async function getClientIp(headers: Headers): Promise<string | null> {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",");
    return ips[0]?.trim() ?? null;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  return null;
}

export async function checkAndIncrementGuestChatUsage(
  ipAddress: string,
): Promise<GuestRateLimitResult> {
  const limit = 10;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOURS_24_MS);

  try {
    const existing = await db.guestUsage.findUnique({
      where: { ipAddress },
    });

    if (existing) {
      if (now.getTime() < existing.expiresAt.getTime()) {
        if (existing.chatCount >= limit) {
          void logAudit({
            action: "GUEST_CHAT_LIMIT_EXCEEDED",
            ipAddress,
            details: {
              chatCount: existing.chatCount,
              limit,
              expiresAt: existing.expiresAt,
            },
          });
          return {
            allowed: false,
            currentCount: existing.chatCount,
            limit,
            message: `Daily chat limit exceeded. You've used ${existing.chatCount}/${limit} chats today. Limit resets in ${Math.ceil((existing.expiresAt.getTime() - now.getTime()) / (1000 * 60))} minutes.`,
          };
        }
        const updated = await db.guestUsage.update({
          where: { ipAddress },
          data: {
            chatCount: { increment: 1 },
            expiresAt,
            updatedAt: now,
          },
        });
        return {
          allowed: true,
          currentCount: updated.chatCount,
          limit,
        };
      } else {
        const reset = await db.guestUsage.update({
          where: { ipAddress },
          data: {
            chatCount: 1,
            searchCount: 0,
            expiresAt,
            updatedAt: now,
          },
        });
        return {
          allowed: true,
          currentCount: reset.chatCount,
          limit,
        };
      }
    } else {
      const created = await db.guestUsage.create({
        data: {
          ipAddress,
          chatCount: 1,
          searchCount: 0,
          expiresAt,
        },
      });
      return {
        allowed: true,
        currentCount: created.chatCount,
        limit,
      };
    }
  } catch (error) {
    console.error("[Guest Chat Rate Limit] Error:", error);
    return {
      allowed: true,
      currentCount: 0,
      limit,
    };
  }
}

export async function checkAndIncrementGuestSearchUsage(
  ipAddress: string,
): Promise<GuestRateLimitResult> {
  const limit = 1;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOURS_24_MS);

  try {
    const existing = await db.guestUsage.findUnique({
      where: { ipAddress },
    });

    if (existing) {
      if (now.getTime() < existing.expiresAt.getTime()) {
        if (existing.searchCount >= limit) {
          void logAudit({
            action: "GUEST_SEARCH_LIMIT_EXCEEDED",
            ipAddress,
            details: {
              searchCount: existing.searchCount,
              limit,
              expiresAt: existing.expiresAt,
            },
          });
          return {
            allowed: false,
            currentCount: existing.searchCount,
            limit,
            message: `Daily web search limit exceeded. You've used ${existing.searchCount}/${limit} searches today. Limit resets in ${Math.ceil((existing.expiresAt.getTime() - now.getTime()) / (1000 * 60))} minutes.`,
          };
        }
        const updated = await db.guestUsage.update({
          where: { ipAddress },
          data: {
            searchCount: { increment: 1 },
            expiresAt,
            updatedAt: now,
          },
        });
        return {
          allowed: true,
          currentCount: updated.searchCount,
          limit,
        };
      } else {
        const reset = await db.guestUsage.update({
          where: { ipAddress },
          data: {
            chatCount: 0,
            searchCount: 1,
            expiresAt,
            updatedAt: now,
          },
        });
        return {
          allowed: true,
          currentCount: reset.searchCount,
          limit,
        };
      }
    } else {
      const created = await db.guestUsage.create({
        data: {
          ipAddress,
          chatCount: 0,
          searchCount: 1,
          expiresAt,
        },
      });
      return {
        allowed: true,
        currentCount: created.searchCount,
        limit,
      };
    }
  } catch (error) {
    console.error("[Guest Search Rate Limit] Error:", error);
    return {
      allowed: true,
      currentCount: 0,
      limit,
    };
  }
}

export async function getGuestUsageInfo(ipAddress: string): Promise<{
  chatCount: number;
  searchCount: number;
  expiresAt: Date | null;
} | null> {
  try {
    const existing = await db.guestUsage.findUnique({
      where: { ipAddress },
    });
    if (!existing) return null;
    const now = new Date();
    if (now.getTime() >= existing.expiresAt.getTime()) {
      return null;
    }
    return {
      chatCount: existing.chatCount,
      searchCount: existing.searchCount,
      expiresAt: existing.expiresAt,
    };
  } catch (error) {
    console.error("[Guest Usage Info] Error:", error);
    return null;
  }
}
