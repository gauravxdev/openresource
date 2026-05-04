/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars */
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  stepCountIs,
  streamText,
} from "ai";
import { z } from "zod";
import {
  getLanguageModel,
  getTitleModel,
  getAdminModel,
} from "@/lib/chat/providers";
import { systemPrompt, titlePrompt } from "@/lib/chat/prompts";
import { generateUUID } from "@/lib/chat/utils";
import { ChatError } from "@/lib/chat/errors";
import {
  saveChat,
  getChatById,
  saveMessages,
  getMessagesByChatId,
  updateChatTitle,
  updateChat,
  deleteChatById,
} from "@/lib/chat/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  exaSearch,
  tavilySearch,
  serperSearch,
  searchResources,
  getCategories,
  getTags,
  getResourceDetails,
  getResourcesByCategory,
  getResourcesByTag,
  getGitHubRepoDeepDive,
  compareResources,
  recommendResources,
  getTotalCount,
  searchUsers,
  getUserDetails,
  updateUserRoleTool,
  updateUserStatusTool,
  searchResourcesAdmin,
  updateResourceStatusTool,
  updateResourceFieldsTool,
  getPendingResources,
  getDashboardStats,
  getUsageStats,
  getFeedbackStats,
  searchAuditLogs,
  getRecentActivity,
  searchChatsAdmin,
  deleteChatAdmin,
  getSystemHealth,
} from "@/lib/chat/tools";
import {
  createGetUserBookmarksTool,
  createSearchResourcesTool,
  createSerperSearchTool,
  createExaSearchTool,
  createTavilySearchTool,
} from "@/lib/chat/tool-factories";
import type { UserRole } from "@/lib/chat/rate-limit";
import { getToolPerformanceContext } from "@/actions/admin/feedback-stats";
import {
  getClientIp,
  checkAndIncrementGuestChatUsage,
} from "@/lib/chat/guest-rate-limit";

export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────────────────────
// Request schema
// ─────────────────────────────────────────────────────────────────────────────

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(10000),
});

const partSchema = textPartSchema;

const userMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user"]),
  parts: z.array(partSchema),
});

