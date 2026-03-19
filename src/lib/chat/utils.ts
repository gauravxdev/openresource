import type { UIMessage } from "ai";
import { ChatError, type ErrorCode } from "./errors";
import type { ChatMessage } from "./types";

export function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function sanitizeText(text: string) {
    return text.replace("<has_function_call>", "");
}

export async function fetchWithErrorHandlers(
    input: RequestInfo | URL,
    init?: RequestInit,
) {
    try {
        const response = await fetch(input, init);

        if (!response.ok) {
            const errorData = (await response.json()) as {
                code?: string;
                cause?: string;
            };
            throw new ChatError(
                (errorData.code ?? "bad_request:api") as ErrorCode,
                errorData.cause,
            );
        }

        return response;
    } catch (error: unknown) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            throw new ChatError("offline:chat");
        }

        throw error;
    }
}

export function getTextFromMessage(message: ChatMessage | UIMessage): string {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => (part as { type: "text"; text: string }).text)
        .join("");
}

export function getMostRecentUserMessage(messages: UIMessage[]) {
    const userMessages = messages.filter((message) => message.role === "user");
    return userMessages.at(-1);
}
