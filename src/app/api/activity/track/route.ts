import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ tracked: false }, { status: 401 });
    }

    const userId = session.user.id;

    // Get today's UTC date boundaries
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Check if already tracked today
    const existing = await db.loginHistory.findFirst({
      where: {
        userId,
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ tracked: false, reason: "already_recorded" });
    }

    // Extract IP address and user agent from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent") ?? null;

    // Record today's activity
    await db.loginHistory.create({
      data: { userId, ipAddress, userAgent },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("[Activity Track] Failed:", error);
    return NextResponse.json({ tracked: false }, { status: 500 });
  }
}
