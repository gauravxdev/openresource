import "server-only";

import { db } from "@/server/db";

// ─────────────────────────────────────────────────────────────────────────────
// Chat operations
// ─────────────────────────────────────────────────────────────────────────────

export async function saveChat({
    id,
    userId,
    title,
}: {
    id: string;
    userId: string;
    title: string;
}) {
    return db.chat.create({
        data: {
            id,
            userId,
            title,
        },
    });
}

export async function getChatById({ id }: { id: string }) {
    return db.chat.findUnique({
        where: { id },
    });
}

export async function getChatsByUserId({
    userId,
    limit = 20,
    cursor,
}: {
    userId: string;
    limit?: number;
    cursor?: string;
}) {
    const chats = await db.chat.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor
            ? {
                cursor: { id: cursor },
                skip: 1,
            }
            : {}),
    });

    const hasMore = chats.length > limit;
    return {
        chats: hasMore ? chats.slice(0, limit) : chats,
        hasMore,
    };
}

export async function updateChatTitle({
    id,
    title,
}: {
    id: string;
    title: string;
}) {
    try {
        return await db.chat.update({
            where: { id },
            data: { title },
        });
    } catch (error) {
        console.warn("Failed to update chat title:", id, error);
        return null;
    }
}

export async function updateChat({
    id,
    title,
    isPinned,
}: {
    id: string;
    title?: string;
    isPinned?: boolean;
}) {
    try {
        return await db.chat.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(isPinned !== undefined && { isPinned }),
            },
        });
    } catch (error) {
        console.warn("Failed to update chat:", id, error);
        return null;
    }
}

export async function deleteChatById({ id }: { id: string }) {
    // ChatMessage cascade-deletes automatically via onDelete: Cascade
    return db.chat.delete({
        where: { id },
    });
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
    const result = await db.chat.deleteMany({
        where: { userId },
    });
    return { deletedCount: result.count };
}

// ─────────────────────────────────────────────────────────────────────────────
// Message operations
// ─────────────────────────────────────────────────────────────────────────────

export async function saveMessages({
    messages,
}: {
    messages: Array<{
        id: string;
        chatId: string;
        role: string;
        parts: any;
        createdAt: Date;
    }>;
}) {
    return db.chatMessage.createMany({
        data: messages,
    });
}

export async function getMessagesByChatId({ id }: { id: string }) {
    return db.chatMessage.findMany({
        where: { chatId: id },
        orderBy: { createdAt: "asc" },
    });
}

export async function deleteMessagesByChatIdAfterTimestamp({
    chatId,
    timestamp,
}: {
    chatId: string;
    timestamp: Date;
}) {
    return db.chatMessage.deleteMany({
        where: {
            chatId,
            createdAt: { gte: timestamp },
        },
    });
}
