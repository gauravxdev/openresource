/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/server/db";
import {
  extractToolNames,
  calculateSatisfactionRate,
  formatMessagePreview,
  getToolDisplayName,
} from "@/lib/chat/feedback-utils";

export interface FeedbackByTool {
  toolName: string;
  toolDisplayName: string;
  goodCount: number;
  badCount: number;
  totalCount: number;
  satisfactionRate: number;
}

export interface FeedbackOverTime {
  date: string;
  goodCount: number;
  badCount: number;
  totalCount: number;
}

export interface RecentFeedback {
  id: string;
  type: string;
  messagePreview: string;
  toolName: string;
  toolDisplayName: string;
  createdAt: Date;
  userName: string | null;
}

export interface FeedbackSummary {
  totalFeedback: number;
  goodFeedback: number;
  badFeedback: number;
  overallSatisfactionRate: number;
  bestTool: string | null;
  bestToolRate: number;
  worstTool: string | null;
  worstToolRate: number;
}

/**
 * Get feedback statistics grouped by tool
 */
export async function getFeedbackByTool(): Promise<FeedbackByTool[]> {
  try {
    // Get all feedback with associated messages
    const feedbackWithMessages = await db.messageFeedback.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1000, // Limit to last 1000 feedback entries
    });

    // Get message parts for each feedback
    const toolFeedbackMap = new Map<string, { good: number; bad: number }>();

    for (const feedback of feedbackWithMessages) {
      // Get the message to extract tool names
      const message = await db.chatMessage.findUnique({
        where: { id: feedback.messageId },
        select: { parts: true },
      });

      if (!message) continue;

      const toolNames = extractToolNames(message.parts as any[]);

      for (const toolName of toolNames) {
        const current = toolFeedbackMap.get(toolName) ?? { good: 0, bad: 0 };

        if (feedback.type === "good") {
          current.good += 1;
        } else {
          current.bad += 1;
        }

        toolFeedbackMap.set(toolName, current);
      }
    }

    // Convert to array and calculate satisfaction rates
    const result: FeedbackByTool[] = [];

    for (const [toolName, counts] of toolFeedbackMap.entries()) {
      result.push({
        toolName,
        toolDisplayName: getToolDisplayName(toolName),
        goodCount: counts.good,
        badCount: counts.bad,
        totalCount: counts.good + counts.bad,
        satisfactionRate: calculateSatisfactionRate(counts.good, counts.bad),
      });
    }

    // Sort by total count descending
    return result.sort((a, b) => b.totalCount - a.totalCount);
  } catch (error) {
    console.error("[Feedback Stats] Error getting feedback by tool:", error);
    return [];
  }
}

/**
 * Get feedback statistics over time (last 30 days)
 */
