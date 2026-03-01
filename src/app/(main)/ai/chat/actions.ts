"use server";

import { generateText } from "ai";
import { cookies } from "next/headers";
import { getTitleModel } from "@/lib/chat/providers";
import { titlePrompt } from "@/lib/chat/prompts";
import {
    deleteMessagesByChatIdAfterTimestamp,
    getMessagesByChatId,
} from "@/lib/chat/queries";

export async function saveChatModelAsCookie(model: string) {
    const cookieStore = await cookies();
    cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
    message,
}: {
    message: { role: string; parts: Array<{ type: string; text?: string }> };
}) {
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

    return title.trim();
}

export async function deleteTrailingMessages({ id }: { id: string }) {
    const messages = await getMessagesByChatId({ id });

    const messageToDelete = messages.find((m) => m.id === id);

    if (messageToDelete) {
        await deleteMessagesByChatIdAfterTimestamp({
            chatId: messageToDelete.chatId,
            timestamp: messageToDelete.createdAt,
        });
    }
}
