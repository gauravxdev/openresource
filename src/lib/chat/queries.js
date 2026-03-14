import "server-only";
import { db } from "@/server/db";
// ─────────────────────────────────────────────────────────────────────────────
// Chat operations
// ─────────────────────────────────────────────────────────────────────────────
export async function saveChat({ id, userId, title, }) {
    return db.chat.create({
        data: {
            id,
            userId,
            title,
        },
    });
}
export async function getChatById({ id }) {
    return db.chat.findUnique({
        where: { id },
    });
}
export async function getChatsByUserId({ userId, limit = 20, cursor, }) {
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
export async function updateChatTitle({ id, title, }) {
    try {
        return await db.chat.update({
            where: { id },
            data: { title },
        });
    }
    catch (error) {
        console.warn("Failed to update chat title:", id, error);
        return null;
    }
}
export async function updateChat({ id, title, isPinned, }) {
    try {
        return await db.chat.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(isPinned !== undefined && { isPinned }),
            },
        });
    }
    catch (error) {
        console.warn("Failed to update chat:", id, error);
        return null;
    }
}
export async function deleteChatById({ id }) {
    // ChatMessage cascade-deletes automatically via onDelete: Cascade
    return db.chat.delete({
        where: { id },
    });
}
export async function deleteAllChatsByUserId({ userId }) {
    const result = await db.chat.deleteMany({
        where: { userId },
    });
    return { deletedCount: result.count };
}
// ─────────────────────────────────────────────────────────────────────────────
// Message operations
// ─────────────────────────────────────────────────────────────────────────────
export async function saveMessages({ messages, }) {
    return db.chatMessage.createMany({
        data: messages,
    });
}
export async function getMessagesByChatId({ id }) {
    return db.chatMessage.findMany({
        where: { chatId: id },
        orderBy: { createdAt: "asc" },
    });
}
export async function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp, }) {
    return db.chatMessage.deleteMany({
        where: {
            chatId,
            createdAt: { gte: timestamp },
        },
    });
}
