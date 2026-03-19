import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    generateText,
    streamText,
} from "ai";
import { z } from "zod";
import { getLanguageModel, getTitleModel } from "@/lib/chat/providers";
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
import { exaSearch, tavilySearch, serperSearch } from "@/lib/chat/tools";

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

        // Auth check
        const headersList = await headers();
        const session = await auth.api.getSession({
            headers: headersList,
        });

        if (!session?.user) {
            return new ChatError("unauthorized:chat").toResponse();
        }

        if (!message) {
            return new ChatError("bad_request:api").toResponse();
        }

        const userId = session.user.id;

        // Check if this is a new chat or existing
        const existingChat = await getChatById({ id });

        if (!existingChat) {
            // Create the chat in DB
            await saveChat({
                id,
                userId,
                title: "New Chat",
            });
        }

        // Save the user message to DB
        const userMessageId = message.id || generateUUID();
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

        // Load ALL previous messages from DB for full conversation context
        const allDbMessages = await getMessagesByChatId({ id });
        const uiMessages = allDbMessages
            .filter((msg) => {
                // Skip assistant messages that contain tool-call parts
                // (tool results aren't persisted, so they'd cause MissingToolResultsError)
                const partsArray = msg.parts as Array<{ type: string }>;
                if (msg.role === "assistant" && partsArray?.some((p) => p.type === "tool-call")) {
                    return false;
                }
                return true;
            })
            .map((msg) => {
                const partsArray = msg.parts as Array<{ type: string; text?: string }>;
                const content = partsArray
                    ? partsArray
                        .filter((p) => p.type === "text")
                        .map((p) => p.text)
                        .join("")
                    : "";

                return {
                    id: msg.id,
                    role: msg.role as "user" | "assistant",
                    content,
                    parts: partsArray as any,
                };
            });
        const modelMessages = await convertToModelMessages(uiMessages);

        const stream = createUIMessageStream({
            execute: async ({ writer: dataStream }) => {
                const result = streamText({
                    model: getLanguageModel(selectedChatModel),
                    system: systemPrompt({ selectedChatModel }),
                    messages: modelMessages,
                    tools: allowSearch ? {
                        exaSearch,
                        tavilySearch,
                        serperSearch,
                    } : undefined,
                    maxSteps: allowSearch ? 5 : 1,
                    toolCallStreaming: true,
                    onChunk: ({ chunk }: { chunk: any }) => {
                        if (chunk.type === 'tool-call' || chunk.type === 'tool-call-streaming-start' || chunk.type === 'tool-call-delta') {
                            console.log("[onChunk]", chunk.type, JSON.stringify(chunk));
                        }
                    },
                    onFinish: async ({ response }) => {
                        // Save all assistant messages to DB (multi-step tool calling produces multiple)
                        try {
                            const assistantMessages = response.messages.filter(
                                (m) => m.role === "assistant",
                            );

                            for (const assistantMessage of assistantMessages) {
                                const assistantParts = [];
                                if (typeof assistantMessage.content === "string") {
                                    assistantParts.push({ type: "text", text: assistantMessage.content });
                                } else if (Array.isArray(assistantMessage.content)) {
                                    for (const part of assistantMessage.content) {
                                        if (part.type === "text") {
                                            assistantParts.push({ type: "text", text: part.text });
                                        } else if (part.type === "tool-call") {
                                            assistantParts.push({
                                                type: "tool-call",
                                                toolCallId: part.toolCallId,
                                                toolName: part.toolName,
                                                args: part.args,
                                            });
                                        }
                                    }
                                }

                                // Only save if there's meaningful content
                                if (assistantParts.length > 0) {
                                    await saveMessages({
                                        messages: [
                                            {
                                                id: generateUUID(),
                                                chatId: id,
                                                role: "assistant",
                                                parts: assistantParts,
                                                createdAt: new Date(),
                                            },
                                        ],
                                    });
                                }
                            }
                        } catch (error) {
                            console.error("Failed to save assistant message:", error);
                        }

                        // Generate title for new chats
                        if (!existingChat) {
                            try {
                                const userText =
                                    message.parts
                                        ?.filter((p) => p.type === "text")
                                        .map((p) => p.text)
                                        .join(" ") || "New Chat";

                                const { text: title } = await generateText({
                                    model: getTitleModel(),
                                    system: titlePrompt,
                                    prompt: userText,
                                });

                                const cleanTitle = title.trim() || "New Chat";
                                await updateChatTitle({ id, title: cleanTitle });

                                // Send title to client via data stream
                                dataStream.write({
                                    type: "data-chat-title",
                                    data: cleanTitle,
                                });
                            } catch (error) {
                                console.error("Failed to generate title:", error);
                            }
                        }
                    },
                });

                dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));
            },
            generateId: generateUUID,
            onError: () => "Oops, an error occurred!",
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
