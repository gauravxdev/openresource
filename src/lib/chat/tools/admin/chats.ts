/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, logAdminToolAudit } from "./audit-helper";

// ─────────────────────────────────────────────────────────────────────────────
// searchChatsAdmin
// ─────────────────────────────────────────────────────────────────────────────

const searchChatsAdminParams = z.object({
  query: z.string().optional().describe("Search by chat title (partial match)"),
  userId: z.string().optional().describe("Filter by specific user ID"),
  visibility: z
    .enum(["private", "public", "all"])
    .default("all")
    .describe("Filter by visibility"),
  page: z.number().default(1).describe("Page number"),
  limit: z.number().default(20).describe("Results per page (max 50)"),
});

export const searchChatsAdmin = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Search all user chats by title, user ID, or visibility. Shows message counts and metadata. Use for moderation or investigation.",
    parameters: searchChatsAdminParams,
    execute: async (args: z.infer<typeof searchChatsAdminParams>) => {
      requireAdmin(userRole);
      const { query, userId, visibility, page, limit } = args;
      await logAdminToolAudit("ADMIN_SEARCH_CHATS", adminUserId, {
        query,
        filterUserId: userId,
        visibility,
      });

      try {
        const cappedLimit = Math.min(limit, 50);
        const skip = (page - 1) * cappedLimit;

        const where: Record<string, unknown> = {};
        if (query) {
          where.title = { contains: query, mode: "insensitive" };
        }
        if (userId) where.userId = userId;
        if (visibility !== "all") where.visibility = visibility;

        const [chats, total] = await Promise.all([
          db.chat.findMany({
            where,
            orderBy: { updatedAt: "desc" },
            skip,
            take: cappedLimit,
            include: {
              user: {
                select: { name: true, email: true, role: true },
              },
              _count: { select: { messages: true } },
            },
          }),
          db.chat.count({ where }),
        ]);

        return {
          total,
          page,
          totalPages: Math.ceil(total / cappedLimit),
          chats: chats.map((c) => ({
            id: c.id,
            title: c.title,
            visibility: c.visibility,
            isPinned: c.isPinned,
            userName: c.user.name,
            userEmail: c.user.email,
            userRole: c.user.role,
            messageCount: c._count.messages,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] searchChatsAdmin error:", error);
        return { error: "Failed to search chats" };
      }
    },
      } as any);

// ─────────────────────────────────────────────────────────────────────────────
// deleteChatAdmin
// ─────────────────────────────────────────────────────────────────────────────

const deleteChatAdminParams = z.object({
  chatId: z.string().describe("The chat ID to delete"),
});

export const deleteChatAdmin = (adminUserId: string, userRole: string) =>
  tool({
    description:
      "Delete a specific chat and all its messages. Use for content moderation — this action is irreversible.",
    parameters: deleteChatAdminParams,
    execute: async (args: z.infer<typeof deleteChatAdminParams>) => {
      requireAdmin(userRole);
      const { chatId } = args;
      await logAdminToolAudit("ADMIN_DELETE_CHAT", adminUserId, {
        deletedChatId: chatId,
      });

      try {
        const chat = await db.chat.findUnique({
          where: { id: chatId },
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { name: true, email: true } },
            _count: { select: { messages: true } },
          },
        });

        if (!chat) {
          return { error: "Chat not found" };
        }

        await db.chat.delete({ where: { id: chatId } });

        return {
          success: true,
          message: `Chat "${chat.title}" (${chat._count.messages} messages) owned by ${chat.user.name ?? chat.user.email} has been deleted`,
          deletedChat: {
            id: chat.id,
            title: chat.title,
            ownerName: chat.user.name,
            ownerEmail: chat.user.email,
            messageCount: chat._count.messages,
          },
        };
      } catch (error) {
        console.error("[Admin Tool] deleteChatAdmin error:", error);
        return { error: "Failed to delete chat" };
      }
    },
      } as any);
