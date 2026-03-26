/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const feedbackSchema = z.object({
  messageId: z.string().min(1),
  chatId: z.string().min(1),
  type: z.enum(["good", "bad"]),
});

export async function POST(request: Request) {
  try {
    // Auth check
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      console.log("[Feedback API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("[Feedback API] User ID:", userId);

    // Parse request body
    const body = await request.json();
    console.log("[Feedback API] Request body:", body);

    const result = feedbackSchema.safeParse(body);

    if (!result.success) {
      console.log("[Feedback API] Validation failed:", result.error.errors);
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.errors },
        { status: 400 },
      );
    }

    const { messageId, chatId, type } = result.data;
    console.log("[Feedback API] Saving feedback:", {
      messageId,
      chatId,
      type,
      userId,
    });

    // Upsert feedback (update if exists, create if not)
    const feedback = await db.messageFeedback.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        type,
      },
      create: {
        messageId,
        chatId,
        userId,
        type,
      },
    });

    console.log("[Feedback API] Feedback saved successfully:", feedback.id);

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        type: feedback.type,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error("[Feedback API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to save feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
