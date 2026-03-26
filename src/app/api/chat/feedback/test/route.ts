/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    // Check if message_feedback table exists and count records
    const count = await db.messageFeedback.count();

    // Get recent feedback
    const recentFeedback = await db.messageFeedback.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tableExists: true,
      totalFeedback: count,
      recentFeedback: recentFeedback.map((f) => ({
        id: f.id,
        type: f.type,
        messageId: f.messageId,
        chatId: f.chatId,
        createdAt: f.createdAt,
        user: f.user.name || f.user.email,
      })),
    });
  } catch (error) {
    console.error("[Feedback Test] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tableExists: false,
      },
      { status: 500 },
    );
  }
}