export async function getFeedbackOverTime(): Promise<FeedbackOverTime[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const feedback = await db.messageFeedback.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const dateMap = new Map<string, { good: number; bad: number }>();

    for (const entry of feedback) {
      const dateStr = entry.createdAt.toISOString().split("T")[0];
      if (!dateStr) continue;

      const current = dateMap.get(dateStr) ?? { good: 0, bad: 0 };

      if (entry.type === "good") {
        current.good += 1;
      } else {
        current.bad += 1;
      }

      dateMap.set(dateStr, current);
    }

    // Convert to array
    const result: FeedbackOverTime[] = [];

    for (const [date, counts] of dateMap.entries()) {
      result.push({
        date,
        goodCount: counts.good,
        badCount: counts.bad,
        totalCount: counts.good + counts.bad,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("[Feedback Stats] Error getting feedback over time:", error);
    return [];
  }
}

/**
 * Get recent feedback entries
 */
export async function getRecentFeedback(): Promise<RecentFeedback[]> {
  try {
    const feedback = await db.messageFeedback.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const result: RecentFeedback[] = [];

    for (const entry of feedback) {
      // Get the message to extract tool name and preview
      const message = await db.chatMessage.findUnique({
        where: { id: entry.messageId },
        select: { parts: true },
      });

      const toolNames = message ? extractToolNames(message.parts as any[]) : [];
      const toolName = toolNames[0] ?? "unknown";
      const messagePreview = message
        ? formatMessagePreview(message.parts as any[])
        : "Message not found";

      result.push({
        id: entry.id,
        type: entry.type,
        messagePreview,
        toolName,
        toolDisplayName: getToolDisplayName(toolName),
        createdAt: entry.createdAt,
        userName: entry.user.name,
      });
    }

    return result;
  } catch (error) {
    console.error("[Feedback Stats] Error getting recent feedback:", error);
    return [];
  }
}

/**
 * Get overall feedback summary
 */
export async function getFeedbackSummary(): Promise<FeedbackSummary> {
  try {
    const [totalCount, goodCount, badCount, feedbackByTool] = await Promise.all(
      [
        db.messageFeedback.count(),
        db.messageFeedback.count({ where: { type: "good" } }),
        db.messageFeedback.count({ where: { type: "bad" } }),
        getFeedbackByTool(),
      ],
    );

    const overallSatisfactionRate = calculateSatisfactionRate(
      goodCount,
      badCount,
    );

    // Find best and worst tools
    let bestTool: string | null = null;
    let bestToolRate = 0;
    let worstTool: string | null = null;
    let worstToolRate = 100;

    for (const tool of feedbackByTool) {
      if (tool.totalCount >= 5) {
        // Only consider tools with at least 5 feedbacks
        if (tool.satisfactionRate > bestToolRate) {
          bestTool = tool.toolDisplayName;
          bestToolRate = tool.satisfactionRate;
        }
        if (tool.satisfactionRate < worstToolRate) {
          worstTool = tool.toolDisplayName;
          worstToolRate = tool.satisfactionRate;
        }
      }
    }

    return {
      totalFeedback: totalCount,
      goodFeedback: goodCount,
      badFeedback: badCount,
      overallSatisfactionRate,
      bestTool,
      bestToolRate,
      worstTool,
      worstToolRate,
    };
  } catch (error) {
    console.error("[Feedback Stats] Error getting feedback summary:", error);
    return {
      totalFeedback: 0,
      goodFeedback: 0,
      badFeedback: 0,
      overallSatisfactionRate: 0,
      bestTool: null,
      bestToolRate: 0,
      worstTool: null,
      worstToolRate: 0,
    };
  }
}

/**
 * Get tool performance context for AI system prompt
 */
export async function getToolPerformanceContext(): Promise<string> {
  try {
    const feedbackByTool = await getFeedbackByTool();

    if (feedbackByTool.length === 0) {
      return "";
    }

    // Only include tools with at least 3 feedback entries for meaningful insights
    const significantTools = feedbackByTool.filter(
      (tool) => tool.totalCount >= 3,
    );

    if (significantTools.length === 0) {
      return "";
    }

    // Sort by satisfaction rate (best to worst)
    const sortedTools = [...significantTools].sort(
      (a, b) => b.satisfactionRate - a.satisfactionRate,
    );

    // Build context string
    const lines: string[] = [
      "# Tool Performance Context",
      "Based on user feedback, here's how each tool has performed:",
      "",
    ];

    for (const tool of sortedTools) {
      let recommendation = "";
      if (tool.satisfactionRate >= 80) {
        recommendation = "use confidently";
      } else if (tool.satisfactionRate >= 60) {
        recommendation = "use normally";
      } else if (tool.satisfactionRate >= 40) {
        recommendation = "use cautiously, prefer alternatives when possible";
      } else {
        recommendation = "avoid if possible, use alternatives instead";
      }

      lines.push(
        `- ${tool.toolDisplayName}: ${tool.satisfactionRate}% satisfaction (${tool.totalCount} feedbacks) - ${recommendation}`,
      );
    }

    lines.push("");
    lines.push(
      "Use this information to make better tool selection decisions. Prefer tools with higher satisfaction rates.",
    );

    return lines.join("\n");
  } catch (error) {
    console.error(
      "[Feedback Stats] Error getting tool performance context:",
      error,
    );
    return "";
  }
}
