import {
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
    streamText,
} from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/chat/providers";
import { systemPrompt, titlePrompt } from "@/lib/chat/prompts";
import { generateUUID, getTextFromMessage } from "@/lib/chat/utils";
import { ChatError } from "@/lib/chat/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
        const { id, message, selectedChatModel } = requestBody;

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

        const uiMessages = [message];

        const modelMessages = await convertToModelMessages(uiMessages);

        const stream = createUIMessageStream({
            execute: async ({ writer: dataStream }) => {
                const result = streamText({
                    model: getLanguageModel(selectedChatModel),
                    system: systemPrompt({ selectedChatModel }),
                    messages: modelMessages,
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