const postRequestBodySchema = z.object({
  id: z.string(),
  message: userMessageSchema.optional(),
  selectedChatModel: z.string(),
  allowSearch: z.boolean().default(false),
});

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let requestBody: z.infer<typeof postRequestBodySchema>;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatError("bad_request:api").toResponse();
  }

  try {
    const { id, message, selectedChatModel, allowSearch } = requestBody;

    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    let userId: string | null;
    let userRole: UserRole;
    let isGuest = false;
    let ipAddress: string | null = null;

    if (!session?.user) {
      ipAddress = await getClientIp(headersList);
      if (!ipAddress) {
        return new ChatError("bad_request:api").toResponse();
      }

      const chatLimitResult = await checkAndIncrementGuestChatUsage(ipAddress);
      if (!chatLimitResult.allowed) {
        return new ChatError("guest_limit:chat").toResponse();
      }

      userId = null;
      userRole = "user";
      isGuest = true;
    } else {
      userId = session.user.id;
      userRole = (session.user.role ?? "user") as UserRole;
    }

    if (!message) {
      return new ChatError("bad_request:api").toResponse();
    }

    const userMessageId = message.id || generateUUID();

    if (isGuest) {
      const existingChat = await getChatById({ id });
      if (!existingChat) {
        await saveChat({
          id,
          userId,
          title: "New Chat",
        });
      }

      const chatAfterSave = await getChatById({ id });
      if (!chatAfterSave) {
        return new ChatError("bad_request:api").toResponse();
      }

      await saveMessages({
        messages: [
          {
            id: userMessageId,
            chatId: id,
            role: "user",
            parts: message.parts as any,
            createdAt: new Date(),
          },
        ],
      });

      const allDbMessages = await getMessagesByChatId({ id });
      const uiMessages = [
        ...allDbMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: msg.parts as any,
        })),
        {
          id: userMessageId,
          role: "user" as const,
          parts: message.parts as any,
        },
      ];
      const modelMessages = await convertToModelMessages(uiMessages);

      let titlePromise: Promise<string> | null = null;
      const existingChatAfterSave = await getChatById({ id });
      if (!existingChatAfterSave) {
        const userText =
          message.parts
            ?.filter((p) => p.type === "text")
            .map((p) => p.text)
            .join(" ") || "New Chat";
        titlePromise = generateText({
          model: getTitleModel(),
          system: titlePrompt,
          prompt: userText,
        }).then(({ text }) => text.trim() || "New Chat");
      }

      const tools: Record<string, any> = {
        searchResources: createSearchResourcesTool(
          userId,
          userRole,
          searchResources,
        ),
        getCategories,
        getTags,
        getResourceDetails,
        getResourcesByCategory,
        getResourcesByTag,
        getGitHubRepoDeepDive,
        compareResources,
        recommendResources,
        exaSearch: createExaSearchTool(
          userId,
          userRole,
          exaSearch,
          ipAddress,
          isGuest,
        ),
        tavilySearch: createTavilySearchTool(
          userId,
          userRole,
          tavilySearch,
          ipAddress,
          isGuest,
        ),
        serperSearch: createSerperSearchTool(
          userId,
          userRole,
          serperSearch,
          ipAddress,
          isGuest,
        ),
        getTotalCount,
      };

      const stream = createUIMessageStream({
        execute: async ({ writer: dataStream }) => {
          const toolPerformanceContext = await getToolPerformanceContext();
          const model = getLanguageModel(selectedChatModel);

          const result = streamText({
            model,
            system: systemPrompt({
              selectedChatModel,
              toolPerformanceContext,
              isAdmin: false,
            }),
            messages: modelMessages,
            stopWhen: stepCountIs(5),
            tools,
          });

          dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));

          if (titlePromise) {
            try {
              const title = await titlePromise;
              await updateChatTitle({ id, title });
              dataStream.write({
                type: "data-chat-title",
                data: title,
              });
            } catch (error) {
              console.error("Failed to generate title:", error);
            }
          }
        },
        onFinish: async ({ messages: finishedMessages }) => {
          try {
            await saveMessages({
              messages: finishedMessages.map((msg) => ({
                id: msg.id,
                chatId: id,
                role: msg.role,
                parts: msg.parts as any,
                createdAt: new Date(),
              })),
            });
          } catch (error) {
            console.error("Failed to save messages:", error);
          }
        },
        generateId: generateUUID,
        onError: (error) => {
          console.error("Chat stream error:", error);
          return "Oops, an error occurred!";
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    const existingChat = await getChatById({ id });

    if (!existingChat) {
      await saveChat({
        id,
        userId,
        title: "New Chat",
      });
    }

    const chatAfterSave = await getChatById({ id });
    if (!chatAfterSave) {
      return new ChatError("bad_request:api").toResponse();
    }

    await saveMessages({
      messages: [
        {
          id: userMessageId,
          chatId: id,
          role: "user",
          parts: message.parts as any,
          createdAt: new Date(),
        },
      ],
    });

    const allDbMessages = await getMessagesByChatId({ id });
    const uiMessages = [
      ...allDbMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        parts: msg.parts as any,
      })),
      {
        id: userMessageId,
        role: "user" as const,
        parts: message.parts as any,
      },
    ];
    const modelMessages = await convertToModelMessages(uiMessages);

    let titlePromise: Promise<string> | null = null;
    if (!existingChat) {
      const userText =
        message.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join(" ") || "New Chat";
      titlePromise = generateText({
        model: getTitleModel(),
        system: titlePrompt,
        prompt: userText,
      }).then(({ text }) => text.trim() || "New Chat");
    }

    const isAdmin = userRole === "admin";

    const tools: Record<string, any> = {
      searchResources: createSearchResourcesTool(
        userId,
        userRole,
        searchResources,
      ),
      getCategories,
      getTags,
      getResourceDetails,
      getResourcesByCategory,
      getResourcesByTag,
      getUserBookmarks: createGetUserBookmarksTool(userId),
      getGitHubRepoDeepDive,
      compareResources,
      recommendResources,
      exaSearch: createExaSearchTool(userId, userRole, exaSearch),
      tavilySearch: createTavilySearchTool(userId, userRole, tavilySearch),
      serperSearch: createSerperSearchTool(userId, userRole, serperSearch),
      getTotalCount,
    };

    if (isAdmin) {
      tools.searchUsers = searchUsers(userId!, userRole);
      tools.getUserDetails = getUserDetails(userId!, userRole);
      tools.updateUserRoleTool = updateUserRoleTool(userId!, userRole);
      tools.updateUserStatusTool = updateUserStatusTool(userId!, userRole);
      tools.searchResourcesAdmin = searchResourcesAdmin(userId!, userRole);
      tools.updateResourceStatusTool = updateResourceStatusTool(
        userId!,
        userRole,
      );
      tools.updateResourceFieldsTool = updateResourceFieldsTool(
        userId!,
        userRole,
      );
      tools.getPendingResources = getPendingResources(userId!, userRole);
      tools.getDashboardStats = getDashboardStats(userId!, userRole);
      tools.getUsageStats = getUsageStats(userId!, userRole);
      tools.getFeedbackStats = getFeedbackStats(userId!, userRole);
      tools.searchAuditLogs = searchAuditLogs(userId!, userRole);
      tools.getRecentActivity = getRecentActivity(userId!, userRole);
      tools.searchChatsAdmin = searchChatsAdmin(userId!, userRole);
      tools.deleteChatAdmin = deleteChatAdmin(userId!, userRole);
      tools.getSystemHealth = getSystemHealth(userId!, userRole);
    }

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const toolPerformanceContext = await getToolPerformanceContext();

        const model = isAdmin
          ? getAdminModel()
          : getLanguageModel(selectedChatModel);

        const result = streamText({
          model,
          system: systemPrompt({
            selectedChatModel,
            toolPerformanceContext,
            isAdmin,
          }),
          messages: modelMessages,
          stopWhen: stepCountIs(5),
          tools,
        });

        dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));

        if (titlePromise) {
          try {
            const title = await titlePromise;
            await updateChatTitle({ id, title });
            dataStream.write({
              type: "data-chat-title",
              data: title,
            });
          } catch (error) {
            console.error("Failed to generate title:", error);
          }
        }
      },
      onFinish: async ({ messages: finishedMessages }) => {
        try {
          await saveMessages({
            messages: finishedMessages.map((msg) => ({
              id: msg.id,
              chatId: id,
              role: msg.role,
              parts: msg.parts as any,
              createdAt: new Date(),
            })),
          });
        } catch (error) {
          console.error("Failed to save messages:", error);
        }
      },
      generateId: generateUUID,
      onError: (error) => {
        console.error("Chat stream error:", error);
        return "Oops, an error occurred!";
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    if (error instanceof ChatError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat API:", error);
    return new ChatError("offline:chat").toResponse();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE handler
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatError("bad_request:api").toResponse();
  }

  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return new ChatError("unauthorized:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      return new ChatError("not_found:chat").toResponse();
    }

    if (chat.userId !== session.user.id) {
      return new ChatError("forbidden:chat").toResponse();
    }

    await deleteChatById({ id });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return new ChatError("bad_request:api").toResponse();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH handler (Update chat properties like title, pinned status)
// ─────────────────────────────────────────────────────────────────────────────

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new ChatError("bad_request:api").toResponse();
    }

    const body = await request.json();
    const { title, isPinned } = body;

    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return new ChatError("unauthorized:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      return new ChatError("not_found:chat").toResponse();
    }

    if (chat.userId !== session.user.id) {
      return new ChatError("forbidden:chat").toResponse();
    }

    const updatedChat = await updateChat({
      id,
      title,
      isPinned,
    });

    if (!updatedChat) {
      return new ChatError("bad_request:api").toResponse();
    }

    return Response.json({ success: true, chat: updatedChat });
  } catch (error) {
    console.error("Failed to update chat:", error);
    return new ChatError("bad_request:api").toResponse();
  }
}
