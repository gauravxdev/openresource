import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Chat } from "@/components/chat/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";
import { getChatById, getMessagesByChatId } from "@/lib/chat/queries";
import { auth } from "@/lib/auth";
import type { UIMessage } from "ai";

export const metadata = {
    title: "AI Chat | OpenResource",
    description: "Chat with OpenResource AI assistant",
};

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Auth check
    const headersList = await headers();
    const session = await auth.api.getSession({
        headers: headersList,
    });

    if (!session?.user) {
        notFound();
    }

    // Load chat
    const chat = await getChatById({ id });

    if (!chat) {
        notFound();
    }

    // Check ownership
    if (chat.userId !== session.user.id) {
        notFound();
    }

    // Load messages
    const dbMessages = await getMessagesByChatId({ id });

    // Convert DB messages to UIMessages
    const initialMessages: UIMessage[] = dbMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as UIMessage["role"],
        parts: msg.parts as UIMessage["parts"],
        createdAt: msg.createdAt,
    }));

    const cookieStore = await cookies();
    const modelIdFromCookie = cookieStore.get("chat-model");

    return (
        <Chat
            id={id}
            initialMessages={initialMessages}
            initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
            key={id}
        />
    );
}
