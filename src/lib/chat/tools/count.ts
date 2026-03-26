/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";

const getTotalCountParams = z.object({});

export const getTotalCount = tool({
  description:
    "Get the exact count of approved resources in the database. Use this when users ask 'how many resources do you have?', 'how many resources are available?', 'what is the total count?', or similar questions about resource quantities. Always returns accurate count.",
  parameters: getTotalCountParams,
  execute: async () => {
    try {
      // Count database resources (APPROVED only)
      const resourceCount = await db.resource.count({
        where: { status: "APPROVED" },
      });

      return {
        count: resourceCount,
        message: `There are ${resourceCount} approved resources in the database.`,
      };
    } catch (error) {
      console.error("[Chat Tool] getTotalCount error:", error);
      return {
        error: "Failed to get resource count. Please try again.",
        count: 0,
        message: "Unable to retrieve resource count at this time.",
      };
    }
  },
} as any);
